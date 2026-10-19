/* Motor adaptativo da tela Aulas do dia.
   A matéria só avança quando o bloco de aula foi assistido E as questões foram registradas. */

const ADAPTIVE_LESSON_MAP={
  "Ordem Constitucional e Direitos":["pf1","pf2","df1","df2","df21","df25","df26","df27","adm1","adm2"],
  "Governança e Responsabilidades":["gov8","gov9","gov10","gov11","gov12"],
  "Riscos e Controles Essenciais":["risk1","risk2","risk3","risk4"],
  "Integridade Pública":["int1","int2","int3"],
  "Acesso à Informação":["lai1","lai2","lai3","lai4","lai5"],
  "Transparência e Proteção de Dados":["lgpd1","lgpd2","lgpd3","lgpd4"],
  "Conflitos de Interesses e Imparcialidade":["lei9784_5","coi11","coi12"],
  "Planejamento e Recursos":["orc1","orc5","orc9","orc13"]
};

const ADAPTIVE_FLOW_KEY=KEY+"-adaptive-flow-v2";

function readAdaptiveFlow(){
  try{return JSON.parse(localStorage.getItem(ADAPTIVE_FLOW_KEY)||"null")}catch(e){return null}
}
function writeAdaptiveFlow(flow){
  if(!flow){localStorage.removeItem(ADAPTIVE_FLOW_KEY);return}
  localStorage.setItem(ADAPTIVE_FLOW_KEY,JSON.stringify(flow));
}
function adaptivePriorityScore(x){
  const priorityBase={"Crítica":120,"Alta":85,"Média":50,"Baixa":25}[x.priority]||25;
  const examBase={P3:75,P2:35,P1:10}[x.exam]||0;
  const m=x.m;
  let score=priorityBase+examBase;
  if(x.exam==="P3")score+=20;
  if(x.exam==="P2")score+=10;
  if(!m.q){
    score+=x.priority==="Crítica"?45:x.priority==="Alta"?30:15;
  }else{
    const gap=m.meta-m.liquido;
    if(gap>0)score+=100+Math.min(80,gap*2);
    else{
      if(m.q<15)score+=18;
      if(m.q>=15 && m.liquido>=m.meta+15)score-=55;
      else if(m.q>=15 && m.liquido>=m.meta)score-=25;
    }
  }
  if(m.status==="Revisar")score+=35;
  if(m.s.done && m.status==="Atendeu")score-=70;
  if(m.s.done && m.status==="Revisar")score+=20;
  return score;
}
function adaptiveRankedTopics(){
  return topicsFlat().map(x=>({...x,adaptiveScore:adaptivePriorityScore(x)}))
    .sort((a,b)=>b.adaptiveScore-a.adaptiveScore || PRIORITY_RANK[a.priority]-PRIORITY_RANK[b.priority]);
}
function adaptiveReason(x){
  const m=x.m;
  if(!m.q)return `Ainda sem amostra de questões; ${x.exam} / ${x.priority.toLowerCase()} prioridade.`;
  const gap=m.meta-m.liquido;
  if(gap>0)return `% líquido ${fmtPct(m.liquido)} — ${gap.toFixed(1).replace('.',',')} p.p. abaixo da meta de ${m.meta}%.`;
  if(m.q<15)return `Meta atingida, mas a amostra ainda é pequena (${m.q} questões).`;
  if(m.liquido>=m.meta+15)return `Desempenho confortável (${fmtPct(m.liquido)}); reduzido na fila para abrir espaço a pontos fracos.`;
  return `Na meta (${fmtPct(m.liquido)}), mas ainda merece consolidação.`;
}
function adaptiveAllocation(main){
  const m=main.m;
  if(m.q && m.status==="Revisar"){
    const gap=m.meta-m.liquido;
    if(gap>=20)return {video:60,questions:90,review:30,label:"recuperação intensiva"};
    if(gap>=10)return {video:75,questions:75,review:30,label:"recuperação"};
    return {video:60,questions:90,review:30,label:"ajuste fino por questões"};
  }
  if(!m.q)return {video:105,questions:60,review:15,label:"cobertura de conteúdo novo"};
  if(m.liquido>=m.meta+15)return {video:75,questions:90,review:15,label:"manutenção e ganho por questões"};
  return {video:90,questions:75,review:15,label:"consolidação"};
}
function topicById(id){return adaptiveRankedTopics().find(x=>x.id===id)||null}
function pendingLessonsForTopic(x,videoMinutes){
  const ids=ADAPTIVE_LESSON_MAP[x.g.nome]||[];
  const available=ids.map(id=>LESSONS.find(l=>l.id===id)).filter(Boolean).filter(l=>!lessonDone(l.id));
  const chosen=[];let used=0;
  for(const lesson of available){
    if(chosen.length>=2)break;
    if(!chosen.length || used+lesson.sec<=videoMinutes*60){chosen.push(lesson);used+=lesson.sec}
  }
  return chosen;
}
function newAdaptiveFlow(main,alloc){
  const lessons=pendingLessonsForTopic(main,alloc.video);
  return {
    topicId:main.id,
    lessonIds:lessons.map(l=>l.id),
    customDone:false,
    questionRegistered:false,
    questionSource:null,
    baselineQ:main.m.q||0,
    startedAt:new Date().toISOString()
  };
}
function ensureAdaptiveFlow(ranked){
  let flow=readAdaptiveFlow();
  let main=flow?ranked.find(x=>x.id===flow.topicId):null;
  if(!main){
    main=ranked[0];
    flow=newAdaptiveFlow(main,adaptiveAllocation(main));
    writeAdaptiveFlow(flow);
  }else if(!flow.questionRegistered && main.m.q>(Number(flow.baselineQ)||0)){
    flow.questionRegistered=true;
    flow.questionSource="external";
    writeAdaptiveFlow(flow);
  }
  return {flow,main};
}
function adaptiveLessonsFromFlow(flow){return (flow.lessonIds||[]).map(id=>LESSONS.find(l=>l.id===id)).filter(Boolean)}
function adaptiveLessonsDone(flow){
  const ids=flow.lessonIds||[];
  return ids.length?ids.every(id=>lessonDone(id)):!!flow.customDone;
}
function adaptiveFlowReady(flow){return adaptiveLessonsDone(flow)&&!!flow.questionRegistered}
function finishAdaptiveFlowIfReady(){
  const flow=readAdaptiveFlow();
  if(flow && adaptiveFlowReady(flow)){
    writeAdaptiveFlow(null);
    toast("Bloco concluído. Plano recalculado pelo desempenho.");
    return true;
  }
  return false;
}

