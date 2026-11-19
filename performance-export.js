/* Exportacao somente leitura de desempenho para analise externa (ChatGPT).
   Nao exporta credenciais, UID, senha ou configuracoes de autenticacao.
   Fonte: estado hidratado do Firebase/cache e stores locais do plano e da P4.
*/
(() => {
  "use strict";

  const SCHEMA = "cgu-estudos.desempenho-completo.v1";
  const EXAMS = ["P1", "P2", "P3"];
  const WEIGHTS = {P1:1, P2:1, P3:2};

  function number(value) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? Math.max(0, parsed) : 0;
  }
  function pct(num, den) {
    return den > 0 ? Math.round(10000 * num / den) / 100 : null;
  }
  function average(values) {
    return values.length ? Math.round(values.reduce((a, b) => a + b, 0) * 100 / values.length) / 100 : null;
  }
  function jsonStore(key, fallback) {
    try {
      const value = JSON.parse(localStorage.getItem(key) || "null");
      return value === null ? fallback : value;
    } catch (err) {
      return fallback;
    }
  }
  function safeClone(data) {
    const sensitive = /^(password|passwd|senha|passphrase|token|idToken|refreshToken|accessToken|apiKey|api_key|privateKey|clientSecret|secret|credential|credentials|authorization|authHeader|firebaseConfig|uid|userId|email)$/i;
    return JSON.parse(JSON.stringify(data, function(key, value) {
      return sensitive.test(key) ? undefined : value;
    }));
  }
  function planData() {
    if (typeof window.CGU_readDailyPlans === "function") return window.CGU_readDailyPlans() || {};
    return jsonStore(KEY + "-daily-plans-v1", {});
  }
  function p4Data(plans) {
    if (typeof window.CGU_P4Store?.read === "function") return window.CGU_P4Store.read() || {entries:[]};
    const dedicated = jsonStore(KEY + "-discursive-p4-v1", {});
    const legacy = plans.__discursiveTrackerV1 || {};
    return Number(dedicated.updatedAtMs || 0) >= Number(legacy.updatedAtMs || 0) ? dedicated : legacy;
  }
  function counts(saved) {
    const a = number(saved.acertos);
    let q = number(saved.questoes);
    let b = number(saved.brancos);
    if (!q && (a || b || number(saved.erros))) q = a + b + number(saved.erros);
    if (q < a + b) q = a + b;
    b = Math.min(b, q - a);
    const e = Math.max(0, q - a - b);
    return {questoes:q, acertos:a, erros:e, brancos:b};
  }
  function score(c, weight) {
    return {
      ...c,
      percentualBruto:pct(c.acertos, c.questoes),
      percentualLiquido:pct(c.acertos - c.erros, c.questoes),
      pontosLiquidos:(c.acertos - c.erros) * weight,
      pontosMaximosAmostra:c.questoes * weight
    };
  }
  function summarize(rows, label, exam) {
    const sum = {questoes:0, acertos:0, erros:0, brancos:0};
    rows.forEach(r => Object.keys(sum).forEach(k => {sum[k] += r[k];}));
    const weight = exam ? WEIGHTS[exam] : 1;
    const done = rows.filter(r => r.concluido).length;
    const studied = rows.filter(r => r.questoes > 0).length;
    const toReview = rows.filter(r => r.status === "Revisar").length;
    const weightedNet = rows.reduce((acc, r) => acc + r.pontosLiquidos, 0);
    const weightedMaximum = rows.reduce((acc, r) => acc + r.pontosMaximosAmostra, 0);
    return {
      nome:label,
      ...(exam ? {prova:exam, pesoPorItem:weight} : {}),
      subitens:rows.length,
      subitensConcluidos:done,
      subitensPendentes:rows.length-done,
      subitensComQuestoes:studied,
      subitensSemQuestoes:rows.length-studied,
      subitensParaRevisar:toReview,
      percentualCoberturaQuestoes:pct(studied,rows.length),
      percentualConclusao:pct(done,rows.length),
      ...score(sum,weight),
      pontosLiquidosPonderados:weightedNet,
      maximoPonderadoDaAmostra:weightedMaximum,
      percentualLiquidoPonderado:pct(weightedNet,weightedMaximum),
      rodadasRegistradas:rows.reduce((acc,r)=>acc+r.rodadas.length,0)
    };
  }
  function dateOnly(value) {
    if (!value) return null;
    const text = String(value);
    return /^\d{4}-\d{2}-\d{2}/.test(text) ? text.slice(0,10) : null;
  }
  function discursiveScore(entry) {
    const q1 = entry.type === "q1";
    const limit = q1 ? 30 : 70;
    const maxLines = q1 ? 30 : 60;
    const factor = q1 ? 6 : 14;
    const lines = Math.min(number(entry.lines), maxLines);
    const nc = Math.min(number(entry.nc),limit);
    const errors = number(entry.spelling)+number(entry.syntax)+number(entry.vocab)+number(entry.otherLang);
    const zero = !lines || !!entry.escapeTheme || !!entry.noText;
    const penalty = zero ? 0 : factor*errors/lines;
    const finalScore = zero ? 0 : Math.max(0,nc-penalty);
    return {...safeClone(entry), notaCalculada:Math.round(finalScore*100)/100,
      notaMaxima:limit, linhasConsideradas:lines, errosEscrita:errors, descontoEscrita:Math.round(penalty*100)/100};
  }
  function discursiveReport(bucket) {
    const entries = (Array.isArray(bucket?.entries) ? bucket.entries : []).map(discursiveScore);
    const valid = entries.filter(e => !e.training);
    const avgQ1=average(valid.filter(e=>e.type==="q1").map(e=>e.notaCalculada));
    const avgQ2=average(valid.filter(e=>e.type==="q2").map(e=>e.notaCalculada));
    return {
      totalRegistros:entries.length,
      treinosFormativos:entries.filter(e=>e.training).length,
      correcoesValidas:valid.length,
      questoesQ1:entries.filter(e=>e.type==="q1").length,
      questoesQ2:entries.filter(e=>e.type==="q2").length,
      mediaQ1:avgQ1, mediaQ2:avgQ2,
      mediaP4:avgQ1===null||avgQ2===null?null:Math.round((avgQ1+avgQ2)*100)/100,
      metaPessoalIntensivao:85,
      historicoCompleto:entries
    };
  }
  function mockReport(plans) {
    const source = plans.__sprint34V1?.mocks || {};
    const list = [];
    Object.keys(source).sort().forEach(date => {
      Object.keys(source[date] || {}).forEach(key => {
        list.push({data:date, tarefa:key, ...safeClone(source[date][key] || {})});
      });
    });
    return {
      quantidadeRegistros:list.length,
      simuladosIntegrais:list.filter(x=>x.type==="integral").length,
      simuladosParciais:list.filter(x=>x.type==="half").length,
      registros:list
    };
  }
  function timeline(rows, writing, simulations) {
    const days = {};
    function at(date) {
      if (!date) return null;
      if (!days[date]) days[date]={data:date,questoesEmRodadas:0,acertos:0,erros:0,brancos:0,rodadas:0,discursivas:0,simulados:0};
      return days[date];
    }
    rows.forEach(r => r.rodadas.forEach(q => {
      const day = at(dateOnly(q.at || q.data));
      if (!day) return;
      const n = counts(q);
      day.questoesEmRodadas += n.questoes;
      day.acertos += n.acertos;
      day.erros += n.erros;
      day.brancos += n.brancos;
      day.rodadas++;
    }));
    writing.historicoCompleto.forEach(q => {const d=at(dateOnly(q.date));if(d)d.discursivas++;});
    simulations.registros.forEach(q => {const d=at(dateOnly(q.data));if(d)d.simulados++;});
    return Object.values(days).sort((a,b)=>a.data.localeCompare(b.data)).map(d=>({
      ...d,percentualLiquidoRodadas:pct(d.acertos-d.erros,d.questoesEmRodadas)
    }));
  }
  function createReport() {
    if (typeof topicsFlat !== "function" || typeof state === "undefined") throw new Error("Dados do edital ainda nao foram carregados.");
    const plans = planData();
    const p4 = p4Data(plans);
    const rows = topicsFlat().map(x => {
      const original=getTS(x.id)||{};
      const c=counts(original);
      const meta=window.ATOMIC_META?.[x.id] || {};
      const roundHistory=Array.isArray(original.questionRounds) ? original.questionRounds : [];
      const rounds=roundHistory.map(r => ({...safeClone(r), ...score(counts(r), WEIGHTS[x.exam])}));
      const last=rounds.length ? rounds[rounds.length-1] : null;
      const liquid=pct(c.acertos-c.erros,c.questoes);
      const target=Number(settings[x.exam] ?? DEFAULT_META[x.exam]);
      return {
        id:x.id, prova:x.exam, disciplina:x.d.nome, disciplinaId:x.d.id,
        grupo:x.g.nome, codigoSubitem:meta.code||null,
        subitem:meta.fullText||x.t, prioridade:x.priority,
        concluido:!!original.done,
        dataConclusao:original.completedAtMs ? new Date(original.completedAtMs).toISOString() : null,
        status:c.questoes ? (liquid>=target?"Atendeu":"Revisar") : "Pendente",
        metaLiquidaPercentual:target,
        ...score(c,WEIGHTS[x.exam]),
        numeroRodadas:rounds.length, rodadas:rounds, ultimaRodada:last,
        percentualLiquidoUltimaRodada:last?last.percentualLiquido:null,
        historicoLegadoSemRodadas:c.questoes>rounds.reduce((s,r)=>s+r.questoes,0),
        anotacoes:typeof original.obs==="string"?original.obs:null,
        materialOuAula:typeof original.aula==="string"?original.aula:null,
        ultimoEstudo:original.lastStudyDate||null,
        ultimaDataQuestao:original.lastQuestionDate||null
      };
    });
    const exams=EXAMS.map(exam=>summarize(rows.filter(r=>r.prova===exam),exam,exam));
    const bySubject=EDITAL.map(d=>summarize(rows.filter(r=>r.disciplinaId===d.id),d.nome,d.prova));
    const byGroup=EDITAL.flatMap(d=>d.grupos.map(g=>summarize(rows.filter(r=>r.disciplinaId===d.id && r.grupo===g.nome),g.nome,d.prova)));
    const overall=summarize(rows,"CGU - Todas as provas");
    const weightedNet=rows.reduce((a,r)=>a+r.pontosLiquidos,0);
    const weightedMax=rows.reduce((a,r)=>a+r.pontosMaximosAmostra,0);
    const writing=discursiveReport(p4);
    const mocks=mockReport(plans);
    const timelineRows=timeline(rows,writing,mocks);
    const registeredTopics=Object.keys(state||{});
    const lessonItems=Object.keys(lessonState||{});
    const sprint=plans.__sprint34V1 || {};
    const days=sprint.days || {};
    const savedCheckCount=Object.values(days).reduce((a,d)=>a+Object.values(d?.checks||{}).filter(Boolean).length,0);
    const exportedAt=new Date();
    const totalRounds=rows.reduce((n,r)=>n+r.rodadas.length,0);
    const todayLocal=exportedAt.getFullYear()+"-"+String(exportedAt.getMonth()+1).padStart(2,"0")+"-"+String(exportedAt.getDate()).padStart(2,"0");

    return safeClone({
      schema:SCHEMA,
      exportadoEmUTC:exportedAt.toISOString(), dataLocalExportacao:todayLocal,
      identificacao:{concurso:"CGU 2026",cargo:"Cargo 3 - Infraestrutura de TI",banca:"Cebraspe",dataProva:"2026-12-13",fonte:"Painel CGU - dados do navegador apos hidratacao da nuvem"},
      metodologia:{
        corretas:"Cada acerto soma um ponto por item, multiplicado pelo peso de P1/P2/P3.",
        erradas:"Cada erro subtrai um ponto por item, multiplicado pelo peso.",
        emBranco:"Nao pontuam nem descontam.",
        porcentagemLiquida:"100 * (acertos - erros) / questoes respondidas (incluindo brancos, se registrados).",
        pontosLiquidos:"(acertos - erros) * peso da prova.",
        metasPessoais:"Metas do aplicativo nao equivalem a notas minimas oficiais.",
        contagens:"Totais por topico sao registros acumulados; nao somar novamente as rodadas, que sao subconjuntos do acumulado.",
        historico:"Rodadas com data permitem tendencia temporal; volume legado sem rodadas nao tem data confiavel.",
        observacao:"Arquivo para analise, nao e backup restauravel. Dados brutos e calculados sao preservados separadamente."
      },
      resumoGeral:{
        ...overall,
        pontosLiquidosPonderados:weightedNet,
        maximoPonderadoDaAmostra:weightedMax,
        percentualLiquidoPonderado:pct(weightedNet,weightedMax),
        totalDisciplinas:EDITAL.length,
        totalGrupos:byGroup.length,
        rodadasRegistradas:totalRounds,
        aulasCadastradas:typeof LESSONS!=="undefined"&&Array.isArray(LESSONS)?LESSONS.length:null,
        aulasMarcadasConcluidas:lessonItems.filter(k=>!!lessonState[k]).length,
        simuladosSalvos:mocks.quantidadeRegistros,
        atividadesMarcadasNoIntensivao:savedCheckCount,
        datasSalvasIntensivao:Object.keys(days).length,
        totaisObjetivosPorProva:exams,
        notaDaProvaReal:null
      },
      porProva:exams,
      porDisciplina:bySubject,
      porGrupo:byGroup,
      topicos:rows,
      desempenhoDiscursivoP4:writing,
      simulados:mocks,
      evolucaoDiariaRegistrada:timelineRows,
      aulas:{
        cadastradas:typeof LESSONS!=="undefined"&&Array.isArray(LESSONS)?safeClone(LESSONS):[],
        marcadasPorId:safeClone(lessonState||{}),
        totalConcluidas:lessonItems.filter(k=>!!lessonState[k]).length
      },
      metasConfiguradas:safeClone(settings||{}),
      planejamentos:{
        totalDiasSalvos:Object.keys(plans).filter(k=>/^\d{4}-\d{2}-\d{2}$/.test(k)).length,
        datasIntensivaoSalvas:Object.keys(days).length,
        atividadesMarcadasIntensivao:savedCheckCount,
        configuracaoIntensivao:safeClone(sprint.settings||{}),
        todasAsInformacoesSalvas:safeClone(plans)
      },
      dadosOriginais:{
        estadoSubitens:safeClone(state||{}),
        configuracoes:safeClone(settings||{}),
        aulas:safeClone(lessonState||{}),
        discursivas:safeClone(p4||{}),
        registrosDeTopicosDesconhecidos:registeredTopics.filter(id=>!rows.some(r=>r.id===id))
      }
    });
  }

  function exportPerformance() {
    if (document.body.classList.contains("auth-locked") || !window.FirebaseCGU?.currentUser) {
      alert("Entre na sua conta antes de exportar o desempenho.");
      return;
    }
    if (!window.CGU_cloudHydrated) {
      alert("O progresso ainda esta sendo carregado do Firebase. Tente novamente apos a sincronizacao inicial.");
      return;
    }
    const button=document.getElementById("downloadStudyPerformance");
    if(button)button.disabled=true;
    try{
      const report=createReport();
      const json=JSON.stringify(report,null,2);
      const blob=new Blob([json],{type:"application/json;charset=utf-8"});
      const url=URL.createObjectURL(blob);
      const a=document.createElement("a");
      a.href=url;
      a.download="cgu-desempenho-completo-"+report.dataLocalExportacao+".json";
      a.style.display="none";
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(()=>URL.revokeObjectURL(url),30000);
      if(typeof toast==="function")toast("Relatorio de desempenho completo gerado.");
    }catch(error){
      console.error("Falha ao exportar desempenho:",error);
      alert("Nao foi possivel gerar o relatorio. Confira se o painel carregou completamente.");
    }finally{
      if(button)button.disabled=false;
    }
  }

  window.CGU_exportPerformance = exportPerformance;
})();
