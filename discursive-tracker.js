/* Acompanhamento da prova discursiva P4 - CGU/Cebraspe.
   Regras oficiais do Edital nº 1/2026:
   Q1 (Conhecimentos Complementares): até 30 linhas, 30 pts, NQ1 = NC - 6*NE/TL.
   Q2 (Situação-problema / Conhecimentos Específicos): até 60 linhas, 70 pts, NQ2 = NC - 14*NE/TL.
   NFPD = NQ1 + NQ2; mínimo edital = 50/100.
   A rubrica formativa abaixo é apenas diagnóstico de treino e NÃO altera a fórmula oficial.
*/
(() => {
  const PLAN_KEY=KEY+"-daily-plans-v1";
  const META_KEY="__discursiveTrackerV1";
  const TARGET=Number(window.CGU_OBJECTIVE_GOAL?.p4Target)||85;
  const CONFIG={
    q1:{label:"Questão discursiva · Conhecimentos Complementares",short:"Q1 · Complementares",maxScore:30,maxLines:30,factor:6,target:30*TARGET/100},
    q2:{label:"Situação-problema · Conhecimentos Específicos",short:"Q2 · Estudo de caso",maxScore:70,maxLines:60,factor:14,target:70*TARGET/100}
  };
  let editingId=null;

  function readPlans(){
    if(typeof window.CGU_readDailyPlans==="function")return window.CGU_readDailyPlans();
    try{return JSON.parse(localStorage.getItem(PLAN_KEY)||"{}")||{}}catch(e){return {}}
  }
  function writePlans(v){
    if(typeof window.CGU_writeDailyPlans==="function")return window.CGU_writeDailyPlans(v);
    try{localStorage.setItem(PLAN_KEY,JSON.stringify(v||{}));}catch(e){}
    window.dispatchEvent(new CustomEvent("cgu-plan-changed"));
  }
  function readBucket(){
    const p=readPlans();
    const b=p[META_KEY]||{};
    return {version:1,entries:Array.isArray(b.entries)?b.entries:[],updatedAtMs:Number(b.updatedAtMs)||0};
  }
  function saveBucket(bucket){
    const p=readPlans();
    p[META_KEY]={version:1,entries:bucket.entries||[],updatedAtMs:Date.now()};
    writePlans(p);
    try{save();}catch(e){}
  }
  function n(v){const x=Number(v);return Number.isFinite(x)?Math.max(0,x):0;}
  function clamp(v,min,max){return Math.max(min,Math.min(max,v));}
  function fmt(v,d=1){return v==null||!isFinite(v)?"—":Number(v).toFixed(d).replace(".",",");}
  function today(){const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;}
  function dateBR(v){if(!v)return "—";const d=new Date(v+"T12:00:00");return d.toLocaleDateString("pt-BR");}
  function cfg(type){return CONFIG[type]||CONFIG.q1;}
  function calc(entry){
    const c=cfg(entry.type);
    const written=n(entry.lines);
    const effective=Math.min(written,c.maxLines);
    const nc=clamp(n(entry.nc),0,c.maxScore);
    const spelling=n(entry.spelling),syntax=n(entry.syntax),vocab=n(entry.vocab),other=n(entry.otherLang);
    const ne=spelling+syntax+vocab+other;
    const zero=!!entry.escapeTheme||!!entry.noText||effective<=0;
    const penalty=zero?0:(c.factor*ne/effective);
    const score=zero?0:Math.max(0,nc-penalty);
    const pct=c.maxScore?100*score/c.maxScore:0;
    const gap=score-c.target;
    const rubric=[entry.rCommand,entry.rKnowledge,entry.rDevelopment,entry.rStructure,entry.rCohesion].reduce((s,v)=>s+clamp(n(v),0,5),0);
    return {...c,written,effective,nc,ne,penalty,score,pct,gap,rubric,rubricPct:100*rubric/25,overLines:written>c.maxLines};
  }
  function validEntries(){return readBucket().entries.filter(e=>!e.training);}
  function summary(){
    const all=readBucket().entries;
    const valid=all.filter(e=>!e.training);
    const scores=type=>valid.filter(e=>e.type===type).map(e=>calc(e).score);
    const avg=arr=>arr.length?arr.reduce((a,b)=>a+b,0)/arr.length:null;
    const q1=avg(scores("q1")),q2=avg(scores("q2"));
    const total=q1!=null&&q2!=null?q1+q2:null;
    return {all,valid,q1,q2,total,training:all.filter(e=>e.training).length};
  }

  function insertPage(){
    if(document.getElementById("page-discursiva"))return;
    const nav=document.querySelector(".nav");
    if(nav&&!nav.querySelector('[data-page="discursiva"]')){
      const review=[...nav.querySelectorAll("button")].find(b=>b.dataset.page==="revisar");
      const b=document.createElement("button");b.dataset.page="discursiva";b.innerHTML="✍️ Discursivas / P4";b.onclick=function(){switchPage("discursiva",this)};
      nav.insertBefore(b,review||null);
    }
    const main=document.querySelector(".main");if(!main)return;
    const page=document.createElement("section");page.className="page";page.id="page-discursiva";
    page.innerHTML=`
      <div class="hero p4-hero"><div><h2>Discursivas / P4</h2><p>Registre treinos e simulados usando a fórmula oficial do Cebraspe. Treinos formativos ficam no histórico, mas não alteram sua projeção competitiva.</p></div><div><span class="badge p3">Meta de treino: ${TARGET}%+</span></div></div>
      <div id="p4Summary"></div>
      <div class="p4-layout">
        <div class="card p4-form-card"><h3 id="p4FormTitle">Nova correção</h3><div id="p4Form"></div></div>
        <div class="card p4-rules"><h3>Critério oficial do edital</h3><div id="p4Rules"></div></div>
      </div>
      <div class="card p4-history-card"><div class="p4-history-head"><h3>Histórico de correções</h3><span id="p4HistoryCount" class="small"></span></div><div id="p4History"></div></div>`;
    const revisar=document.getElementById("page-revisar");main.insertBefore(page,revisar||null);
  }

  function rulesHtml(){return `
    <div class="p4-rule"><b>Q1 · Complementares</b><span>Até 30 linhas · máximo 30 pontos</span><code>NQ1 = NC − 6 × NE ÷ TL</code></div>
    <div class="p4-rule"><b>Q2 · Estudo de caso</b><span>Até 60 linhas · máximo 70 pontos</span><code>NQ2 = NC − 14 × NE ÷ TL</code></div>
    <div class="p4-rule"><b>Nota P4</b><span>NFPD = NQ1 + NQ2 · máximo 100 pontos</span><code>Aprovação no edital: NFPD ≥ 50</code></div>
    <div class="p4-rule-note"><b>NC</b> = domínio do conteúdo. <b>NE</b> = erros de modalidade escrita. <b>TL</b> = linhas efetivamente escritas. O edital cita grafia, morfossintaxe e propriedade vocabular entre os erros avaliados.</div>
    <div class="p4-rule-note warning"><b>Importante:</b> o edital não publica pesos internos separados para cada aspecto do NC. Por isso a rubrica de 0–5 usada no formulário é apenas formativa e não entra na fórmula oficial.</div>`;}

  function inputVal(id){return document.getElementById(id)?.value;}
  function checked(id){return !!document.getElementById(id)?.checked;}
  function currentDraft(){
    return {
      id:editingId||`p4-${Date.now()}-${Math.random().toString(36).slice(2,7)}`,
      date:inputVal("p4-date")||today(),type:inputVal("p4-type")||"q1",theme:String(inputVal("p4-theme")||"").trim(),
      training:checked("p4-training"),lines:n(inputVal("p4-lines")),nc:n(inputVal("p4-nc")),
      spelling:n(inputVal("p4-spelling")),syntax:n(inputVal("p4-syntax")),vocab:n(inputVal("p4-vocab")),otherLang:n(inputVal("p4-other")),
      escapeTheme:checked("p4-escape"),noText:checked("p4-notext"),
      rCommand:n(inputVal("p4-r-command")),rKnowledge:n(inputVal("p4-r-knowledge")),rDevelopment:n(inputVal("p4-r-development")),rStructure:n(inputVal("p4-r-structure")),rCohesion:n(inputVal("p4-r-cohesion")),
      notes:String(inputVal("p4-notes")||"").trim()
    };
  }

  function formHtml(entry={}){
    const type=entry.type||"q1",c=cfg(type),training=entry.id?!!entry.training:true;
    return `
      <div class="p4-form-grid">
        <div class="field"><label>Data</label><input id="p4-date" type="date" value="${escapeHtml(entry.date||today())}"></div>
        <div class="field span2"><label>Tipo</label><select id="p4-type" onchange="CGU_p4TypeChanged()"><option value="q1" ${type==="q1"?"selected":""}>Q1 · Conhecimentos Complementares</option><option value="q2" ${type==="q2"?"selected":""}>Q2 · Estudo de caso / Específicos</option></select></div>
        <label class="p4-training-toggle"><input id="p4-training" type="checkbox" ${training?"checked":""} onchange="CGU_p4Live()"><span><b>Treino formativo</b><small>Não entra na média P4 nem no gap da meta.</small></span></label>
        <div class="field span3"><label>Tema / proposta</label><input id="p4-theme" value="${escapeHtml(entry.theme||"")}" placeholder="Ex.: Zero Trust em ambiente híbrido"></div>
      </div>

      <div class="p4-section-title">Campos oficiais para cálculo</div>
      <div class="p4-score-grid">
        <div class="field"><label>NC · Conteúdo</label><input id="p4-nc" type="number" min="0" max="${c.maxScore}" step="0.1" value="${entry.nc??""}" oninput="CGU_p4Live()"><small>0 a ${c.maxScore}</small></div>
        <div class="field"><label>Linhas escritas (TL)</label><input id="p4-lines" type="number" min="0" max="120" value="${entry.lines??""}" oninput="CGU_p4Live()"><small>limite: <b id="p4-max-lines">${c.maxLines}</b></small></div>
        <div class="field"><label>Grafia</label><input id="p4-spelling" type="number" min="0" value="${entry.spelling??0}" oninput="CGU_p4Live()"><small>erros</small></div>
        <div class="field"><label>Morfossintaxe</label><input id="p4-syntax" type="number" min="0" value="${entry.syntax??0}" oninput="CGU_p4Live()"><small>erros</small></div>
        <div class="field"><label>Propriedade vocabular</label><input id="p4-vocab" type="number" min="0" value="${entry.vocab??0}" oninput="CGU_p4Live()"><small>erros</small></div>
        <div class="field"><label>Outros erros de escrita</label><input id="p4-other" type="number" min="0" value="${entry.otherLang??0}" oninput="CGU_p4Live()"><small>somados ao NE</small></div>
      </div>
      <div class="p4-zero-row"><label><input id="p4-escape" type="checkbox" ${entry.escapeTheme?"checked":""} onchange="CGU_p4Live()"> Fuga ao tema</label><label><input id="p4-notext" type="checkbox" ${entry.noText?"checked":""} onchange="CGU_p4Live()"> Sem texto</label></div>
      <div id="p4LiveResult" class="p4-live"></div>

      <details class="p4-rubric" open><summary>Rubrica formativa de conteúdo · não oficial</summary>
        <div class="p4-rubric-note">Use 0 a 5 em cada aspecto para acompanhar sua evolução. Essa soma <b>não substitui o NC</b> e não altera a nota Cebraspe.</div>
        <div class="p4-rubric-grid">
          <div class="field"><label>Atendimento ao comando</label><input id="p4-r-command" type="number" min="0" max="5" step="0.5" value="${entry.rCommand??""}" oninput="CGU_p4Live()"></div>
          <div class="field"><label>Conhecimento do tema</label><input id="p4-r-knowledge" type="number" min="0" max="5" step="0.5" value="${entry.rKnowledge??""}" oninput="CGU_p4Live()"></div>
          <div class="field"><label>Desenvolvimento dos aspectos</label><input id="p4-r-development" type="number" min="0" max="5" step="0.5" value="${entry.rDevelopment??""}" oninput="CGU_p4Live()"></div>
          <div class="field"><label>Estrutura / organização</label><input id="p4-r-structure" type="number" min="0" max="5" step="0.5" value="${entry.rStructure??""}" oninput="CGU_p4Live()"></div>
          <div class="field"><label>Coerência / coesão</label><input id="p4-r-cohesion" type="number" min="0" max="5" step="0.5" value="${entry.rCohesion??""}" oninput="CGU_p4Live()"></div>
        </div>
      </details>
      <div class="field p4-notes"><label>Observações da correção</label><textarea id="p4-notes" rows="3" placeholder="Pontos fortes, lacunas de conteúdo, conectivos, termos técnicos, erros recorrentes...">${escapeHtml(entry.notes||"")}</textarea></div>
      <div class="p4-form-actions"><button type="button" class="primary" onclick="CGU_p4Save()">${entry.id?"Salvar alterações":"Salvar correção"}</button>${entry.id?'<button type="button" onclick="CGU_p4CancelEdit()">Cancelar edição</button>':""}</div>`;
  }

  function live(){
    const host=document.getElementById("p4LiveResult");if(!host)return;
    const e=currentDraft(),r=calc(e),training=e.training;
    const linePct=r.maxLines?100*Math.min(r.written,r.maxLines)/r.maxLines:0;
    const gap=r.score-r.target;
    host.className=`p4-live ${training?"training":gap>=0?"ok":"warn"}`;
    host.innerHTML=`
      <div><span>NE total</span><b>${r.ne}</b><small>${e.spelling} grafia · ${e.syntax} morfossintaxe · ${e.vocab} vocabulário · ${e.otherLang} outros</small></div>
      <div><span>Desconto linguístico</span><b>${fmt(r.penalty,2)}</b><small>${r.factor} × NE ÷ TL</small></div>
      <div><span>Nota calculada</span><b>${fmt(r.score,2)}/${r.maxScore}</b><small>${fmt(r.pct,1)}% da questão</small></div>
      <div><span>Gap meta ${TARGET}%</span><b>${gap>=0?"+":""}${fmt(gap,2)}</b><small>alvo desta questão: ${fmt(r.target,1)}/${r.maxScore}</small></div>
      <div><span>Linhas</span><b>${r.written}/${r.maxLines}</b><small>${fmt(linePct,0)}% do limite${r.overLines?" · excesso desconsiderado":""}</small></div>
      <div><span>Rubrica formativa</span><b>${fmt(r.rubric,1)}/25</b><small>${fmt(r.rubricPct,0)}% · não oficial</small></div>
      <div class="p4-live-note">${training?"🧪 Treino formativo: salvo no histórico, mas excluído da projeção P4.":"🎯 Simulado válido: esta nota entra na projeção P4."}</div>`;
  }

  function renderSummary(){
    const h=document.getElementById("p4Summary");if(!h)return;
    const s=summary(),complete=s.total!=null,gap=complete?s.total-TARGET:null;
    const status=!complete?"Projeção incompleta":s.total>=TARGET?"Meta de treino atingida":s.total>=50?"Aprovado no mínimo, abaixo da meta":"Abaixo do mínimo do edital";
    h.innerHTML=`<div class="p4-summary-grid">
      <div class="p4-summary main"><span>Projeção P4 válida</span><b>${complete?fmt(s.total,1)+"/100":"—"}</b><small>${complete?status:"É preciso ao menos 1 Q1 e 1 Q2 sem marcar Treino."}</small></div>
      <div class="p4-summary"><span>Q1 · média válida</span><b>${s.q1==null?"—":fmt(s.q1,1)+"/30"}</b><small>meta ${fmt(CONFIG.q1.target,1)}/30</small></div>
      <div class="p4-summary"><span>Q2 · média válida</span><b>${s.q2==null?"—":fmt(s.q2,1)+"/70"}</b><small>meta ${fmt(CONFIG.q2.target,1)}/70</small></div>
      <div class="p4-summary ${complete&&gap>=0?"ok":""}"><span>Gap para ${TARGET}/100</span><b>${gap==null?"—":(gap>=0?"+":"")+fmt(gap,1)}</b><small>mínimo oficial de aprovação: 50/100</small></div>
      <div class="p4-summary"><span>Simulados válidos</span><b>${s.valid.length}</b><small>entram na projeção</small></div>
      <div class="p4-summary training"><span>Treinos formativos</span><b>${s.training}</b><small>não alteram meta/projeção</small></div>
    </div>`;
  }

  function renderHistory(){
    const host=document.getElementById("p4History"),count=document.getElementById("p4HistoryCount");if(!host)return;
    const entries=[...readBucket().entries].sort((a,b)=>String(b.date||"").localeCompare(String(a.date||""))||String(b.updatedAtMs||0).localeCompare(String(a.updatedAtMs||0)));
    if(count)count.textContent=`${entries.length} registro(s)`;
    if(!entries.length){host.innerHTML='<div class="empty">Nenhuma correção registrada ainda.</div>';return;}
    host.innerHTML=entries.map(e=>{const r=calc(e);return `<article class="p4-entry ${e.training?"training":"valid"}">
      <div class="p4-entry-top"><div><span>${dateBR(e.date)}</span><b>${escapeHtml(cfg(e.type).short)}</b><small>${escapeHtml(e.theme||"Sem título")}</small></div><div class="p4-entry-score"><b>${fmt(r.score,2)}/${r.maxScore}</b><span>${fmt(r.pct,1)}%</span></div></div>
      <div class="p4-entry-badges"><span class="p4-pill ${e.training?"train":"valid"}">${e.training?"Treino formativo":"Simulado válido"}</span><span class="p4-pill">TL ${r.written}/${r.maxLines}</span><span class="p4-pill">NE ${r.ne}</span><span class="p4-pill">NC ${fmt(r.nc,1)}</span><span class="p4-pill ${r.gap>=0?"ok":"warn"}">${r.gap>=0?"Meta atingida":"Gap "+fmt(Math.abs(r.gap),1)}</span></div>
      ${e.notes?`<div class="p4-entry-notes">${escapeHtml(e.notes)}</div>`:""}
      <div class="p4-entry-actions"><button type="button" onclick="CGU_p4Edit('${e.id}')">Editar</button><button type="button" class="danger" onclick="CGU_p4Delete('${e.id}')">Excluir</button></div>
    </article>`}).join("");
  }

  function renderForm(entry){
    const h=document.getElementById("p4Form");if(!h)return;
    h.innerHTML=formHtml(entry||{});
    const t=document.getElementById("p4FormTitle");if(t)t.textContent=entry?.id?"Editar correção":"Nova correção";
    live();
  }

  function renderAllP4(){insertPage();const rules=document.getElementById("p4Rules");if(rules)rules.innerHTML=rulesHtml();renderSummary();renderForm(editingId?readBucket().entries.find(e=>e.id===editingId):null);renderHistory();patchDashboard();}

  window.CGU_p4TypeChanged=function(){
    const type=inputVal("p4-type")||"q1",c=cfg(type);
    const max=document.getElementById("p4-max-lines");if(max)max.textContent=c.maxLines;
    const nc=document.getElementById("p4-nc");if(nc)nc.max=c.maxScore;
    live();
  };
  window.CGU_p4Live=live;
  window.CGU_p4Save=function(){
    const e=currentDraft(),r=calc(e);
    if(!e.theme){alert("Informe o tema ou a proposta da redação/estudo de caso.");return;}
    if(e.lines<=0&&!e.noText){alert("Informe quantas linhas foram efetivamente escritas.");return;}
    if(e.nc>r.maxScore){alert(`O NC máximo para este tipo é ${r.maxScore} pontos.`);return;}
    const b=readBucket();
    const old=b.entries.find(x=>x.id===e.id);
    const saved={...old,...e,updatedAtMs:Date.now(),createdAtMs:old?.createdAtMs||Date.now()};
    b.entries=old?b.entries.map(x=>x.id===e.id?saved:x):[...b.entries,saved];
    saveBucket(b);editingId=null;renderAllP4();if(typeof renderDashboard==="function")renderDashboard();if(typeof toast==="function")toast(e.training?"Treino formativo salvo.":"Simulado válido salvo na projeção P4.");
  };
  window.CGU_p4Edit=function(id){editingId=id;renderForm(readBucket().entries.find(e=>e.id===id));document.getElementById("page-discursiva")?.scrollIntoView({behavior:"smooth",block:"start"});};
  window.CGU_p4CancelEdit=function(){editingId=null;renderForm();};
  window.CGU_p4Delete=function(id){if(!confirm("Excluir esta correção do histórico?"))return;const b=readBucket();b.entries=b.entries.filter(e=>e.id!==id);saveBucket(b);if(editingId===id)editingId=null;renderAllP4();if(typeof renderDashboard==="function")renderDashboard();};

  function patchDashboard(){
    const panel=document.getElementById("performanceVsTarget");if(!panel)return;
    const box=panel.querySelector(".perf-discursive");if(!box)return;
    const s=summary();
    if(s.total==null)box.innerHTML=`<b>P4/Discursiva:</b> projeção válida ainda <b>incompleta</b>. Registre ao menos uma Q1 e uma Q2 sem marcar “Treino formativo”. Meta de treino: <b>${TARGET}/100</b>; mínimo do edital: <b>50/100</b>.`;
    else box.innerHTML=`<b>P4/Discursiva:</b> projeção pelas médias válidas: <b>${fmt(s.total,1)}/100</b> (${fmt(s.total,1)}%). Gap para ${TARGET}: <b>${s.total>=TARGET?"+":""}${fmt(s.total-TARGET,1)}</b>. Treinos formativos excluídos: ${s.training}.`;
  }

  function style(){
    if(document.getElementById("p4TrackerStyle"))return;
    const s=document.createElement("style");s.id="p4TrackerStyle";s.textContent=`
      .p4-summary-grid{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:9px;margin-bottom:12px}.p4-summary{background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:12px;min-width:0}.p4-summary span,.p4-summary b,.p4-summary small{display:block}.p4-summary span{font-size:8px;text-transform:uppercase;font-weight:900;color:#64748b}.p4-summary b{font-size:19px;color:#17365D;margin:4px 0}.p4-summary small{font-size:8px;color:#64748b;line-height:1.35}.p4-summary.main{border-color:#c4b5fd;background:#faf5ff}.p4-summary.main b{color:#5b21b6}.p4-summary.ok{border-color:#86efac;background:#f0fdf4}.p4-summary.training{background:#f8fafc}
      .p4-layout{display:grid;grid-template-columns:minmax(0,1.35fr) minmax(300px,.65fr);gap:12px;margin-bottom:12px}.p4-form-card,.p4-rules,.p4-history-card{padding:14px}.p4-form-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px}.p4-form-grid .span2{grid-column:span 2}.p4-form-grid .span3{grid-column:1/-1}.p4-form-card input,.p4-form-card select,.p4-form-card textarea{width:100%;border:1px solid #dbe4f0;border-radius:8px;padding:8px;background:#fff}.p4-training-toggle{grid-column:1/-1;display:flex;gap:8px;align-items:flex-start;border:1px solid #fde68a;background:#fffbeb;border-radius:9px;padding:9px;cursor:pointer}.p4-training-toggle input{width:16px;height:16px}.p4-training-toggle b,.p4-training-toggle small{display:block}.p4-training-toggle small{font-size:8px;color:#92400e;margin-top:2px}.p4-section-title{margin:12px 0 7px;font-size:9px;font-weight:900;text-transform:uppercase;color:#64748b}.p4-score-grid{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:7px}.p4-score-grid small{display:block;font-size:8px;color:#64748b;margin-top:3px}.p4-zero-row{display:flex;gap:14px;margin:9px 0;font-size:10px;font-weight:800;color:#475569}.p4-zero-row label{display:flex;gap:5px;align-items:center}.p4-zero-row input{width:15px;height:15px}.p4-live{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:7px;padding:9px;border:1px solid #e2e8f0;border-radius:10px;background:#f8fafc;margin:8px 0}.p4-live>div:not(.p4-live-note){background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:7px}.p4-live span,.p4-live b,.p4-live small{display:block}.p4-live span{font-size:7px;text-transform:uppercase;color:#64748b;font-weight:900}.p4-live b{font-size:14px;color:#17365D;margin:3px 0}.p4-live small{font-size:7px;color:#64748b;line-height:1.3}.p4-live.training{border-color:#fde68a;background:#fffbeb}.p4-live.ok{border-color:#86efac;background:#f0fdf4}.p4-live.warn{border-color:#fecaca;background:#fff7f7}.p4-live-note{grid-column:1/-1;font-size:9px;font-weight:800;color:#475569}.p4-rubric{border:1px dashed #cbd5e1;border-radius:9px;padding:9px;margin-top:10px}.p4-rubric summary{cursor:pointer;font-size:10px;font-weight:900;color:#17365D}.p4-rubric-note{font-size:8px;color:#64748b;margin:7px 0}.p4-rubric-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:7px}.p4-notes{margin-top:10px}.p4-form-actions{display:flex;gap:7px;margin-top:9px}.p4-form-actions button,.p4-entry-actions button{border:1px solid #cbd5e1;background:#fff;border-radius:8px;padding:7px 10px;font-size:9px;font-weight:900;cursor:pointer}.p4-form-actions .primary{background:#17365D;color:#fff;border-color:#17365D}
      .p4-rule{border:1px solid #e2e8f0;border-radius:9px;padding:10px;margin-bottom:8px}.p4-rule b,.p4-rule span,.p4-rule code{display:block}.p4-rule b{font-size:11px;color:#17365D}.p4-rule span{font-size:9px;color:#64748b;margin:3px 0}.p4-rule code{font-size:11px;font-weight:900;color:#5b21b6;background:#faf5ff;border-radius:6px;padding:6px}.p4-rule-note{font-size:9px;color:#64748b;line-height:1.45;padding:8px}.p4-rule-note.warning{background:#fffbeb;border:1px solid #fde68a;border-radius:8px;color:#92400e}.p4-history-head{display:flex;justify-content:space-between;gap:10px;align-items:center}.p4-entry{border:1px solid #e5e7eb;border-radius:10px;padding:10px;margin-top:8px}.p4-entry.training{background:#fcfcfd}.p4-entry.valid{border-left:4px solid #2f75b5}.p4-entry-top{display:flex;justify-content:space-between;gap:10px}.p4-entry-top span,.p4-entry-top b,.p4-entry-top small{display:block}.p4-entry-top span{font-size:8px;color:#64748b}.p4-entry-top b{font-size:11px;color:#17365D;margin-top:2px}.p4-entry-top small{font-size:9px;color:#64748b;margin-top:2px}.p4-entry-score{text-align:right}.p4-entry-score b{font-size:16px!important;color:#17365D}.p4-entry-score span{font-size:9px;color:#64748b}.p4-entry-badges{display:flex;gap:5px;flex-wrap:wrap;margin-top:8px}.p4-pill{font-size:8px;font-weight:800;border-radius:999px;background:#f1f5f9;color:#475569;padding:4px 7px}.p4-pill.train{background:#fffbeb;color:#92400e}.p4-pill.valid,.p4-pill.ok{background:#f0fdf4;color:#166534}.p4-pill.warn{background:#fff7ed;color:#c2410c}.p4-entry-notes{font-size:9px;color:#475569;line-height:1.45;margin-top:8px;padding-top:7px;border-top:1px solid #eef2f7}.p4-entry-actions{display:flex;gap:6px;margin-top:8px}.p4-entry-actions .danger{color:#b91c1c;border-color:#fecaca}
      @media(max-width:1050px){.p4-summary-grid{grid-template-columns:repeat(3,1fr)}.p4-layout{grid-template-columns:1fr}.p4-score-grid{grid-template-columns:repeat(3,1fr)}.p4-rubric-grid{grid-template-columns:repeat(3,1fr)}}@media(max-width:650px){.p4-summary-grid{grid-template-columns:repeat(2,1fr)}.p4-form-grid,.p4-score-grid,.p4-rubric-grid,.p4-live{grid-template-columns:1fr 1fr}.p4-form-grid .span2,.p4-form-grid .span3{grid-column:1/-1}}
    `;document.head.appendChild(s);
  }

  insertPage();style();
  const baseSwitch=switchPage;
  switchPage=function(name,btn){const r=baseSwitch(name,btn);if(name==="discursiva"){document.getElementById("topTitle").textContent="Discursivas / P4";renderAllP4();}return r;};
  const baseDashboard=renderDashboard;
  renderDashboard=function(){const r=baseDashboard.apply(this,arguments);patchDashboard();return r;};
  window.addEventListener("cgu-cloud-ready",()=>{try{renderAllP4();}catch(e){}});
  window.CGU_renderDiscursiveTracker=renderAllP4;
  try{renderAllP4();}catch(e){console.warn("Discursivas/P4:",e)}
})();