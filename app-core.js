const PRIORITY_RANK={"Crítica":0,"Alta":1,"Média":2,"Baixa":3};
const DEFAULT_META={P1:60,P2:65,P3:70};
let state={};
let settings={...DEFAULT_META};

function slug(s){return s.toLowerCase().replace(/[^a-z0-9]/g,'-').replace(/-+/g,'-');}
function tid(d,g,i=0){return d.id+"_"+slug(g.nome)+"_"+i}
function getTS(id){return state[id]||{}}
function setTS(id,patch){state[id]={...getTS(id),...patch}}
function examMeta(exam){return Number(settings[exam]??DEFAULT_META[exam])}
function priClass(p){return p==="Crítica"?"critical":p==="Alta"?"high":p==="Média"?"medium":"low"}
function examClass(e){return e.toLowerCase()}
function normalizeTopic(id){
  const s=getTS(id);
  const a=Math.max(0,Number(s.acertos)||0);
  let q=Math.max(0,Number(s.questoes)||0);
  const oldE=Math.max(0,Number(s.erros)||0);
  if(!q && (a||oldE)) q=a+oldE;
  if(q<a) q=a;
  return {...s,acertos:a,questoes:q,erros:Math.max(q-a,0)};
}
function metrics(id,exam){
  const s=normalizeTopic(id), q=s.questoes, a=s.acertos, e=s.erros;
  const bruto=q?100*a/q:null;
  const liquido=q?100*(a-e)/q:null;
  const meta=examMeta(exam);
  const status=!q?"Pendente":liquido>=meta?"Atendeu":"Revisar";
  return {s,q,a,e,bruto,liquido,meta,status};
}
function fmtPct(v){return v===null||!isFinite(v)?"—":v.toFixed(1).replace(".",",")+"%"}
function escapeHtml(s){return String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}
function toast(msg){const t=document.getElementById("toast");t.textContent=msg;t.classList.add("show");setTimeout(()=>t.classList.remove("show"),1400)}

function load(){
  try{
    const raw=localStorage.getItem(KEY);
    if(raw){
      const old=JSON.parse(raw);
      state=old.state||{};
      settings={...DEFAULT_META,...(old.settings||{})};
      lessonState=old.lessonState||{};
      Object.keys(state).forEach(id=>{ const n=normalizeTopic(id); state[id]={...state[id],questoes:n.questoes,acertos:n.acertos,erros:n.erros}; });
    }
  }catch(e){console.warn(e)}
}
function save(silent=true){
  try{localStorage.setItem(KEY,JSON.stringify({version:3,state,settings,lessonState})); if(!silent)toast("Progresso salvo")}catch(e){}
}
function updateSetting(exam,val){settings[exam]=Math.max(0,Math.min(100,Number(val)||0));save();renderAll()}
function patchTopic(id,patch){setTS(id,patch);save();renderAll()}
function setQuestion(id,field,val){
  const cur=normalizeTopic(id);
  let q=cur.questoes,a=cur.acertos;
  if(field==="questoes")q=Math.max(0,Number(val)||0);
  if(field==="acertos")a=Math.max(0,Number(val)||0);
  if(a>q)q=a;
  setTS(id,{questoes:q,acertos:a,erros:Math.max(q-a,0)});
  save();renderAll();
}
function setPriority(id,val){patchTopic(id,{prioridade:val})}
function getPriority(d,g,id){return getTS(id).prioridade||g.prioridade||d.prioridade}
function markDone(id,v){patchTopic(id,{done:!!v})}
function setText(id,k,v){setTS(id,{[k]:v});save();renderDashboard();renderReview()}

