/* Organização visual da aba Discursivas / P4.
   Sobrescreve apenas layout/estilo, sem alterar cálculos ou dados.
*/
(() => {
  function install(){
    if(document.getElementById('p4LayoutFixStyle'))return;
    const s=document.createElement('style');
    s.id='p4LayoutFixStyle';
    s.textContent=`
      /* página */
      #page-discursiva{max-width:100%;overflow-x:hidden}
      #page-discursiva .hero{margin-bottom:12px}
      #page-discursiva .card{min-width:0}

      /* resumo: menos cards espremidos */
      #page-discursiva .p4-summary-grid{
        display:grid!important;
        grid-template-columns:repeat(3,minmax(0,1fr))!important;
        gap:10px!important;
        margin-bottom:14px!important;
      }
      #page-discursiva .p4-summary{
        min-width:0!important;
        min-height:96px;
        padding:13px 14px!important;
        display:flex;
        flex-direction:column;
        justify-content:center;
      }
      #page-discursiva .p4-summary b{font-size:20px!important;line-height:1.1}
      #page-discursiva .p4-summary small{font-size:9px!important;line-height:1.35}

      /* formulário + regras */
      #page-discursiva .p4-layout{
        display:grid!important;
        grid-template-columns:minmax(0,1fr)!important;
        gap:12px!important;
        margin-bottom:12px!important;
      }
      #page-discursiva .p4-form-card,
      #page-discursiva .p4-rules,
      #page-discursiva .p4-history-card{padding:16px!important}
      #page-discursiva .p4-rules{
        display:grid;
        grid-template-columns:repeat(3,minmax(0,1fr));
        gap:9px;
        align-items:start;
      }
      #page-discursiva .p4-rules>h3{grid-column:1/-1;margin-bottom:0}
      #page-discursiva .p4-rule,
      #page-discursiva .p4-rule-note{margin:0!important;min-width:0;height:100%;box-sizing:border-box}
      #page-discursiva .p4-rule-note.warning{grid-column:span 2}
      #page-discursiva .p4-double-rule{grid-column:auto}

      /* dados básicos */
      #page-discursiva .p4-form-grid{
        display:grid!important;
        grid-template-columns:repeat(3,minmax(0,1fr))!important;
        gap:10px!important;
        align-items:end;
      }
      #page-discursiva .p4-form-grid .span2{grid-column:span 2!important}
      #page-discursiva .p4-form-grid .span3,
      #page-discursiva .p4-training-toggle{grid-column:1/-1!important}
      #page-discursiva .p4-extra-source{grid-column:span 2!important}
      #page-discursiva .p4-extra-time{grid-column:span 1!important}

      /* campos oficiais */
      #page-discursiva .p4-score-grid{
        display:grid!important;
        grid-template-columns:repeat(3,minmax(0,1fr))!important;
        gap:10px!important;
      }
      #page-discursiva .field{min-width:0}
      #page-discursiva .field label{
        display:block;
        min-height:18px;
        line-height:1.25;
        overflow-wrap:anywhere;
      }
      #page-discursiva .field input,
      #page-discursiva .field select,
      #page-discursiva .field textarea{min-width:0;box-sizing:border-box}

      /* resultado calculado */
      #page-discursiva .p4-live{
        display:grid!important;
        grid-template-columns:repeat(3,minmax(0,1fr))!important;
        gap:9px!important;
        padding:10px!important;
      }
      #page-discursiva .p4-live>div:not(.p4-live-note){
        min-width:0;
        min-height:84px;
        padding:9px!important;
        display:flex;
        flex-direction:column;
        justify-content:center;
      }
      #page-discursiva .p4-live-note{grid-column:1/-1!important;padding:4px 2px}
      #page-discursiva .p4-live span{font-size:8px!important;line-height:1.25}
      #page-discursiva .p4-live b{font-size:16px!important;line-height:1.15}
      #page-discursiva .p4-live small{font-size:8px!important;line-height:1.35}

      /* dupla correção */
      #page-discursiva .p4-evaluators{margin:12px 0!important;padding:11px!important}
      #page-discursiva .p4-eval-grid{
        display:grid!important;
        grid-template-columns:repeat(3,minmax(0,1fr))!important;
        gap:10px!important;
        align-items:end!important;
      }
      #page-discursiva .p4-convergence{
        grid-column:1/-1!important;
        min-height:66px;
        display:flex;
        flex-direction:column;
        justify-content:center;
      }
      #page-discursiva .p4-convergence b{font-size:12px!important}
      #page-discursiva .p4-convergence small{font-size:8px!important}

      /* rubrica formativa */
      #page-discursiva .p4-rubric{margin-top:12px!important;padding:11px!important}
      #page-discursiva .p4-rubric-grid{
        display:grid!important;
        grid-template-columns:repeat(3,minmax(0,1fr))!important;
        gap:10px!important;
      }
      #page-discursiva .p4-rubric-grid .field{min-width:0}

      /* observações e ações */
      #page-discursiva .p4-notes{margin-top:12px!important}
      #page-discursiva .p4-form-actions{margin-top:12px!important;display:flex;gap:8px;flex-wrap:wrap}

      /* histórico */
      #page-discursiva .p4-entry{
        padding:12px!important;
        margin-top:10px!important;
      }
      #page-discursiva .p4-entry-top{align-items:flex-start}
      #page-discursiva .p4-entry-badges{gap:6px!important}
      #page-discursiva .p4-pill{font-size:8px!important;line-height:1.2}

      /* evita títulos e valores esmagados */
      #page-discursiva h3,
      #page-discursiva .p4-summary,
      #page-discursiva .p4-live,
      #page-discursiva .p4-entry{overflow-wrap:anywhere}

      @media (min-width:1400px){
        #page-discursiva .p4-layout{
          grid-template-columns:minmax(0,1.65fr) minmax(320px,.75fr)!important;
        }
        #page-discursiva .p4-rules{
          display:block;
        }
        #page-discursiva .p4-rule,
        #page-discursiva .p4-rule-note{margin-bottom:9px!important;height:auto}
      }

      @media (max-width:900px){
        #page-discursiva .p4-summary-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important}
        #page-discursiva .p4-rules{grid-template-columns:1fr 1fr}
        #page-discursiva .p4-rule-note.warning{grid-column:1/-1}
        #page-discursiva .p4-score-grid,
        #page-discursiva .p4-live,
        #page-discursiva .p4-rubric-grid,
        #page-discursiva .p4-eval-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important}
        #page-discursiva .p4-convergence{grid-column:1/-1!important}
      }

      @media (max-width:620px){
        #page-discursiva .p4-summary-grid,
        #page-discursiva .p4-rules,
        #page-discursiva .p4-form-grid,
        #page-discursiva .p4-score-grid,
        #page-discursiva .p4-live,
        #page-discursiva .p4-rubric-grid,
        #page-discursiva .p4-eval-grid{grid-template-columns:1fr!important}
        #page-discursiva .p4-form-grid .span2,
        #page-discursiva .p4-form-grid .span3,
        #page-discursiva .p4-extra-source,
        #page-discursiva .p4-extra-time,
        #page-discursiva .p4-training-toggle,
        #page-discursiva .p4-convergence,
        #page-discursiva .p4-live-note,
        #page-discursiva .p4-rule-note.warning{grid-column:1!important}
        #page-discursiva .p4-entry-top{display:block!important}
        #page-discursiva .p4-entry-score{text-align:left!important;margin-top:8px}
      }
    `;
    document.head.appendChild(s);
  }

  install();
  window.CGU_installDiscursiveLayout=install;
})();
