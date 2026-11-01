/* Mínimo recomendado de questões por rodada.
   Mantém a mesma régua do plano adaptativo:
   - 10 questões: primeiro contato / sem amostra;
   - 15 questões: consolidação ou revisão normal;
   - 20 questões: revisão intensiva quando o gap para a meta é >= 20 p.p.
*/
(() => {
  function n(v){return Math.max(0,Number(v)||0)}
  function topic(id){return typeof topicsFlat==="function"?topicsFlat().find(x=>x.id===id):null}

  function minimumFor(id){
    const x=topic(id);
    if(!x)return 15;
    const m=x.m||{};
    const historicalQ=n(m.histQ ?? m.q);
    if(!historicalQ && !n(m.q))return 10;
    if(m.status==="Revisar"){
      const gap=m.liquido==null?999:Math.max(0,n(m.meta)-Number(m.liquido));
      return gap>=20?20:15;
    }
    return 15;
  }

  function labelFor(id){
    const x=topic(id),min=minimumFor(id),m=x?.m||{};
    if(min===10)return "primeiro contato / criação de amostra";
    if(min===20)return `revisão intensiva · gap de ${Math.max(0,n(m.meta)-Number(m.liquido||0)).toFixed(1).replace('.',',')} p.p.`;
    return m.status==="Revisar"?"revisão direcionada":"consolidação";
  }

  function patchWrapper(wrapper){
    const id=wrapper?.dataset?.roundsFor;
    if(!id)return;
    const form=wrapper.querySelector('.question-round-form');
    if(!form)return;
    const min=minimumFor(id),q=form.querySelector('[data-round-field="q"]');
    if(q){q.min=String(min);q.placeholder=`Mín.: ${min}`;q.dataset.roundMinimum=String(min)}
    let info=wrapper.querySelector('.question-round-minimum');
    if(!info){
      info=document.createElement('div');
      info.className='question-round-minimum';
      const help=wrapper.querySelector('.question-round-help');
      if(help)help.insertAdjacentElement('afterend',info);
      else form.insertAdjacentElement('beforebegin',info);
    }
    info.innerHTML=`<span>Mínimo desta rodada</span><b>${min} questões</b><small>${labelFor(id)}</small>`;
  }

  function patchAll(root=document){root.querySelectorAll('.question-rounds').forEach(patchWrapper)}

  const baseSave=window.CGU_saveQuestionRound;
  if(typeof baseSave==='function'){
    window.CGU_saveQuestionRound=function(id,button){
      const form=button?.closest?.('.question-round-form');
      const qEl=form?.querySelector('[data-round-field="q"]');
      const q=n(qEl?.value),min=minimumFor(id);
      if(q>0&&q<min){
        alert(`Faça pelo menos ${min} questões nesta rodada (${labelFor(id)}).`);
        qEl?.focus();
        return;
      }
      return baseSave.apply(this,arguments);
    };
  }

  const baseEdital=renderEdital;
  renderEdital=function(){const r=baseEdital.apply(this,arguments);patchAll(document.getElementById('editalList')||document);return r;};
  const baseReview=renderReview;
  renderReview=function(){const r=baseReview.apply(this,arguments);patchAll(document.getElementById('reviewList')||document);return r;};
  const baseToday=renderToday;
  renderToday=function(){const r=baseToday.apply(this,arguments);patchAll(document.getElementById('page-hoje')||document);return r;};

  window.CGU_questionRoundMinimum=minimumFor;
  window.CGU_refreshQuestionRoundMinimum=()=>patchAll();
  window.addEventListener('cgu-question-recorded',()=>setTimeout(()=>patchAll(),0));
  window.addEventListener('cgu-cloud-ready',()=>setTimeout(()=>patchAll(),0));
  try{patchAll()}catch(e){console.warn('Mínimo de questões:',e)}
})();