function topicsFlat(){
  const out=[];
  EDITAL.forEach((d,di)=>d.grupos.forEach((g,gi)=>g.topicos.forEach((t,i)=>{
    const id=tid(d,g,i); out.push({d,g,t,id,di,gi,i,exam:d.prova,priority:getPriority(d,g,id),m:metrics(id,d.prova)})
  })));
  return out;
}
function subjectStats(d){
  const rows=topicsFlat().filter(x=>x.d.id===d.id);
  const q=rows.reduce((s,x)=>s+x.m.q,0), a=rows.reduce((s,x)=>s+x.m.a,0), e=rows.reduce((s,x)=>s+x.m.e,0);
  const done=rows.filter(x=>x.m.s.done).length;
  const bruto=q?100*a/q:null, liquido=q?100*(a-e)/q:null;
  return {q,a,e,done,total:rows.length,bruto,liquido};
}
function blockStats(exam){
  const rows=topicsFlat().filter(x=>x.exam===exam);
  const q=rows.reduce((s,x)=>s+x.m.q,0),a=rows.reduce((s,x)=>s+x.m.a,0),e=rows.reduce((s,x)=>s+x.m.e,0);
  const done=rows.filter(x=>x.m.s.done).length;
  return {q,a,e,done,total:rows.length,bruto:q?100*a/q:null,liquido:q?100*(a-e)/q:null,meta:examMeta(exam)};
}

function switchPage(name,btn){
  document.querySelectorAll(".page").forEach(p=>p.classList.remove("active"));
  document.getElementById("page-"+name).classList.add("active");
  document.querySelectorAll(".nav button").forEach(b=>b.classList.remove("active"));
  if(btn)btn.classList.add("active");
  document.getElementById("topTitle").textContent=name==="dashboard"?"Visão geral":name==="hoje"?"Aulas do dia · 3h":name==="edital"?"Edital por prioridade":"Revisar";
  if(name==="hoje")renderToday();
  if(name==="edital")renderEdital();
  if(name==="revisar")renderReview();
}
function goSubject(id){
  const btn=[...document.querySelectorAll(".nav button")].find(b=>b.dataset.page==="edital");
  switchPage("edital",btn);
  setTimeout(()=>{const el=document.getElementById("sub-"+id);if(el){el.classList.add("open");el.scrollIntoView({behavior:"smooth",block:"start"})}},50)
}

function renderSidebar(){
  const colors={"Crítica":"#ef4444","Alta":"#f59e0b","Média":"#3b82f6","Baixa":"#94a3b8"};
  const arr=[...EDITAL].sort((a,b)=>PRIORITY_RANK[a.prioridade]-PRIORITY_RANK[b.prioridade]||a.prova.localeCompare(b.prova));
  document.getElementById("subjectLinks").innerHTML=arr.map(d=>`<div class="subject-link" onclick="goSubject('${d.id}')"><span class="dot" style="background:${colors[d.prioridade]}"></span><span>${escapeHtml(d.nome)}</span></div>`).join("");
  const exam=new Date("2026-12-13T00:00:00"), now=new Date(); now.setHours(0,0,0,0);
  const days=Math.max(0,Math.ceil((exam-now)/86400000));
  document.getElementById("countdown").textContent=days+" dias até a prova";
}

