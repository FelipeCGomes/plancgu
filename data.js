const EDITAL=[...EDITAL_P1,...EDITAL_P2,...EDITAL_P3];

// Carrega os controles e motores em ordem determinística.
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

  addCss("adaptive.css?v=20261019-4","adaptiveCss");
  addCss("menu.css?v=20261019-3","menuCss");

  window.addEventListener("load",async()=>{
    try{
      await loadScript("performance.js?v=20261019-2","performance");
      await loadScript("menu.js?v=20261019-2","menu");
      await loadScript("adaptive.js?v=20261019-4","adaptive");
      await loadScript("study-ui.js?v=20261019-3","studyUi");
      await loadScript("consistency.js?v=20261019-1","consistency");
      await loadScript("question-link.js?v=20261019-1","questionLink");
      await loadScript("flow-sync.js?v=20261019-1","flowSync");
      await loadScript("completion-sync.js?v=20261019-1","completionSync");
    }catch(e){
      console.error("Falha ao carregar módulos do painel:",e);
    }
  });
})();
