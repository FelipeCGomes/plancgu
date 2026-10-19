/* Camada de consistência entre todas as telas.
   Uma única fonte: state[topicId]. Dashboard, Edital, Revisar e Plano do dia leem os mesmos registros. */
(() => {
  // Toda alteração de tópico recebe timestamp para permitir sincronização segura entre dispositivos.
  const baseSetTS = setTS;
  setTS = function(id, patch){
    const next={...patch};
    if(next.updatedAtMs===undefined)next.updatedAtMs=Date.now();
    baseSetTS(id,next);
  };

  function overall(){
    if(typeof knownOverallStats==="function")return knownOverallStats();
    const rows=topicsFlat();
    const mapped={
      questoes:rows.reduce((s,x)=>s+x.m.q,0),
      acertos:rows.reduce((s,x)=>s+x.m.a,0),
      erros:rows.reduce((s,x)=>s+x.m.e,0),
      brancos:rows.reduce((s,x)=>s+(Number(x.m.s.brancos)||0),0)
    };
    return {mapped,total:{...mapped}};
  }

  function fmtDateTime(ms){
    const n=Number(ms)||0;if(!n)return "";
    try{return new Date(n).toLocaleString("pt-BR",{day:"2-digit",month:"2-digit",hour:"2-digit",minute:"2-digit"})}catch(e){return ""}
  }

  function installStyle(){
    if(document.getElementById("consistencyStyle"))return;
    const s=document.createElement("style");
    s.id="consistencyStyle";
    s.textContent=`
      .topic-grid.consistent{grid-template-columns:105px 110px 100px 90px 90px 95px 95px minmax(145px,1fr)}
      .sync-link{margin-top:8px;padding:7px 9px;border:1px solid #dbeafe;background:#eff6ff;border-radius:8px;color:#1e3a5f;font-size:10px;line-height:1.4}
      .sync-link b{color:#17365D}.topic-last{font-size:9px;color:#64748b;margin-top:6px}
      .filter-stats{font-size:9px;color:#64748b;margin-top:3px;text-align:right}
      .question-cumulative{display:grid;grid-template-columns:repeat(5,1fr);gap:6px;margin:8px 0}
      .question-cumulative>div{border:1px solid #e2e8f0;border-radius:8px;padding:6px;background:#fff}
      .question-cumulative span{display:block;font-size:8px;text-transform:uppercase;color:#64748b;font-weight:800}
      .question-cumulative b{display:block;margin-top:2px;color:#17365D;font-size:12px}
      @media(max-width:1150px){.topic-grid.consistent{grid-template-columns:repeat(4,1fr)}}
      @media(max-width:700px){.topic-grid.consistent{grid-template-columns:1fr 1fr}.question-cumulative{grid-template-columns:1fr 1fr}}
    `;
    document.head.appendChild(s);
  }

  // Edital: inclui em branco e deixa claro quando o filtro está mostrando um tópico diferente daquele que possui questões.
  topicHtml=function(x,compact=false){
    const m=x.m,s=m.s,p=x.priority;
    const last=fmtDateTime(s.updatedAtMs||s.lastQuestionDate);
    return `<div class="topic" data-topic-id="${escapeHtml(x.id)}">
      <div class="topic-top">
        <label class="done-wrap"><input type="checkbox" ${s.done?"checked":""} onchange="markDone('${x.id}',this.checked)"> Concluído</label>
        <div class="topic-title">${escapeHtml(x.g.nome)}</div>
        <span class="badge ${priClass(p)}">${p}</span><span class="badge ${examClass(x.exam)}">${x.exam}</span>
      </div>
      <div class="topic-text">${escapeHtml(x.t)}</div>
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
      <div class="note-row">
        <input value="${escapeHtml(s.aula||"")}" placeholder="Aula / material (opcional)" onchange="setText('${x.id}','aula',this.value)">
        <input value="${escapeHtml(s.obs||"")}" placeholder="Observação / ponto fraco (opcional)" onchange="setText('${x.id}','obs',this.value)">
      </div>
    </div>`;
  };

  renderEdital=function(){
    const q=(document.getElementById("search")?.value||"").toLowerCase();
    const ex=document.getElementById("filterExam")?.value||"", pr=document.getElementById("filterPriority")?.value||"", st=document.getElementById("filterStatus")?.value||"";
    const subjects=[...EDITAL].sort((a,b)=>PRIORITY_RANK[a.prioridade]-PRIORITY_RANK[b.prioridade] || (a.prova==="P3"?-1:a.prova==="P2"?0:1));
    let html="";
    subjects.forEach(d=>{
      if(ex && d.prova!==ex)return;
      const visible=[];
      d.grupos.forEach((g,gi)=>g.topicos.forEach((t,i)=>{
        const id=tid(d,g,i),x={d,g,t,id,exam:d.prova,priority:getPriority(d,g,id),m:metrics(id,d.prova)};
        const hay=(d.nome+" "+g.nome+" "+t).toLowerCase();
        const statusFilter=st==="Concluído"?x.m.s.done:(st?x.m.status===st:true);
        if((!q||hay.includes(q))&&(!pr||x.priority===pr)&&statusFilter)visible.push(x);
      }));
      if(!visible.length)return;
      visible.sort((a,b)=>PRIORITY_RANK[a.priority]-PRIORITY_RANK[b.priority] || a.g.nome.localeCompare(b.g.nome));
      const s=subjectStats(d);
      const visibleQ=visible.reduce((sum,x)=>sum+x.m.q,0);
      html+=`<div class="subject-card" id="sub-${d.id}">
        <div class="subject-head" onclick="this.parentElement.classList.toggle('open')">
          <div class="subject-info"><div class="subject-name">${escapeHtml(d.nome)}</div>
            <div class="subject-meta"><span class="badge ${priClass(d.prioridade)}">${d.prioridade}</span><span class="badge ${examClass(d.prova)}">${d.prova}</span><span class="badge">${d.p4}</span><span class="small">${escapeHtml(d.motivo)}</span></div>
          </div>
          <div class="subject-stats"><span><b>${s.done}/${s.total}</b>concluídos</span><span><b>${s.q}</b>questões na matéria</span><span><b>${fmtPct(s.liquido)}</b>líquido</span></div>
        </div>
        ${(q||pr||st)&&s.q!==visibleQ?`<div class="filter-stats" style="padding:0 16px 8px">O filtro atual mostra ${visibleQ} questão(ões); a matéria possui ${s.q} no total.</div>`:""}
        <div class="subject-body">${visible.map(x=>topicHtml(x)).join("")}</div>
      </div>`;
    });
    document.getElementById("editalList").innerHTML=html||'<div class="empty">Nenhum conteúdo com esses filtros.</div>';
  };

  renderReview=function(){
    const rows=topicsFlat().filter(x=>x.m.status==="Revisar")
      .sort((a,b)=>PRIORITY_RANK[a.priority]-PRIORITY_RANK[b.priority] || (a.m.liquido??-999)-(b.m.liquido??-999));
    document.getElementById("reviewList").innerHTML=rows.length?rows.map(x=>`<div class="review-card" data-topic-id="${escapeHtml(x.id)}">
      <div class="topic-top"><div class="topic-title">${escapeHtml(x.g.nome)}</div><span class="badge ${priClass(x.priority)}">${x.priority}</span><span class="badge ${examClass(x.exam)}">${x.exam}</span></div>
      <div class="small">${escapeHtml(x.d.nome)}</div>
      <div class="review-grid">
        <div class="field"><label>Total questões</label><input type="number" min="0" value="${x.m.q}" onchange="setQuestion('${x.id}','questoes',this.value)"></div>
        <div class="field"><label>Acertos</label><input type="number" min="0" value="${x.m.a}" onchange="setQuestion('${x.id}','acertos',this.value)"></div>
        <div class="field"><label>Em branco</label><input type="number" min="0" value="${Number(x.m.s.brancos)||0}" onchange="setQuestion('${x.id}','brancos',this.value)"></div>
        <div class="field"><label>Erros</label><div class="metric">${x.m.e}</div></div>
        <div class="field"><label>% líquido</label><div class="metric status-review">${fmtPct(x.m.liquido)}</div></div>
        <div class="field"><label>Meta</label><div class="metric">${x.m.meta}%</div></div>
      </div>
      ${x.m.s.obs?`<div class="small" style="margin-top:8px"><b>Observação:</b> ${escapeHtml(x.m.s.obs)}</div>`:""}
    </div>`).join(""):'<div class="empty">Nenhum tópico abaixo da meta. Quando um desempenho ficar abaixo da meta, aparecerá aqui automaticamente.</div>';
  };

  // Plano do dia: identifica explicitamente qual registro do Edital receberá as questões e mostra o acumulado.
  if(typeof adaptiveQuestionForm==="function"){
    adaptiveQuestionForm=function(main,lessonId){
      const min=typeof adaptiveMinQuestions==="function"?adaptiveMinQuestions(main):10;
      const m=metrics(main.id,main.exam);
      const b=Number(m.s.brancos)||0;
      return `<div class="lesson-question-box">
        <div class="lesson-question-head">
          <div class="lesson-question-title">📝 Registrar questões desta rodada</div>
          <div class="min-question-badge">Mínimo hoje: ${min} questões</div>
        </div>
        <div class="sync-link"><b>Vinculado ao Edital:</b> ${escapeHtml(main.d.nome)} → <b>${escapeHtml(main.g.nome)}</b>. Tudo que você salvar aqui aparece nesse mesmo tópico no Edital, Revisar e Dashboard.</div>
        <div class="question-cumulative">
          <div><span>Acumulado</span><b>${m.q}</b></div><div><span>Acertos</span><b>${m.a}</b></div><div><span>Erros</span><b>${m.e}</b></div><div><span>Em branco</span><b>${b}</b></div><div><span>Líquido</span><b>${fmtPct(m.liquido)}</b></div>
        </div>
        <div class="min-question-help">${escapeHtml(typeof adaptiveQuestionTargetText==="function"?adaptiveQuestionTargetText(main):`Faça no mínimo ${min} questões.`)}</div>
        <div class="lesson-question-grid">
          <div><label>Total</label><input id="${qInputId("q-total",lessonId)}" type="number" min="${min}" inputmode="numeric" placeholder="Mín.: ${min}"></div>
          <div><label>Acertos</label><input id="${qInputId("q-acertos",lessonId)}" type="number" min="0" inputmode="numeric" placeholder="Ex.: 12"></div>
          <div><label>Em branco</label><input id="${qInputId("q-brancos",lessonId)}" type="number" min="0" inputmode="numeric" placeholder="0"></div>
          <button type="button" onclick="registerAdaptiveQuestions('${main.id}','${lessonId||"custom"}')">Salvar questões</button>
        </div>
        <div class="small" style="margin-top:6px">Os erros são calculados automaticamente. O registro é cumulativo neste tópico.</div>
      </div>`;
    };
  }

  // Corrige KPIs para não misturar "questões mapeadas" com a amostra histórica geral.
  const previousDashboard=renderDashboard;
  renderDashboard=function(){
    previousDashboard();
    const rows=topicsFlat();
    const stats=overall();
    const studied=rows.filter(x=>x.m.q>0||x.m.s.done).length;
    const rev=rows.filter(x=>x.m.status==="Revisar").length;
    const weightedMax=rows.reduce((s,x)=>s+x.m.q*(x.exam==="P3"?2:1),0);
    const weightedNet=rows.reduce((s,x)=>s+(x.m.a-x.m.e)*(x.exam==="P3"?2:1),0);
    const weighted=weightedMax?100*weightedNet/weightedMax:null;
    const gross=stats.total.questoes?100*stats.total.acertos/stats.total.questoes:null;
    const kpis=document.getElementById("kpis");
    if(kpis)kpis.innerHTML=[
      ["Tópicos estudados",studied+"/"+rows.length],
      ["Questões conhecidas",stats.total.questoes],
      ["Acertos conhecidos",stats.total.acertos],
      ["% bruto geral",fmtPct(gross)],
      ["% líquido mapeado",fmtPct(weighted)],
      ["Para revisar",rev]
    ].map(([l,v])=>`<div class="kpi"><div class="v">${v}</div><div class="l">${l}</div></div>`).join("");

    // performance.js antigo usava total histórico fixo. Ajusta o resumo para a base atual.
    const panel=document.getElementById("performanceVsTarget");
    const boxes=panel?.querySelectorAll(".perf-summary>div");
    if(boxes&&boxes.length>=2){
      const mapped=stats.mapped.questoes,total=stats.total.questoes,coverage=total?100*mapped/total:0;
      boxes[0].querySelector("b").textContent=String(total);
      boxes[1].querySelector("b").textContent=String(mapped);
      const small=boxes[1].querySelector("small");if(small)small.textContent=`${coverage.toFixed(1).replace('.',',')}% da amostra`;
    }
  };

  installStyle();
  if(typeof ensureKnownHistory==="function")ensureKnownHistory();
  try{save();}catch(e){}
  try{renderAll();}catch(e){console.warn("Consistência de telas:",e)}
  try{if(typeof renderPerformancePanel==="function")renderPerformancePanel();renderDashboard();}catch(e){}
})();
