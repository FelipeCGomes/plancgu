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

  addCss("adaptive.css?v=20261020-1","adaptiveCss");
  addCss("menu.css?v=20261020-1","menuCss");

  window.addEventListener("load",async()=>{
    try{
      await loadScript("performance.js?v=20261020-1","performance");
      await loadScript("menu.js?v=20261020-1","menu");
      await loadScript("consistency.js?v=20261020-1","consistency");
      await loadScript("atomic-ui.js?v=20261020-1","atomicUi");
      await loadScript("planner-v2.js?v=20261020-1","plannerV2");
      if(typeof renderAll==="function")renderAll();
    }catch(e){
      console.error("Falha ao carregar módulos do painel:",e);
    }
  });
})();
