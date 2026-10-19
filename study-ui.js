/* Complemento da tela Aulas do dia: mínimo de questões por bloco. */

function adaptiveMinQuestions(main){
  const m=main.m;
  if(!m.q) return 10;
  if(m.status==="Revisar"){
    const gap=m.meta-m.liquido;
    if(gap>=20) return 20;
    if(gap>=10) return 15;
    return 15;
  }
  if(m.liquido>=m.meta+15) return 20;
  return 15;
}

function adaptiveQuestionTargetText(main){
  const min=adaptiveMinQuestions(main);
  const m=main.m;
  if(!m.q) return `Conteúdo novo: faça no mínimo ${min} questões para criar uma primeira amostra.`;
  if(m.status==="Revisar") return `Recuperação: faça no mínimo ${min} questões antes de liberar a próxima matéria.`;
  if(m.liquido>=m.meta+15) return `Manutenção: faça no mínimo ${min} questões para confirmar que o desempenho continua estável.`;
  return `Consolidação: faça no mínimo ${min} questões antes de avançar.`;
}

adaptiveQuestionForm=function(main,lessonId){
  const min=adaptiveMinQuestions(main);
  return `<div class="lesson-question-box">
    <div class="lesson-question-head">
      <div class="lesson-question-title">📝 Registrar questões desta rodada</div>
      <div class="min-question-badge">Mínimo hoje: ${min} questões</div>
    </div>
    <div class="min-question-help">${escapeHtml(adaptiveQuestionTargetText(main))}</div>
    <div class="lesson-question-grid">
      <div><label>Total</label><input id="${qInputId("q-total",lessonId)}" type="number" min="${min}" inputmode="numeric" placeholder="Mín.: ${min}"></div>
      <div><label>Acertos</label><input id="${qInputId("q-acertos",lessonId)}" type="number" min="0" inputmode="numeric" placeholder="Ex.: 12"></div>
      <div><label>Em branco</label><input id="${qInputId("q-brancos",lessonId)}" type="number" min="0" inputmode="numeric" placeholder="0"></div>
      <button type="button" onclick="registerAdaptiveQuestions('${main.id}','${lessonId||"custom"}')">Salvar questões</button>
    </div>
    <div class="small" style="margin-top:6px">Os erros são calculados automaticamente. O resultado atualiza Dashboard, Edital, Revisar e recalcula o próximo foco.</div>
  </div>`;
};

registerAdaptiveQuestions=function(topicId,lessonId){
  const main=topicById(topicId);
  if(!main){alert("Não foi possível localizar o tópico atual.");return}
  const min=adaptiveMinQuestions(main);
  const q=Number(document.getElementById(qInputId("q-total",lessonId))?.value||0);
  const a=Number(document.getElementById(qInputId("q-acertos",lessonId))?.value||0);
  const b=Number(document.getElementById(qInputId("q-brancos",lessonId))?.value||0);
  if(!Number.isFinite(q)||q<min){
    alert(`Para este bloco, faça pelo menos ${min} questões antes de avançar.`);
    return;
  }
  if(a<0||b<0||a+b>q){
    alert("Confira os valores: acertos + em branco não podem ultrapassar o total de questões.");
    return;
  }
  const cur=normalizeTopic(topicId);
  const novosErros=q-a-b;
  setTS(topicId,{
    questoes:cur.q+q,
    acertos:cur.a+a,
    erros:cur.e+novosErros,
    brancos:(cur.brancos||0)+b,
    lastQuestionDate:new Date().toISOString(),
    historico:false
  });
  const flow=readAdaptiveFlow();
  if(flow && flow.topicId===topicId){
    flow.questionRegistered=true;
    flow.questionSource="batch";
    flow.lastBatch={questoes:q,acertos:a,erros:novosErros,brancos:b,at:new Date().toISOString(),minimo:min};
    writeAdaptiveFlow(flow);
  }
  save();
  finishAdaptiveFlowIfReady();
  renderAll();
  toast(`${q} questões registradas: ${a} acertos, ${novosErros} erros${b?` e ${b} em branco`:""}.`);
};

try{renderToday();}catch(e){console.warn("Mínimo de questões:",e)}
