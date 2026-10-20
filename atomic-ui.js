/* UI do modelo atômico: cada subitem do edital é um tema independente em todas as telas. */
(() => {
  const baseGetPriority=getPriority;
  getPriority=function(d,g,id){
    return getTS(id).prioridade || window.ATOMIC_META?.[id]?.priority || g.prioridade || d.prioridade || baseGetPriority(d,g,id);
  };

  function metaOf(x){return window.ATOMIC_META?.[x.id]||{};}
  function themeTitle(x){
    const m=metaOf(x);
    return m.code?`${m.code} · ${m.title}`:(m.title||x.g.nome);
  }
  function parentLine(x){return `${x.d.nome} → ${x.g.nome}`;}
  function lastText(s){
    const ms=Number(s?.updatedAtMs)||0;
    if(!ms)return "";
    try{return new Date(ms).toLocaleString("pt-BR",{day:"2-digit",month:"2-digit",hour:"2-digit",minute:"2-digit"});}catch(e){return "";}
  }

  const style=document.createElement("style");
  style.id="atomicUiStyle";
  style.textContent=`
    .atomic-parent{font-size:9px;color:#64748b;margin:2px 0 5px}.atomic-reason{margin:7px 0;padding:7px 9px;border:1px solid #e2e8f0;background:#f8fafc;border-radius:8px;font-size:9px;color:#475569;line-height:1.4}.atomic-reason b{color:#17365D}.atomic-code{font-weight:900;color:#17365D}.atomic-topic-title{font-weight:900;color:#0f2748;line-height:1.25}.legacy-note{margin-top:7px;padding:6px 8px;background:#fff7ed;border:1px solid #fed7aa;border-radius:8px;color:#9a3412;font-size:9px}
  `;
  document.head.appendChild(style);

  topicHtml=function(x){
    const m=x.m,s=m.s,p=x.priority,am=metaOf(x),last=lastText(s);
    const legacy=am.legacyMulti && m.q>0 && !s.atomicConfirmed;
    return `<div class="topic" data-topic-id="${escapeHtml(x.id)}">
      <div class="topic-top">
        <label class="done-wrap"><input type="checkbox" ${s.done?"checked":""} onchange="markDone('${x.id}',this.checked)"> Concluído</label>
        <div class="atomic-topic-title">${escapeHtml(themeTitle(x))}</div>
        <span class="badge ${priClass(p)}">${p}</span><span class="badge ${examClass(x.exam)}">${x.exam}</span>
      </div>
      <div class="atomic-parent">${escapeHtml(parentLine(x))}</div>
      <div class="topic-text">${escapeHtml(x.t)}</div>
      <div class="atomic-reason"><b>Prioridade Cebraspe/CGU:</b> ${escapeHtml(am.reason||"")}</div>
      <div class="topic-grid consistent">
        <div class="field"><label>Prioridade</label><select onchange="setPriority('${x.id}',this.value)">${["Crítica","Alta","Média","Baixa"].map(v=>`<option ${v===p?"selected":""}>${v}</option>`).join("")}</select></div>
        <div class="field"><label>Total questões</label><input type="number" min="0" value="${m.q||""}" placeholder="0" onchange="setQuestion('${x.id}','questoes',this.value)"></div>
        <div class="field"><label>Acertos</label><input type="number" min="0" value="${m.a||""}" placeholder="0" onchange="setQuestion('${x.id}','acertos',this.value)"></div>
        <div class="field"><label>Em branco</label><input type="number" min="0" value="${Number(s.brancos)||0}" onchange="setQuestion('${x.id}','brancos',this.value)"></div>
        <div class="field"><label>Erros</label><div class="metric">${m.e}</div></div>
        <div class="field"><label>% bruto</label><div class="metric">${fmtPct(m.bruto)}</div></div>
        <div class="field"><label>% líquido</label><div class="metric">${fmtPct(m.liquido)}</div></div>
        <div class="field"><label>Meta / status</label><div class="metric ${statusClass(m.status)}">${m.meta}% · ${m.status}</div></div>
      </div>
      ${last?`<div class="topic-last">Última atualização: ${last}</div>`:""}
      ${legacy?`<div class="legacy-note">Registro preservado da versão anterior, quando este grupo ainda não estava separado em subitens. Revise se estas questões pertencem realmente a ${escapeHtml(am.code||"este tema")}.</div>`:""}
      <div class="note-row">
        <input value="${escapeHtml(s.aula||"")}" placeholder="Aula / material (opcional)" onchange="setText('${x.id}','aula',this.value)">
        <input value="${escapeHtml(s.obs||"")}" placeholder="Observação / ponto fraco (opcional)" onchange="setText('${x.id}','obs',this.value)">
      </div>
    </div>`;
  };

  renderEdital=function(){
    const q=(document.getElementById("search")?.value||"").toLowerCase();
    const ex=document.getElementById("filterExam")?.value||"",pr=document.getElementById("filterPriority")?.value||"",st=document.getElementById("filterStatus")?.value||"";
    const subjects=[...EDITAL].sort((a,b)=>PRIORITY_RANK[a.prioridade]-PRIORITY_RANK[b.prioridade] || (a.prova==="P3"?-1:a.prova==="P2"?0:1));
    let html="";
    subjects.forEach(d=>{
      if(ex&&d.prova!==ex)return;
      const visible=[];
      d.grupos.forEach(g=>g.topicos.forEach((t,i)=>{
        const id=tid(d,g,i),x={d,g,t,id,exam:d.prova,priority:getPriority(d,g,id),m:metrics(id,d.prova)};
        const am=metaOf(x),hay=(d.nome+" "+g.nome+" "+t+" "+(am.title||"")).toLowerCase();
        const statusFilter=st==="Concluído"?x.m.s.done:(st?x.m.status===st:true);
        if((!q||hay.includes(q))&&(!pr||x.priority===pr)&&statusFilter)visible.push(x);
      }));
      if(!visible.length)return;
      visible.sort((a,b)=>PRIORITY_RANK[a.priority]-PRIORITY_RANK[b.priority] || a.g.nome.localeCompare(b.g.nome) || a.i-b.i);
      const s=subjectStats(d),visibleQ=visible.reduce((sum,x)=>sum+x.m.q,0);
      html+=`<div class="subject-card open" id="sub-${d.id}">
        <div class="subject-head" onclick="this.parentElement.classList.toggle('open')">
          <div class="subject-info"><div class="subject-name">${escapeHtml(d.nome)}</div>
          <div class="subject-meta"><span class="badge ${priClass(d.prioridade)}">${d.prioridade}</span><span class="badge ${examClass(d.prova)}">${d.prova}</span><span class="badge">${d.p4}</span><span class="small">${escapeHtml(d.motivo)}</span></div></div>
          <div class="subject-stats"><span><b>${s.done}/${s.total}</b>temas concluídos</span><span><b>${s.q}</b>questões</span><span><b>${fmtPct(s.liquido)}</b>líquido</span></div>
        </div>
        ${(q||pr||st)&&s.q!==visibleQ?`<div class="filter-stats" style="padding:0 16px 8px">O filtro atual mostra ${visibleQ} questão(ões); a matéria possui ${s.q} no total.</div>`:""}
        <div class="subject-body">${visible.map(topicHtml).join("")}</div>
      </div>`;
    });
    document.getElementById("editalList").innerHTML=html||'<div class="empty">Nenhum conteúdo com esses filtros.</div>';
  };

  renderReview=function(){
    const rows=topicsFlat().filter(x=>x.m.status==="Revisar")
      .sort((a,b)=>PRIORITY_RANK[a.priority]-PRIORITY_RANK[b.priority] || (a.m.liquido??-999)-(b.m.liquido??-999));
    document.getElementById("reviewList").innerHTML=rows.length?rows.map(x=>`<div class="review-card" data-topic-id="${escapeHtml(x.id)}">
      <div class="topic-top"><div class="atomic-topic-title">${escapeHtml(themeTitle(x))}</div><span class="badge ${priClass(x.priority)}">${x.priority}</span><span class="badge ${examClass(x.exam)}">${x.exam}</span></div>
      <div class="atomic-parent">${escapeHtml(parentLine(x))}</div>
      <div class="review-grid">
        <div class="field"><label>Total questões</label><input type="number" min="0" value="${x.m.q}" onchange="setQuestion('${x.id}','questoes',this.value)"></div>
        <div class="field"><label>Acertos</label><input type="number" min="0" value="${x.m.a}" onchange="setQuestion('${x.id}','acertos',this.value)"></div>
        <div class="field"><label>Em branco</label><input type="number" min="0" value="${Number(x.m.s.brancos)||0}" onchange="setQuestion('${x.id}','brancos',this.value)"></div>
        <div class="field"><label>Erros</label><div class="metric">${x.m.e}</div></div>
        <div class="field"><label>% líquido</label><div class="metric status-review">${fmtPct(x.m.liquido)}</div></div>
        <div class="field"><label>Meta</label><div class="metric">${x.m.meta}%</div></div>
      </div>
    </div>`).join(""):'<div class="empty">Nenhum tema abaixo da meta.</div>';
  };

  const baseDashboard=renderDashboard;
  renderDashboard=function(){
    baseDashboard();
    const focus=topicsFlat().filter(x=>!x.m.s.done||x.m.status==="Revisar")
      .sort((a,b)=>PRIORITY_RANK[a.priority]-PRIORITY_RANK[b.priority] || (a.exam==="P3"?-1:1) || (a.m.status==="Revisar"?-1:1)).slice(0,8);
    const host=document.getElementById("focusQueue");
    if(host)host.innerHTML=focus.length?focus.map(x=>`<div class="queue-item" onclick="goSubject('${x.d.id}')"><div class="queue-title">${escapeHtml(themeTitle(x))}</div><div class="queue-sub"><span class="badge ${priClass(x.priority)}">${x.priority}</span> <span class="badge ${examClass(x.exam)}">${x.exam}</span> · ${escapeHtml(x.g.nome)}</div></div>`).join(""):'<div class="empty">Nenhum tema pendente.</div>';
  };

  try{renderAll();}catch(e){console.warn("UI atômica:",e);}
})();
