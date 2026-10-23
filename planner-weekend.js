/* Sábado estratégico v1.
   Reserva o sábado para revisão acumulada + treino discursivo P4.
   Alterna semanalmente entre Discursiva de Conhecimentos Complementares (30 linhas)
   e Estudo de Caso de Conhecimentos Específicos (60 linhas).
*/
(() => {
  const PLAN_KEY=KEY+"-daily-plans-v1";
  const WEEKEND_META="__weekendSessions";
  const FIRST_SATURDAY="2026-10-24";
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
  function isSaturday(ymd){return dateObj(ymd).getDay()===6;}
  function fmtDate(ymd){return dateObj(ymd).toLocaleDateString("pt-BR",{weekday:"long",day:"2-digit",month:"2-digit"});}
  function title(x){const a=window.ATOMIC_META?.[x.id]||{};return a.code?`${a.code} · ${a.title}`:(a.title||x.g.nome);}
  function priorityValue(p){return ({"Crítica":4,"Alta":3,"Média":2,"Baixa":1}[p]||0);}

  function weekendMode(ymd){
    const diff=Math.floor((dateObj(ymd)-dateObj(FIRST_SATURDAY))/(7*86400000));
    return ((diff%2)+2)%2===0?"complementar":"estudo-caso";
  }
  function modeLabel(mode){return mode==="complementar"?"Discursiva · Conhecimentos Complementares (até 30 linhas)":"Estudo de Caso · Conhecimentos Específicos (até 60 linhas)";}

  function reviewScore(x){
    const gap=x.m.liquido==null?0:Math.max(0,x.m.meta-x.m.liquido);
    return priorityValue(x.priority)*100 + (x.exam==="P3"?35:x.exam==="P2"?20:10) + gap*3 + Math.min(30,x.m.q||0);
  }
  function reviewRows(){
    return topicsFlat().filter(x=>x.m.q>0&&x.m.status==="Revisar")
      .map(x=>({...x,_review:reviewScore(x)}))
      .sort((a,b)=>b._review-a._review).slice(0,4);
  }
  function writingFocus(mode){
    const exam=mode==="complementar"?"P2":"P3";
    const rows=topicsFlat().filter(x=>x.exam===exam)
      .map(x=>{
        const gap=x.m.liquido==null?20:Math.max(0,x.m.meta-x.m.liquido);
        const score=priorityValue(x.priority)*100 + gap*3 + (!x.m.q?35:0) + (!x.m.s.done?20:0);
        return {...x,_w:score};
      }).sort((a,b)=>b._w-a._w);
    return rows[0]||null;
  }

  function ensureWeekendSession(ymd){
    const plans=readPlans(),sessions={...(plans[WEEKEND_META]||{})};
    const existing=sessions[ymd]||{};
    const mode=existing.mode||weekendMode(ymd);
    sessions[ymd]={...existing,mode,updatedAtMs:Number(existing.updatedAtMs)||Date.now()};
    plans[WEEKEND_META]=sessions;

    const old=plans[ymd]||{};
    plans[ymd]={
      ...old,
      specialWeekend:true,
      weekendMode:mode,
      weekendOriginalTopicId:old.weekendOriginalTopicId||old.activeTopicId||null,
      activeTopicId:null,
      subjectId:null,
      studied:false,
      questionRegistered:false,
      userTouched:true,
      updatedAtMs:Date.now()
    };
    writePlans(plans);
    return sessions[ymd];
  }

  window.CGU_toggleWeekendTask=function(ymd,field){
    const plans=readPlans(),sessions={...(plans[WEEKEND_META]||{})};
    const s={...(sessions[ymd]||{mode:weekendMode(ymd)})};
    s[field]=!s[field];s.updatedAtMs=Date.now();sessions[ymd]=s;plans[WEEKEND_META]=sessions;writePlans(plans);
    try{save();}catch(e){}
    renderToday();
    if(typeof toast==="function")toast(s[field]?"Etapa de sábado concluída.":"Etapa de sábado reaberta.");
  };

  function reviewHtml(rows){
    if(!rows.length)return `<div class="weekend-empty">Nenhum tópico abaixo da meta no momento. Use o bloco para revisar erros recentes, resumos e conceitos-chave.</div>`;
    return rows.map(x=>`<div class="weekend-review-row"><div><b>${escapeHtml(title(x))}</b><small>${escapeHtml(x.d.nome)} · ${x.exam} · ${x.priority}</small></div><div><b>${fmtPct(x.m.liquido)}</b><small>meta ${x.m.meta}%</small></div></div>`).join("");
  }

  function renderWeekend(ymd){
    const session=ensureWeekendSession(ymd),mode=session.mode||weekendMode(ymd),reviews=reviewRows(),focus=writingFocus(mode);
    const complementary=mode==="complementar";
    const reviewMin=complementary?75:60,questionMin=complementary?45:30,writingMin=complementary?60:90;
    const host=document.getElementById("todayLessons"),routine=document.getElementById("todayRoutine"),titleEl=document.getElementById("todayTitle"),budget=document.querySelector("#page-hoje .study-budget");
    if(!host||!routine)return;

    if(titleEl)titleEl.textContent=`Sábado estratégico · ${fmtDate(ymd)}`;
    if(budget)budget.innerHTML=`
      <div class="budget-item"><span class="small">Revisão semanal</span><b>${reviewMin} min</b><span class="small">pontos abaixo da meta e erros</span></div>
      <div class="budget-item"><span class="small">Questões de revisão</span><b>${questionMin} min</b><span class="small">itens Cebraspe dos pontos fracos</span></div>
      <div class="budget-item"><span class="small">Treino P4</span><b>${writingMin} min</b><span class="small">${complementary?"discursiva até 30 linhas":"estudo de caso até 60 linhas"}</span></div>`;

    host.innerHTML=`
      <div class="weekend-banner"><b>🧠 Sábado de consolidação + discursiva</b><span>Hoje não entra conteúdo novo na fila principal. O objetivo é fechar lacunas da semana e treinar a prova discursiva.</span></div>
      <div class="weekend-section"><h4>1. Revisão prioritária da semana</h4>${reviewHtml(reviews)}
        <button type="button" class="weekend-check ${session.reviewDone?"done":""}" onclick="CGU_toggleWeekendTask('${ymd}','reviewDone')">${session.reviewDone?"✓ Revisão concluída":"Marcar revisão concluída"}</button>
      </div>
      <div class="weekend-section weekend-writing"><h4>2. ${escapeHtml(modeLabel(mode))}</h4>
        ${focus?`<div class="weekend-focus"><span>Foco sugerido pelo desempenho/prioridade</span><b>${escapeHtml(focus.d.nome)}</b><small>${escapeHtml(title(focus))}</small></div>`:""}
        <div class="weekend-writing-rule">${complementary?"Estruture introdução objetiva, desenvolvimento por aspectos e conclusão; respeite o limite de até 30 linhas.":"Resolva o problema técnico de forma aplicada, cobrindo os aspectos solicitados e justificando decisões; limite de até 60 linhas."}</div>
        <button type="button" class="weekend-check ${session.writingDone?"done":""}" onclick="CGU_toggleWeekendTask('${ymd}','writingDone')">${session.writingDone?"✓ Treino P4 concluído":"Marcar treino P4 concluído"}</button>
      </div>
      <div class="weekend-status ${session.reviewDone&&session.writingDone?"ok":""}">${session.reviewDone&&session.writingDone?"✓ Sábado concluído. Domingo volta ao plano adaptativo normal.":"Conclua revisão + treino P4 para fechar o sábado estratégico."}</div>`;

    routine.innerHTML=`
      <div class="plan-line"><div class="plan-time">0–${reviewMin}m</div><div><b>Revisão estratégica</b><div class="plan-kind">tópicos abaixo da meta, erros e conceitos-chave</div></div><b>${reviewMin} min</b></div>
      <div class="plan-line"><div class="plan-time">${reviewMin}–${reviewMin+questionMin}m</div><div><b>Questões Cebraspe</b><div class="plan-kind">15–25 itens direcionados aos pontos revisados</div></div><b>${questionMin} min</b></div>
      <div class="plan-line"><div class="plan-time">${reviewMin+questionMin}–180m</div><div><b>${escapeHtml(modeLabel(mode))}</b><div class="plan-kind">treino cronometrado P4</div></div><b>${writingMin} min</b></div>
      <div class="weekend-logic">Lógica: sábado é reservado para consolidação. Os tópicos abaixo da meta vêm da aba Revisar; o tipo de discursiva alterna semanalmente entre Conhecimentos Complementares e Estudo de Caso específico.</div>`;
  }

  function decoratePreview(ymd){
    const rows=[...document.querySelectorAll("#todayRelease .planner-preview-row, .planner-week .planner-preview-row")];
    rows.slice(0,7).forEach((el,i)=>{
      const d=addDays(ymd,i);if(!isSaturday(d))return;
      const mode=weekendMode(d);
      el.classList.add("weekend-preview");
      el.innerHTML=`<span>${dateObj(d).toLocaleDateString("pt-BR",{weekday:"short",day:"2-digit",month:"2-digit"})}</span><b>P4</b><span><b>REVISÃO SEMANAL + TREINO DISCURSIVO</b><small>${escapeHtml(modeLabel(mode))}</small></span>`;
    });
  }

  if(!document.getElementById("weekendPlannerStyle")){
    const s=document.createElement("style");s.id="weekendPlannerStyle";s.textContent=`
      .weekend-banner{padding:12px;border:1px solid #c4b5fd;background:#f5f3ff;border-radius:10px;color:#4c1d95;margin-bottom:10px}.weekend-banner b,.weekend-banner span{display:block}.weekend-banner span{font-size:10px;margin-top:4px;line-height:1.45}
      .weekend-section{border:1px solid #e2e8f0;border-radius:10px;padding:11px;margin-top:9px;background:#fff}.weekend-section h4{margin:0 0 9px;color:#17365D}.weekend-review-row{display:grid;grid-template-columns:1fr auto;gap:10px;padding:7px 0;border-top:1px solid #eef2f7}.weekend-review-row:first-of-type{border-top:0}.weekend-review-row b,.weekend-review-row small{display:block}.weekend-review-row small{font-size:9px;color:#64748b;margin-top:2px}.weekend-focus{padding:9px;border:1px solid #dbeafe;background:#eff6ff;border-radius:8px}.weekend-focus span,.weekend-focus b,.weekend-focus small{display:block}.weekend-focus span{font-size:8px;text-transform:uppercase;color:#64748b;font-weight:800}.weekend-focus small{font-size:9px;margin-top:3px;color:#475569}.weekend-writing-rule{font-size:10px;line-height:1.45;color:#475569;margin:9px 0}.weekend-check{border:1px solid #94a3b8;background:#fff;color:#17365D;border-radius:8px;padding:8px 10px;font-weight:900;cursor:pointer}.weekend-check.done{border-color:#86efac;background:#f0fdf4;color:#166534}.weekend-status{margin-top:10px;padding:8px 10px;border:1px solid #fde68a;background:#fffbeb;border-radius:8px;color:#92400e;font-size:10px;font-weight:800}.weekend-status.ok{border-color:#86efac;background:#f0fdf4;color:#166534}.weekend-preview{background:#faf5ff}.weekend-preview b{color:#6d28d9}.weekend-preview small{display:block;font-size:8px;color:#64748b;margin-top:2px}.weekend-logic{margin-top:10px;font-size:9px;color:#64748b;line-height:1.45}
    `;document.head.appendChild(s);
  }

  const baseRender=renderToday;
  renderToday=function(){
    if(internal)return baseRender.apply(this,arguments);
    internal=true;
    try{
      const ymd=selectedYmd();
      const r=baseRender.apply(this,arguments);
      if(isSaturday(ymd))renderWeekend(ymd);
      decoratePreview(ymd);
      return r;
    }finally{internal=false;}
  };

  try{renderToday();}catch(e){console.warn("Sábado estratégico:",e);}
})();
