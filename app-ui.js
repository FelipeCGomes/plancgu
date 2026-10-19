function renderEdital(){
  const q=(document.getElementById("search").value||"").toLowerCase();
  const ex=document.getElementById("filterExam").value, pr=document.getElementById("filterPriority").value, st=document.getElementById("filterStatus").value;
  const subjects=[...EDITAL].sort((a,b)=>PRIORITY_RANK[a.prioridade]-PRIORITY_RANK[b.prioridade] || (a.prova==="P3"?-1:a.prova==="P2"?0:1));
  let html="";
  subjects.forEach(d=>{
    if(ex && d.prova!==ex)return;
    const all=[];
    d.grupos.forEach((g,gi)=>g.topicos.forEach((t,i)=>{
      const id=tid(d,g,i),x={d,g,t,id,exam:d.prova,priority:getPriority(d,g,id),m:metrics(id,d.prova)};
      const hay=(d.nome+" "+g.nome+" "+t).toLowerCase();
      const statusFilter=st==="Concluído"?x.m.s.done:(st?x.m.status===st:true);
      if((!q||hay.includes(q))&&(!pr||x.priority===pr)&&statusFilter)all.push(x);
    }));
    if(!all.length)return;
    all.sort((a,b)=>PRIORITY_RANK[a.priority]-PRIORITY_RANK[b.priority] || a.g.nome.localeCompare(b.g.nome));
    const s=subjectStats(d);
    html+=`<div class="subject-card" id="sub-${d.id}">
      <div class="subject-head" onclick="this.parentElement.classList.toggle('open')">
        <div class="subject-info"><div class="subject-name">${escapeHtml(d.nome)}</div>
          <div class="subject-meta"><span class="badge ${priClass(d.prioridade)}">${d.prioridade}</span><span class="badge ${examClass(d.prova)}">${d.prova}</span><span class="badge">${d.p4}</span><span class="small">${escapeHtml(d.motivo)}</span></div>
        </div>
        <div class="subject-stats"><span><b>${s.done}/${s.total}</b>concluídos</span><span><b>${s.q}</b>questões</span><span><b>${fmtPct(s.liquido)}</b>líquido</span></div>
      </div>
      <div class="subject-body">${all.map(x=>topicHtml(x)).join("")}</div>
    </div>`;
  });
  document.getElementById("editalList").innerHTML=html||'<div class="empty">Nenhum conteúdo com esses filtros.</div>';
}

function renderReview(){
  const rows=topicsFlat().filter(x=>x.m.status==="Revisar")
    .sort((a,b)=>PRIORITY_RANK[a.priority]-PRIORITY_RANK[b.priority] || (a.m.liquido??-999)-(b.m.liquido??-999));
  document.getElementById("reviewList").innerHTML=rows.length?rows.map(x=>`<div class="review-card">
    <div class="topic-top"><div class="topic-title">${escapeHtml(x.g.nome)}</div><span class="badge ${priClass(x.priority)}">${x.priority}</span><span class="badge ${examClass(x.exam)}">${x.exam}</span></div>
    <div class="small">${escapeHtml(x.d.nome)}</div>
    <div class="review-grid">
      <div class="field"><label>Total questões</label><input type="number" min="0" value="${x.m.q}" onchange="setQuestion('${x.id}','questoes',this.value)"></div>
      <div class="field"><label>Acertos</label><input type="number" min="0" value="${x.m.a}" onchange="setQuestion('${x.id}','acertos',this.value)"></div>
      <div class="field"><label>Erros</label><div class="metric">${x.m.e}</div></div>
      <div class="field"><label>% líquido</label><div class="metric status-review">${fmtPct(x.m.liquido)}</div></div>
      <div class="field"><label>Meta</label><div class="metric">${x.m.meta}%</div></div>
    </div>
    ${x.m.s.obs?`<div class="small" style="margin-top:8px"><b>Observação:</b> ${escapeHtml(x.m.s.obs)}</div>`:""}
  </div>`).join(""):'<div class="empty">Nenhum tópico abaixo da meta. Quando um desempenho ficar abaixo da meta, aparecerá aqui automaticamente.</div>';
}

