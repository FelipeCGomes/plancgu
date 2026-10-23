/* Política de conclusão do Plano v1.
   - Conteúdo marcado como estudado/concluído sai da fila principal de teoria.
   - Se ficou abaixo da meta, permanece em Revisar, sem voltar imediatamente como aula.
   - A prévia dos próximos 7 dias mostra matéria + subitem exato.
*/
(() => {
  const START="2026-10-19";
  const ROT=["P3","P2","P3","P1","P3","P2","P3"];
  const PLAN_KEY=KEY+"-daily-plans-v1";
  let internal=false;

  function readPlans(){
    if(typeof window.CGU_readDailyPlans==="function")return window.CGU_readDailyPlans();
    try{return JSON.parse(localStorage.getItem(PLAN_KEY)||"{}")||{}}catch(e){return {}}
  }
  function writePlans(v){
    if(typeof window.CGU_writeDailyPlans==="function")return window.CGU_writeDailyPlans(v);
    try{localStorage.setItem(PLAN_KEY,JSON.stringify(v||{}));}catch(e){}
    window.dispatchEvent(new CustomEvent("cgu-plan-changed"));
  }
  function dateObj(ymd){return new Date(ymd+"T12:00:00");}
  function addDays(ymd,n){const d=dateObj(ymd);d.setDate(d.getDate()+n);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;}
  function todayYmd(){const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;}
  function selectedYmd(){return document.getElementById("studyDate")?.value||todayYmd();}
  function dayIndex(ymd){return Math.floor((dateObj(ymd)-dateObj(START))/86400000);}
  function laneFor(ymd){const i=((dayIndex(ymd)%7)+7)%7;return ROT[i];}
  function laneOccurrence(ymd,lane){const idx=((dayIndex(ymd)%7)+7)%7;let n=0;for(let i=0;i<=idx;i++)if(ROT[i]===lane)n++;return n-1;}
  function title(x){const a=window.ATOMIC_META?.[x.id]||{};return a.code?`${a.code} · ${a.title}`:(a.title||x.g.nome);}

  function blocked(x,ymd,plans){
    const m=plans?.__deferrals||{},t=m.topics?.[x.id],s=m.subjects?.[x.d.id];
    return !!((t?.until&&ymd<t.until&&!t.cancelledAtMs)||(s?.until&&ymd<s.until&&!s.cancelledAtMs));
  }
  function need(x){
    let s=({"Crítica":130,"Alta":95,"Média":55,"Baixa":25}[x.priority]||25)+({P3:80,P2:38,P1:15}[x.exam]||0);
    if(!x.m.q)s+=45;
    else if(x.m.status==="Revisar")s+=55+Math.min(50,Math.max(0,x.m.meta-x.m.liquido)*1.5);
    else if(x.m.q<15)s+=20;
    return s;
  }
  function priorSubject(ymd,plans){
    for(let b=1;b<=3;b++){
      const p=plans[addDays(ymd,-b)];
      const x=p?.activeTopicId?topicsFlat().find(r=>r.id===p.activeTopicId):null;
      if(x)return x.d.id;
      const last=(p?.completed||[]).slice(-1)[0];
      const y=last?topicsFlat().find(r=>r.id===last.topicId):null;
      if(y)return y.d.id;
    }
    return null;
  }
  function choose(ymd,exclude=[]){
    const plans=readPlans(),ex=new Set(exclude||[]),lane=laneFor(ymd);
    let rows=topicsFlat().filter(x=>x.exam===lane&&!x.m.s.done&&!ex.has(x.id)&&!blocked(x,ymd,plans));
    if(!rows.length)rows=topicsFlat().filter(x=>!x.m.s.done&&!ex.has(x.id)&&!blocked(x,ymd,plans));
    if(!rows.length)return null;

    const bySubject=new Map();
    rows.forEach(x=>{if(!bySubject.has(x.d.id))bySubject.set(x.d.id,[]);bySubject.get(x.d.id).push(x);});
    const subjects=[...bySubject.entries()].map(([id,items])=>{
      const sorted=items.map(x=>({...x,_need:need(x)})).sort((a,b)=>b._need-a._need);
      const unseen=items.filter(x=>!x.m.q).length/items.length;
      return {id,items:sorted,score:sorted[0]._need+unseen*15};
    }).sort((a,b)=>b.score-a.score);

    const week=Math.floor(Math.max(0,dayIndex(ymd))/7),occ=laneOccurrence(ymd,lane),slots=ROT.filter(v=>v===lane).length;
    let pos=(week*slots+occ)%subjects.length;
    const prev=priorSubject(ymd,plans);
    if(subjects.length>1&&subjects[pos].id===prev)pos=(pos+1)%subjects.length;
    return subjects[pos].items[0]||null;
  }

  function reconcileActive(ymd){
    if(ymd<todayYmd())return false;
    const plans=readPlans(),p=plans[ymd];
    if(!p?.activeTopicId)return false;
    // Não interfere em fluxos especiais enquanto estão sendo resolvidos.
    if(p.carryoverTopicId||p.delayIncomingTopicId)return false;
    const current=topicsFlat().find(x=>x.id===p.activeTopicId);if(!current||!current.m.s.done)return false;

    const completed=[...(p.completed||[])];
    if(!completed.some(c=>c?.topicId===current.id))completed.push({topicId:current.id,at:new Date().toISOString(),source:"completion-policy"});
    const next=choose(ymd,completed.map(c=>c.topicId));
    plans[ymd]={...p,completed,activeTopicId:next?.id||null,subjectId:next?.d?.id||null,examLane:next?.exam||p.examLane,studied:false,questionRegistered:false,completionPolicyVersion:1,updatedAtMs:Date.now()};
    writePlans(plans);
    try{save();}catch(e){}
    return true;
  }

  function previewChoice(ymd){
    const plans=readPlans(),p=plans[ymd],current=p?.activeTopicId?topicsFlat().find(x=>x.id===p.activeTopicId):null;
    if(current&&!current.m.s.done&&!blocked(current,ymd,plans))return current;
    return choose(ymd,[]);
  }
  function decorateWeek(ymd){
    const week=document.querySelector("#todayRelease .planner-week")||document.querySelector(".planner-week");
    if(!week)return;
    const rows=[];
    for(let i=0;i<7;i++){
      const d=addDays(ymd,i),x=previewChoice(d),lane=laneFor(d);
      rows.push(`<div class="planner-preview-row planner-preview-exact"><span>${dateObj(d).toLocaleDateString("pt-BR",{weekday:"short",day:"2-digit",month:"2-digit"})}</span><b>${lane}</b><span>${x?`<b>${escapeHtml(x.d.nome)}</b><small>${escapeHtml(title(x))}</small>`:"—"}</span></div>`);
    }
    week.innerHTML=`<b>Rotação dos próximos 7 dias</b>${rows.join("")}<div class="planner-completion-note">✓ Tópico concluído sai da fila principal. Se ficou abaixo da meta, permanece em <b>Revisar</b> para reforço, sem voltar como aula nova.</div>`;
  }

  if(!document.getElementById("completionPolicyStyle")){
    const s=document.createElement("style");s.id="completionPolicyStyle";
    s.textContent=`.planner-preview-exact span:last-child{display:flex;flex-direction:column;gap:2px}.planner-preview-exact small{font-size:8px;color:#64748b;line-height:1.25}.planner-completion-note{margin-top:8px;padding:7px 9px;border:1px solid #bbf7d0;background:#f0fdf4;border-radius:8px;color:#166534;font-size:9px;line-height:1.4}`;
    document.head.appendChild(s);
  }

  const baseRender=renderToday;
  renderToday=function(){
    if(internal)return baseRender.apply(this,arguments);
    internal=true;
    try{
      const ymd=selectedYmd();
      let r=baseRender.apply(this,arguments);
      if(reconcileActive(ymd))r=baseRender.apply(this,arguments);
      decorateWeek(ymd);
      return r;
    }finally{internal=false;}
  };

  try{renderToday();}catch(e){console.warn("Política de conclusão do plano:",e);}
})();
