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

  const baseRender=window.CGU_renderDiscursiveTracker;
  if(typeof baseRender==='function'){
    window.CGU_renderDiscursiveTracker=function(){
      const r=baseRender.apply(this,arguments);
      fixSummaryClass();
      return r;
    };
  }

  const baseSwitch=window.switchPage;
  if(typeof baseSwitch==='function'){
    window.switchPage=function(name,btn){
      const r=baseSwitch.apply(this,arguments);
      if(name==='discursiva')fixSummaryClass();
      return r;
    };
  }

  fixSummaryClass();
  window.CGU_fixDiscursiveStructure=fixSummaryClass;
})();
