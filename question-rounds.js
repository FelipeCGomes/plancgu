/* Rodadas cumulativas de questões por subitem.
   Permite registrar apenas a nova rodada; o sistema soma aos totais existentes
   e preserva um histórico das rodadas no próprio state[topicId]. */
(() => {
  function n(v){return Math.max(0,Number(v)||0)}
  function canonical(id){
    const s=getTS(id)||{};
    let q=n(s.questoes),a=n(s.acertos),b=n(s.brancos),e=n(s.erros);
    if(!q&&(a||b||e))q=a+b+e;
    if(a+b>q)q=a+b;
    e=Math.max(q-a-b,0);
    return {q,a,b,e};
  }
  function safeId(id){return String(id).replace(/[^a-zA-Z0-9_-]/g,"-")}
  function row(id){return typeof topicsFlat==="function"?topicsFlat().find(x=>x.id===id):null}
  function title(id){const x=row(id),m=window.ATOMIC_META?.[id]||{};return m.code?`${m.code} · ${m.title}`:(m.title||x?.g?.nome||id)}
  function fmtDate(v){try{return new Date(v).toLocaleString("pt-BR",{day:"2-digit",month:"2-digit",year:"2-digit",hour:"2-digit",minute:"2-digit"})}catch(e){return ""}}
  function rounds(id){const r=getTS(id)?.questionRounds;return Array.isArray(r)?r:[]}

  function roundHtml(id){
    const rs=rounds(id),last=rs.slice(-3).reverse();
    return `<div class="question-rounds" data-rounds-for="${escapeHtml(id)}">
      <div class="question-rounds-head">
        <button type="button" class="question-round-add" onclick="CGU_toggleQuestionRound('${id}')">＋ Adicionar nova rodada</button>
        ${rs.length?`<button type="button" class="question-round-history-btn" onclick="CGU_toggleQuestionHistory('${id}')">${rs.length} rodada(s) registrada(s)</button>`:""}
      </div>
      <div class="question-round-form" id="round-form-${safeId(id)}" hidden>
        <div><label>Total da rodada</label><input id="round-q-${safeId(id)}" type="number" min="1" placeholder="Ex.: 15"></div>
        <div><label>Acertos</label><input id="round-a-${safeId(id)}" type="number" min="0" placeholder="Ex.: 12"></div>
        <div><label>Em branco</label><input id="round-b-${safeId(id)}" type="number" min="0" value="0"></div>
        <div class="question-round-auto"><label>Erros</label><strong id="round-e-${safeId(id)}">0</strong><small>automático</small></div>
        <button type="button" class="question-round-save" onclick="CGU_saveQuestionRound('${id}')">Somar rodada</button>
      </div>
      <div class="question-round-history" id="round-history-${safeId(id)}" hidden>
        ${last.map((r,i)=>`<div class="question-round-history-row"><span>${escapeHtml(fmtDate(r.at))}</span><b>${n(r.questoes)} questões</b><span>${n(r.acertos)} C · ${n(r.erros)} E · ${n(r.brancos)} B</span><span>${r.liquido==null?"":Number(r.liquido).toFixed(1).replace(".",",")+"% líq."}</span></div>`).join("")}
        ${rs.length>3?`<div class="question-round-more">+ ${rs.length-3} rodada(s) anterior(es) preservada(s)</div>`:""}
      </div>
    </div>`;
  }

  const baseTopicHtml=topicHtml;
  topicHtml=function(x){
    const html=baseTopicHtml(x);
    const marker='<div class="note-row">';
    return html.includes(marker)?html.replace(marker,roundHtml(x.id)+marker):html+roundHtml(x.id);
  };

  function bindForm(id){
    const sid=safeId(id),q=document.getElementById(`round-q-${sid}`),a=document.getElementById(`round-a-${sid}`),b=document.getElementById(`round-b-${sid}`),e=document.getElementById(`round-e-${sid}`);
    const refresh=()=>{const Q=n(q?.value),A=n(a?.value),B=n(b?.value);if(e)e.textContent=String(Math.max(Q-A-B,0));};
    [q,a,b].filter(Boolean).forEach(el=>{if(el.dataset.roundBound)return;el.dataset.roundBound="1";el.addEventListener("input",refresh)});
    refresh();
  }

  window.CGU_toggleQuestionRound=function(id){
    const el=document.getElementById(`round-form-${safeId(id)}`);if(!el)return;
    el.hidden=!el.hidden;if(!el.hidden){bindForm(id);document.getElementById(`round-q-${safeId(id)}`)?.focus();}
  };
  window.CGU_toggleQuestionHistory=function(id){const el=document.getElementById(`round-history-${safeId(id)}`);if(el)el.hidden=!el.hidden;};

  window.CGU_saveQuestionRound=function(id){
    const sid=safeId(id),q=n(document.getElementById(`round-q-${sid}`)?.value),a=n(document.getElementById(`round-a-${sid}`)?.value),b=n(document.getElementById(`round-b-${sid}`)?.value);
    if(q<=0){alert("Informe o total de questões desta rodada.");return;}
    if(a+b>q){alert("Acertos + em branco não podem ultrapassar o total da rodada.");return;}
    const e=q-a-b,before=canonical(id),after={q:before.q+q,a:before.a+a,b:before.b+b,e:before.e+e};
    const bruto=after.q?100*after.a/after.q:null,liquido=after.q?100*(after.a-after.e)/after.q:null;
    const at=new Date().toISOString();
    const history=rounds(id);
    history.push({id:`qr-${Date.now()}-${Math.random().toString(36).slice(2,6)}`,at,questoes:q,acertos:a,erros:e,brancos:b,totalAntes:before.q,totalDepois:after.q,liquido});
    setTS(id,{questoes:after.q,acertos:after.a,brancos:after.b,erros:after.e,questionRounds:history,lastQuestionDate:at,lastQuestionSource:"edital-nova-rodada",lastQuestionBatch:{questoes:q,acertos:a,erros:e,brancos:b,data:at.slice(0,10)},updatedAtMs:Date.now(),atomicConfirmed:true});
    try{save();}catch(err){console.warn("Falha ao salvar nova rodada",err)}
    window.dispatchEvent(new CustomEvent("cgu-question-recorded",{detail:{topicId:id,batch:{q,a,e,b},source:"edital-nova-rodada"}}));
    const active=document.activeElement;if(active&&typeof active.blur==="function")active.blur();
    const y=window.scrollY;
    setTimeout(()=>{
      try{renderEdital();}catch(err){console.warn(err)}
      requestAnimationFrame(()=>window.scrollTo({top:y,left:0,behavior:"instant"}));
      try{renderDashboard();renderReview();if(typeof renderPerformancePanel==="function")renderPerformancePanel();}catch(err){}
    },0);
    if(typeof toast==="function")toast(`${q} questões somadas a ${title(id)}.`);
  };

  // O formulário também fica disponível na aba Revisar.
  const baseReview=renderReview;
  renderReview=function(){
    const r=baseReview.apply(this,arguments);
    document.querySelectorAll('#reviewList .review-card[data-topic-id]').forEach(card=>{
      const id=card.dataset.topicId;if(!id||card.querySelector('.question-rounds'))return;
      card.insertAdjacentHTML('beforeend',roundHtml(id));
    });
    return r;
  };

  try{renderEdital();renderReview();}catch(e){}
})();