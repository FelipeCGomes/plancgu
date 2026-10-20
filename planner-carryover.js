/* Pendências do plano diário.
   Regra: um tema não concluído no dia anterior (ou no último dia com plano) vira o primeiro bloco do dia atual.
   Ao concluir a pendência, o sistema retorna ao tema que estava originalmente programado para hoje.
   Datas futuras usadas apenas para consulta não são contaminadas por pendências de hoje. */
(() => {
  const PLAN_KEY = KEY + "-daily-plans-v1";
  let internalRender = false;

  function readPlans(){
    if(typeof window.CGU_readDailyPlans === "function") return window.CGU_readDailyPlans();
    try{return JSON.parse(localStorage.getItem(PLAN_KEY)||"{}")||{}}catch(e){return {}}
  }
  function writePlans(v){
    if(typeof window.CGU_writeDailyPlans === "function") return window.CGU_writeDailyPlans(v);
    try{localStorage.setItem(PLAN_KEY,JSON.stringify(v||{}));}catch(e){}
    window.dispatchEvent(new CustomEvent("cgu-plan-changed"));
  }
  function todayYmd(){
    const n=new Date();
    return `${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,"0")}-${String(n.getDate()).padStart(2,"0")}`;
  }
  function selectedYmd(){return document.getElementById("studyDate")?.value || todayYmd();}
  function row(id){return topicsFlat().find(x=>x.id===id)||null;}
  function atomTitle(x){
    if(!x)return "";
    const a=window.ATOMIC_META?.[x.id]||{};
    return a.code?`${a.code} · ${a.title}`:(a.title||x.g.nome);
  }
  function completedHas(p,id){return (p?.completed||[]).some(c=>c?.topicId===id);}
  function planFinished(p){
    if(!p?.activeTopicId)return true;
    if(completedHas(p,p.activeTopicId))return true;
    return !!p.studied && !!p.questionRegistered;
  }
  function unfinishedBefore(ymd,plans){
    const dates=Object.keys(plans||{}).filter(d=>/^\d{4}-\d{2}-\d{2}$/.test(d)&&d<ymd).sort().reverse();
    for(const d of dates){
      const p=plans[d];
      if(!p?.activeTopicId || !row(p.activeTopicId) || planFinished(p))continue;
      return {
        planDate:d,
        sourceDate:p.carryoverFrom||d,
        topicId:p.activeTopicId,
        studied:!!p.studied || !!row(p.activeTopicId)?.m?.s?.done,
        questionRegistered:!!p.questionRegistered
      };
    }
    return null;
  }
  function applyCarryover(ymd){
    // Carryover real só é aplicado ao dia atual. Futuro continua sendo prévia do cronograma.
    if(ymd!==todayYmd())return false;
    const plans=readPlans();
    const p=plans[ymd];
    if(!p?.activeTopicId)return false;

    // Se o usuário já começou o plano de hoje, não trocamos o foco por baixo dele.
    if(p.userTouched || (p.completed||[]).length || p.studied || p.questionRegistered)return false;
    if(p.carryoverFrom && p.carryoverTopicId)return false;

    const pending=unfinishedBefore(ymd,plans);
    if(!pending || pending.topicId===p.activeTopicId)return false;
    const x=row(pending.topicId); if(!x)return false;

    plans[ymd]={
      ...p,
      scheduledTopicId:p.activeTopicId,
      scheduledSubjectId:p.subjectId||row(p.activeTopicId)?.d?.id||null,
      scheduledExamLane:p.examLane||row(p.activeTopicId)?.exam||null,
      carryoverFrom:pending.sourceDate,
      carryoverPlanDate:pending.planDate,
      carryoverTopicId:pending.topicId,
      activeTopicId:pending.topicId,
      subjectId:x.d.id,
      examLane:x.exam,
      studied:pending.studied,
      questionRegistered:pending.questionRegistered,
      carryoverAppliedAtMs:Date.now(),
      updatedAtMs:Date.now()
    };
    writePlans(plans);
    return true;
  }
  function sameYmd(value,ymd){
    if(!value)return false;
    const d=new Date(value);if(isNaN(d))return false;
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`===ymd;
  }
  function restoreScheduledIfCarryoverFinished(ymd,before){
    if(!before?.carryoverTopicId || !before?.scheduledTopicId)return false;
    const plans=readPlans(),p=plans[ymd];
    if(!p)return false;
    const finished=completedHas(p,before.carryoverTopicId);
    if(!finished)return false;

    const scheduled=row(before.scheduledTopicId);
    if(!scheduled){
      const cleaned={...p};
      ["scheduledTopicId","scheduledSubjectId","scheduledExamLane","carryoverFrom","carryoverPlanDate","carryoverTopicId","carryoverAppliedAtMs"].forEach(k=>delete cleaned[k]);
      plans[ymd]=cleaned;writePlans(plans);return true;
    }
    const s=scheduled.m.s;
    const cleaned={
      ...p,
      activeTopicId:scheduled.id,
      subjectId:scheduled.d.id,
      examLane:before.scheduledExamLane||scheduled.exam,
      studied:!!s.done,
      questionRegistered:sameYmd(s.lastQuestionDate,ymd),
      carryoverCompletedAtMs:Date.now(),
      updatedAtMs:Date.now()
    };
    ["scheduledTopicId","scheduledSubjectId","scheduledExamLane","carryoverFrom","carryoverPlanDate","carryoverTopicId","carryoverAppliedAtMs"].forEach(k=>delete cleaned[k]);
    plans[ymd]=cleaned;
    writePlans(plans);
    return true;
  }
  function decorate(ymd){
    const plans=readPlans(),p=plans[ymd];
    if(!p?.carryoverFrom || !p?.carryoverTopicId)return;
    const host=document.getElementById("todayLessons");if(!host||host.querySelector(".carryover-banner"))return;
    const x=row(p.carryoverTopicId),scheduled=row(p.scheduledTopicId);
    const missing=[];if(!p.studied)missing.push("teoria/estudo");if(!p.questionRegistered)missing.push("questões");
    host.insertAdjacentHTML("afterbegin",`<div class="carryover-banner" style="margin:0 0 10px;padding:10px 12px;border:1px solid #fbbf24;background:#fffbeb;border-radius:10px;color:#92400e;font-size:11px;line-height:1.45"><b>⏳ Pendência transferida de ${escapeHtml(p.carryoverFrom.split('-').reverse().join('/'))}</b><br>${escapeHtml(atomTitle(x))}${missing.length?` · falta: <b>${escapeHtml(missing.join(" + "))}</b>`:""}.${scheduled?`<br><span style="color:#64748b">Depois desta pendência, o plano volta ao conteúdo previsto para hoje: ${escapeHtml(atomTitle(scheduled))}.</span>`:""}</div>`);
  }

  const baseRender=renderToday;
  renderToday=function(){
    if(internalRender)return baseRender();
    internalRender=true;
    try{
      const ymd=selectedYmd();
      baseRender(); // garante que o plano do dia exista
      const changed=applyCarryover(ymd);
      if(changed)baseRender();
      decorate(ymd);
    }finally{internalRender=false;}
  };

  function wrapAction(name){
    const base=window[name];if(typeof base!=="function")return;
    window[name]=function(...args){
      const ymd=args[1]||selectedYmd();
      const before={...(readPlans()[ymd]||{})};
      const out=base.apply(this,args);
      if(restoreScheduledIfCarryoverFinished(ymd,before)){
        try{renderAll();}catch(e){}
      }
      return out;
    };
  }
  wrapAction("CGU_markPlanStudied");
  wrapAction("CGU_registerPlanQuestions");

  try{renderToday();}catch(e){console.warn("Carryover do plano:",e);}
})();
