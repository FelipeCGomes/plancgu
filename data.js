const EDITAL=[...EDITAL_P1,...EDITAL_P2,...EDITAL_P3];

// Carrega os controles em ordem determinística depois da interface base.
(function(){
  function addCss(href,key){
    if(document.querySelector(`link[data-${key}="1"]`))return;
    const link=document.createElement("link");
    link.rel="stylesheet";
    link.href=href;
    link.dataset[key]="1";
    document.head.appendChild(link);
  }
  function loadScript(src,key){
    const existing=document.querySelector(`script[data-${key}="1"]`);
    if(existing)return Promise.resolve();
    return new Promise((resolve,reject)=>{
      const s=document.createElement("script");
      s.src=src;
      s.dataset[key]="1";
      s.onload=resolve;
      s.onerror=reject;
      document.body.appendChild(s);
    });
  }

  addCss("adaptive.css?v=20261020-2","adaptiveCss");
  addCss("menu.css?v=20261020-1","menuCss");

  window.addEventListener("load",async()=>{
    try{
      // A meta objetiva precisa ser aplicada antes dos motores de desempenho e planejamento.
      await loadScript("objective-goal.js?v=20261030-1","objectiveGoal");
      await loadScript("performance.js?v=20261020-1","performance");
      await loadScript("menu.js?v=20261020-1","menu");
      await loadScript("consistency.js?v=20261020-1","consistency");
      await loadScript("atomic-ui.js?v=20261020-1","atomicUi");
      await loadScript("planner-v2.js?v=20261020-1","plannerV2");
      await loadScript("planner-reconcile.js?v=20261020-1","plannerReconcile");
      await loadScript("planner-balance.js?v=20261020-1","plannerBalance");
      await loadScript("planner-carryover.js?v=20261020-2","plannerCarryover");
      await loadScript("planner-delay.js?v=20261021-1","plannerDelay");
      await loadScript("backup-v2.js?v=20261020-1","backupV2");
      await loadScript("stable-edit.js?v=20261020-1","stableEdit");
      await loadScript("data-integrity.js?v=20261023-2","dataIntegrity");
      await loadScript("planner-completion-policy.js?v=20261023-1","plannerCompletionPolicy");
      await loadScript("planner-weekend.js?v=20261023-1","plannerWeekend");
      await loadScript("planner-intensive.js?v=20261024-2","plannerIntensive");
      await loadScript("edital-timeline.js?v=20261024-1","editalTimeline");
      await loadScript("dashboard-overview.js?v=20261028-1","dashboardOverview");
      await loadScript("objective-goal-ui.js?v=20261030-1","objectiveGoalUi");
      if(typeof renderAll==="function")renderAll();
      if(typeof window.CGU_renderEditalTimeline==="function")window.CGU_renderEditalTimeline();
      if(typeof window.CGU_optimizeDashboard==="function")window.CGU_optimizeDashboard();
      if(typeof window.CGU_renderObjectiveGoal==="function")window.CGU_renderObjectiveGoal();
    }catch(e){
      console.error("Falha ao carregar módulos do painel:",e);
    }
  });
})();
