/* Correção de interface Q1/Q2 da P4.
   Mantém limites e textos sincronizados sem observar/mutar o DOM em ciclo.
*/
(() => {
  function config(){
    const type=document.getElementById("p4-type")?.value||"q1";
    return type==="q2"
      ? {maxScore:70,maxLines:60,factor:14,label:"0 a 70"}
      : {maxScore:30,maxLines:30,factor:6,label:"0 a 30"};
  }

  function setTextIfChanged(el,value){
    if(el && el.textContent!==String(value))el.textContent=String(value);
  }

  function sync(){
    const c=config();
    const nc=document.getElementById("p4-nc");
    if(nc){
      if(nc.max!==String(c.maxScore))nc.max=String(c.maxScore);
      const helper=nc.closest(".field")?.querySelector("small");
      setTextIfChanged(helper,c.label);
    }

    setTextIfChanged(document.getElementById("p4-max-lines"),c.maxLines);

    const live=document.getElementById("p4LiveResult");
    if(live){
      const discount=[...live.querySelectorAll(":scope > div")].find(x=>x.querySelector("span")?.textContent?.trim()==="Desconto linguístico");
      setTextIfChanged(discount?.querySelector("small"),`${c.factor} × NE ÷ TL`);
    }
  }

  const base=window.CGU_p4TypeChanged;
  window.CGU_p4TypeChanged=function(){
    const r=typeof base==="function"?base.apply(this,arguments):undefined;
    sync();
    return r;
  };

  // Sem MutationObserver: o formulário-base já nasce com os limites corretos.
  // Esta chamada cobre a primeira renderização sem criar ciclos de DOM.
  queueMicrotask(sync);
  window.CGU_syncP4TypeUi=sync;
})();
