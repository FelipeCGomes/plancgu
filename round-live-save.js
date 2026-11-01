/* Salvamento de rodada sem rerender global + celebração de meta.
   Atualiza somente os cards do tópico em tela e preserva scroll/posição.
*/
(() => {
  function n(v){return Math.max(0,Number(v)||0)}
  function pct(v){return v==null||!isFinite(v)?"—":Number(v).toFixed(1).replace(".",",")+"%"}
  function row(id){return typeof topicsFlat==="function"?topicsFlat().find(x=>x.id===id):null}
  function rounds(id){const r=getTS(id)?.questionRounds;return Array.isArray(r)?r:[]}
  function canonical(id){
    const s=getTS(id)||{};let q=n(s.questoes),a=n(s.acertos),b=n(s.brancos),e=n(s.erros);
    if(!q&&(a||b||e))q=a+b+e;if(a+b>q)q=a+b;e=Math.max(q-a-b,0);return {q,a,b,e};
  }
  function fmtDate(v){try{return new Date(v).toLocaleString("pt-BR",{day:"2-digit",month:"2-digit",year:"2-digit",hour:"2-digit",minute:"2-digit"})}catch(e){return ""}}
  function title(id){const x=row(id),m=window.ATOMIC_META?.[id]||{};return m.code?`${m.code} · ${m.title}`:(m.title||x?.g?.nome||id)}

  function ensureOverlay(){
    let el=document.getElementById('roundLiveOverlay');
    if(el)return el;
    el=document.createElement('div');el.id='roundLiveOverlay';el.className='round-live-overlay';
    el.innerHTML='<div class="round-live-box"><span class="round-live-spinner"></span><b>Atualizando rodada...</b><small>Sem recarregar a página</small></div>';
    document.body.appendChild(el);return el;
  }
  function showSaving(){const el=ensureOverlay();el.classList.remove('ok');el.classList.add('show');el.querySelector('b').textContent='Atualizando rodada...';el.querySelector('small').textContent='Sem recarregar a página';}
  function showSaved(){const el=ensureOverlay();el.classList.add('ok');el.querySelector('b').textContent='Rodada registrada';el.querySelector('small').textContent='Estado atualizado';setTimeout(()=>el.classList.remove('show','ok'),550)}

  function historyMarkup(id,review){
    const rs=rounds(id),list=rs.slice(-3).reverse();
    if(!rs.length)return '';
    return `<div class="question-round-history latest-always-visible ${review?'show-all-rounds':''}">
      <div class="question-round-history-title">${review?'Evolução por rodada':'Último registro'}</div>
      ${list.map((r,i)=>{const q=n(r.questoes),a=n(r.acertos),b=n(r.brancos),e=n(r.erros??(q-a-b)),l=r.liquidoRodada!=null?r.liquidoRodada:(q?100*(a-e)/q:null);return `<div class="question-round-history-row ${i===0?'latest':''}"><span>${i===0?'Atual · ':''}${escapeHtml(fmtDate(r.at))}</span><b>${q} questões</b><span>${a} C · ${e} E · ${b} B</span><span>${pct(l)} líquido</span></div>`}).join('')}
      ${rs.length>3?`<div class="question-round-more">+ ${rs.length-3} rodada(s) anterior(es) preservada(s)</div>`:''}
    </div>`;
  }
  function historicalMarkup(id){const c=canonical(id),l=c.q?100*(c.a-c.e)/c.q:null;return `<b>Histórico acumulado:</b><span>${c.q} questões</span><span>${c.a} C</span><span>${c.e} E</span><span>${c.b} B</span><span>${pct(l)} líquido histórico</span>`}

  function updateMetricFields(card,id){
    const x=row(id);if(!x)return;const m=x.m;
    const values={
      'Total questões':m.q,'Acertos':m.a,'Erros':m.e,'Em branco':n(m.b??m.s?.brancos),
      '% bruto':pct(m.bruto),'% líquido':pct(m.liquido),'Meta':`${m.meta}%`,'Meta / status':`${m.meta}% · ${m.status}`
    };
    card.querySelectorAll('.topic-grid>.field,.review-accumulated>.field').forEach(f=>{
      const label=f.querySelector('label')?.textContent?.trim();if(!(label in values))return;
      const metric=f.querySelector('.metric');if(!metric)return;metric.textContent=values[label];
      if(label==='% líquido'||label==='Meta / status'){
        metric.classList.remove('status-ok','status-review','status-pending');
        metric.classList.add(m.status==='Atendeu'?'status-ok':m.status==='Revisar'?'status-review':'status-pending');
      }
    });
    const source=m.performanceSource==='ultima-rodada'?'Desempenho atual · última rodada':'Base histórica · ainda sem nova rodada';
    const lab=card.querySelector('.atomic-accumulated-label,.review-accumulated-label');if(lab)lab.textContent=source;
  }

  function refreshRoundBlock(wrapper,id){
    if(!wrapper)return;const review=wrapper.classList.contains('review-mode'),rs=rounds(id);
    const histStrip=wrapper.querySelector('.question-history-strip');if(histStrip)histStrip.innerHTML=historicalMarkup(id);
    const oldHistory=wrapper.querySelector('.question-round-history');const html=historyMarkup(id,review);
    if(oldHistory){if(html){const t=document.createElement('div');t.innerHTML=html;oldHistory.replaceWith(t.firstElementChild)}else oldHistory.remove()}
    else if(html){const form=wrapper.querySelector('.question-round-form');if(form)form.insertAdjacentHTML('afterend',html);else wrapper.insertAdjacentHTML('beforeend',html)}
    const histBtn=wrapper.querySelector('.question-round-history-btn');
    if(histBtn){if(rs.length<=1)histBtn.style.display='none';else{histBtn.style.display='';histBtn.textContent=`Ver histórico (${rs.length})`}}
    const form=wrapper.querySelector('.question-round-form');
    if(form){form.querySelectorAll('input').forEach(i=>i.value='');const er=form.querySelector('[data-round-error]');if(er)er.textContent='—';if(!review)form.hidden=true}
  }

  function updateEveryVisibleCopy(id){
    document.querySelectorAll('[data-topic-id]').forEach(card=>{if(card.getAttribute('data-topic-id')===id)updateMetricFields(card,id)});
    document.querySelectorAll('.question-rounds').forEach(w=>{if(w.dataset.roundsFor===id)refreshRoundBlock(w,id)});
    try{window.CGU_refreshQuestionRoundMinimum?.();window.CGU_showLatestRoundEverywhere?.()}catch(e){}
  }

  function celebrate(id,liquido,meta,anchor){
    const card=anchor?.closest?.('.topic,.review-card')||anchor?.closest?.('.question-rounds');
    if(card){card.classList.remove('goal-hit');void card.offsetWidth;card.classList.add('goal-hit');setTimeout(()=>card.classList.remove('goal-hit'),2200)}
    const fx=document.createElement('div');fx.className='goal-party';
    fx.innerHTML=`<div class="goal-party-badge"><span>🎉</span><b>Meta atingida!</b><small>${pct(liquido)} líquido · meta ${meta}%</small></div>`+
      Array.from({length:28},(_,i)=>`<i style="--x:${Math.round(Math.random()*100)}vw;--d:${(Math.random()*0.7).toFixed(2)}s;--r:${Math.round(Math.random()*540)}deg;--s:${6+Math.round(Math.random()*6)}px"></i>`).join('');
    document.body.appendChild(fx);setTimeout(()=>fx.remove(),2300);
  }

  function removeReviewIfResolved(id){
    const active=document.getElementById('page-revisar')?.classList.contains('active');
    document.querySelectorAll('#reviewList .review-card[data-topic-id]').forEach(card=>{
      if(card.getAttribute('data-topic-id')!==id)return;
      if(active){setTimeout(()=>{card.classList.add('review-resolved');setTimeout(()=>card.remove(),420)},1800)}else card.remove();
    });
  }

  window.CGU_saveQuestionRound=function(id,button){
    const form=button?.closest?.('.question-round-form');if(!form)return;
    const qEl=form.querySelector('[data-round-field="q"]'),aEl=form.querySelector('[data-round-field="a"]'),bEl=form.querySelector('[data-round-field="b"]');
    const q=n(qEl?.value),a=n(aEl?.value),b=n(bEl?.value),min=Number(window.CGU_questionRoundMinimum?.(id)||1);
    if(q<=0){alert('Informe o total de questões desta rodada.');qEl?.focus();return}
    if(q<min){alert(`Faça pelo menos ${min} questões nesta rodada.`);qEl?.focus();return}
    if(a+b>q){alert('Acertos + em branco não podem ultrapassar o total da rodada.');return}

    const beforeRow=row(id),beforeStatus=beforeRow?.m?.status||'Pendente',before=canonical(id),e=q-a-b;
    const after={q:before.q+q,a:before.a+a,b:before.b+b,e:before.e+e},liq=q?100*(a-e)/q:null,at=new Date().toISOString();
    const history=[...rounds(id),{id:`qr-${Date.now()}-${Math.random().toString(36).slice(2,6)}`,at,questoes:q,acertos:a,erros:e,brancos:b,totalAntes:before.q,totalDepois:after.q,liquidoRodada:liq,liquidoAcumulado:after.q?100*(after.a-after.e)/after.q:null}];

    showSaving();button.disabled=true;
    setTS(id,{questoes:after.q,acertos:after.a,brancos:after.b,erros:after.e,questionRounds:history,lastQuestionDate:at,lastQuestionSource:'edital-nova-rodada',lastQuestionBatch:{questoes:q,acertos:a,erros:e,brancos:b,data:at.slice(0,10)},updatedAtMs:Date.now(),atomicConfirmed:true});
    try{save()}catch(err){console.warn('Falha ao salvar nova rodada',err)}

    updateEveryVisibleCopy(id);
    const now=row(id),status=now?.m?.status,meta=now?.m?.meta,liquido=now?.m?.liquido;
    button.disabled=false;showSaved();
    if(status==='Atendeu'&&liquido!=null&&liquido>=meta)celebrate(id,liquido,meta,form);
    if(status==='Atendeu'&&beforeStatus!=='Atendeu')removeReviewIfResolved(id);

    window.dispatchEvent(new CustomEvent('cgu-question-recorded',{detail:{topicId:id,batch:{q,a,e,b},source:'edital-nova-rodada'}}));
    if(typeof toast==='function')toast(`Rodada registrada: ${q} questões em ${title(id)}.`);

    const idle=window.requestIdleCallback||((fn)=>setTimeout(fn,80));
    idle(()=>{try{if(!document.getElementById('page-dashboard')?.classList.contains('active')){renderDashboard();window.CGU_patchLatestRoundDashboard?.()}}catch(e){}});
  };
})();