function renderDashboard(){
  ["P1","P2","P3"].forEach(e=>document.getElementById("meta"+e).value=examMeta(e));
  const rows=topicsFlat();
  const q=rows.reduce((s,x)=>s+x.m.q,0),a=rows.reduce((s,x)=>s+x.m.a,0),e=rows.reduce((s,x)=>s+x.m.e,0);
  const done=rows.filter(x=>x.m.s.done).length, rev=rows.filter(x=>x.m.status==="Revisar").length;
  const weightedMax=rows.reduce((s,x)=>s+x.m.q*(x.exam==="P3"?2:1),0);
  const weightedNet=rows.reduce((s,x)=>s+(x.m.a-x.m.e)*(x.exam==="P3"?2:1),0);
  const weighted=weightedMax?100*weightedNet/weightedMax:null;
  document.getElementById("kpis").innerHTML=[
    ["Tópicos concluídos",done+"/"+rows.length],
    ["Questões",q],["Acertos",a],["% bruto",fmtPct(q?100*a/q:null)],
    ["% líquido ponderado",fmtPct(weighted)],["Para revisar",rev]
  ].map(([l,v])=>`<div class="kpi"><div class="v">${v}</div><div class="l">${l}</div></div>`).join("");

  const weights={P1:"7,7% final",P2:"22,7% estratégico",P3:"69,6% estratégico"};
  document.getElementById("blockStats").innerHTML=["P3","P2","P1"].map(ex=>{
    const s=blockStats(ex), bar=s.liquido===null?0:Math.max(0,Math.min(100,s.liquido));
    return `<div class="block-row"><span class="badge ${examClass(ex)}">${ex}</span><div><b>${weights[ex]}</b><div class="bar"><span style="width:${bar}%"></span></div></div><div><b>${s.q}</b><br><span class="small">questões</span></div><div><b>${fmtPct(s.liquido)}</b><br><span class="small">líquido</span></div><div><b>${s.meta}%</b><br><span class="small">meta</span></div></div>`
  }).join("");

  const focus=rows.filter(x=>!x.m.s.done || x.m.status==="Revisar")
    .sort((a,b)=>PRIORITY_RANK[a.priority]-PRIORITY_RANK[b.priority] || (a.m.status==="Revisar"?-1:1) || (a.exam==="P3"?-1:1)).slice(0,8);
  document.getElementById("focusQueue").innerHTML=focus.length?focus.map(x=>`<div class="queue-item" onclick="goSubject('${x.d.id}')"><div class="queue-title">${escapeHtml(x.g.nome)}</div><div class="queue-sub"><span class="badge ${priClass(x.priority)}">${x.priority}</span> <span class="badge ${examClass(x.exam)}">${x.exam}</span> · ${escapeHtml(x.d.nome)}</div></div>`).join(""):'<div class="empty">Nenhum tópico pendente.</div>';

  const sum=[...EDITAL].sort((a,b)=>PRIORITY_RANK[a.prioridade]-PRIORITY_RANK[b.prioridade]).map(d=>{
    const s=subjectStats(d);
    return `<div class="block-row" style="grid-template-columns:80px 1fr 70px 80px 85px"><span class="badge ${priClass(d.prioridade)}">${d.prioridade}</span><div><b>${escapeHtml(d.nome)}</b><div class="small">${d.prova} · ${d.p4}</div></div><div><b>${s.done}/${s.total}</b></div><div><b>${s.q}</b><br><span class="small">questões</span></div><div><b>${fmtPct(s.liquido)}</b><br><span class="small">líquido</span></div></div>`
  }).join("");
  document.getElementById("subjectSummary").innerHTML=sum;
}

function statusClass(s){return s==="Atendeu"?"status-ok":s==="Revisar"?"status-review":"status-pending"}
function topicHtml(x,compact=false){
  const m=x.m,s=m.s,p=x.priority;
  return `<div class="topic">
    <div class="topic-top">
      <label class="done-wrap"><input type="checkbox" ${s.done?"checked":""} onchange="markDone('${x.id}',this.checked)"> Concluído</label>
      <div class="topic-title">${escapeHtml(x.g.nome)}</div>
      <span class="badge ${priClass(p)}">${p}</span><span class="badge ${examClass(x.exam)}">${x.exam}</span>
    </div>
    <div class="topic-text">${escapeHtml(x.t)}</div>
    <div class="topic-grid">
      <div class="field"><label>Prioridade</label><select onchange="setPriority('${x.id}',this.value)">${["Crítica","Alta","Média","Baixa"].map(v=>`<option ${v===p?"selected":""}>${v}</option>`).join("")}</select></div>
      <div class="field"><label>Total questões</label><input type="number" min="0" value="${m.q||""}" placeholder="0" onchange="setQuestion('${x.id}','questoes',this.value)"></div>
      <div class="field"><label>Acertos</label><input type="number" min="0" value="${m.a||""}" placeholder="0" onchange="setQuestion('${x.id}','acertos',this.value)"></div>
      <div class="field"><label>Erros</label><div class="metric">${m.e}</div></div>
      <div class="field"><label>% bruto</label><div class="metric">${fmtPct(m.bruto)}</div></div>
      <div class="field"><label>% líquido</label><div class="metric">${fmtPct(m.liquido)}</div></div>
      <div class="field"><label>Meta / status</label><div class="metric ${statusClass(m.status)}">${m.meta}% · ${m.status}</div></div>
    </div>
    <div class="note-row">
      <input value="${escapeHtml(s.aula||"")}" placeholder="Aula / material (opcional)" onchange="setText('${x.id}','aula',this.value)">
      <input value="${escapeHtml(s.obs||"")}" placeholder="Observação / ponto fraco (opcional)" onchange="setText('${x.id}','obs',this.value)">
    </div>
  </div>`
}

