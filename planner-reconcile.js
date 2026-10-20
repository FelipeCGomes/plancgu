/* Reconcilia o plano diário quando estudo/questões são alterados em outra tela. */
(() => {
  if(typeof window.CGU_readDailyPlans!=="function"||typeof window.CGU_writeDailyPlans!=="function")return;
  function ymdNowFromInput(){const el=document.getElementById("studyDate");if(el?.value)return el.value;const n=new Date();return `${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,"0")}-${String(n.getDate()).padStart(2,"0")}`;}
  function sameYmd(value,ymd){if(!value)return false;try{const d=new Date(value);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`===ymd;}catch(e){return false}}
  function score(x){
    let s=({"Crítica":130,"Alta":95,"Média":55,"Baixa":25}[x.priority]||25)+({P3:85,P2:38,P1:12}[x.exam]||0);
    if(!x.m.q)s+=35;else if(x.m.status==="Revisar")s+=105+Math.min(90,Math.max(0,x.m.meta-x.m.liquido)*2);
    if(x.m.s.done&&x.m.status==="Atendeu")s-=220;
    return s;
  }
  function reconcile(ymd){
    const plans=window.CGU_readDailyPlans(),p=plans[ymd];if(!p?.activeTopicId)return false;
    const current=topicsFlat().find(x=>x.id===p.activeTopicId);if(!current)return false;
    const studied=!!current.m.s.done||!!p.studied;
    const questions=!!p.questionRegistered||sameYmd(current.m.s.lastQuestionDate,ymd);
    if(!studied||!questions){
      let changed=false;if(studied&&!p.studied){p.studied=true;changed=true}if(questions&&!p.questionRegistered){p.questionRegistered=true;changed=true}
      if(changed){p.updatedAtMs=Date.now();plans[ymd]=p;window.CGU_writeDailyPlans(plans);}return changed;
    }
    const completed=[...(p.completed||[])];if(!completed.some(c=>c.topicId===current.id))completed.push({topicId:current.id,at:new Date().toISOString(),source:"reconcile"});
    const excluded=new Set(completed.map(c=>c.topicId));
    const candidates=topicsFlat().filter(x=>!excluded.has(x.id)&&!(x.m.s.done&&x.m.status==="Atendeu")).map(x=>({...x,_score:score(x)})).sort((a,b)=>b._score-a._score||PRIORITY_RANK[a.priority]-PRIORITY_RANK[b.priority]);
    p.completed=completed;p.activeTopicId=candidates[0]?.id||null;p.studied=!!candidates[0]?.m.s.done;p.questionRegistered=false;p.updatedAtMs=Date.now();plans[ymd]=p;window.CGU_writeDailyPlans(plans);try{save();}catch(e){}return true;
  }
  const baseRender=renderToday;
  renderToday=function(){reconcile(ymdNowFromInput());return baseRender();};
  try{reconcile(ymdNowFromInput());renderToday();}catch(e){console.warn("Reconciliação do plano:",e);}
})();