function secLabel(sec){
  const m=Math.round(sec/60), h=Math.floor(m/60), r=m%60;
  return h?`${h}h${String(r).padStart(2,"0")}`:`${m} min`;
}
function lessonDone(id){return !!lessonState[id]}
function toggleLesson(id,v){lessonState[id]=!!v;save();renderToday();toast(v?"Aula marcada como assistida":"Aula reaberta")}
function studyDateObj(){
  const el=document.getElementById("studyDate");
  const v=el&&el.value?el.value:"2026-10-19";
  return new Date(v+"T12:00:00");
}
function dateYMD(d){return d.toISOString().slice(0,10)}
function daysFromStart(d){
  const s=new Date("2026-10-19T12:00:00");
  return Math.max(0,Math.floor((d-s)/86400000));
}
function availableKnownLessons(d){
  return LESSONS.filter(l=>!lessonDone(l.id))
    .sort((a,b)=>PRIORITY_RANK[a.priority]-PRIORITY_RANK[b.priority] || (a.exam==="P2"?-1:a.exam==="P1"?0:1));
}
function selectKnownForBudget(list,budgetSec){
  const chosen=[]; let used=0;
  for(const l of list){
    if(used+l.sec<=budgetSec || chosen.length===0){chosen.push(l);used+=l.sec}
    if(used>=budgetSec-900)break;
  }
  return {chosen,used};
}
function renderToday(){
  const host=document.getElementById("todayLessons"); if(!host)return;
  const dateEl=document.getElementById("studyDate");
  if(dateEl && !dateEl.dataset.init){
    const n=new Date();
    const localYmd=`${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,"0")}-${String(n.getDate()).padStart(2,"0")}`;
    dateEl.value=localYmd;
    dateEl.dataset.init="1";
  }
  const d=studyDateObj(), ymd=dateYMD(d);
  const afterRelease=ymd>="2026-10-22";
  const budgetSec=120*60;
  const known=availableKnownLessons(d);

  let lessonHtml="", used=0, sourceLabel="";
  if(afterRelease){
    const idx=daysFromStart(d)%FUTURE_P3.length;
    const p=FUTURE_P3[idx];
    sourceLabel=`Prioridade P3 do dia`;
    lessonHtml+=`<div class="future-box"><b>Primeiro bloco: P3 recém-liberado</b><div class="lesson-meta">${escapeHtml(p.course)} · ${escapeHtml(p.topic)}</div><div class="small" style="margin-top:6px">Use até <b>2h</b> para as aulas que estiverem liberadas nesse bloco. A grade enviada ainda não informava os títulos/durações dessas aulas; por isso o sistema não inventa tempos.</div></div>`;
    const fallback=selectKnownForBudget(known,60*60).chosen.slice(0,1);
    if(fallback.length){
      lessonHtml+=`<div class="small" style="margin:10px 0 5px"><b>Se o P3 ainda não aparecer no Gran:</b> use esta aula de apoio.</div>`;
      lessonHtml+=fallback.map(l=>lessonCardHtml(l)).join("");
    }
    used=budgetSec;
  }else{
    const exactIds=PRE_RELEASE_DAILY[ymd]||[];
    let exact=exactIds.map(id=>LESSONS.find(l=>l.id===id)).filter(Boolean).filter(l=>!lessonDone(l.id));
    if(!exact.length){
      exact=selectKnownForBudget(known,budgetSec).chosen;
    }
    used=exact.reduce((s,l)=>s+l.sec,0);
    sourceLabel=PRE_RELEASE_DAILY[ymd]?"Aulas definidas para este dia":"Próximas aulas prioritárias disponíveis";
    lessonHtml=exact.length?exact.map(l=>lessonCardHtml(l)).join(""):'<div class="empty">Todas as aulas prioritárias deste dia já foram marcadas como assistidas.</div>';
  }
  document.getElementById("todayTitle").textContent=`${sourceLabel} · ${d.toLocaleDateString("pt-BR",{weekday:"long",day:"2-digit",month:"2-digit"})}`;
  host.innerHTML=lessonHtml;

  const videoMin=afterRelease?120:Math.min(120,Math.round(used/60));
  const qMin=45, revMin=15;
  document.getElementById("todayRoutine").innerHTML=`
    <div class="plan-line"><div class="plan-time">0–${videoMin}m</div><div><b>Aulas Gran</b><div class="plan-kind">${afterRelease?"P3 prioritário; se não liberado, usar aula de apoio":"aulas listadas ao lado"}</div></div><b>${videoMin} min</b></div>
    <div class="plan-line"><div class="plan-time">${videoMin}–${videoMin+qMin}m</div><div><b>Questões Cebraspe</b><div class="plan-kind">10–20 itens do mesmo assunto das aulas</div></div><b>45 min</b></div>
    <div class="plan-line"><div class="plan-time">${videoMin+qMin}–${videoMin+qMin+revMin}m</div><div><b>Revisão ativa</b><div class="plan-kind">erros, conceitos-chave e 3–5 linhas de resumo</div></div><b>15 min</b></div>
    ${videoMin<120?`<div class="plan-line"><div class="plan-time">restante</div><div><b>Questões extras / revisão</b><div class="plan-kind">complete as 3h sem forçar vídeo desnecessário</div></div><b>${120-videoMin} min</b></div>`:""}
  `;
  const doneCount=LESSONS.filter(l=>lessonDone(l.id)).length;
  document.getElementById("todayRelease").innerHTML=`
    <div style="margin-top:16px"><div class="small"><b>Aulas conhecidas concluídas:</b> ${doneCount}/${LESSONS.length}</div>
    <div class="progress-ring"><span style="width:${LESSONS.length?100*doneCount/LESSONS.length:0}%"></span></div></div>
    ${afterRelease?'<div class="small" style="margin-top:12px">Após 21/10, os quatro blocos P3 têm prioridade. Quando o Gran publicar títulos e durações, você pode registrar a aula/material no tópico correspondente do Edital; o conteúdo e desempenho continuam centralizados na mesma base.</div>':''}
  `;
}
function lessonCardHtml(l){
  return `<div class="lesson-card ${lessonDone(l.id)?"done":""}">
    <div class="lesson-top"><div class="lesson-title">${escapeHtml(l.title)}</div><span class="badge ${priClass(l.priority)}">${l.priority}</span><span class="badge ${examClass(l.exam)}">${l.exam}</span></div>
    <div class="lesson-meta">${escapeHtml(l.course)} · ${secLabel(l.sec)}</div>
    <div class="lesson-actions"><button class="primary" onclick="toggleLesson('${l.id}',${!lessonDone(l.id)})">${lessonDone(l.id)?"Reabrir aula":"✓ Marcar assistida"}</button></div>
  </div>`;
}

function renderAll(){renderSidebar();renderDashboard();renderToday();renderEdital();renderReview()}

function exportBackup(){
  const blob=new Blob([JSON.stringify({version:3,state,settings,lessonState,exportedAt:new Date().toISOString()},null,2)],{type:"application/json"});
  const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="cgu3-backup.json";a.click();URL.revokeObjectURL(a.href)
}
function importBackup(inp){
  const f=inp.files&&inp.files[0];if(!f)return;
  const r=new FileReader();r.onload=e=>{try{const o=JSON.parse(e.target.result);state=o.state||{};settings={...DEFAULT_META,...(o.settings||{})};lessonState=o.lessonState||{};save();renderAll();toast("Backup restaurado")}catch(err){alert("Backup inválido")}};r.readAsText(f);inp.value="";
}

load();renderAll();
