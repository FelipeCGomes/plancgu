/* Rodadas de questões por subitem.
   A última rodada representa o desempenho atual; o acumulado serve apenas como histórico/volume.
*/
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
  function pct(v){return v==null||!isFinite(v)?"—":Number(v).toFixed(1).replace(".",",")+"%"}

  function historicalStrip(id){
    const c=canonical(id),liq=c.q?100*(c.a-c.e)/c.q:null;
    return `<div class="question-history-strip"><b>Histórico acumulado:</b><span>${c.q} questões</span><span>${c.a} C</span><span>${c.e} E</span><span>${c.b} B</span><span>${pct(liq)} líquido histórico</span></div>`;
  }

  function historyHtml(id,{visible=false,limit=3}={}){
    const rs=rounds(id),list=rs.slice(-limit).reverse();
    if(!rs.length){
      const c=canonical(id);
      return `<div class="question-round-history-empty">${c.q?"Este tópico possui apenas a base histórica anterior ao registro por rodadas. A próxima sessão passará a representar o desempenho atual.":"Nenhuma rodada registrada ainda."}</div>`;
    }
    return `<div class="question-round-history" id="round-history-${safeId(id)}" ${visible?"":"hidden"}>
      <div class="question-round-history-title">Últimos registros</div>
      ${list.map((r,i)=>{
        const qe=n(r.questoes),aa=n(r.acertos),ee=n(r.erros),bb=n(r.brancos);
        const roundLiquid=r.liquidoRodada!=null?r.liquidoRodada:(qe?100*(aa-ee)/qe:null);
        return `<div class="question-round-history-row ${i===0?"latest":""}">
          <span>${i===0?"Atual · ":""}${escapeHtml(fmtDate(r.at))}</span>
          <b>${qe} questões</b>
          <span>${aa} C · ${ee} E · ${bb} B</span>
          <span>${pct(roundLiquid)} líquido</span>
        </div>`;
      }).join("")}
      ${rs.length>limit?`<div class="question-round-more">+ ${rs.length-limit} rodada(s) anterior(es) preservada(s)</div>`:""}
    </div>`;
  }

  function formHtml(id,{visible=false}={}){
    const sid=safeId(id);
    return `<div class="question-round-form" id="round-form-${sid}" ${visible?"":"hidden"}>
      <div><label>Total da rodada</label><input id="round-q-${sid}" type="number" min="1" value="" placeholder="Ex.: 15"></div>
      <div><label>Acertos</label><input id="round-a-${sid}" type="number" min="0" value="" placeholder="Ex.: 12"></div>
      <div><label>Em branco</label><input id="round-b-${sid}" type="number" min="0" value="" placeholder="Ex.: 1"></div>
      <div class="question-round-auto"><label>Erros</label><strong id="round-e-${sid}">—</strong><small>automático</small></div>
      <button type="button" class="question-round-save" onclick="CGU_saveQuestionRound('${id}')">Registrar rodada</button>
    </div>`;
  }

  function roundHtml(id,{review=false}={}){
    const rs=rounds(id);
    if(review){
      return `<div class="question-rounds review-mode" data-rounds-for="${escapeHtml(id)}">
        ${historicalStrip(id)}
        <div class="question-round-section-title">Nova rodada</div>
        <div class="question-round-help">Informe apenas esta sessão. Ela passa a ser seu desempenho atual; o histórico acumulado permanece preservado.</div>
        ${formHtml(id,{visible:true})}
        <div class="question-round-section-title history-title">Evolução por rodada</div>
        ${historyHtml(id,{visible:true,limit:3})}
      </div>`;
    }
    return `<div class="question-rounds" data-rounds-for="${escapeHtml(id)}">
      ${historicalStrip(id)}
      <div class="question-rounds-head">
        <button type="button" class="question-round-add" onclick="CGU_toggleQuestionRound('${id}')">＋ Adicionar nova rodada</button>
        ${rs.length?`<button type="button" class="question-round-history-btn" onclick="CGU_toggleQuestionHistory('${id}')">${rs.length} rodada(s) registrada(s)</button>`:""}
      </div>
      ${formHtml(id,{visible:false})}
      ${rs.length?historyHtml(id,{visible:false,limit:3}):""}
    </div>`;
  }

  const baseTopicHtml=topicHtml;
  topicHtml=function(x){
    let html=baseTopicHtml(x);
    const source=x.m.performanceSource==="ultima-rodada"?"Desempenho atual · última rodada":"Base histórica · ainda sem nova rodada";
    html=html.replace("Acumulado até agora · somente leitura",source);
    const marker='<div class="note-row">';
    return html.includes(marker)?html.replace(marker,roundHtml(x.id)+marker):html+roundHtml(x.id);
  };

  function bindForm(id){
    const sid=safeId(id),q=document.getElementById(`round-q-${sid}`),a=document.getElementById(`round-a-${sid}`),b=document.getElementById(`round-b-${sid}`),e=document.getElementById(`round-e-${sid}`);
    const refresh=()=>{
      if(!q||!e)return;
      if(String(q.value).trim()===""){e.textContent="—";return;}
      const Q=n(q.value),A=n(a?.value),B=n(b?.value);
      e.textContent=String(Math.max(Q-A-B,0));
    };
    [q,a,b].filter(Boolean).forEach(el=>{if(el.dataset.roundBound)return;el.dataset.roundBound="1";el.addEventListener("input",refresh)});
    refresh();
  }
  function bindVisibleForms(){
    document.querySelectorAll('.question-round-form:not([hidden])').forEach(form=>{
      const id=form.closest('.question-rounds')?.dataset.roundsFor;
      if(id)bindForm(id);
    });
  }

  window.CGU_toggleQuestionRound=function(id){
    const el=document.getElementById(`round-form-${safeId(id)}`);if(!el)return;
    el.hidden=!el.hidden;
    if(!el.hidden){bindForm(id);document.getElementById(`round-q-${safeId(id)}`)?.focus();}
  };
  window.CGU_toggleQuestionHistory=function(id){const el=document.getElementById(`round-history-${safeId(id)}`);if(el)el.hidden=!el.hidden;};

  window.CGU_saveQuestionRound=function(id){
    const sid=safeId(id),qEl=document.getElementById(`round-q-${sid}`),aEl=document.getElementById(`round-a-${sid}`),bEl=document.getElementById(`round-b-${sid}`);
    const q=n(qEl?.value),a=n(aEl?.value),b=n(bEl?.value);
    if(q<=0){alert("Informe o total de questões desta rodada.");return;}
    if(a+b>q){alert("Acertos + em branco não podem ultrapassar o total da rodada.");return;}
    const e=q-a-b,before=canonical(id),after={q:before.q+q,a:before.a+a,b:before.b+b,e:before.e+e};
    const roundLiquid=q?100*(a-e)/q:null;
    const accumulatedLiquid=after.q?100*(after.a-after.e)/after.q:null;
    const at=new Date().toISOString();
    const history=[...rounds(id),{
      id:`qr-${Date.now()}-${Math.random().toString(36).slice(2,6)}`,
      at,questoes:q,acertos:a,erros:e,brancos:b,
      totalAntes:before.q,totalDepois:after.q,
      liquidoRodada:roundLiquid,liquidoAcumulado:accumulatedLiquid
    }];
    setTS(id,{
      questoes:after.q,acertos:after.a,brancos:after.b,erros:after.e,
      questionRounds:history,
      lastQuestionDate:at,lastQuestionSource:"edital-nova-rodada",
      lastQuestionBatch:{questoes:q,acertos:a,erros:e,brancos:b,data:at.slice(0,10)},
      updatedAtMs:Date.now(),atomicConfirmed:true
    });
    try{save();}catch(err){console.warn("Falha ao salvar nova rodada",err)}
    window.dispatchEvent(new CustomEvent("cgu-question-recorded",{detail:{topicId:id,batch:{q,a,e,b},source:"edital-nova-rodada"}}));
    const y=window.scrollY,reviewActive=!!document.getElementById("page-revisar")?.classList.contains("active");
    setTimeout(()=>{
      try{if(reviewActive)renderReview();else renderEdital();}catch(err){console.warn(err)}
      requestAnimationFrame(()=>window.scrollTo({top:y,left:0,behavior:"instant"}));
      try{renderDashboard();if(typeof renderPerformancePanel==="function")renderPerformancePanel();}catch(err){}
      bindVisibleForms();
    },0);
    if(typeof toast==="function")toast(`Nova rodada registrada: ${q} questões em ${title(id)}.`);
  };

  function currentSummary(id){
    const x=row(id);if(!x)return "";
    const m=x.m,source=m.performanceSource==="ultima-rodada"?"Desempenho atual · última rodada":"Base histórica · ainda sem nova rodada";
    return `<div class="review-accumulated-label">${source}</div>
      <div class="review-grid review-accumulated">
        <div class="field"><label>Total questões</label><div class="metric">${m.q}</div></div>
        <div class="field"><label>Acertos</label><div class="metric">${m.a}</div></div>
        <div class="field"><label>Erros</label><div class="metric">${m.e}</div></div>
        <div class="field"><label>Em branco</label><div class="metric">${n(m.b ?? m.s?.brancos)}</div></div>
        <div class="field"><label>% líquido</label><div class="metric ${m.status==="Atendeu"?"status-ok":"status-review"}">${fmtPct(m.liquido)}</div></div>
        <div class="field"><label>Meta</label><div class="metric">${m.meta}%</div></div>
      </div>`;
  }

  const baseReview=renderReview;
  renderReview=function(){
    const r=baseReview.apply(this,arguments);
    document.querySelectorAll('#reviewList .review-card[data-topic-id]').forEach(card=>{
      const id=card.dataset.topicId;if(!id)return;
      const oldGrid=card.querySelector('.review-grid');
      if(oldGrid){
        const wrap=document.createElement('div');wrap.innerHTML=currentSummary(id);oldGrid.replaceWith(...wrap.childNodes);
      }
      card.querySelector('.question-rounds')?.remove();
      card.insertAdjacentHTML('beforeend',roundHtml(id,{review:true}));
    });
    bindVisibleForms();
    return r;
  };

  try{renderEdital();renderReview();bindVisibleForms();}catch(e){}
})();