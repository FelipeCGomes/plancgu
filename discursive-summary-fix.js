/* Hotfix visual do resumo P4: impede cards altos/esticados e garante colunas iguais. */
(() => {
  function install(){
    if(document.getElementById('p4SummaryFixStyle'))return;
    const s=document.createElement('style');
    s.id='p4SummaryFixStyle';
    s.textContent=`
      #page-discursiva #p4Summary{
        display:block!important;
        width:100%!important;
        height:auto!important;
        min-height:0!important;
        max-height:none!important;
        overflow:visible!important;
      }
      #page-discursiva #p4Summary .p4-summary-grid{
        display:grid!important;
        grid-template-columns:repeat(3,minmax(0,1fr))!important;
        grid-auto-columns:minmax(0,1fr)!important;
        grid-auto-rows:max-content!important;
        align-items:start!important;
        align-content:start!important;
        justify-items:stretch!important;
        width:100%!important;
        height:auto!important;
        min-height:0!important;
        max-height:none!important;
        gap:10px!important;
      }
      #page-discursiva #p4Summary .p4-summary,
      #page-discursiva #p4Summary .p4-summary.main{
        grid-column:auto!important;
        grid-row:auto!important;
        align-self:start!important;
        justify-self:stretch!important;
        width:auto!important;
        min-width:0!important;
        height:auto!important;
        min-height:0!important;
        max-height:none!important;
        overflow:visible!important;
        display:block!important;
        padding:12px 14px!important;
      }
      #page-discursiva #p4Summary .p4-summary span,
      #page-discursiva #p4Summary .p4-summary b,
      #page-discursiva #p4Summary .p4-summary small{
        position:static!important;
        transform:none!important;
      }
      #page-discursiva #p4Summary .p4-summary b{
        margin:5px 0!important;
        line-height:1.1!important;
      }
      #page-discursiva #p4Summary .p4-summary small{
        margin:0!important;
        line-height:1.35!important;
      }
      @media(max-width:900px){
        #page-discursiva #p4Summary .p4-summary-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important}
      }
      @media(max-width:620px){
        #page-discursiva #p4Summary .p4-summary-grid{grid-template-columns:1fr!important}
      }
    `;
    document.head.appendChild(s);
  }
  install();
  window.CGU_installP4SummaryFix=install;
})();
