/* Correção de interface Q1/Q2 da P4.
   Mantém limites e textos do formulário sincronizados ao trocar o tipo da questão.
*/
(() => {
  function config(){
    const type=document.getElementById("p4-type")?.value||"q1";
    return type==="q2"
      ? {maxScore:70,maxLines:60,factor:14,label:"0 a 70",scoreLabel:"Q2 · máximo 70 pontos"}
      : {maxScore:30,maxLines:30,factor:6,label:"0 a 30",scoreLabel:"Q1 · máximo 30 pontos"};
  }

  function sync(){
    const c=config();
    const nc=document.getElementById("p4-nc");
    if(nc){
      nc.max=String(c.maxScore);
      const helper=nc.closest(".field")?.querySelector("small");
      if(helper)helper.textContent=c.label;
    }
    const lines=document.getElementById("p4-max-lines");
    if(lines)lines.textContent=String(c.maxLines);

    const live=document.getElementById("p4LiveResult");
    if(live){
      const discount=[...live.querySelectorAll(":scope > div")].find(x=>x.querySelector("span")?.textContent?.trim()==="Desconto linguístico");
      const small=discount?.querySelector("small");
      if(small)small.textContent=`${c.factor} × NE ÷ TL`;
    }
  }

  const base=window.CGU_p4TypeChanged;
  window.CGU_p4TypeChanged=function(){
    const r=typeof base==="function"?base.apply(this,arguments):undefined;
    sync();
    if(typeof window.CGU_p4Live==="function")window.CGU_p4Live();
    sync();
    return r;
  };

  // Garante consistência também ao abrir/editar um registro já salvo.
  const observer=new MutationObserver(()=>{
    if(document.getElementById("page-discursiva")?.classList.contains("active"))sync();
  });
  const page=document.getElementById("page-discursiva");
  if(page)observer.observe(page,{childList:true,subtree:true});
  sync();
})();
