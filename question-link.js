/* Vínculo explícito das questões do Plano do dia com o tópico correto do Edital.
   A aula e o assunto das questões podem ser diferentes; o usuário escolhe onde lançar. */
(() => {
  function rowsForSubject(main){
    return topicsFlat().filter(x=>x.d.id===main.d.id);
  }

  function targetSelectId(lessonId){
    return qInputId("q-topic",lessonId);
  }
  function previewId(lessonId){
    return qInputId("q-preview",lessonId);
  }
  function minBadgeId(lessonId){
    return qInputId("q-min-badge",lessonId);
  }
  function minHelpId(lessonId){
    return qInputId("q-min-help",lessonId);
  }

  function selectedTarget(main,lessonId){
    const id=document.getElementById(targetSelectId(lessonId))?.value || main.id;
    return topicsFlat().find(x=>x.id===id) || main;
  }

  function targetMin(target){
    return typeof adaptiveMinQuestions==="function" ? adaptiveMinQuestions(target) : 10;
  }

  function targetHelp(target){
    return typeof adaptiveQuestionTargetText==="function"
      ? adaptiveQuestionTargetText(target)
      : `Faça no mínimo ${targetMin(target)} questões.`;
  }

  function targetPreview(target){
    const m=metrics(target.id,target.exam);
    const b=Number(m.s.brancos)||0;
    return `
      <div class="sync-link"><b>Será lançado em:</b> ${escapeHtml(target.d.nome)} → <b>${escapeHtml(target.g.nome)}</b>.</div>
      <div class="question-cumulative">
        <div><span>Acumulado</span><b>${m.q}</b></div>
        <div><span>Acertos</span><b>${m.a}</b></div>
        <div><span>Erros</span><b>${m.e}</b></div>
        <div><span>Em branco</span><b>${b}</b></div>
        <div><span>Líquido</span><b>${fmtPct(m.liquido)}</b></div>
      </div>`;
  }

  window.refreshQuestionTarget=function(mainId,lessonId){
    const main=topicsFlat().find(x=>x.id===mainId);
    if(!main)return;
    const target=selectedTarget(main,lessonId);
    const preview=document.getElementById(previewId(lessonId));
    if(preview)preview.innerHTML=targetPreview(target);
    const min=targetMin(target);
    const badge=document.getElementById(minBadgeId(lessonId));
    if(badge)badge.textContent=`Mínimo hoje: ${min} questões`;
    const help=document.getElementById(minHelpId(lessonId));
    if(help)help.textContent=targetHelp(target);
    const total=document.getElementById(qInputId("q-total",lessonId));
    if(total){total.min=String(min);total.placeholder=`Mín.: ${min}`;}
  };

  adaptiveQuestionForm=function(main,lessonId){
    const rows=rowsForSubject(main);
    const min=targetMin(main);
    const options=rows.map(x=>`<option value="${escapeHtml(x.id)}" ${x.id===main.id?"selected":""}>${escapeHtml(x.g.nome)}</option>`).join("");
    return `<div class="lesson-question-box">
      <div class="lesson-question-head">
        <div class="lesson-question-title">📝 Registrar questões desta rodada</div>
        <div id="${minBadgeId(lessonId)}" class="min-question-badge">Mínimo hoje: ${min} questões</div>
      </div>
      <div class="question-topic-select">
        <label>Questões sobre qual tópico do Edital?</label>
        <select id="${targetSelectId(lessonId)}" onchange="refreshQuestionTarget('${main.id}','${lessonId||"custom"}')">${options}</select>
        <div class="small">A aula assistida e o assunto das questões podem ser diferentes. Escolha aqui o tópico que você realmente respondeu.</div>
      </div>
      <div id="${previewId(lessonId)}">${targetPreview(main)}</div>
      <div id="${minHelpId(lessonId)}" class="min-question-help">${escapeHtml(targetHelp(main))}</div>
      <div class="lesson-question-grid">
        <div><label>Total</label><input id="${qInputId("q-total",lessonId)}" type="number" min="${min}" inputmode="numeric" placeholder="Mín.: ${min}"></div>
        <div><label>Acertos</label><input id="${qInputId("q-acertos",lessonId)}" type="number" min="0" inputmode="numeric" placeholder="Ex.: 12"></div>
        <div><label>Em branco</label><input id="${qInputId("q-brancos",lessonId)}" type="number" min="0" inputmode="numeric" placeholder="0"></div>
        <button type="button" onclick="registerAdaptiveQuestions('${main.id}','${lessonId||"custom"}')">Salvar questões</button>
      </div>
      <div class="small" style="margin-top:6px">Os erros são calculados automaticamente. O lançamento atualiza imediatamente Edital, Revisar e Dashboard.</div>
    </div>`;
  };

  registerAdaptiveQuestions=function(mainTopicId,lessonId){
    const main=topicsFlat().find(x=>x.id===mainTopicId);
    if(!main){alert("Não foi possível localizar o tópico atual.");return;}
    const target=selectedTarget(main,lessonId);
    const min=targetMin(target);
    const q=Number(document.getElementById(qInputId("q-total",lessonId))?.value||0);
    const a=Number(document.getElementById(qInputId("q-acertos",lessonId))?.value||0);
    const b=Number(document.getElementById(qInputId("q-brancos",lessonId))?.value||0);
    if(!Number.isFinite(q)||q<min){alert(`Para ${target.g.nome}, faça pelo menos ${min} questões antes de avançar.`);return;}
    if(a<0||b<0||a+b>q){alert("Confira os valores: acertos + em branco não podem ultrapassar o total de questões.");return;}

    const cur=normalizeTopic(target.id);
    const novosErros=q-a-b;
    setTS(target.id,{
      questoes:cur.q+q,
      acertos:cur.a+a,
      erros:cur.e+novosErros,
      brancos:(cur.brancos||0)+b,
      lastQuestionDate:new Date().toISOString(),
      historico:false,
      updatedAtMs:Date.now()
    });

    const flow=readAdaptiveFlow();
    if(flow && flow.topicId===mainTopicId){
      flow.questionRegistered=true;
      flow.questionSource="batch";
      flow.lastBatch={topicId:target.id,questoes:q,acertos:a,erros:novosErros,brancos:b,at:new Date().toISOString(),minimo:min};
      writeAdaptiveFlow(flow);
    }

    save();
    finishAdaptiveFlowIfReady();
    renderAll();
    if(typeof renderPerformancePanel==="function")renderPerformancePanel();
    toast(`${q} questões registradas em ${target.g.nome}: ${a} acertos, ${novosErros} erros${b?` e ${b} em branco`:""}.`);
  };

  const style=document.createElement("style");
  style.id="questionLinkStyle";
  style.textContent=`
    .question-topic-select{margin:8px 0 6px}.question-topic-select label{display:block;font-size:9px;text-transform:uppercase;font-weight:900;color:#475569;margin-bottom:4px}.question-topic-select select{width:100%;border:1px solid #cbd5e1;border-radius:8px;background:#fff;padding:8px 10px;color:#17365D;font-weight:800}.question-topic-select .small{margin-top:4px}
  `;
  document.head.appendChild(style);

  try{renderToday();}catch(e){console.warn("Vínculo de questões:",e);}
})();
