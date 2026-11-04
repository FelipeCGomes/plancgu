/* Interações locais do Plano + limpeza visual solicitada.
   - Marcar/salvar atualiza apenas o bloco clicado.
   - Preserva scroll e página atual.
   - Remove textos redundantes da área do Plano.
*/
(() => {
  const META="__intensiveSessions";
  function n(v){return Math.max(0,Number(v)||0)}
  function readPlans(){return typeof window.CGU_readDailyPlans==="function"?window.CGU_readDailyPlans():{}}
  function writePlans(v){if(typeof window.CGU_writeDailyPlans==="function")window.CGU_writeDailyPlans(v)}
  function rounds(id){const r=getTS(id)?.questionRounds;return Array.isArray(r)?r:[]}
  function fmtPct(v){return v==null||!isFinite(v)?"—":Number(v).toFixed(1).replace(".",",")+"%"}

  function overlay(){
    let el=document.getElementById('planActionOverlay');
    if(el)return el;
    el=document.createElement('div');el.id='planActionOverlay';el.className='plan-action-overlay';
    el.innerHTML='<div class="plan-action-box"><span class="plan-action-spinner"></span><b>Atualizando...</b><small>Sem sair da página</small></div>';
    document.body.appendChild(el);return el;
  }
  function showLoading(text='Atualizando...'){
    if(window.CGUFeedback){window.CGUFeedback.begin(text);return}
    const el=overlay();el.querySelector('b').textContent=text;el.querySelector('small').textContent='Sem sair da página';el.classList.add('show');
  }
  function hideLoading(ok='Atualizado'){
    if(window.CGUFeedback){window.CGUFeedback.complete();return}
    const el=overlay();el.classList.add('ok');el.querySelector('b').textContent=ok;el.querySelector('small').textContent='Estado salvo';
    setTimeout(()=>el.classList.remove('show','ok'),420);
  }

  function updateSlot(ymd,i,patch){
    const plans=readPlans(),all={...(plans[META]||{})},day={...(all[ymd]||{})},slots={...(day.slots||{})};
    slots[i]={...(slots[i]||{}),...patch,updatedAtMs:Date.now()};day.slots=slots;day.updatedAtMs=Date.now();all[ymd]=day;plans[META]=all;writePlans(plans);try{save()}catch(e){}
    return slots[i];
  }
  function slotState(ymd,i){return readPlans()?.[META]?.[ymd]?.slots?.[i]||{}}
  function blockFor(topicId,ymd,i){
    return [...document.querySelectorAll('#todayLessons .int-block')].find(block=>{
      const all=[...block.querySelectorAll('button')].map(b=>b.getAttribute('onclick')||'').join(' ');
      return all.includes(`'${topicId}'`)&&all.includes(`'${ymd}'`)&&all.includes(`,${i}`);
    })||document.querySelectorAll('#todayLessons .int-block')[i]||null;
  }
  function refreshComplete(block,ymd,i){
    if(!block)return;const st=slotState(ymd,i),complete=!!(st.studied&&st.questionsDone);
    block.classList.toggle('complete',complete);
    let flag=block.querySelector('.int-complete');
    if(complete&&!flag){flag=document.createElement('span');flag.className='int-complete';flag.textContent='✓ Aula + questões concluídas';block.querySelector('.int-actions')?.appendChild(flag)}
    if(!complete)flag?.remove();
  }

  window.CGU_intensiveMarkStudied=function(topicId,ymd,i,v){
    const block=blockFor(topicId,ymd,i),btn=block?.querySelector('.int-actions button');
    showLoading(v?'Marcando aula...':'Reabrindo aula...');if(btn)btn.disabled=true;
    setTS(topicId,{done:!!v,completedAtMs:v?Date.now():null,completionSource:'intensive-plan-live',updatedAtMs:Date.now()});
    updateSlot(ymd,i,{studied:!!v});
    if(btn){btn.disabled=false;btn.classList.toggle('done',!!v);btn.textContent=v?'✓ Estudado':'Marcar aula estudada';btn.setAttribute('onclick',`CGU_intensiveMarkStudied('${topicId}','${ymd}',${i},${!v})`)}
    refreshComplete(block,ymd,i);hideLoading(v?'Aula marcada':'Aula reaberta');
    window.dispatchEvent(new CustomEvent('cgu-plan-block-updated',{detail:{topicId,ymd,i,kind:'studied'}}));
    if(typeof toast==='function')toast(v?'Bloco marcado como estudado.':'Bloco reaberto.');
  };

  window.CGU_intensiveSaveQuestions=function(topicId,ymd,i){
    const qEl=document.getElementById(`int-${ymd}-${i}-q`),aEl=document.getElementById(`int-${ymd}-${i}-a`),bEl=document.getElementById(`int-${ymd}-${i}-b`);
    const q=n(qEl?.value),a=n(aEl?.value),b=n(bEl?.value),min=Number(window.CGU_questionRoundMinimum?.(topicId)||10);
    if(q<min){alert(`Registre pelo menos ${min} questões neste bloco.`);qEl?.focus();return}
    if(a+b>q){alert('Confira os valores: acertos + em branco não podem ultrapassar o total.');return}
    const e=q-a-b,s=getTS(topicId)||{},before={q:n(s.questoes),a:n(s.acertos),b:n(s.brancos),e:n(s.erros)},after={q:before.q+q,a:before.a+a,b:before.b+b,e:before.e+e},at=new Date().toISOString();
    const history=[...rounds(topicId),{id:`qr-${Date.now()}-${Math.random().toString(36).slice(2,6)}`,at,questoes:q,acertos:a,erros:e,brancos:b,liquidoRodada:q?100*(a-e)/q:null,source:'plano-intensivo'}];
    const block=blockFor(topicId,ymd,i),btn=block?.querySelector('.int-q-grid button');
    showLoading('Salvando questões...');if(btn)btn.disabled=true;
    setTS(topicId,{questoes:after.q,acertos:after.a,brancos:after.b,erros:after.e,questionRounds:history,lastQuestionDate:at,lastQuestionSource:'plano-intensivo',lastQuestionBatch:{questoes:q,acertos:a,erros:e,brancos:b,data:at.slice(0,10)},updatedAtMs:Date.now(),atomicConfirmed:true});
    updateSlot(ymd,i,{questionsDone:true,lastBatch:{questoes:q,acertos:a,erros:e,brancos:b,at}});
    const cur=block?.querySelector('.question-cumulative');
    if(cur)cur.innerHTML=`<div><span>Última rodada</span><b>${q}</b></div><div><span>Acertos</span><b>${a}</b></div><div><span>Erros</span><b>${e}</b></div><div><span>Em branco</span><b>${b}</b></div><div><span>Líquido</span><b>${fmtPct(q?100*(a-e)/q:null)}</b></div>`;
    [qEl,aEl,bEl].forEach((el,idx)=>{if(el)el.value=idx===2?'0':''});if(btn)btn.disabled=false;
    refreshComplete(block,ymd,i);hideLoading('Questões salvas');
    window.dispatchEvent(new CustomEvent('cgu-question-recorded',{detail:{topicId,batch:{q,a,e,b},source:'plano-intensivo'}}));
    window.dispatchEvent(new CustomEvent('cgu-plan-block-updated',{detail:{topicId,ymd,i,kind:'questions'}}));
    if(typeof toast==='function')toast(`${q} questões registradas no bloco intensivo.`);
  };

  function cleanPlan(){
    const page=document.getElementById('page-hoje');if(!page)return;
    page.querySelector('.hero p')?.remove();
    document.getElementById('objectiveGoalPlanBox')?.remove();
    const routine=document.getElementById('todayRoutine');
    if(routine){routine.querySelectorAll('.plan-line,.int-logic').forEach(el=>el.remove());if(!routine.textContent.trim())routine.hidden=true;else routine.hidden=false}
    const release=document.getElementById('todayRelease');
    if(release){[...release.children].forEach(el=>{if(el.classList.contains('small')&&/^Lógica:/i.test(el.textContent.trim()))el.remove()})}
    const routineCard=routine?.closest('.today-card');
    const h=routineCard?.querySelector(':scope > h3');if(h&&/Distribuição das 3 horas/i.test(h.textContent))h.remove();
    page.querySelectorAll('.int-q-grid').forEach(grid=>{
      const btn=grid.querySelector('button[onclick*="CGU_intensiveSaveQuestions"]'),raw=btn?.getAttribute('onclick')||'',m=raw.match(/CGU_intensiveSaveQuestions\('([^']+)'/);if(!m)return;
      const min=Number(window.CGU_questionRoundMinimum?.(m[1])||10),q=grid.querySelector('input[id$="-q"]');if(q){q.min=String(min);q.placeholder=`Mín. ${min}`}
    });
  }

  const baseToday=renderToday;
  renderToday=function(){const y=window.scrollY,r=baseToday.apply(this,arguments);cleanPlan();requestAnimationFrame(()=>window.scrollTo({top:y,left:0,behavior:'instant'}));return r};
  window.CGU_cleanPlanUi=cleanPlan;
  window.addEventListener('cgu-cloud-ready',()=>setTimeout(cleanPlan,0));
  try{cleanPlan()}catch(e){console.warn('Plano compacto:',e)}
})();