// Mantém o comportamento de aula assistida, mas não libera outra matéria sem questões.
const baseToggleLessonAdaptive=toggleLesson;
toggleLesson=function(id,v){
  lessonState[id]=!!v;
  save();
  finishAdaptiveFlowIfReady();
  renderAll();
};

function markAdaptiveCustomDone(v){
  const flow=readAdaptiveFlow();if(!flow)return;
  flow.customDone=!!v;writeAdaptiveFlow(flow);
  finishAdaptiveFlowIfReady();renderAll();
}
function markQuestionsAlreadyRegistered(checked){
  const flow=readAdaptiveFlow();if(!flow)return;
  if(checked){
    flow.questionRegistered=true;
    flow.questionSource="already";
  }else if(flow.questionSource==="already"){
    flow.questionRegistered=false;
    flow.questionSource=null;
  }
  writeAdaptiveFlow(flow);
  finishAdaptiveFlowIfReady();renderAll();
}
function qInputId(prefix,lessonId){return `${prefix}-${String(lessonId||"custom").replace(/[^a-zA-Z0-9_-]/g,"-")}`}
function registerAdaptiveQuestions(topicId,lessonId){
  const q=Number(document.getElementById(qInputId("q-total",lessonId))?.value||0);
  const a=Number(document.getElementById(qInputId("q-acertos",lessonId))?.value||0);
  const b=Number(document.getElementById(qInputId("q-brancos",lessonId))?.value||0);
  if(!Number.isFinite(q)||q<=0){alert("Informe a quantidade de questões feitas nesta rodada.");return}
  if(a<0||b<0||a+b>q){alert("Confira os valores: acertos + em branco não podem ultrapassar o total de questões.");return}
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
    flow.lastBatch={questoes:q,acertos:a,erros:novosErros,brancos:b,at:new Date().toISOString()};
    writeAdaptiveFlow(flow);
  }
  save();
  finishAdaptiveFlowIfReady();
  renderAll();
  toast(`${q} questões registradas: ${a} acertos, ${novosErros} erros${b?` e ${b} em branco`:""}.`);
}
function adaptiveQuestionControls(main,lessonId,index,totalLessons,flow){
  const repeated=totalLessons>1 && index>0;
  if(flow.questionRegistered){
    return `<label class="question-registered"><input type="checkbox" checked onchange="markQuestionsAlreadyRegistered(this.checked)"><span>Questões já registradas nesta matéria hoje${repeated?" — não precisa lançar novamente nesta segunda aula":""}.</span></label>`;
  }
  if(repeated){
    return `<div class="question-registered" style="background:#fff;border-color:#e5e7eb;color:#64748b"><input type="checkbox" disabled><span>Questões já registradas nesta matéria. Marque automaticamente após registrar no bloco anterior, ou registre abaixo se preferir fazer as questões depois desta aula.</span></div>${adaptiveQuestionForm(main,lessonId)}`;
  }
  return adaptiveQuestionForm(main,lessonId);
}
function adaptiveQuestionForm(main,lessonId){
  return `<div class="lesson-question-box">
    <div class="lesson-question-title">📝 Registrar questões desta rodada</div>
    <div class="lesson-question-grid">
      <div><label>Total</label><input id="${qInputId("q-total",lessonId)}" type="number" min="1" inputmode="numeric" placeholder="Ex.: 15"></div>
      <div><label>Acertos</label><input id="${qInputId("q-acertos",lessonId)}" type="number" min="0" inputmode="numeric" placeholder="Ex.: 12"></div>
      <div><label>Em branco</label><input id="${qInputId("q-brancos",lessonId)}" type="number" min="0" inputmode="numeric" placeholder="0"></div>
      <button type="button" onclick="registerAdaptiveQuestions('${main.id}','${lessonId||"custom"}')">Salvar questões</button>
    </div>
    <div class="small" style="margin-top:6px">Os erros são calculados automaticamente. O resultado atualiza Dashboard, Edital, Revisar e recalcula o próximo foco.</div>
  </div>`;
}
function adaptiveLessonCard(main,lesson,index,totalLessons,flow){
  const watched=lessonDone(lesson.id);
  return `<div class="lesson-card ${watched?"done":""}">
    <div class="lesson-top">
      <div class="lesson-title">${escapeHtml(lesson.title)} <span class="lesson-step">Aula ${index+1}/${totalLessons}</span></div>
      <span class="badge ${priClass(main.priority)}">${main.priority}</span><span class="badge ${examClass(main.exam)}">${main.exam}</span>
    </div>
    <div class="lesson-meta">${escapeHtml(lesson.course)} · ${secLabel(lesson.sec)} · <b>${escapeHtml(main.g.nome)}</b></div>
    <div class="small" style="margin-top:6px"><b>Por que entrou hoje:</b> ${escapeHtml(adaptiveReason(main))}</div>
    <div class="lesson-actions"><button class="primary" onclick="toggleLesson('${lesson.id}',${!watched})">${watched?"Reabrir aula":"✓ Marcar assistida"}</button></div>
    ${adaptiveQuestionControls(main,lesson.id,index,totalLessons,flow)}
  </div>`;
}
function adaptiveCustomCard(main,flow,alloc){
  const material=(main.m.s.aula||"").trim() || `Gran > ${main.d.nome} > ${main.g.nome}`;
  return `<div class="lesson-card ${flow.customDone?"done":""}">
    <div class="lesson-top"><div class="lesson-title">${escapeHtml(material)}</div><span class="badge ${priClass(main.priority)}">${main.priority}</span><span class="badge ${examClass(main.exam)}">${main.exam}</span></div>
    <div class="lesson-meta"><b>${escapeHtml(main.g.nome)}</b> · reservar até ${alloc.video} min</div>
    <div class="topic-text">${escapeHtml(main.t)}</div>
    <div class="small"><b>Por que entrou hoje:</b> ${escapeHtml(adaptiveReason(main))}</div>
    <div class="custom-study-actions"><button class="primary" onclick="markAdaptiveCustomDone(${!flow.customDone})">${flow.customDone?"Reabrir bloco":"✓ Marcar bloco assistido"}</button></div>
    ${adaptiveQuestionControls(main,"custom",0,1,flow)}
  </div>`;
}

