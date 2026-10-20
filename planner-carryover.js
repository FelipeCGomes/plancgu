/* Pendências do plano diário.
   Regra v2:
   - tema não concluído é reclassificado para o dia atual;
   - ele deixa de aparecer como ativo no dia anterior;
   - o dia anterior mantém apenas um flag/auditoria "Reclassificado";
   - se o dia anterior também tinha um conteúdo originalmente agendado, esse conteúdo volta a ficar pendente naquele dia;
   - ao concluir a pendência no dia atual, o sistema retorna ao conteúdo originalmente previsto para hoje.
*/
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
  function fmtDate(ymd){return String(ymd||"").split("-").reverse().join("/");}
  function completedHas(p,id){return (p?.completed||[]).some(c=>c?.topicId===id);}
  function planFinished(p){
    if(!p?.activeTopicId)return true;
    if(completedHas(p,p.activeTopicId))return true;
    return !!p.studied && !!p.questionRegistered;
  }
  function sameYmd(value,ymd){
    if(!value)return false;
    const d=new Date(value);if(isNaN(d))return false;
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`===ymd;
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

  function markSourceReclassified(plans,pending,toDate){
    const source=plans[pending.planDate];
    if(!source)return;
    const now=Date.now();
    const hist=[...(source.reclassifiedOut||[])];
    if(!hist.some(h=>h?.topicId===pending.topicId && h?.toDate===toDate)){
      hist.push({
        topicId:pending.topicId,
        fromDate:pending.planDate,
        originalDate:pending.sourceDate||pending.planDate,
        toDate,
        atMs:now,
        status:"Reclassificado"
      });
    }

    const next={
      ...source,
      reclassifiedOut:hist,
      reclassified:true,
      lastReclassifiedTopicId:pending.topicId,
      lastReclassifiedTo:toDate,
      lastReclassifiedAtMs:now,
      updatedAtMs:now
    };

    // O tópico movido deixa de ser o ativo do dia anterior.
    if(source.activeTopicId===pending.topicId){
      const scheduled=source.scheduledTopicId ? row(source.scheduledTopicId) : null;
      if(scheduled && source.scheduledTopicId!==pending.topicId){
        // Se aquele dia já tinha recebido uma pendência, devolve ao dia seu conteúdo original.
        next.activeTopicId=scheduled.id;
        next.subjectId=scheduled.d.id;
        next.examLane=source.scheduledExamLane||scheduled.exam;
        next.studied=!!scheduled.m.s.done;
        next.questionRegistered=sameYmd(scheduled.m.s.lastQuestionDate,pending.planDate);
      }else{
        next.activeTopicId=null;
        next.subjectId=null;
        next.studied=false;
        next.questionRegistered=false;
      }
      ["scheduledTopicId","scheduledSubjectId","scheduledExamLane","carryoverFrom","carryoverPlanDate","carryoverTopicId","carryoverAppliedAtMs"].forEach(k=>delete next[k]);
    }
    plans[pending.planDate]=next;
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

    // Primeiro registra a saída no dia anterior. Assim o mesmo tema não fica duplicado em dois dias.
    markSourceReclassified(plans,pending,ymd);

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

  function reclassifiedBanner(p){
    const hist=(p?.reclassifiedOut||[]).filter(h=>h?.topicId&&h?.toDate);
    if(!hist.length)return "";
    return `<div class="reclassified-banner" style="margin:0 0 10px;padding:10px 12px;border:1px solid #93c5fd;background:#eff6ff;border-radius:10px;color:#1e3a8a;font-size:11px;line-height:1.45">
      <div style="display:flex;align-items:center;gap:7px;flex-wrap:wrap;margin-bottom:5px"><b>↪ Reclassificado</b><span style="display:inline-block;padding:2px 7px;border-radius:999px;background:#dbeafe;font-size:9px;font-weight:900;text-transform:uppercase">movido para outro dia</span></div>
      ${hist.map(h=>{
        const x=row(h.topicId);
        return `<div><b>${escapeHtml(atomTitle(x))}</b> → ${escapeHtml(fmtDate(h.toDate))}</div>`;
      }).join("")}
      <div style="margin-top:4px;color:#64748b">O tema não conta mais como conteúdo ativo desta data; permanece aqui somente como histórico da reclassificação.</div>
    </div>`;
  }

  function decorateReclassified(ymd){
    const plans=readPlans(),p=plans[ymd];
    if(!p)return;
    const banner=reclassifiedBanner(p);if(!banner)return;
    const host=document.getElementById("todayLessons");if(!host||host.querySelector(".reclassified-banner"))return;
    if(!p.activeTopicId){
      host.innerHTML=banner+`<div class="empty">Nenhum outro conteúdo ficou ativo nesta data após a reclassificação.</div>`;
    }else{
      host.insertAdjacentHTML("afterbegin",banner);
    }
  }

  function decorateCarryover(ymd){
    const plans=readPlans(),p=plans[ymd];
    if(!p?.carryoverFrom || !p?.carryoverTopicId)return;
    const host=document.getElementById("todayLessons");if(!host||host.querySelector(".carryover-banner"))return;
    const x=row(p.carryoverTopicId),scheduled=row(p.scheduledTopicId);
    const missing=[];if(!p.studied)missing.push("teoria/estudo");if(!p.questionRegistered)missing.push("questões");
    host.insertAdjacentHTML("afterbegin",`<div class="carryover-banner" style="margin:0 0 10px;padding:10px 12px;border:1px solid #fbbf24;background:#fffbeb;border-radius:10px;color:#92400e;font-size:11px;line-height:1.45"><b>⏳ Pendência reclassificada de ${escapeHtml(fmtDate(p.carryoverFrom))}</b><br>${escapeHtml(atomTitle(x))}${missing.length?` · falta: <b>${escapeHtml(missing.join(" + "))}</b>`:""}.${scheduled?`<br><span style="color:#64748b">Depois desta pendência, o plano volta ao conteúdo previsto para hoje: ${escapeHtml(atomTitle(scheduled))}.</span>`:""}</div>`);
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
      decorateReclassified(ymd);
      decorateCarryover(ymd);
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
