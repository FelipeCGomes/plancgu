const EDITAL=[...EDITAL_P1,...EDITAL_P2,...EDITAL_P3];

// Carrega os controles responsivos e os motores do painel somente depois que a interface estiver pronta.
(function(){
  function addCss(href,key){
    if(document.querySelector(`link[data-${key}="1"]`))return;
    const link=document.createElement("link");
    link.rel="stylesheet";
    link.href=href;
    link.dataset[key]="1";
    document.head.appendChild(link);
  }
  addCss("adaptive.css?v=20261019-3","adaptiveCss");
  addCss("menu.css?v=20261019-3","menuCss");

  window.addEventListener("load",()=>{
    if(!document.querySelector('script[data-performance="1"]')){
      const p=document.createElement("script");
      p.src="performance.js?v=20261019-1";
      p.dataset.performance="1";
      document.body.appendChild(p);
    }

    if(!document.querySelector('script[data-menu="1"]')){
      const m=document.createElement("script");
      m.src="menu.js?v=20261019-2";
      m.dataset.menu="1";
      document.body.appendChild(m);
    }

    if(!document.querySelector('script[data-adaptive="1"]')){
      const s=document.createElement("script");
      s.src="adaptive.js?v=20261019-3";
      s.dataset.adaptive="1";
      s.onload=()=>{
        if(document.querySelector('script[data-study-ui="1"]'))return;
        const u=document.createElement("script");
        u.src="study-ui.js?v=20261019-1";
        u.dataset.studyUi="1";
        document.body.appendChild(u);
      };
      document.body.appendChild(s);
    }
  });
})();