renderToday=function(){
  const host=document.getElementById("todayLessons");if(!host)return;
  const dateEl=document.getElementById("studyDate");
  if(dateEl && !dateEl.dataset.init){
    const n=new Date();
    dateEl.value=`${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,"0")}-${String(n.getDate()).padStart(2,"0")}`;
    dateEl.dataset.init="1";
  }
  const d=studyDateObj();
  const ranked=adaptiveRankedTopics();
  if(!ranked.length){host.innerHTML='<div class="empty">Nenhum tópico disponível.</div>';return}
  let {flow,main}=ensureAdaptiveFlow(ranked);
  const alloc=adaptiveAllocation(main);
  const lessons=adaptiveLessonsFromFlow(flow);
  const watched=adaptiveLessonsDone(flow);
  const questionOK=!!flow.questionRegistered;

  document.getElementById("todayTitle").textContent=`Plano adaptativo · ${d.toLocaleDateString("pt-BR",{weekday:"long",day:"2-digit",month:"2-digit"})}`;

  let html=`<div style="border:1px solid #bfdbfe;background:#eff6ff;border-radius:12px;padding:12px;margin-bottom:10px">
    <div style="font-weight:900;color:#17365D;margin-bottom:5px">🎯 Matéria atual: ${escapeHtml(main.g.nome)}</div>
    <div class="small">O foco fica travado nesta matéria até você concluir a(s) aula(s) do bloco e registrar as questões. Depois o sistema recalcula o próximo assunto pelo desempenho.</div>
  </div>`;
  if(lessons.length)html+=lessons.map((l,i)=>adaptiveLessonCard(main,l,i,lessons.length,flow)).join("");
  else html+=adaptiveCustomCard(main,flow,alloc);

  const gateClass=watched&&questionOK?"focus-lock ok":"focus-lock";
  const gateText=watched&&questionOK
    ?"✓ Aula(s) e questões concluídas. O próximo foco será recalculado."
    :`Para liberar outra matéria: ${watched?"✓ aula(s) assistida(s)":"○ concluir aula(s)"} + ${questionOK?"✓ questões registradas":"○ registrar questões"}.`;
  html+=`<div class="${gateClass}"><b>Regra de avanço:</b> ${gateText}</div>`;
  host.innerHTML=html;

  const videoEnd=alloc.video, qEnd=videoEnd+alloc.questions;
  document.getElementById("todayRoutine").innerHTML=`
    <div style="border:1px solid #e5e7eb;border-radius:10px;padding:10px;margin-bottom:10px">
      <div class="small"><b>Modo de hoje:</b> ${escapeHtml(alloc.label)}.</div>
      <div class="small" style="margin-top:4px"><b>Motivo:</b> ${escapeHtml(adaptiveReason(main))}</div>
    </div>
    <div class="plan-line"><div class="plan-time">0–${videoEnd}m</div><div><b>Aula / teoria direcionada</b><div class="plan-kind">${escapeHtml(main.g.nome)}</div></div><b>${alloc.video} min</b></div>
    <div class="plan-line"><div class="plan-time">${videoEnd}–${qEnd}m</div><div><b>Questões Cebraspe</b><div class="plan-kind">faça do mesmo assunto e registre logo abaixo da aula</div></div><b>${alloc.questions} min</b></div>
    <div class="plan-line"><div class="plan-time">${qEnd}–180m</div><div><b>Revisão ativa</b><div class="plan-kind">erros, conceitos-chave e resumo</div></div><b>${alloc.review} min</b></div>`;

  const next=ranked.filter(x=>x.id!==main.id).slice(0,4);
  document.getElementById("todayRelease").innerHTML=`
    <div style="margin-top:16px;border-top:1px solid #e5e7eb;padding-top:12px">
      <div class="small"><b>Próximos candidatos de foco</b> — só entram depois do registro das questões atuais.</div>
      ${next.map((x,i)=>`<div class="small" style="margin-top:6px"><b>${i+1}. ${escapeHtml(x.g.nome)}</b> · ${x.exam} · ${x.m.q?`${fmtPct(x.m.liquido)} / meta ${x.m.meta}%`:"sem questões"}</div>`).join("")}
    </div>
    <div style="margin-top:12px;border:1px solid #dcfce7;background:#f0fdf4;border-radius:10px;padding:10px">
      <div class="small"><b>Inteligência adaptativa:</b> as questões lançadas nesta tela alimentam a mesma base do Edital e da aba Revisar. Se o resultado ficar abaixo da meta, o assunto pode continuar ou voltar rapidamente; se estiver forte, o sistema abre espaço para outro ponto fraco ou conteúdo ainda não coberto.</div>
    </div>`;

  const budget=document.querySelectorAll("#page-hoje .budget-item b");
  if(budget.length>=3){budget[0].textContent=`${alloc.video} min`;budget[1].textContent=`${alloc.questions} min`;budget[2].textContent=`${alloc.review} min`}
};

try{renderToday();}catch(e){console.warn("Motor adaptativo:",e)}
