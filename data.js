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
  addCss("question-rounds.css?v=20261101-2","questionRoundsCss");
  addCss("edital-filters.css?v=20261102-1","editalFiltersCss");
  addCss("sprint28.css?v=20261111-fixed1","sprint28Css");

  window.addEventListener("load",async()=>{
    try{
      // A meta objetiva precisa ser aplicada antes dos motores de desempenho e planejamento.
      await loadScript("objective-goal.js?v=20261031-2","objectiveGoal");
      await loadScript("canonical-metrics.js?v=20261031-1","canonicalMetrics");
      await loadScript("performance.js?v=20261020-1","performance");
      await loadScript("menu.js?v=20261020-1","menu");
      await loadScript("consistency.js?v=20261020-1","consistency");
      await loadScript("atomic-ui.js?v=20261031-3","atomicUi");
      await loadScript("planner-v2.js?v=20261020-1","plannerV2");
      await loadScript("planner-reconcile.js?v=20261020-1","plannerReconcile");
      await loadScript("planner-balance.js?v=20261030-1","plannerBalance");
      await loadScript("planner-carryover.js?v=20261020-2","plannerCarryover");
      await loadScript("planner-delay.js?v=20261021-1","plannerDelay");
      await loadScript("backup-v2.js?v=20261020-1","backupV2");
      await loadScript("stable-edit.js?v=20261020-1","stableEdit");
      await loadScript("data-integrity.js?v=20261023-2","dataIntegrity");
      await loadScript("latest-round-performance.js?v=20261031-1","latestRoundPerformance");
      await loadScript("question-rounds.js?v=20261031-4","questionRounds");
      await loadScript("latest-round-ui-fix.js?v=20261031-1","latestRoundUiFix");
      await loadScript("planner-completion-policy.js?v=20261023-1","plannerCompletionPolicy");
      await loadScript("planner-weekend.js?v=20261023-1","plannerWeekend");
      await loadScript("weekend-auto-review.js?v=20261031-1","weekendAutoReview");
      await loadScript("planner-intensive.js?v=20261024-2","plannerIntensive");
      await loadScript("latest-round-everywhere.js?v=20261031-1","latestRoundEverywhere");
      await loadScript("question-round-minimum.js?v=20261101-1","questionRoundMinimum");
      await loadScript("round-live-save.js?v=20261104-1","roundLiveSave");
      await loadScript("edital-filters.js?v=20261102-1","editalFilters");
      await loadScript("edital-timeline.js?v=20261024-1","editalTimeline");
      await loadScript("dashboard-overview.js?v=20261031-2","dashboardOverview");
      await loadScript("objective-goal-ui.js?v=20261031-3","objectiveGoalUi");
      await loadScript("latest-round-dashboard.js?v=20261031-1","latestRoundDashboard");
      await loadScript("discursive-persistence.js?v=20261031-1","discursivePersistence");
      await loadScript("discursive-tracker.js?v=20261030-1","discursiveTracker");
      await loadScript("discursive-type-fix.js?v=20261031-2","discursiveTypeFix");
      await loadScript("discursive-enhancements.js?v=20261031-1","discursiveEnhancements");
      await loadScript("discursive-style-cleanup.js?v=20261031-1","discursiveStyleCleanup");
      await loadScript("discursive-structure-fix.js?v=20261110-1","discursiveStructureFix");
      // Última camada do Plano: evita rerender global e remove textos redundantes.
      await loadScript("plan-focus-ui.js?v=20261104-1","planFocusUi");
      await loadScript("weighted-score-ui.js?v=20261108-3","weightedScoreUi");
      await loadScript("sprint28.js?v=20261111-fixed2","sprint28");
      if(typeof renderAll==="function")renderAll();
      if(typeof window.CGU_renderEditalTimeline==="function")window.CGU_renderEditalTimeline();
      if(typeof window.CGU_optimizeDashboard==="function")window.CGU_optimizeDashboard();
      if(typeof window.CGU_renderObjectiveGoal==="function")window.CGU_renderObjectiveGoal();
      if(typeof window.CGU_patchLatestRoundDashboard==="function")window.CGU_patchLatestRoundDashboard();
      if(typeof window.CGU_showLatestRoundEverywhere==="function")window.CGU_showLatestRoundEverywhere();
      if(typeof window.CGU_refreshQuestionRoundMinimum==="function")window.CGU_refreshQuestionRoundMinimum();
      if(typeof window.CGU_renderDiscursiveTracker==="function")window.CGU_renderDiscursiveTracker();
      if(typeof window.CGU_cleanupDiscursiveStyles==="function")window.CGU_cleanupDiscursiveStyles();
      if(typeof window.CGU_fixDiscursiveStructure==="function")window.CGU_fixDiscursiveStructure();
      if(typeof window.CGU_cleanPlanUi==="function")window.CGU_cleanPlanUi();
    }catch(e){
      console.error("Falha ao carregar módulos do painel:",e);
    }finally{
      // A splash só termina depois da montagem inicial das páginas.
      window.CGUFeedback?.installNavigation?.();
      window.dispatchEvent(new Event("cgu-app-ready"));
    }
  });
})();