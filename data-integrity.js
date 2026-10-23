/* Integridade de dados v1.
   Unifica e confere o fluxo de questões entre Plano, Edital, Revisar, Dashboard e Firebase.
   Regra canônica: TOTAL = ACERTOS + ERROS + EM BRANCO.
*/
(() => {
  const dirtyEdital = new Set();

  function n(v){ return Math.max(0, Number(v) || 0); }
  function canonical(id){
    const raw = getTS(id) || {};
    let q = n(raw.questoes), a = n(raw.acertos), b = n(raw.brancos), storedE=n(raw.erros);
    if(!q && (a || storedE || b)) q = a + storedE + b;
    if(a + b > q) q = a + b;
    const e = Math.max(q - a - b, 0);
    return {raw,q,a,b,e};
  }
  function sameTotals(a,b){return a.q===b.q && a.a===b.a && a.b===b.b && a.e===b.e;}
  function row(id){return typeof topicsFlat === "function" ? topicsFlat().find(x=>x.id===id) : null;}
  function topicTitle(id){
    const x=row(id); if(!x)return id;
    const am=window.ATOMIC_META?.[id]||{};
    return am.code?`${am.code} · ${am.title}`:(am.title||x.g.nome);
  }
  function selectedYmd(){
    const el=document.getElementById("studyDate");
    if(el?.value)return el.value;
    const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
  }

  function persistRepair(id, expected, meta={}){
    setTS(id,{
      questoes:expected.q,
      acertos:expected.a,
      erros:expected.e,
      brancos:expected.b,
      atomicConfirmed:true,
      updatedAtMs:Date.now(),
      ...meta
    });
  }

  function auditAll({saveChanges=true}={}){
    const validIds=new Set((typeof topicsFlat==="function"?topicsFlat():[]).map(x=>x.id));
    let repaired=0, checked=0, orphaned=0;
    Object.keys(state||{}).forEach(id=>{
      const raw=getTS(id)||{};
      const hasNumbers=[raw.questoes,raw.acertos,raw.erros,raw.brancos].some(v=>v!==undefined&&v!==null&&v!=="");
      if(!hasNumbers)return;
      checked++;
      if(!validIds.has(id))orphaned++;
      const c=canonical(id);
      if(n(raw.questoes)!==c.q || n(raw.acertos)!==c.a || n(raw.brancos)!==c.b || n(raw.erros)!==c.e){
        persistRepair(id,c,{integrityRepairedAtMs:Date.now()});
        repaired++;
      }
    });
    const report={checked,repaired,orphaned,at:new Date().toISOString()};
    window.CGU_LAST_INTEGRITY_REPORT=report;
    if(repaired&&saveChanges){try{save();}catch(e){console.warn("Falha ao salvar reparos de integridade",e);}}
    return report;
  }
  window.CGU_runDataIntegrityAudit=auditAll;

  function fieldInputByLabel(host,label){
    const wanted=label.toLowerCase();
    const blocks=[...(host?.querySelectorAll(".lesson-question-grid > div")||[])];
    const block=blocks.find(d=>(d.querySelector("label")?.textContent||"").trim().toLowerCase()===wanted);
    return block?.querySelector("input")||null;
  }
  function plannerCapture(activeId){
    const host=document.querySelector("#todayLessons .planner-qbox")||document.querySelector("#todayLessons .lesson-question-box");
    if(!host)return null;
    const select=host.querySelector("select");
    const targetId=select?.value||activeId;
    const qEl=fieldInputByLabel(host,"Total");
    const aEl=fieldInputByLabel(host,"Acertos");
    const bEl=fieldInputByLabel(host,"Em branco");
    const q=Number(qEl?.value||0), a=Number(aEl?.value||0), b=Number(bEl?.value||0);
    return {host,targetId,q,a,b};
  }

  const baseRegister=window.CGU_registerPlanQuestions;
  if(typeof baseRegister==="function"){
    window.CGU_registerPlanQuestions=function(activeId,ymd){
      const cap=plannerCapture(activeId);
      const before=cap?.targetId?canonical(cap.targetId):null;
      const beforeUpdated=cap?.targetId?Number(getTS(cap.targetId)?.updatedAtMs)||0:0;
      const result=baseRegister.apply(this,arguments);
      if(!cap||!before||!cap.targetId)return result;

      const after=canonical(cap.targetId);
      const afterUpdated=Number(getTS(cap.targetId)?.updatedAtMs)||0;
      const successful=afterUpdated>beforeUpdated || !sameTotals(before,after);
      if(!successful)return result;

      const batchQ=n(cap.q), batchA=n(cap.a), batchB=n(cap.b);
      if(batchA+batchB>batchQ)return result;
      const batchE=Math.max(batchQ-batchA-batchB,0);
      const expected={q:before.q+batchQ,a:before.a+batchA,b:before.b+batchB,e:before.e+batchE};
      const mismatch=!sameTotals(expected,after);
      const at=new Date().toISOString();
      persistRepair(cap.targetId,expected,{
        lastQuestionDate:at,
        lastQuestionSource:"plano-estudo",
        lastQuestionBatch:{questoes:batchQ,acertos:batchA,erros:batchE,brancos:batchB,data:ymd||selectedYmd()},
        integrityVerifiedAtMs:Date.now()
      });
      try{save();}catch(e){console.warn("Falha ao salvar conferência do lançamento",e);}

      try{renderAll();}catch(e){}
      try{if(typeof renderPerformancePanel==="function")renderPerformancePanel();}catch(e){}
      window.dispatchEvent(new CustomEvent("cgu-question-recorded",{detail:{topicId:cap.targetId,batch:{q:batchQ,a:batchA,e:batchE,b:batchB},mismatch}}));
      if(mismatch&&typeof toast==="function")toast(`Registro corrigido e sincronizado: ${topicTitle(cap.targetId)}.`);
      return result;
    };
  }

  const baseSetQuestion=setQuestion;
  setQuestion=function(id,field,val){
    const result=baseSetQuestion.apply(this,arguments);
    const c=canonical(id),raw=getTS(id)||{};
    if(n(raw.questoes)!==c.q || n(raw.acertos)!==c.a || n(raw.brancos)!==c.b || n(raw.erros)!==c.e){
      persistRepair(id,c,{integrityRepairedAtMs:Date.now()});
      try{save();}catch(e){}
    }
    if(document.getElementById("page-edital")?.classList.contains("active"))dirtyEdital.add(id);
    return result;
  };

  document.addEventListener("focusout",ev=>{
    const topic=ev.target?.closest?.("#page-edital .topic[data-topic-id]");
    if(!topic)return;
    const id=topic.dataset.topicId;if(!id||!dirtyEdital.has(id))return;
    setTimeout(()=>{
      if(topic.contains(document.activeElement))return;
      dirtyEdital.delete(id);
      setTS(id,{lastQuestionDate:new Date().toISOString(),lastQuestionSource:"edital",updatedAtMs:Date.now(),atomicConfirmed:true});
      try{save();}catch(e){}
    },0);
  },true);

  function decoratePlannerErrors(){
    const box=document.querySelector("#todayLessons .planner-qbox")||document.querySelector("#todayLessons .lesson-question-box");
    const grid=box?.querySelector(".lesson-question-grid");
    if(!grid)return;
    let auto=grid.querySelector(".auto-error-field");
    if(!auto){
      auto=document.createElement("div");auto.className="auto-error-field";
      auto.innerHTML='<label>Erros (automático)</label><input type="number" readonly value="0" title="Calculado como Total - Acertos - Em branco">';
      const btn=grid.querySelector("button");
      if(btn)grid.insertBefore(auto,btn);else grid.appendChild(auto);
    }
    const qEl=fieldInputByLabel(box,"Total"),aEl=fieldInputByLabel(box,"Acertos"),bEl=fieldInputByLabel(box,"Em branco"),eEl=auto.querySelector("input");
    const refresh=()=>{
      const q=n(qEl?.value),a=n(aEl?.value),b=n(bEl?.value);
      eEl.value=String(Math.max(q-a-b,0));
      const invalid=a+b>q && q>0;
      eEl.style.borderColor=invalid?"#ef4444":"";
      if(invalid)eEl.title="Acertos + Em branco não podem ultrapassar o Total";
      else eEl.title="Calculado como Total - Acertos - Em branco";
    };
    [qEl,aEl,bEl].filter(Boolean).forEach(el=>{
      if(el.dataset.integrityBound)return;
      el.dataset.integrityBound="1";el.addEventListener("input",refresh);
    });
    refresh();
  }

  const baseRenderToday=renderToday;
  renderToday=function(){
    const r=baseRenderToday.apply(this,arguments);
    decoratePlannerErrors();
    return r;
  };

  if(!document.getElementById("integrityStyle")){
    const s=document.createElement("style");s.id="integrityStyle";
    s.textContent=`
      .lesson-question-grid{grid-template-columns:repeat(4,minmax(0,1fr)) auto}
      .auto-error-field input[readonly]{background:#eef2f7;color:#334155;font-weight:800}
      @media(max-width:700px){.lesson-question-grid{grid-template-columns:1fr 1fr}.lesson-question-grid button{grid-column:1/-1;width:100%}}
      @media(max-width:420px){.lesson-question-grid{grid-template-columns:1fr}.lesson-question-grid button{grid-column:auto}}
    `;
    document.head.appendChild(s);
  }

  const initial=auditAll();
  if(initial.repaired)console.warn("CGU: inconsistências numéricas reparadas",initial);
  window.addEventListener("cgu-cloud-ready",()=>{
    const r=auditAll();
    if(r.repaired){try{renderAll();}catch(e){}}
  });

  try{decoratePlannerErrors();}catch(e){}
})();
