/* Adiamento por indisponibilidade no Gran.
   Permite mover apenas o subitem atual ou toda a matéria para +7 dias.
   O adiamento fica dentro de dailyPlans para sincronizar pelo Firebase/backup.
*/
(() => {
  const PLAN_KEY = KEY + "-daily-plans-v1";
  const META_KEY = "__deferrals";
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
  function todayYmd(){const n=new Date();return `${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,"0")}-${String(n.getDate()).padStart(2,"0")}`;}
  function selectedYmd(){return document.getElementById("studyDate")?.value || todayYmd();}
  function dateObj(ymd){return new Date(ymd+"T12:00:00");}
  function addDays(ymd,n){const d=dateObj(ymd);d.setDate(d.getDate()+n);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;}
  function fmtDate(ymd){return String(ymd||"").split("-").reverse().join("/");}
  function row(id){return topicsFlat().find(x=>x.id===id)||null;}
  function atomTitle(x){
    if(!x)return "";
    const a=window.ATOMIC_META?.[x.id]||{};
    return a.code?`${a.code} · ${a.title}`:(a.title||x.g.nome);
  }
  function meta(plans){
    const current=plans[META_KEY]||{};
    return {
      topics:{...(current.topics||{})},
      subjects:{...(current.subjects||{})},
      history:[...(current.history||[])],
      updatedAtMs:Number(current.updatedAtMs)||0
    };
  }
  function saveMeta(plans,m){m.updatedAtMs=Date.now();plans[META_KEY]=m;}
  function isBlocked(x,ymd,m){
    const t=m.topics?.[x.id],s=m.subjects?.[x.d.id];
    return !!((t?.until && ymd<t.until && !t.cancelledAtMs) || (s?.until && ymd<s.until && !s.cancelledAtMs));
  }
  function needScore(x){
    let s=({"Crítica":130,"Alta":95,"Média":55,"Baixa":25}[x.priority]||25)+({P3:80,P2:38,P1:15}[x.exam]||0);
    const mm=x.m;
    if(!mm.q)s+=42;
    else if(mm.status==="Revisar")s+=95+Math.min(85,Math.max(0,mm.meta-mm.liquido)*2.2);
    else {if(mm.q<15)s+=18;if(mm.liquido>=mm.meta+15)s-=55;}
    if(mm.s.done&&mm.status==="Atendeu")s-=240;
    return s;
  }
  function chooseReplacement(ymd,plans,p,current){
    const m=meta(plans),completed=new Set((p?.completed||[]).map(c=>c?.topicId).filter(Boolean));
    let rows=topicsFlat().filter(x=>x.id!==current?.id && !completed.has(x.id) && !(x.m.s.done&&x.m.status==="Atendeu") && !isBlocked(x,ymd,m));
    const lane=p?.examLane||current?.exam;
    const sameLane=rows.filter(x=>x.exam===lane);
    if(sameLane.length)rows=sameLane;
    return rows.map(x=>({...x,_need:needScore(x)})).sort((a,b)=>b._need-a._need || PRIORITY_RANK[a.priority]-PRIORITY_RANK[b.priority])[0]||null;
  }
  function clearCarryoverKeys(p){
    ["scheduledTopicId","scheduledSubjectId","scheduledExamLane","carryoverFrom","carryoverPlanDate","carryoverTopicId","carryoverAppliedAtMs"].forEach(k=>delete p[k]);
  }

  function recordOut(p,entry){
    const out=[...(p.deferredOut||[])];
    out.push(entry);p.deferredOut=out;
  }

  window.CGU_deferGran=function(scope){
    const ymd=selectedYmd(),plans=readPlans(),p=plans[ymd];
    if(!p?.activeTopicId)return;
    const x=row(p.activeTopicId);if(!x)return;
    const target=addDays(ymd,7);
    const whole=scope==="subject";
    const label=whole?x.d.nome:atomTitle(x);
    const ok=window.confirm(`A aula não está disponível no Gran.\n\nRealocar ${whole?"TODA A MATÉRIA":"somente esta aula/tópico"} para a semana seguinte (${fmtDate(target)})?\n\n${label}`);
    if(!ok)return;

    const m=meta(plans),now=Date.now();
    const entry={scope:whole?"subject":"topic",topicId:x.id,subjectId:x.d.id,fromDate:ymd,targetDate:target,reason:"Gran indisponível",status:"Adiado",atMs:now};
    if(whole){
      m.subjects[x.d.id]={subjectId:x.d.id,until:target,fromDate:ymd,reason:"Gran indisponível",atMs:now};
    }else{
      m.topics[x.id]={topicId:x.id,subjectId:x.d.id,until:target,fromDate:ymd,reason:"Gran indisponível",atMs:now};
    }
    m.history.push(entry);saveMeta(plans,m);recordOut(p,entry);

    // Se o item era uma pendência trazida de outro dia, devolve ao plano de hoje o conteúdo originalmente previsto.
    let next=null;
    if(p.carryoverTopicId===x.id && p.scheduledTopicId){
      const scheduled=row(p.scheduledTopicId);
      if(scheduled && !isBlocked(scheduled,ymd,m))next=scheduled;
      clearCarryoverKeys(p);
    }
    if(!next)next=chooseReplacement(ymd,plans,p,x);

    p.activeTopicId=next?.id||null;
    p.subjectId=next?.d?.id||null;
    p.examLane=next?.exam||p.examLane;
    p.studied=!!next?.m?.s?.done;
    p.questionRegistered=false;
    p.userTouched=true;
    p.lastGranDeferral=entry;
    p.updatedAtMs=now;
    plans[ymd]=p;
    writePlans(plans);
    try{save();}catch(e){}
    if(typeof toast==="function")toast(`${whole?"Matéria":"Aula/tópico"} realocada para ${fmtDate(target)}.`);
    renderToday();
  };

  function dueEntry(ymd,plans){
    const m=meta(plans),candidates=[];
    Object.values(m.topics||{}).forEach(v=>{
      if(!v?.until||v.cancelledAtMs||v.completedAtMs||v.activatedAtMs)return;
      const x=row(v.topicId);if(!x||x.m.s.done&&x.m.status==="Atendeu")return;
      if(v.until<=ymd)candidates.push({kind:"topic",due:v.until,record:v,x});
    });
    Object.values(m.subjects||{}).forEach(v=>{
      if(!v?.until||v.cancelledAtMs||v.releasedAtMs)return;
      if(v.until>ymd)return;
      const rows=topicsFlat().filter(x=>x.d.id===v.subjectId && !(x.m.s.done&&x.m.status==="Atendeu"))
        .map(x=>({...x,_need:needScore(x)})).sort((a,b)=>b._need-a._need);
      if(rows[0])candidates.push({kind:"subject",due:v.until,record:v,x:rows[0]});
    });
    candidates.sort((a,b)=>a.due.localeCompare(b.due));
    return candidates[0]||null;
  }

  function applyDue(ymd){
    const plans=readPlans(),p=plans[ymd];if(!p?.activeTopicId)return false;
    if(p.delayIncomingTopicId)return false;
    // Não substitui um bloco que o usuário já começou manualmente naquele dia.
    if(p.userTouched || p.studied || p.questionRegistered || (p.completed||[]).length)return false;
    const due=dueEntry(ymd,plans);if(!due)return false;
    const current=row(p.activeTopicId),x=due.x;if(!x)return false;
    if(current?.id===x.id)return false;

    const m=meta(plans),now=Date.now();
    if(due.kind==="topic")m.topics[due.record.topicId]={...due.record,activatedAtMs:now,activatedDate:ymd};
    else m.subjects[due.record.subjectId]={...due.record,releasedAtMs:now,releasedDate:ymd};
    saveMeta(plans,m);

    plans[ymd]={
      ...p,
      delayScheduledTopicId:p.activeTopicId,
      delayScheduledSubjectId:p.subjectId||current?.d?.id||null,
      delayScheduledExamLane:p.examLane||current?.exam||null,
      delayIncomingTopicId:x.id,
      delayIncomingScope:due.kind,
      delayIncomingFrom:due.record.fromDate,
      delayIncomingTarget:due.record.until,
      activeTopicId:x.id,
      subjectId:x.d.id,
      examLane:x.exam,
      studied:!!x.m.s.done,
      questionRegistered:false,
      updatedAtMs:now
    };
    writePlans(plans);return true;
  }

  function skipBlockedActive(ymd){
    const plans=readPlans(),p=plans[ymd];if(!p?.activeTopicId)return false;
    const x=row(p.activeTopicId);if(!x)return false;
    const m=meta(plans);if(!isBlocked(x,ymd,m))return false;
    const next=chooseReplacement(ymd,plans,p,x);if(!next)return false;
    p.activeTopicId=next.id;p.subjectId=next.d.id;p.examLane=next.exam;p.studied=!!next.m.s.done;p.questionRegistered=false;p.updatedAtMs=Date.now();
    plans[ymd]=p;writePlans(plans);return true;
  }

  function restoreScheduledAfterIncoming(ymd,before){
    if(!before?.delayIncomingTopicId||!before?.delayScheduledTopicId)return false;
    const plans=readPlans(),p=plans[ymd];if(!p)return false;
    const finished=(p.completed||[]).some(c=>c?.topicId===before.delayIncomingTopicId);
    if(!finished)return false;
    const scheduled=row(before.delayScheduledTopicId);
    const m=meta(plans),now=Date.now();
    if(before.delayIncomingScope==="topic" && m.topics?.[before.delayIncomingTopicId]){
      m.topics[before.delayIncomingTopicId]={...m.topics[before.delayIncomingTopicId],completedAtMs:now};saveMeta(plans,m);
    }
    const cleaned={...p};
    if(scheduled && !isBlocked(scheduled,ymd,m)){
      cleaned.activeTopicId=scheduled.id;cleaned.subjectId=scheduled.d.id;cleaned.examLane=before.delayScheduledExamLane||scheduled.exam;cleaned.studied=!!scheduled.m.s.done;cleaned.questionRegistered=false;
    }
    ["delayScheduledTopicId","delayScheduledSubjectId","delayScheduledExamLane","delayIncomingTopicId","delayIncomingScope","delayIncomingFrom","delayIncomingTarget"].forEach(k=>delete cleaned[k]);
    cleaned.updatedAtMs=now;plans[ymd]=cleaned;writePlans(plans);return true;
  }

  function decorateButtons(ymd){
    const plans=readPlans(),p=plans[ymd],x=p?.activeTopicId?row(p.activeTopicId):null;
    const host=document.getElementById("todayLessons");if(!host||!x||host.querySelector(".gran-delay-box"))return;
    const anchor=host.querySelector(".custom-study-actions")||host.querySelector(".lesson-card");if(!anchor)return;
    const box=document.createElement("div");box.className="gran-delay-box";
    box.style.cssText="margin:9px 0;padding:9px 10px;border:1px solid #cbd5e1;background:#f8fafc;border-radius:9px;font-size:10px";
    box.innerHTML=`<div style="font-weight:900;color:#17365D;margin-bottom:6px">📅 Aula ainda não disponível no Gran?</div><div style="display:flex;gap:7px;flex-wrap:wrap"><button type="button" onclick="CGU_deferGran('topic')" style="border:1px solid #93c5fd;background:#eff6ff;color:#1e3a8a;border-radius:8px;padding:7px 10px;font-weight:800;cursor:pointer">↪ Adiar só esta aula/tópico · +7 dias</button><button type="button" onclick="CGU_deferGran('subject')" style="border:1px solid #fbbf24;background:#fffbeb;color:#92400e;border-radius:8px;padding:7px 10px;font-weight:800;cursor:pointer">↪ Adiar toda a matéria · +7 dias</button></div><div style="margin-top:5px;color:#64748b">O plano escolhe outro conteúdo agora e volta a liberar o item adiado na próxima semana.</div>`;
    anchor.insertAdjacentElement("afterend",box);
  }

  function decorateFlags(ymd){
    const plans=readPlans(),p=plans[ymd],host=document.getElementById("todayLessons");if(!p||!host)return;
    if((p.deferredOut||[]).length && !host.querySelector(".gran-deferred-out")){
      const recent=(p.deferredOut||[]).slice(-3);
      host.insertAdjacentHTML("afterbegin",`<div class="gran-deferred-out" style="margin:0 0 10px;padding:9px 11px;border:1px solid #bfdbfe;background:#eff6ff;border-radius:9px;color:#1e3a8a;font-size:10px;line-height:1.45"><b>↪ Realocado por indisponibilidade no Gran</b>${recent.map(e=>`<div>${e.scope==="subject"?"Matéria":"Aula/tópico"}: ${escapeHtml(e.scope==="subject"?(EDITAL.find(d=>d.id===e.subjectId)?.nome||e.subjectId):atomTitle(row(e.topicId)))} → <b>${escapeHtml(fmtDate(e.targetDate))}</b></div>`).join("")}</div>`);
    }
    if(p.delayIncomingTopicId && !host.querySelector(".gran-deferred-in")){
      const x=row(p.delayIncomingTopicId);
      host.insertAdjacentHTML("afterbegin",`<div class="gran-deferred-in" style="margin:0 0 10px;padding:9px 11px;border:1px solid #86efac;background:#f0fdf4;border-radius:9px;color:#166534;font-size:10px;line-height:1.45"><b>📅 Realocado da semana anterior</b><br>${escapeHtml(atomTitle(x))}${p.delayIncomingFrom?` · origem: ${escapeHtml(fmtDate(p.delayIncomingFrom))}`:""}</div>`);
    }
  }

  const baseRender=renderToday;
  renderToday=function(){
    if(internalRender)return baseRender();
    internalRender=true;
    try{
      const ymd=selectedYmd();
      baseRender();
      let changed=skipBlockedActive(ymd);
      if(changed)baseRender();
      changed=applyDue(ymd);
      if(changed)baseRender();
      decorateFlags(ymd);decorateButtons(ymd);
    }finally{internalRender=false;}
  };

  function wrapAction(name){
    const base=window[name];if(typeof base!=="function")return;
    window[name]=function(...args){
      const ymd=args[1]||selectedYmd(),before={...(readPlans()[ymd]||{})};
      const out=base.apply(this,args);
      if(restoreScheduledAfterIncoming(ymd,before)){try{renderAll();}catch(e){}}
      return out;
    };
  }
  wrapAction("CGU_markPlanStudied");
  wrapAction("CGU_registerPlanQuestions");

  try{renderToday();}catch(e){console.warn("Adiamento Gran:",e);}
})();
