/* Última rodada visível e consistente em todo o app.
   - Edital/Revisar: último registro sempre exposto.
   - Plano normal/intensivo: lançamentos também entram em questionRounds.
   - Cards do Plano exibem a última rodada, não um "acumulado" ambíguo.
*/
(() => {
  function n(v){return Math.max(0,Number(v)||0)}
  function sid(v){return String(v||"").replace(/[^a-zA-Z0-9_-]/g,"-")}
  function rounds(id){const r=getTS(id)?.questionRounds;return Array.isArray(r)?r:[]}
  function lastRound(id){const rs=rounds(id);return rs.length?rs[rs.length-1]:null}
  function pct(v){return v==null||!isFinite(v)?"—":Number(v).toFixed(1).replace(".",",")+"%"}
  function fmtDate(v){try{return new Date(v).toLocaleString("pt-BR",{day:"2-digit",month:"2-digit",year:"2-digit",hour:"2-digit",minute:"2-digit"})}catch(e){return ""}}
  function row(id){return typeof topicsFlat==="function"?topicsFlat().find(x=>x.id===id):null}

  function roundData(id){
    const r=lastRound(id),x=row(id);
    if(r){
      const q=n(r.questoes),a=n(r.acertos),b=n(r.brancos),e=n(r.erros ?? (q-a-b));
      return {q,a,b,e,liq:q?100*(a-e)/q:null,at:r.at||getTS(id)?.lastQuestionDate||null,source:"Última rodada"};
    }
    if(x?.m?.q){
      const m=x.m;return {q:n(m.q),a:n(m.a),b:n(m.b??m.s?.brancos),e:n(m.e),liq:m.liquido,at:m.s?.lastQuestionDate||null,source:"Base histórica"};
    }
    return null;
  }

  function latestInline(id){
    const d=roundData(id);if(!d)return "";
    return `<div class="latest-round-inline" data-latest-round-for="${escapeHtml(id)}"><b>${d.source}</b><span>${d.at?escapeHtml(fmtDate(d.at)):"sem data"}</span><span>${d.q} questões</span><span>${d.a} C · ${d.e} E · ${d.b} B</span><strong>${pct(d.liq)} líquido</strong></div>`;
  }
  window.CGU_latestRoundHtml=latestInline;

  function appendRoundOnly(id,batch,source){
    const q=n(batch?.q),a=n(batch?.a),b=n(batch?.b),e=n(batch?.e ?? (q-a-b));
    if(!q||a+b>q)return false;
    const rs=[...rounds(id)],now=Date.now(),last=rs[rs.length-1];
    if(last && n(last.questoes)===q && n(last.acertos)===a && n(last.brancos)===b && n(last.erros)===e && (now-new Date(last.at||0).getTime())<5000)return false;
    const at=new Date().toISOString();
    rs.push({id:`qr-${now}-${Math.random().toString(36).slice(2,6)}`,at,questoes:q,acertos:a,erros:e,brancos:b,liquidoRodada:q?100*(a-e)/q:null,source});
    setTS(id,{questionRounds:rs,lastQuestionBatch:{questoes:q,acertos:a,erros:e,brancos:b,data:at.slice(0,10)},lastQuestionDate:at,lastQuestionSource:source,updatedAtMs:now,atomicConfirmed:true});
    try{save();}catch(err){console.warn("Falha ao salvar histórico da rodada",err)}
    window.dispatchEvent(new CustomEvent("cgu-question-recorded",{detail:{topicId:id,batch:{q,a,e,b},source}}));
    return true;
  }

  function patchRoundContainers(root=document){
    root.querySelectorAll('.question-rounds').forEach(wrapper=>{
      const id=wrapper.dataset.roundsFor;if(!id)return;
      const history=wrapper.querySelector('.question-round-history');
      const rs=rounds(id);
      if(history&&rs.length){
        history.hidden=false;
        history.classList.add('latest-always-visible');
        const title=history.querySelector('.question-round-history-title');if(title)title.textContent=wrapper.classList.contains('review-mode')?'Evolução por rodada':'Último registro';
      }
      const btn=wrapper.querySelector('.question-round-history-btn');
      if(btn){
        if(rs.length<=1)btn.style.display='none';
        else{btn.style.display='';btn.textContent=`Ver histórico (${rs.length})`;}
      }
    });
  }

  window.CGU_toggleQuestionHistory=function(id,button){
    const wrapper=button?.closest?.('.question-rounds'),history=wrapper?.querySelector('.question-round-history');
    if(!history)return;
    history.classList.toggle('show-all-rounds');
    const total=rounds(id).length;
    button.textContent=history.classList.contains('show-all-rounds')?'Mostrar só a última':`Ver histórico (${total})`;
  };

  function replacePlanSummary(box,id){
    const d=roundData(id);if(!box||!d)return;
    const cur=box.querySelector('.question-cumulative');
    if(cur)cur.innerHTML=`<div><span>${d.source}</span><b>${d.q}</b></div><div><span>Acertos</span><b>${d.a}</b></div><div><span>Erros</span><b>${d.e}</b></div><div><span>Em branco</span><b>${d.b}</b></div><div><span>Líquido</span><b>${pct(d.liq)}</b></div>`;
    box.querySelector('.latest-round-inline')?.remove();
    const target=cur||box.querySelector('.lesson-question-head')||box.firstElementChild;
    if(target)target.insertAdjacentHTML('afterend',latestInline(id));
  }

  function patchPlan(){
    document.querySelectorAll('.planner-qbox').forEach(box=>{
      const sel=box.querySelector('.planner-target select');
      const id=sel?.value;if(id)replacePlanSummary(box,id);
      if(sel&&!sel.dataset.latestBound){sel.dataset.latestBound='1';sel.addEventListener('change',()=>replacePlanSummary(box,sel.value));}
    });
    document.querySelectorAll('.int-q').forEach(box=>{
      const btn=box.querySelector('button[onclick*="CGU_intensiveSaveQuestions"]');
      const raw=btn?.getAttribute('onclick')||'';
      const m=raw.match(/CGU_intensiveSaveQuestions\('([^']+)'/);if(m)replacePlanSummary(box,m[1]);
    });
  }

  const basePlanSave=window.CGU_registerPlanQuestions;
  if(typeof basePlanSave==='function')window.CGU_registerPlanQuestions=function(activeId,ymd){
    const s=sid(activeId),targetId=document.getElementById(`bal-target-${s}`)?.value||activeId;
    const q=n(document.getElementById(`bal-q-${s}`)?.value),a=n(document.getElementById(`bal-a-${s}`)?.value),b=n(document.getElementById(`bal-b-${s}`)?.value);
    const before=n(normalizeTopic(targetId)?.questoes);
    const r=basePlanSave.apply(this,arguments);
    const after=n(normalizeTopic(targetId)?.questoes);
    if(q>0&&after>=before+q&&appendRoundOnly(targetId,{q,a,b,e:q-a-b},'plano-diario')){try{renderAll();}catch(e){}}
    return r;
  };

  const baseIntensiveSave=window.CGU_intensiveSaveQuestions;
  if(typeof baseIntensiveSave==='function')window.CGU_intensiveSaveQuestions=function(topicId,ymd,i){
    const prefix=`int-${ymd}-${i}-`,q=n(document.getElementById(prefix+'q')?.value),a=n(document.getElementById(prefix+'a')?.value),b=n(document.getElementById(prefix+'b')?.value);
    const before=n(normalizeTopic(topicId)?.questoes);
    const r=baseIntensiveSave.apply(this,arguments);
    const after=n(normalizeTopic(topicId)?.questoes);
    if(q>0&&after>=before+q&&appendRoundOnly(topicId,{q,a,b,e:q-a-b},'plano-intensivo')){try{renderAll();}catch(e){}}
    return r;
  };

  const baseEdital=renderEdital;
  renderEdital=function(){const r=baseEdital.apply(this,arguments);patchRoundContainers(document.getElementById('editalList')||document);return r;};
  const baseReview=renderReview;
  renderReview=function(){const r=baseReview.apply(this,arguments);patchRoundContainers(document.getElementById('reviewList')||document);return r;};
  const baseToday=renderToday;
  renderToday=function(){const r=baseToday.apply(this,arguments);patchPlan();return r;};

  window.CGU_showLatestRoundEverywhere=function(){patchRoundContainers();patchPlan();};
  window.addEventListener('cgu-question-recorded',()=>setTimeout(()=>{patchRoundContainers();patchPlan();},0));
  window.addEventListener('cgu-cloud-ready',()=>setTimeout(()=>{patchRoundContainers();patchPlan();},0));
  try{patchRoundContainers();patchPlan();}catch(e){console.warn('Última rodada visível:',e)}
})();
