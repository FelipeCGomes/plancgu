/* Corrige conflito estrutural da P4 sem adicionar CSS.
   O primeiro card de resumo usava a classe global `main`, reservada ao container principal do app.
   Este módulo troca essa classe por `featured`, deixando todo o visual sob responsabilidade do styles.css.
*/
(() => {
  function fixSummaryClass(){
    const card=document.querySelector('#page-discursiva #p4Summary .p4-summary.main');
    if(card){
      card.classList.remove('main');
      card.classList.add('featured');
    }
  }

  function wrap(name){
    const base=window[name];
    if(typeof base!=='function'||base.__p4StructureWrapped)return;
    const wrapped=function(){
      const r=base.apply(this,arguments);
      fixSummaryClass();
      return r;
    };
    wrapped.__p4StructureWrapped=true;
    window[name]=wrapped;
  }

  wrap('CGU_renderDiscursiveTracker');
  wrap('CGU_p4Save');
  wrap('CGU_p4Delete');
  wrap('CGU_p4CancelEdit');

  const baseSwitch=window.switchPage;
  if(typeof baseSwitch==='function'&&!baseSwitch.__p4StructureWrapped){
    const wrappedSwitch=function(name,btn){
      const r=baseSwitch.apply(this,arguments);
      if(name==='discursiva')fixSummaryClass();
      return r;
    };
    wrappedSwitch.__p4StructureWrapped=true;
    window.switchPage=wrappedSwitch;
  }

  const summary=document.getElementById('p4Summary');
  if(summary){
    const observer=new MutationObserver(fixSummaryClass);
    observer.observe(summary,{childList:true});
  }

  fixSummaryClass();
  window.CGU_fixDiscursiveStructure=fixSummaryClass;
})();
