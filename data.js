const EDITAL=[...EDITAL_P1,...EDITAL_P2,...EDITAL_P3];

// Carrega os controles responsivos e o motor adaptativo somente depois que o painel estiver pronto.
(function(){
  if(!document.querySelector('link[data-adaptive-css="1"]')){
    const link=document.createElement("link");
    link.rel="stylesheet";
    link.href="adaptive.css?v=20261019-2";
    link.dataset.adaptiveCss="1";
    document.head.appendChild(link);
  }
  window.addEventListener("load",()=>{
    if(document.querySelector('script[data-adaptive="1"]'))return;
    const s=document.createElement("script");
    s.src="adaptive.js?v=20261019-2";
    s.dataset.adaptive="1";
    document.body.appendChild(s);
  });
})();
