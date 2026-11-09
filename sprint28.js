/* CGU Cargo 3 — reta final de 28 dias (16/11 a 13/12/2026).
   Fonte: tópicos atômicos e métricas já salvas no aplicativo.
   Plano estratégico estimativo: frequência por tópico NÃO é publicada pelo Cebraspe.
   Persistência na mesma dailyPlans/__sprint28V1, já sincronizada no Firestore.
*/
(() => {
  const META="__sprint28V1", START="2026-11-16", EXAM="2026-12-13", DURATION=28;
  const WEIGHT={P1:1,P2:1,P3:2}, LIMIT={P1:40,P2:40,P3:90};
  const PAIRS=[
    {name:"Segurança da infraestrutura + gestão de riscos",a:["P3","Riscos e Arquitetura de Segurança"],b:["P2","Riscos e Controles Essenciais"],case:"Aplicar defesa em profundidade, risco residual e controles proporcionais em serviço digital da CGU."},
    {name:"Operação de segurança + transparência e privacidade",a:["P3","Vulnerabilidades e Operação de Segurança"],b:["P2","Transparência e Proteção de Dados"],case:"Tratar incidente, evidências, comunicação e proteção de dados sem interromper o serviço."},
    {name:"Computação em nuvem + auditoria governamental",a:["P3","Modelos e Arquitetura de Nuvem"],b:["P2","Ciclo do Trabalho"],case:"Descrever contratação, controle, migração de serviço crítico e evidências de auditoria."},
    {name:"Observabilidade + evidência e conclusão",a:["P3","Confiabilidade e Observabilidade"],b:["P2","Evidência e Conclusão"],case:"Relacionar logs, métricas, rastreamento, indicadores, achados e recomendações."},
    {name:"Dados e inteligência artificial responsável",a:["P3","Plataformas de Bancos de Dados"],b:["P2","Uso Responsável de Inteligência Artificial"],case:"Avaliar integridade, disponibilidade, rastreabilidade e governança de dados."},
    {name:"Identidades e controles do setor público",a:["P3","Identidades e Proteção Criptográfica"],b:["P2","Riscos e Controles Essenciais"],case:"Propor menor privilégio, IAM, proteção criptográfica, auditoria de acessos e tratamento de risco."},
    {name:"Gestão digital + políticas públicas",a:["P3","Governança e Controle"],b:["P1","Serviços e Transformação Digital"],case:"Conectar confiabilidade de TI com controles, qualidade de serviço e geração de valor público."},
    {name:"Continuidade + governança e responsabilização",a:["P3","Continuidade e Recuperação"],b:["P2","Governança e Responsabilidades"],case:"Projetar resposta, continuidade, testes de recuperação, responsabilidades e prestação de contas."}
  ];
  const PREF={satHours:6,sunHours:5};
  let selected=START, dayFilter="todos", ready=false, cachedDeferrals=null, cachedSettings=null;

  function n(v){const r=Number(v);return Number.isFinite(r)?Math.max(0,r):0}
  function clamp(v,min,max){return Math.max(min,Math.min(max,v))}
  function dateObj(s){return new Date(s+"T12:00:00")}
  function iso(d){return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0")}
  function dateAt(i){const d=dateObj(START);d.setDate(d.getDate()+i);return iso(d)}
  function today(){return iso(new Date())}
  function fmtDate(d){return dateObj(d).toLocaleDateString("pt-BR",{day:"2-digit",month:"2-digit",weekday:"short"})}
  function fmt(v,d=0){return Number(v).toLocaleString("pt-BR",{minimumFractionDigits:d,maximumFractionDigits:d})}
  function esc(s){return typeof escapeHtml==="function"?escapeHtml(s):String(s||"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]))}
  function plans(){return window.CGU_readDailyPlans?.()||{}}
  function load(){
    const b=plans()[META]||{};
    return {version:1,days:b.days||{},mocks:b.mocks||{},settings:{...PREF,...(b.settings||{})},
      competition:{total:null,ac:null,absence:25,below:65,...(b.competition||{})},updatedAtMs:Number(b.updatedAtMs)||0};
  }
  function write(b){
    const p=plans();p[META]={...b,version:1,updatedAtMs:Date.now()};
    if(typeof window.CGU_writeDailyPlans==="function")window.CGU_writeDailyPlans(p);
    else{localStorage.setItem(KEY+"-daily-plans-v1",JSON.stringify(p));window.dispatchEvent(new Event("cgu-plan-changed"))}
  }
  function allRows(){return typeof topicsFlat==="function"?topicsFlat():[]}
  function metadata(x){return window.ATOMIC_META?.[x.id]||{}}
  function fullTitle(x){if(!x)return "Tópico ainda não disponível";const m=metadata(x);return m.code?m.code+" · "+m.title:x.t||x.g.nome}
  function byId(id){return allRows().find(x=>x.id===id)||null}
  function priority(x){return ({Crítica:4,Alta:3,Média:2,Baixa:1}[x?.priority]||1)}
  function blocked(x,ymd){
    const d=cachedDeferrals||plans().__deferrals||{},t=d.topics?.[x.id],s=d.subjects?.[x.d.id];
    return !!((t?.until&&ymd<t.until&&!t.cancelledAtMs)||(s?.until&&ymd<s.until&&!s.cancelledAtMs));
  }
  function importance(x){
    if(!x)return 0;
    const m=x.m||{},gap=Math.max(0,n(m.meta)-Number(m.liquido||0)),p4=x.exam==="P3"?42:x.exam==="P2"?28:0;
    let score=priority(x)*35+({P3:120,P2:52,P1:36}[x.exam]||0)+p4;
    if(!m.s?.done)score+=95;
    if(!m.q)score+=50;
    else if(m.status==="Revisar")score+=75+Math.min(75,gap*1.5);
    if(m.q>0&&m.q<15)score+=16;
    if(m.s?.done&&m.status==="Atendeu")score-=330;
    return score;
  }
  function choose(exam,date,used,chosen,group){
    const list=allRows().filter(x=>(!exam||x.exam===exam)&&!blocked(x,date)&&!chosen.includes(x.id));
    if(!list.length)return null;
    const preferred=group?list.filter(x=>x.g.nome===group):[];
    const pool=preferred.length?preferred:list;
    return [...pool].sort((a,b)=>{
      const score=x=>importance(x)-((used[x.id]||0)*190)-((used["s:"+x.d.id]||0)*18);
      return score(b)-score(a)||a.id.localeCompare(b.id);
    })[0]||null;
  }
  function noteUsed(x,used,chosen){
    if(!x)return;chosen.push(x.id);used[x.id]=(used[x.id]||0)+1;used["s:"+x.d.id]=(used["s:"+x.d.id]||0)+1;
  }
  function pairFor(ordinal,date,used){
    const pair=PAIRS[(ordinal+Math.floor(ordinal/7))%PAIRS.length];
    const a=choose(pair.a[0],date,used,[],pair.a[1])||choose("P3",date,used,[]);
    const b=choose(pair.b[0],date,used,a?[a.id]:[],pair.b[1])||choose("P2",date,used,a?[a.id]:[]);
    return {name:pair.name,case:pair.case,a:a?.id||null,b:b?.id||null};
  }
  function task(id,kind,title,minutes,extra={}){return {id,kind,title,minutes,...extra}}
  function fit(tasks,total){
    const sum=tasks.reduce((s,t)=>s+t.minutes,0);
    if(sum===total||!sum)return tasks;
    const fixed=tasks.filter(x=>x.fixed),variable=tasks.filter(x=>!x.fixed),space=total-fixed.reduce((s,t)=>s+t.minutes,0);
    if(space<0)return tasks;
    const variableTotal=variable.reduce((s,t)=>s+t.minutes,0);
    let remainder=space;
    variable.forEach((t,i)=>{
      const v=i===variable.length-1?remainder:Math.max(5,Math.round((t.minutes/variableTotal)*space/5)*5);
      t.minutes=v;remainder-=v;
    });
    return tasks;
  }
  function generate(date,index,used,prior){
    if(prior?.locked&&Array.isArray(prior.tasks)){
      prior.tasks.forEach(t=>{if(t.kind==="study"&&t.topicId){const x=byId(t.topicId);if(x)noteUsed(x,used,[]) }});
      return {...prior,date,index};
    }
    const weekday=dateObj(date).getDay(),sat=weekday===6,sun=weekday===0,week=Math.floor(index/7);
    const cfg=cachedSettings||load().settings;
    if(date===EXAM)return {date,index,type:"exam",title:"Dia da prova · CGU 2026",minutes:0,tasks:[],pair:null,locked:false,tip:"Prova objetiva pela manhã e discursiva à tarde. Preserve sono, documentos, deslocamento e alimentação. Nada de simulado pesado."};
    const chosen=[],tasks=[];
    let type="weekday",title="",tip="",minutes=80,pair=null;
    if(!sat&&!sun){
      const lane=["P3","P2","P3","P1","P3"][weekday-1]||"P3";
      const main=choose(lane,date,used,chosen)||choose(null,date,used,chosen);
      noteUsed(main,used,chosen);
      pair=pairFor(index,date,used);
      title="04:00–05:20 · "+lane+" orientado por desempenho";
      tip="Aula prioritária + questões com desconto Cebraspe + conexão curta com assunto complementar. Não marque questões como feitas sem registrá-las.";
      if(main){
        tasks.push(task("study","study","Estudo ativo do subitem",45,{topicId:main.id,description:"Teoria direcionada: conceito, diferenças e exemplos de cobrança certo/errado. Elabore 3 frases de recuperação sem consultar o material."}));
        tasks.push(task("questions","questions","Rodada Cebraspe do mesmo subitem",25,{topicId:main.id,description:"Registre total, acertos e brancos; os erros e a nota ponderada serão calculados automaticamente."}));
      }
      if(lane==="P2")tasks.push(task("bridge","bridge","Ponte para Q1 (30 linhas)",10,{topicId:pair?.b||main?.id,description:"Em 10 minutos: tese, 2 argumentos, 1 exemplo institucional e conectivos. Depois evoluir para texto completo no fim de semana."}));
      else tasks.push(task("bridge","bridge","Casadinha com outro conteúdo",10,{topicId:lane==="P1"?pair?.b:pair?.a,description:pair?.case||"Relacione o tema principal a um problema real de controle e gestão de TI."}));
    }else if(sat){
      type="saturday";minutes=index===26?120:clamp(n(cfg.satHours)||6,6,9)*60;
      pair=pairFor(index,date,used);
      const a=byId(pair.a)||choose("P3",date,used,chosen),b=byId(pair.b)||choose("P2",date,used,chosen);
      if(index===26){
        title="Véspera da prova · revisão leve";
        tip="Não estudar conteúdo novo em profundidade. Revisar erros recorrentes, fórmulas, estratégia Cebraspe e estrutura Q1/Q2; priorizar descanso.";
        tasks.push(task("light","review","Revisão leve de erros críticos",75,{description:"Releia apenas os erros e flashcards mais relevantes. Sem rodada longa de questões."}));
        tasks.push(task("outline","bridge","Roteiro mental de P4",45,{description:"Lembre a estrutura Q1 (30 linhas) e Q2 (60 linhas), comando e solução técnica. Encerre e descanse."}));
      }else if(index===12){
        title="Simulado objetivo integral · 170 itens";
        tip="Simulado completo no formato P1 40, P2 40 e P3 90, com 5 horas previstas no edital; depois classifique os erros. A nota fica no histórico de simulados, não em um tópico isolado.";
        tasks.push(task("full-mock","fullMock","Simulado objetivo — P1 + P2 + P3",300,{fixed:true,description:"Aplicar 170 itens em 5 horas, respeitando +1/−1 em P1/P2 e +2/−2 em P3."}));
        tasks.push(task("review","review","Correção e caderno de erros",60,{description:"Classificar erros por conteúdo, comando, distração ou falta de tempo. Priorização dos subitens frágeis."}));
      }else if(index===19){
        title="Simulado discursivo integral · P4";
        tip="Simular 3h30 no total: Q1 até 30 linhas e Q2 até 60 linhas. Registrar cada nota e erros na aba Discursivas/P4.";
        tasks.push(task("full-disc","fullDisc","Simulado P4 completo — Q1 + Q2",210,{fixed:true,description:"Q1: Conhecimentos complementares (30 pontos). Q2: situação-problema técnica (70 pontos). Corrija pela rubrica oficial."}));
        const m=choose("P3",date,used,chosen);noteUsed(m,used,chosen);
        if(m)tasks.push(task("study","study","Conteúdo P3 de maior retorno",90,{topicId:m.id,description:"Aplicação prática do conteúdo, focando resposta a situações-problema de TI."}));
        tasks.push(task("review","review","Revisão de erros e tópicos P2",60,{description:"Corrigir falhas de argumentação e lacunas de conteúdo; não confundir treino com nota oficial."}));
      }else{
        title="Casuística P2 + P3 · simulado casadinha";
        tip="Simulado combinado de conteúdos do edital, correção e estudo de temas novos. A casadinha não é uma prova oficial completa.";
        tasks.push(task("pair","pairMock","Simulado misto · "+pair.name,120,{pair,description:pair.case}));
        tasks.push(task("review","review","Correção criteriosa da casadinha",60,{description:"Identificar se cada erro foi técnico, de interpretação ou de leitura do comando."}));
        if(a){tasks.push(task("study-a","study","Aula técnica P3 pendente",60,{topicId:a.id,description:"Consolidar o subitem de maior prioridade na área técnica."}));noteUsed(a,used,chosen)}
        if(b){tasks.push(task("study-b","study","Complementares P2 para Q1",60,{topicId:b.id,description:"Conceitos e conexão com governança/CGU."}));noteUsed(b,used,chosen)}
        tasks.push(task("writing","writing","Treino de situação-problema Q2",60,{writingType:"q2",description:pair.case+" Estruture diagnóstico, controles, encaminhamentos e critérios de validação."}));
      }
    }else{
      type="sunday";minutes=clamp(n(cfg.sunHours)||5,4,8)*60;
      pair=pairFor(index,date,used);
      const a=choose("P3",date,used,chosen,pair.a?byId(pair.a)?.g.nome:null)||choose("P3",date,used,chosen);
      if(a){noteUsed(a,used,chosen);tasks.push(task("study-a","study","Aula nova ou recuperação P3",100,{topicId:a.id,description:"Aula direcionada + mapa de arquitetura, comandos e soluções aplicáveis."}))}
      const b=choose("P2",date,used,chosen,pair.b?byId(pair.b)?.g.nome:null)||choose("P1",date,used,chosen);
      if(b){noteUsed(b,used,chosen);tasks.push(task("study-b","study","Complementares e repertório Q1",80,{topicId:b.id,description:"Construir ponte entre governança, transparência, risco e responsabilidade."}))}
      tasks.push(task("pair","pairMock","Casadinha P2/P3 · "+pair.name,60,{pair,description:pair.case}));
      tasks.push(task("writing","writing","Redação Q1 — 30 linhas",60,{writingType:"q1",description:"Texto com introdução, dois argumentos, aplicação ao órgão e conclusão. Registrar avaliação na P4."}));
      title="Domingo de avanço + redação";
      tip="Não é domingo só de revisão: inclui dois conteúdos, simulado transversal e escrita de conhecimentos complementares.";
    }
    fit(tasks,minutes);
    return {date,index,type,title,tip,pair,minutes,tasks,locked:false};
  }
  function makeSchedule(){
    const p=plans(),b=p[META]||{},used={},days=[];
    cachedDeferrals=p.__deferrals||{};
    cachedSettings={...PREF,...(b.settings||{})};
    try{
      for(let i=0;i<DURATION;i++){
        const date=dateAt(i),p=generate(date,i,used,b.days?.[date]);
        days.push(p);
      }
      return days;
    }finally{cachedDeferrals=null;cachedSettings=null}
  }
  function p4Entries(){return window.CGU_P4Store?.read?.()?.entries||[]}
  function written(date,type){
    const entries=p4Entries();
    return entries.some(x=>x.date===date&&x.type===type);
  }
  function completed(t,day,b){
    if(!t)return false;
    if(t.kind==="writing")return !!(b.days[day.date]?.checks?.[t.id]||written(day.date,t.writingType));
    if(t.kind==="fullDisc")return !!(b.days[day.date]?.checks?.[t.id]||(written(day.date,"q1")&&written(day.date,"q2")));
    if(t.kind==="fullMock"||t.kind==="pairMock")return !!(b.mocks[day.date]?.[t.id]);
    if(t.kind==="study"){
      const s=t.topicId?getTS(t.topicId):null;
      return !!(b.days[day.date]?.checks?.[t.id]||s?.done);
    }
    return !!b.days[day.date]?.checks?.[t.id];
  }
  function progress(s,b){
    const tasks=s.flatMap(d=>d.tasks);
    const done=s.reduce((sum,d)=>sum+d.tasks.filter(t=>completed(t,d,b)).length,0);
    return {done,total:tasks.length,pct:tasks.length?100*done/tasks.length:0};
  }
  function taskTitle(t){
    const x=byId(t.topicId);
    return x?'<div class="s28-topic">'+esc(fullTitle(x))+'</div><div class="s28-topic-meta">'+esc(x.d.nome)+' · '+x.exam+' · '+esc(x.priority||"")+' · '+(x.m?.status||"Pendente")+(x.m?.q?' · '+fmt(x.m.liquido,1)+'% líquido':" · sem questões")+'</div>':"";
  }
  function resultsFor(day,t,b){
    const result=b.mocks[day.date]?.[t.id];
    if(!result)return "";
    if(t.kind==="fullMock")return '<div class="s28-result">Simulado registrado: '+fmt(result.total)+' / 260 pontos líquidos (P1 '+fmt(result.parts.P1.net)+'; P2 '+fmt(result.parts.P2.net)+'; P3 '+fmt(result.parts.P3.net)+'). Meta pessoal: 210–230/260.</div>';
    return '<div class="s28-result">Casadinha registrada: '+result.parts.map(p=>esc(p.exam)+' '+fmt(p.net)+'/'+fmt(p.max)+' pts').join(" · ")+'</div>';
  }
  function qMin(topicId){return Math.max(10,n(window.CGU_questionRoundMinimum?.(topicId)||10))}
  function roundFields(prefix,id,defaultQ){
    const min=qMin(id);
    return '<div class="s28-fields" data-s28-fields="'+esc(prefix)+'">'+
      '<div><label>Total</label><input type="number" min="'+min+'" step="1" data-s28-q placeholder="Mín. '+min+'"></div>'+
      '<div><label>Acertos</label><input type="number" min="0" step="1" data-s28-a placeholder="Acertos"></div>'+
      '<div><label>Em branco</label><input type="number" min="0" step="1" data-s28-b placeholder="0"></div>'+
      '<div><label>Erros</label><small>Calculados ao salvar</small></div></div>';
  }
  function mockFields(day,t){
    if(t.kind==="fullMock"){
      return '<div class="s28-pair-grid s28-full-grid">'+["P1","P2","P3"].map(exam=>
        '<div class="s28-pair-part" data-s28-exam="'+exam+'"><b>'+exam+' — '+LIMIT[exam]+' itens · peso '+WEIGHT[exam]+'</b>'+
        '<div class="s28-fields form-full">'+
        '<div><label>Acertos</label><input type="number" step="1" min="0" max="'+LIMIT[exam]+'" data-s28-a placeholder="0 a '+LIMIT[exam]+'"></div>'+
        '<div><label>Brancos</label><input type="number" step="1" min="0" max="'+LIMIT[exam]+'" data-s28-b value="0"></div>'+
        '<div><label>Erros</label><small>Automático</small></div></div></div>'
      ).join("")+'</div>';
    }
    const ids=[t.pair?.a,t.pair?.b].filter(Boolean);
    return '<div class="s28-pair-grid">'+ids.map((id,i)=>{
      const x=byId(id);return '<div class="s28-pair-part" data-s28-pair="'+i+'"><b>'+(x?esc(x.exam)+' · '+esc(x.g.nome):"Subitem indisponível")+'</b><small>'+esc(fullTitle(x))+'</small>'+roundFields(day.date+"-"+t.id+"-"+i,id,Math.max(20,qMin(id)))+'</div>';
    }).join("")+'</div>';
  }
  function renderTask(day,t,b){
    const done=completed(t,day,b),x=t.topicId?byId(t.topicId):null,exam=x?.exam||"";
    let actions="";
    if(t.kind==="study"||t.kind==="review"||t.kind==="bridge"){
      actions='<button class="primary" type="button" onclick="CGU28_toggle(\''+day.date+'\',\''+t.id+'\')">'+(done?"✓ Concluído — reabrir":"✓ Marcar atividade concluída")+'</button>';
    }else if(t.kind==="questions"){
      actions=done?'<span class="s28-result">Rodada registrada</span>':'<div>'+roundFields(day.date+"-"+t.id,t.topicId,Math.max(qMin(t.topicId),10))+'<div class="s28-actions"><button class="primary" type="button" onclick="CGU28_saveQuestions(\''+day.date+'\',\''+t.id+'\')">Registrar rodada neste tópico</button></div></div>';
    }else if(t.kind==="pairMock"||t.kind==="fullMock"){
      actions=done?resultsFor(day,t,b):mockFields(day,t)+'<div class="s28-actions"><button class="primary" type="button" onclick="CGU28_saveMock(\''+day.date+'\',\''+t.id+'\')">Salvar resultado do simulado</button></div>';
    }else if(t.kind==="writing"||t.kind==="fullDisc"){
      actions='<span class="s28-subline">'+(done?'✓ Registro localizado no acompanhamento P4.':'O treino só conta automaticamente quando salvo na aba Discursivas / P4. Você também pode marcar um rascunho como feito, sem atribuir nota.')+'</span>'+
      '<div class="s28-actions"><button type="button" class="primary" onclick="CGU28_openP4()">Abrir Discursivas / P4</button>'+
      '<button type="button" onclick="CGU28_toggle(\''+day.date+'\',\''+t.id+'\')">'+(b.days[day.date]?.checks?.[t.id]?"Desmarcar rascunho":"Marcar rascunho feito")+'</button></div>';
    }
    const last=x?.m?.q?' · última amostra: '+fmt(x.m.q)+' questões · '+fmt(x.m.liquido,1)+'% líquido · peso '+WEIGHT[exam]:'';
    return '<article class="s28-task '+(done?'done':'')+'" data-task="'+t.id+'">'+
      '<header><strong>'+(done?'✓ ':'')+esc(t.title)+'</strong><small>'+t.minutes+' min'+last+'</small></header>'+
      (t.topicId?taskTitle(t):'')+'<p>'+esc(t.description||"")+'</p>'+
      (t.kind==="pairMock"?'<div class="s28-subline">Conexão para Q2: '+esc(t.pair?.case||"")+'</div>':'')+
      '<div class="s28-actions">'+actions+'</div></article>';
  }
  function renderDay(days,b){
    const day=days.find(d=>d.date===selected)||days[0],host=document.getElementById("s28Daily");if(!host)return;
    if(!day)return;
    const done=day.tasks.filter(t=>completed(t,day,b)).length;
    host.innerHTML='<div class="s28-detail-head"><div><strong>Dia '+(day.index+1)+' · '+esc(fmtDate(day.date))+'</strong><small>'+esc(day.title)+' · '+(day.minutes?fmt(day.minutes/60,1)+'h disponíveis':"dia de prova")+'</small></div><span class="badge '+(done===day.tasks.length?"p3":"high")+'">'+done+'/'+day.tasks.length+' tarefas</span></div>'+
      '<div class="s28-logic">'+esc(day.tip)+'</div>'+
      (day.tasks.length?day.tasks.map(t=>renderTask(day,t,b)).join(""):'<div class="s28-result">Dia da prova: revise apenas o indispensável e priorize sua execução. Boa prova.</div>');
  }
  function renderDays(days,b){
    const host=document.getElementById("s28Timeline");if(!host)return;
    const oldScroll=host.scrollTop;
    const visible=days.filter(day=>{
      if(dayFilter==="pendentes")return day.tasks.length&&day.tasks.some(t=>!completed(t,day,b));
      if(dayFilter==="simulados")return day.tasks.some(t=>/Mock/.test(t.kind));
      if(dayFilter==="discursivas")return day.tasks.some(t=>["writing","fullDisc"].includes(t.kind));
      return true;
    });
    host.innerHTML=visible.map(day=>{
      const done=day.tasks.filter(t=>completed(t,day,b)).length;
      return '<button type="button" class="s28-day-btn '+(day.date===selected?'selected ':'')+(day.tasks.length&&done===day.tasks.length?'completed ':'')+(day.type==="exam"?'exam':'')+'" onclick="CGU28_select(\''+day.date+'\')">'+
        '<span><span class="s28-date">D'+(day.index+1)+' · '+esc(fmtDate(day.date))+'</span><span class="s28-day-type">'+esc(day.title)+'</span></span>'+
        '<span class="s28-day-state">'+(day.type==="exam"?"PROVA":done+'/'+day.tasks.length)+'</span></button>';
    }).join("")||'<div class="s28-subline">Nenhum dia corresponde ao filtro.</div>';
    host.scrollTop=oldScroll;
  }
  function renderKpis(days,b){
    const all=allRows(),critical=all.filter(x=>x.priority==="Crítica"&&!x.m.s.done).length;
    const below=all.filter(x=>x.m.status==="Revisar").length,unseen=all.filter(x=>!x.m.s.done).length;
    const p=progress(days,b),host=document.getElementById("s28KPIs");
    const hours=days.reduce((s,d)=>s+d.minutes,0);
    if(host)host.innerHTML=[
      [p.done+'/'+p.total,"Tarefas concluídas no ciclo"],
      [unseen,"Subitens ainda não concluídos no Edital"],
      [critical+" / "+below,"Críticos pendentes / temas para revisar"],
      [fmt(hours/60,1)+"h","Carga prevista até a prova"]
    ].map(([v,l])=>'<div class="s28-kpi"><b>'+v+'</b><span>'+l+'</span></div>').join("");
    const bar=document.getElementById("s28Progress");if(bar){bar.style.width=fmt(p.pct)+"%";bar.setAttribute("aria-valuenow",String(Math.round(p.pct)))}
  }
  function competitionHtml(c){
    const total=n(c.total),ac=n(c.ac),base=ac||total,isAC=ac>0;
    if(!base)return '<div class="s28-subline">Informe o número de inscritos do Cargo 3 para ver três cenários hipotéticos. Se conhecer o número da ampla concorrência, preencha-o separadamente.</div>';
    const scenarios=[
      {title:"Concorrência mais forte",absence:clamp(n(c.absence)-10,0,90),below:clamp(n(c.below)-15,0,95)},
      {title:"Cenário central ajustável",absence:clamp(n(c.absence),0,90),below:clamp(n(c.below),0,95)},
      {title:"Cenário mais favorável",absence:clamp(n(c.absence)+10,0,90),below:clamp(n(c.below)+15,0,95)}
    ];
    return '<div class="s28-comp-results">'+scenarios.map(z=>{
      const present=Math.round(base*(1-z.absence/100)),notReady=Math.round(present*z.below/100),competitive=present-notReady;
      return '<div><b>'+fmt(competitive)+' hipotéticos</b><strong style="font-size:10px">'+z.title+'</strong><small>Presentes: '+fmt(present)+' (abstenção suposta '+fmt(z.absence)+'%)</small><small>Perfil abaixo da preparação competitiva: '+fmt(notReady)+' ('+fmt(z.below)+'% dos presentes)</small><small>'+(!isAC?'Total de cargos, não AC isolada':'Base de AC informada')+' · 6 vagas imediatas AC</small></div>';
    }).join("")+'</div>'+
    '<p class="s28-comp-notice"><b>Aviso estatístico:</b> estes valores são cenários matemáticos baseados nas hipóteses escolhidas — NÃO são dados observados de abstenção, preparo ou concorrência real. '+(!isAC?'Como há apenas o total do cargo, não é possível calcular a concorrência real da ampla concorrência. ':'')+'Não representam probabilidade de classificação nem nota de corte. O edital prevê 6 vagas imediatas AC e até 36 redações corrigidas na AC para o Cargo 3.</p>';
  }
  function competitionDraft(){
    const total=document.getElementById("s28Inscritos"),ac=document.getElementById("s28InscritosAC"),abs=document.getElementById("s28Abs"),below=document.getElementById("s28Below");
    return {total:total?.value===""?null:clamp(n(total?.value),0,2000000),
      ac:ac?.value===""?null:clamp(n(ac?.value),0,2000000),
      absence:clamp(n(abs?.value),0,90),below:clamp(n(below?.value),0,95)};
  }
  function renderCompetition(b){
    const c=b.competition,host=document.getElementById("s28CompInputs");
    if(!host)return;
    host.innerHTML='<div class="s28-comp-grid">'+
      '<label>Inscritos no Cargo 3<input id="s28Inscritos" type="number" min="0" step="1" placeholder="Total divulgado" value="'+(c.total??'')+'" oninput="CGU28_previewComp()"></label>'+
      '<label>Inscritos AC (se conhecidos)<input id="s28InscritosAC" type="number" min="0" step="1" placeholder="Opcional" value="'+(c.ac??'')+'" oninput="CGU28_previewComp()"></label>'+
      '<label>Abstenção hipotética (%)<input id="s28Abs" type="number" min="0" max="90" step="1" value="'+c.absence+'" oninput="CGU28_previewComp()"></label>'+
      '<label>Preparo abaixo do competitivo (%)<input id="s28Below" type="number" min="0" max="95" step="1" value="'+c.below+'" oninput="CGU28_previewComp()"></label></div>'+
      '<div class="s28-actions"><button type="button" class="primary" onclick="CGU28_saveComp()">Salvar parâmetros</button></div>';
    document.getElementById("s28CompOutput").innerHTML=competitionHtml(c);
  }
  function render({keepScroll=true,keepComp=true}={}){
    if(!document.getElementById("page-sprint28"))return;
    const scroll=window.scrollY,b=load(),days=makeSchedule();
    renderKpis(days,b);renderDays(days,b);renderDay(days,b);
    const sh=document.getElementById("s28Sat"),su=document.getElementById("s28Sun");
    if(sh)sh.value=b.settings.satHours;if(su)su.value=b.settings.sunHours;
    if(!keepComp)renderCompetition(b);
    if(keepScroll)requestAnimationFrame(()=>window.scrollTo({top:scroll,left:0,behavior:"instant"}));
  }
  function ensureDay(b,date){
    const current=b.days[date],generated=makeSchedule().find(d=>d.date===date);
    if(!generated)throw Error("Dia não encontrado");
    if(!current?.locked)b.days[date]={...generated,locked:true,checks:{...(current?.checks||{})}};
    return b.days[date];
  }
  function taskIn(b,date,id){return ensureDay(b,date).tasks.find(t=>t.id===id)}
  function feedbackStart(text){window.CGUFeedback?.begin?.(text||"Atualizando plano...")}
  function feedbackEnd(){window.CGUFeedback?.complete?.()}
  function updateAfter(b,notice){
    write(b);render();feedbackEnd();
    if(notice&&typeof toast==="function")toast(notice);
  }
  function saveTopicRound(id,q,a,b,source){
    const old=getTS(id)||{},e=q-a-b;const hist=Array.isArray(old.questionRounds)?old.questionRounds:[];
    const oldQ=n(old.questoes),oldA=n(old.acertos),oldB=n(old.brancos),oldE=n(old.erros);
    const canonicalQ=Math.max(oldQ,oldA+oldB+oldE);
    const now=Date.now(),at=new Date(now).toISOString();
    setTS(id,{questoes:canonicalQ+q,acertos:oldA+a,brancos:oldB+b,erros:oldE+e,
      questionRounds:[...hist,{id:"qr-s28-"+now+"-"+Math.random().toString(36).slice(2,6),at,questoes:q,acertos:a,erros:e,brancos:b,liquidoRodada:q?100*(a-e)/q:null,source}],
      lastQuestionDate:at,lastQuestionSource:source,lastQuestionBatch:{questoes:q,acertos:a,erros:e,brancos:b,data:at.slice(0,10)},updatedAtMs:now,atomicConfirmed:true});
    return {q,a,b,e,exam:byId(id)?.exam||"P3",net:(a-e)*WEIGHT[byId(id)?.exam||"P3"],max:q*WEIGHT[byId(id)?.exam||"P3"]};
  }
  function fields(el,fixedQ){
    const qEl=el?.querySelector("[data-s28-q]"),aEl=el?.querySelector("[data-s28-a]"),bEl=el?.querySelector("[data-s28-b]");
    const q=fixedQ||Number(qEl?.value),a=Number(aEl?.value),b=Number(bEl?.value);
    if(!Number.isInteger(q)||q<=0||aEl?.value===""||!Number.isInteger(a)||!Number.isInteger(b)||a<0||b<0||a+b>q)return null;
    return {q,a,b,e:q-a-b};
  }
  function daysBy(date){return makeSchedule().find(x=>x.date===date)}
  window.CGU28_select=function(date){selected=date;render({keepScroll:true});};
  window.CGU28_filter=function(v){
    dayFilter=v;document.querySelectorAll(".s28-chip").forEach(c=>c.classList.toggle("on",c.dataset.filter===v));render();
  };
  window.CGU28_toggle=function(date,key){
    const b=load(),t=taskIn(b,date,key);if(!t)return;
    const day=b.days[date],was=!!day.checks?.[key],next=!was;
    feedbackStart("Atualizando atividade...");
    day.checks={...(day.checks||{}),[key]:next};day.updatedAtMs=Date.now();
    if(t.kind==="study"&&t.topicId){
      const old=getTS(t.topicId)||{};
      if(next)setTS(t.topicId,{done:true,completedAtMs:Date.now(),completionSource:"sprint28",updatedAtMs:Date.now()});
      else if(old.completionSource==="sprint28")setTS(t.topicId,{done:false,completedAtMs:null,completionSource:"sprint28-reopened",updatedAtMs:Date.now()});
      try{save()}catch(e){}
    }
    updateAfter(b,next?"Atividade concluída.":"Atividade reaberta.");
  };
  window.CGU28_saveQuestions=function(date,key){
    const b=load(),t=taskIn(b,date,key);if(!t?.topicId)return;
    const card=document.querySelector('#s28Daily [data-task="'+key+'"]'),data=fields(card);
    if(!data){alert("Preencha o total, acertos e brancos corretamente; erros são o restante.");return;}
    const min=qMin(t.topicId);if(data.q<min){alert("Mínimo do tópico: "+min+" questões nesta rodada.");return;}
    feedbackStart("Registrando rodada...");
    saveTopicRound(t.topicId,data.q,data.a,data.b,"reta-final-28");
    b.days[date].checks={...(b.days[date].checks||{}),[key]:true};
    try{save()}catch(e){}
    updateAfter(b,"Rodada registrada no tópico e sincronizável com o Edital.");
    window.dispatchEvent(new CustomEvent("cgu-question-recorded",{detail:{topicId:t.topicId,source:"reta-final-28"}}));
  };
  window.CGU28_saveMock=function(date,key){
    const b=load(),t=taskIn(b,date,key);if(!t)return;
    const card=document.querySelector('#s28Daily [data-task="'+key+'"]');
    if(!card)return;
    if(t.kind==="fullMock"){
      const parts={};let sum=0;
      for(const exam of ["P1","P2","P3"]){
        const el=card.querySelector('[data-s28-exam="'+exam+'"]'),aEl=el?.querySelector("[data-s28-a]"),bEl=el?.querySelector("[data-s28-b]");
        if(!aEl||aEl.value===""){alert("Preencha os acertos de "+exam+" antes de salvar o simulado.");return;}
        const a=Number(aEl.value),b=Number(bEl?.value),q=LIMIT[exam],e=q-a-b;
        if(!Number.isInteger(a)||!Number.isInteger(b)||a<0||b<0||e<0){alert("Confira os acertos e brancos em "+exam+".");return;}
        const net=(a-e)*WEIGHT[exam];parts[exam]={q,a,b,e,net,max:q*WEIGHT[exam]};sum+=net;
      }
      feedbackStart("Salvando simulado integral...");
      b.mocks[date]={...(b.mocks[date]||{}),[key]:{type:"integral",parts,total:sum,at:new Date().toISOString()}};
      updateAfter(b,"Simulado integral salvo: "+fmt(sum)+" / 260 pontos. Não foi atribuído a um único tópico.");
    }else if(t.kind==="pairMock"){
      const ids=[t.pair?.a,t.pair?.b].filter(Boolean),input=[];
      for(let i=0;i<ids.length;i++){
        const el=card.querySelector('[data-s28-pair="'+i+'"]'),d=fields(el),min=qMin(ids[i]);
        if(!d){alert("Preencha total, acertos e brancos dos dois subitens da casadinha.");return;}
        if(d.q<min){alert("O subitem "+(i+1)+" precisa de pelo menos "+min+" questões.");return;}
        input.push({id:ids[i],...d});
      }
      if(!input.length)return;
      feedbackStart("Salvando casadinha...");
      const parts=input.map(x=>saveTopicRound(x.id,x.q,x.a,x.b,"reta-final-casadinha"));
      b.mocks[date]={...(b.mocks[date]||{}),[key]:{type:"casadinha",parts,topicIds:ids,at:new Date().toISOString()}};
      try{save()}catch(e){}
      updateAfter(b,"Casadinha salva: duas rodadas vinculadas aos respectivos subitens.");
      ids.forEach(id=>window.dispatchEvent(new CustomEvent("cgu-question-recorded",{detail:{topicId:id,source:"reta-final-casadinha"}})));
    }
  };
  window.CGU28_openP4=function(){
    const b=document.querySelector('.nav button[data-page="discursiva"]');
    if(b&&typeof switchPage==="function")switchPage("discursiva",b);
    else if(typeof toast==="function")toast("Abra a aba Discursivas / P4 no menu.");
  };
  window.CGU28_saveHours=function(){
    const a=clamp(n(document.getElementById("s28Sat")?.value)||6,6,9),s=clamp(n(document.getElementById("s28Sun")?.value)||5,4,8);
    const b=load();b.settings.satHours=a;b.settings.sunHours=s;
    feedbackStart("Atualizando horários...");
    updateAfter(b,"Cargas dos próximos dias não iniciados ajustadas.");
  };
  window.CGU28_previewComp=function(){
    const el=document.getElementById("s28CompOutput");if(el)el.innerHTML=competitionHtml(competitionDraft());
  };
  window.CGU28_saveComp=function(){
    const b=load(),c=competitionDraft();
    if(c.ac!=null&&c.total!=null&&c.ac>c.total){alert("Inscritos AC não podem superar o total de inscritos no cargo.");return;}
    b.competition=c;feedbackStart("Salvando estimativas...");
    write(b);feedbackEnd();window.CGU28_previewComp();if(typeof toast==="function")toast("Parâmetros hipotéticos salvos no Firebase.");
  };
  function setup(){
    if(ready)return;ready=true;
    const nav=document.querySelector(".sidebar .nav");
    if(nav&&!nav.querySelector('[data-page="sprint28"]')){
      const btn=document.createElement("button");btn.dataset.page="sprint28";btn.type="button";btn.textContent="🏁 Reta final · 28 dias";
      btn.onclick=function(){switchPage("sprint28",this)};
      const before=nav.querySelector('[data-page="revisar"]');nav.insertBefore(btn,before||null);
    }
    const main=document.querySelector(".main");
    if(!main||document.getElementById("page-sprint28"))return;
    const page=document.createElement("section");page.id="page-sprint28";page.className="page";
    page.innerHTML='<div class="hero s28-header"><div><h2>Reta final · 28 dias</h2><p>16/11 a 13/12/2026 · Cargo 3 AFFC — Infraestrutura de TI</p></div><span class="badge p3">P3: 180/260 pts · Q2: 70/100 pts</span></div>'+
      '<div id="s28KPIs" class="s28-kpis"></div><div class="s28-progress" aria-label="Progresso de tarefas"><i id="s28Progress" role="progressbar" aria-valuemin="0" aria-valuemax="100"></i></div>'+
      '<div class="s28-card" style="margin-bottom:12px"><h3>Jornada realista e adaptável</h3><div class="s28-subline">Segunda a sexta: <b>04:00–05:20 (80 min)</b>, um subitem principal + questões + conexão. Sábados e domingos: conteúdos novos, simulados combinados, treino Q1/Q2 e correção. Véspera da prova: carga reduzida para descanso. Tarefas já iniciadas não são substituídas automaticamente; as futuras podem mudar conforme seu desempenho. Todos os temas vêm do Edital cadastrado.</div>'+
      '<div class="s28-config"><div><label>Horas por sábado (exceto véspera)</label><input id="s28Sat" type="number" min="6" max="9" step="1"></div><div><label>Horas por domingo</label><input id="s28Sun" type="number" min="4" max="8" step="1"></div><button class="s28-action" type="button" onclick="CGU28_saveHours()">Salvar horas</button></div>'+
      '<div class="s28-subline">Nota: 28º dia é a prova. O volume é referência, não obrigação inflexível. A seleção estratégica não equivale a previsão oficial de temas.</div></div>'+
      '<div class="s28-layout"><div class="s28-card"><h3>Calendário adaptativo</h3>'+
      '<div class="s28-toolbar"><button data-filter="todos" class="s28-chip on" onclick="CGU28_filter(\'todos\')">Todos</button><button data-filter="pendentes" class="s28-chip" onclick="CGU28_filter(\'pendentes\')">Pendentes</button><button data-filter="simulados" class="s28-chip" onclick="CGU28_filter(\'simulados\')">Simulados</button><button data-filter="discursivas" class="s28-chip" onclick="CGU28_filter(\'discursivas\')">P4</button></div>'+
      '<div id="s28Timeline" class="s28-day-list"></div></div><div class="s28-card"><h3>Execução do dia</h3><div id="s28Daily"></div></div></div>'+
      '<div class="s28-card" style="margin-top:12px"><h3>Estimativa de concorrência · cenários, não previsão</h3><div class="s28-subline">Cargo 3: <b>6 vagas imediatas AC</b>, <b>25 limites finais de aprovados AC</b> e até <b>36 correções discursivas AC</b> (conforme etapas e regras do edital). Número de inscritos, abstenção e perfil de preparo não são conhecidos automaticamente. Sem dados observados, não existe cálculo confiável de concorrentes efetivos nem probabilidade de ficar entre os seis.</div>'+
      '<div id="s28CompInputs"></div><div id="s28CompOutput"></div>'+
      '<p class="s28-comp-notice">Fonte oficial: <a href="https://www.cebraspe.org.br/concursos/cgu_26_affc" target="_blank" rel="noopener noreferrer">Cebraspe · CGU 26 AFFC</a>. Percentuais de abstenção e preparo nesta calculadora são inteiramente configuráveis e ilustrativos.</p></div>'+
      '<div class="s28-card" style="margin-top:12px"><h3>Regras da seleção estratégica</h3><div class="s28-subline">1) Primeiro, subitens <b>não concluídos</b>, críticos e sem amostra. 2) <b>P3 recebe maior peso</b> pelo limite de 180/260 pontos e também alimenta o estudo de caso Q2 (70 pontos). 3) P2 integra teoria e redação Q1 (30 pontos). 4) Baixo líquido na <b>última rodada</b> eleva a necessidade de recuperação; 5) Casadinhas P2/P3 e P1/P3 geram simulados interdisciplinares. 6) Os temas mais prováveis são <b>hipóteses de prioridade</b>, nunca frequências oficiais divulgadas. Meta pessoal objetiva de 210–230/260 e treino P4 de 85+/100; nenhuma dessas metas garante a classificação.</div></div>';
    const review=document.getElementById("page-revisar");
    if(review)review.insertAdjacentElement("beforebegin",page);else main.appendChild(page);
    const original=window.switchPage;
    if(typeof original==="function"&&!original.__s28Wrapped){
      const wrapped=function(name,btn){
        const r=original.apply(this,arguments);
        if(name==="sprint28"){
          const top=document.getElementById("topTitle");if(top)top.textContent="Reta final · 28 dias";
          render({keepScroll:false,keepComp:false});
        }
        return r;
      };
      wrapped.__s28Wrapped=true;
      window.switchPage=wrapped;
    }
    if(today()>=START&&today()<=EXAM)selected=today();
    render({keepScroll:false,keepComp:false});
    window.addEventListener("cgu-cloud-ready",()=>{if(document.getElementById("page-sprint28")?.classList.contains("active"))render({keepComp:false})});
    window.addEventListener("cgu-question-recorded",()=>{if(document.getElementById("page-sprint28")?.classList.contains("active"))requestAnimationFrame(()=>render())});
    window.addEventListener("cgu-p4-changed",()=>{if(document.getElementById("page-sprint28")?.classList.contains("active"))requestAnimationFrame(()=>render())});
  }
  window.CGU28_render=render;
  setup();
})();