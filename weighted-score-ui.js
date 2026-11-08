/* Pontuação ponderada CGU 2026 — Edital 1/2026, item 8.11.2.
 * P1/P2: +1 por acerto, -1 por erro; P3: +2 por acerto, -2 por erro.
 * Em branco: 0. A última rodada determina o nível atual do tópico.
 * A extrapolação por prova é apenas indicativa e não é nota oficial.
 */
(() => {
  const WEIGHTS={P1:1,P2:1,P3:2};
  const CAP={P1:40,P2:40,P3:180};
  const LABEL={P1:"Básicos",P2:"Complementares",P3:"Específicos"};
  const GOAL=window.CGU_OBJECTIVE_GOAL||{floor:210,target:220,stretch:230};

  function rows(){return typeof topicsFlat==="function"?topicsFlat():[];}
  function current(id){return rows().find(x=>x.id===id)||null;}
  function value(v){const n=Number(v);return Number.isFinite(n)?n:0;}
  function fmt(v,places=0){
    return v===null||!Number.isFinite(v)?"—":Number(v).toLocaleString("pt-BR",{minimumFractionDigits:places,maximumFractionDigits:places});
  }
  function scoreInfo(x){
    if(!x)return null;
    const m=x.m||{},w=WEIGHTS[x.exam]||1;
    const q=Math.max(0,value(m.q)),a=Math.max(0,value(m.a)),e=Math.max(0,value(m.e)),b=Math.max(0,value(m.b??m.s?.brancos));
    const plus=a*w,minus=e*w,net=plus-minus,max=q*w;
    const meta=value(m.meta),reference=max*meta/100,gap=Math.max(0,reference-net);
    return {q,a,e,b,w,plus,minus,net,max,meta,reference,gap,exam:x.exam,
      source:m.performanceSource==="ultima-rodada"?"Última rodada":"Base histórica"};
  }
  function gradeHtml(x){
    const s=scoreInfo(x);
    if(!s||!s.q)return '<div class="cgu-weighted-grade is-pending"><b>Nota por peso</b><span>Registre uma rodada de questões para calcular os pontos líquidos.</span></div>';
    const met=s.net+1e-8>=s.reference;
    return '<div class="cgu-weighted-grade '+(met?"is-met":"is-gap")+'">'+
      '<div class="cgu-weighted-line">'+
        '<span><b>Nota líquida · '+s.source+'</b> <em>'+s.exam+' · peso '+s.w+'</em></span>'+
        '<strong>'+fmt(s.net)+' / '+fmt(s.max)+' pontos</strong>'+
        '<span class="cgu-weighted-goal">Meta do tópico: <b>'+fmt(s.reference,1)+' / '+fmt(s.max)+' pts</b></span>'+
        '<span class="cgu-weighted-diff">'+(met?'✓ Meta operacional atingida':'Faltam '+fmt(s.gap,1)+' pts nesta amostra')+'</span>'+
      '</div>'+
      '<div class="cgu-weighted-formula">'+s.a+' acertos × '+s.w+' = <b>+'+fmt(s.plus)+'</b> · '+s.e+' erros × '+s.w+' = <b>−'+fmt(s.minus)+'</b> · '+s.b+' em branco = <b>0</b> · líquido <b>'+fmt(s.max?100*s.net/s.max:null,1)+'%</b>. Meta operacional '+fmt(s.meta)+'% (não equivale à meta global 210–230/260).</div>'+
    '</div>';
  }
  function replaceOrInsert(host,id,anchor){
    if(!host||!id)return;
    const x=current(id);if(!x)return;
    const html=gradeHtml(x);
    let target=[...host.children].find(ch=>ch.classList.contains("cgu-weighted-grade"));
    if(target){target.outerHTML=html;return;}
    if(anchor&&host.contains(anchor))anchor.insertAdjacentHTML("afterend",html);
    else host.insertAdjacentHTML("afterbegin",html);
  }
  function patchQuestionCards(root=document,onlyId=null){
    root.querySelectorAll(".question-rounds[data-rounds-for]").forEach(w=>{
      const id=w.dataset.roundsFor;
      if(onlyId&&id!==onlyId)return;
      replaceOrInsert(w,id,w.querySelector(".question-history-strip"));
      const x=current(id);
      const weight=WEIGHTS[x?.exam]||1;
      w.querySelectorAll(".question-round-history-row").forEach((line,i)=>{
        // Ordem exibida: mais recente -> mais antigo.
        const rr=getTS(id)?.questionRounds||[];
        const r=rr[rr.length-1-i];
        if(!r)return;
        const q=value(r.questoes),a=value(r.acertos),e=value(r.erros??(q-a-value(r.brancos)));
        const old=line.querySelector(".cgu-round-points");
        const label=fmt((a-e)*weight)+'/'+fmt(q*weight)+' pts';
        if(old)old.textContent=label;
        else line.insertAdjacentHTML("beforeend",'<span class="cgu-round-points">'+label+'</span>');
      });
    });
  }
  function patchPlan(root=document,onlyId=null){
    root.querySelectorAll(".planner-qbox").forEach(box=>{
      const id=box.querySelector(".planner-target select")?.value;
      if(!id||(onlyId&&onlyId!==id))return;
      replaceOrInsert(box,id,box.querySelector(".latest-round-inline")||box.querySelector(".question-cumulative"));
      const select=box.querySelector(".planner-target select");
      if(select&&!select.dataset.weightedBound){select.dataset.weightedBound="1";select.addEventListener("change",()=>replaceOrInsert(box,select.value,box.querySelector(".latest-round-inline")||box.querySelector(".question-cumulative")));}
    });
    root.querySelectorAll(".int-q").forEach(box=>{
      const raw=box.querySelector('button[onclick*="CGU_intensiveSaveQuestions"]')?.getAttribute("onclick")||"";
      const m=raw.match(/CGU_intensiveSaveQuestions\('([^']+)'/);
      if(m&&(!onlyId||m[1]===onlyId))replaceOrInsert(box,m[1],box.querySelector(".latest-round-inline")||box.querySelector(".question-cumulative"));
    });
  }
  function examProjection(){
    const all=rows();
    return ["P1","P2","P3"].map(exam=>{
      const list=all.filter(x=>x.exam===exam),w=WEIGHTS[exam],max=CAP[exam];
      const q=list.reduce((s,x)=>s+Math.max(0,value(x.m.q)),0);
      const a=list.reduce((s,x)=>s+Math.max(0,value(x.m.a)),0);
      const e=list.reduce((s,x)=>s+Math.max(0,value(x.m.e)),0);
      const sampleMax=q*w,sampleNet=(a-e)*w;
      const pct=sampleMax?sampleNet/sampleMax:null;
      return {exam,w,max,q,a,e,sampleNet,sampleMax,pct,projected:pct===null?null:pct*max};
    });
  }
  function patchDashboard(){
    const kpi=document.getElementById("kpis");
    if(!kpi)return;
    const items=examProjection();
    const allReady=items.every(x=>x.q>=10);
    const projected=allReady?items.reduce((sum,x)=>sum+x.projected,0):null;
    let area=document.getElementById("cguWeightedExam");
    if(!area){
      area=document.createElement("section");
      area.id="cguWeightedExam";
      area.className="card cgu-weighted-exam";
      kpi.insertAdjacentElement("afterend",area);
    }
    area.innerHTML='<div class="cgu-weighted-exam-head"><h3>Nota indicativa por prova · regra Cebraspe</h3><span>Acertos − erros, com peso da prova</span></div>'+
      '<div class="cgu-weighted-exam-grid">'+items.map(p=>
        '<div class="cgu-weighted-exam-cell"><b>'+p.exam+' · '+LABEL[p.exam]+'</b><small>Peso '+p.w+' · máximo '+p.max+' pontos</small>'+
        '<strong>'+(p.projected===null?'Sem amostra':fmt(p.projected,1)+' / '+p.max+' pts')+'</strong>'+
        '<span>'+(p.q?p.q+' questões na amostra · '+fmt(p.sampleNet)+'/'+fmt(p.sampleMax)+' pts líquidos':'Sem questões registradas nesta prova')+'</span></div>'
      ).join("")+'</div>'+
      '<div class="cgu-weighted-summary">'+
        '<b>'+(projected===null?'Projeção total indisponível':"Projeção indicativa: "+fmt(projected,1)+" / 260")+'</b>'+
        '<span>'+(projected===null?'Registre pelo menos 10 questões em cada prova (P1, P2 e P3) para liberar uma estimativa global preliminar.':'Meta competitiva pessoal: 210–230 / 260, alvo 220. Diferença para 220: '+fmt(220-projected,1)+' pontos.')+'</span>'+
      '</div><p class="cgu-weighted-disclaimer">Estimativa matemática, não nota oficial nem previsão de classificação: extrapola o desempenho atual das últimas rodadas para 40 itens de P1, 40 de P2 e 90 de P3. A banca não fixa quantidade por tópico; amostras pequenas podem distorcer a projeção.</p>';
    // Evita mensagens concorrentes com projeções antigas baseadas na média de toda a amostra.
    const panel=document.getElementById("performanceVsTarget");
    const signal=panel?.querySelector(".perf-signal");
    if(signal){
      signal.classList.remove("ok","medium","bad");
      const status=!allReady?"Projeção geral ainda incompleta":projected>=230?"Acima da meta superior (estimativa)":projected>=210?"Na faixa-alvo (estimativa)":"Abaixo da faixa-alvo (estimativa)";
      const message=!allReady
        ?"Faltam amostras de pelo menos 10 questões em "+items.filter(p=>p.q<10).map(p=>p.exam).join(", ")+". Não é possível calcular uma estimativa global."
        :"Extrapolação por prova: "+fmt(projected,1)+"/260 pontos. Sua meta pessoal é 210–230; valide em simulados completos.";
      signal.classList.add(allReady&&projected>=210?"ok":"medium");
      signal.innerHTML="<span>"+status+"</span><small>"+message+"</small>";
    }
    const panelNote=panel?.querySelector(".perf-note");
    if(panelNote&&!allReady){
      panelNote.classList.remove("ok");
      panelNote.classList.add("medium");
      panelNote.innerHTML="<b>Projeção total não liberada.</b><span>A estimativa exige ao menos 10 questões em cada prova. Nota final e classificação não são previsíveis por esta amostra.</span>";
    }
    const panelSample=panel?.querySelectorAll(".perf-summary>div")[2];
    if(panelSample){
      const label=panelSample.querySelector("span");
      if(label)label.textContent="Líquido ponderado da amostra";
    }
    kpi.querySelectorAll(".kpi").forEach(card=>{
      const label=card.querySelector(".l")?.textContent?.trim();
      const v=card.querySelector(".v"),detail=card.querySelector(".dash-kpi-detail");
      if(label==="Projeção atual / 260"){
        if(v)v.textContent=projected===null?"—":fmt(projected,1);
        if(detail)detail.textContent=projected===null?"Aguardando amostras nas três provas.":"Estimativa por P1/P2/P3, não nota oficial.";
      }
      if(label==="Gap para 210 pontos"){
        if(v)v.textContent=projected===null?"—":(projected-210>=0?"+":"")+fmt(projected-210,1);
        if(detail)detail.textContent=projected===null?"Sem projeção global ainda.":"Gap para 220: "+(projected-220>=0?"+":"")+fmt(projected-220,1)+" pts";
      }
    });
  }
  function patchAll(){
    patchQuestionCards();
    patchPlan();
    patchDashboard();
  }
  function wrap(name,patch){
    const base=window[name];
    if(typeof base!=="function")return;
    window[name]=function(){
      const result=base.apply(this,arguments);
      patch();
      return result;
    };
  }
  wrap("renderEdital",()=>patchQuestionCards(document.getElementById("editalList")||document));
  wrap("renderReview",()=>patchQuestionCards(document.getElementById("reviewList")||document));
  wrap("renderToday",()=>patchPlan(document.getElementById("page-hoje")||document));
  wrap("renderDashboard",patchDashboard);
  const baseDashboardPatch=window.CGU_patchLatestRoundDashboard;
  if(typeof baseDashboardPatch==="function"){
    window.CGU_patchLatestRoundDashboard=function(){
      const r=baseDashboardPatch.apply(this,arguments);
      patchDashboard();return r;
    };
  }
  window.CGU_refreshWeightedScores=patchAll;
  window.addEventListener("cgu-question-recorded",ev=>requestAnimationFrame(()=>{
    const id=ev.detail?.topicId||null;
    patchQuestionCards(document,id);
    patchPlan(document,id);
    patchDashboard();
  }));
  window.addEventListener("cgu-cloud-ready",()=>requestAnimationFrame(patchAll));
  try{patchAll()}catch(err){console.warn("Pontuação ponderada CGU:",err)}
})();
