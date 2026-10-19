const EDITAL=[...EDITAL_P1,...EDITAL_P2,...EDITAL_P3];

// Carrega o motor adaptativo somente depois que todo o painel estiver pronto.
window.addEventListener("load",()=>{
  if(document.querySelector('script[data-adaptive="1"]'))return;
  const s=document.createElement("script");
  s.src="adaptive.js?v=1";
  s.dataset.adaptive="1";
  s.defer=true;
  document.body.appendChild(s);
});
