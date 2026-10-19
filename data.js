const EDITAL=[...EDITAL_P1,...EDITAL_P2,...EDITAL_P3];

// Carrega os controles responsivos e os motores do painel somente depois que a interface estiver pronta.
(function(){
  if(!document.querySelector('link[data-adaptive-css="1"]')){
    const link=document.createElement("link");
    link.rel="stylesheet";
    link.href="adaptive.css?v=20261019-2";
    link.dataset.adaptiveCss="1";
    document.head.appendChild(link);
  }

  window.addEventListener("load",()=>{
    if(!document.querySelector('script[data-performance="1"]')){
      const p=document.createElement("script");
      p.src="performance.js?v=20261019-1";
      p.dataset.performance="1";
      document.body.appendChild(p);
    }

    if(!document.querySelector('script[data-adaptive="1"]')){
      const s=document.createElement("script");
      s.src="adaptive.js?v=20261019-2";
      s.dataset.adaptive="1";
      document.body.appendChild(s);
    }
  });
})();
