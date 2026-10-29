/* Visão geral otimizada v1.
   Consolida meta Top 6, desempenho, cobertura, foco e matérias sem duplicação visual.
   Meta Top 6 é estratégica, não corte oficial: 75% líquido na objetiva + 85% P4 ~= 16,0/20.
*/
(() => {
  const TOP6_OBJ=75;
  const TOP6_P4=85;
  const TOP6_FINAL=16.0;

  function n(v){return Math.max(0,Number(v)||0)}
  function pct(v){return v==null||!isFinite(v)?"—":`${v.toFixed(1).replace('.',',')}%`}
  function gapText(v,target){
    if(v==null||!isFinite(v))return "sem amostra";
    const g=v-target;
    return `${g>=0?'+':''}${g.toFixed(1).replace('.',',')} p.p.`;
  }
  function priorityScore(p){return ({"Crítica":4,"Alta":3,"Média":2,"Baixa":1}[p]||0)}

  function stats(){
    const rows=typeof topicsFlat==="function"?topicsFlat():[];
    const q=rows.reduce((s,x)=>s+n(x.m.q),0);
    const a=rows.reduce((s,x)=>s+n(x.m.a),0);
    const e=rows.reduce((s,x)=>s+n(x.m.e),0);
    const b=rows.reduce((s,x)=>s+n(x.m.s?.brancos),0);
    const studied=rows.filter(x=>x.m.s?.done||x.m.q>0).length;
    const review=rows.filter(x=>x.m.status==="Revisar").length;
    const weightedMax=rows.reduce((s,x)=>s+n(x.m.q)*(x.exam==="P3"?2:1),0);
    const weightedNet=rows.reduce((s,x)=>s+(n(x.m.a)-n(x.m.e))*(x.exam==="P3"?2:1),0);
    const objective=weightedMax?100*weightedNet/weightedMax:null;
    return {rows,q,a,e,b,studied,review,objective};
  }

  function renderKpis(s){
    const host=document.getElementById("kpis");if(!host)return;
    const coverage=s.rows.length?100*s.studied/s.rows.length:0;
    const gap=s.objective==null?null:s.objective-TOP6_OBJ;
    const cards=[
      {cls:"top6-main",v:`${TOP6_FINAL.toFixed(1).replace('.',',')}/20`,l:"Meta geral Top 6",d:"75% objetiva + 85% P4 · alvo estratégico"},
      {cls:gap!=null&&gap>=0?"top6-ok":"top6-warn",v:pct(s.objective),l:"Objetiva líquida atual",d:`Meta Top 6: ${TOP6_OBJ}% · gap ${gapText(s.objective,TOP6_OBJ)}`},
      {cls:"top6-p4",v:`${TOP6_P4}%+`,l:"Meta discursiva / P4",d:"Treino-alvo para competir no Top 6"},
      {cls:"",v:`${s.studied}/${s.rows.length}`,l:"Cobertura do edital",d:`${coverage.toFixed(1).replace('.',',')}% dos subitens com estudo/questões`},
      {cls:"",v:String(s.q),l:"Questões mapeadas",d:`${s.a} acertos · ${s.e} erros · ${s.b} em branco`},
      {cls:s.review?"review-alert":"",v:String(s.review),l:"Revisar agora",d:s.review?"Tópicos abaixo da meta operacional":"Nenhum tópico abaixo da meta"}
    ];
    host.innerHTML=cards.map(c=>`<div class="kpi dash-kpi ${c.cls}"><div class="v">${c.v}</div><div class="l">${c.l}</div><div class="dash-kpi-detail">${c.d}</div></div>`).join("");
  }

  function renderSubjects(){
    const host=document.getElementById("subjectSummary");if(!host||typeof subjectStats!=="function")return;
    const arr=[...EDITAL].sort((a,b)=>PRIORITY_RANK[a.prioridade]-PRIORITY_RANK[b.prioridade]||(a.prova==="P3"?-1:a.prova==="P2"?0:1));
    host.innerHTML=`<div class="dash-subject-grid">${arr.map(d=>{
      const s=subjectStats(d),coverage=s.total?100*s.done/s.total:0;
      const status=s.q===0?"Sem amostra":s.liquido>=examMeta(d.prova)?"Na meta":"Revisar";
      const statusCls=s.q===0?"pending":s.liquido>=examMeta(d.prova)?"ok":"bad";
      return `<button class="dash-subject-card" type="button" onclick="goSubject('${d.id}')">
        <div class="dash-subject-top"><span class="badge ${priClass(d.prioridade)}">${d.prioridade}</span><span class="badge ${examClass(d.prova)}">${d.prova}</span><span class="dash-subject-status ${statusCls}">${status}</span></div>
        <b>${escapeHtml(d.nome)}</b>
        <div class="dash-subject-numbers"><span><strong>${s.done}/${s.total}</strong><small>concluídos</small></span><span><strong>${s.q}</strong><small>questões</small></span><span><strong>${fmtPct(s.liquido)}</strong><small>líquido</small></span></div>
        <div class="dash-mini-track"><i style="width:${Math.max(0,Math.min(100,coverage))}%"></i></div>
      </button>`;
    }).join("")}</div>`;
  }

  function renderFocus(s){
    const host=document.getElementById("focusQueue");if(!host)return;
    const rows=s.rows.filter(x=>!x.m.s?.done||x.m.status==="Revisar")
      .map(x=>{
        let score=priorityScore(x.priority)*100+(x.exam==="P3"?60:x.exam==="P2"?25:10);
        if(!x.m.s?.done)score+=35;
        if(!x.m.q)score+=25;
        if(x.m.status==="Revisar")score+=Math.max(0,x.m.meta-(x.m.liquido||0))*2;
        return {...x,_score:score};
      }).sort((a,b)=>b._score-a._score).slice(0,6);
    host.innerHTML=rows.length?rows.map(x=>{
      const am=window.ATOMIC_META?.[x.id]||{};
      const title=am.code?`${am.code} · ${am.title}`:(am.title||x.g.nome);
      const why=!x.m.q?"Sem amostra":x.m.status==="Revisar"?`${fmtPct(x.m.liquido)} vs meta ${x.m.meta}%`:"Conteúdo ainda não concluído";
      return `<div class="queue-item dash-focus" onclick="goSubject('${x.d.id}')"><div class="queue-title">${escapeHtml(title)}</div><div class="queue-sub"><span class="badge ${priClass(x.priority)}">${x.priority}</span> <span class="badge ${examClass(x.exam)}">${x.exam}</span> · ${escapeHtml(x.d.nome)}</div><div class="dash-focus-why">${why}</div></div>`;
    }).join(""):'<div class="empty">Nenhum tópico pendente.</div>';
  }

  function tunePerformance(s){
    const panel=document.getElementById("performanceVsTarget");if(!panel)return;
    const boxes=panel.querySelectorAll(".perf-summary>div");
    if(boxes.length>=4){
      const label=boxes[3].querySelector("span"),value=boxes[3].querySelector("b"),small=boxes[3].querySelector("small");
      if(label)label.textContent="Meta Top 6 objetiva";
      if(value)value.textContent=`${TOP6_OBJ}%`;
      if(small)small.textContent="alvo competitivo, não corte oficial";
    }
    panel.querySelectorAll(".perf-values>div").forEach(box=>{
      const l=box.querySelector("span");if(l&&l.textContent.trim()==="Meta estratégica")l.textContent="Meta operacional";
    });
    const signal=panel.querySelector(".perf-signal");
    if(signal){
      signal.classList.remove("ok","medium","bad");
      let label="Amostra insuficiente",text="Continue registrando questões para tornar a leitura mais confiável.",cls="medium";
      if(s.objective!=null){
        if(s.objective>=TOP6_OBJ){label="Objetiva na meta Top 6";text="Mantenha 75%+ líquido e valide a discursiva em 85%+.";cls="ok";}
        else if(s.objective>=65){label="Em aproximação";text=`Faltam ${Math.abs(s.objective-TOP6_OBJ).toFixed(1).replace('.',',')} p.p. para a meta objetiva de 75%.`;cls="medium";}
        else{label="Abaixo da meta Top 6";text=`Gap de ${Math.abs(s.objective-TOP6_OBJ).toFixed(1).replace('.',',')} p.p. na objetiva mapeada.`;cls="bad";}
      }
      signal.classList.add(cls);signal.innerHTML=`<span>${label}</span><small>${text}</small>`;
    }
    const disc=panel.querySelector(".perf-discursive");
    if(disc)disc.innerHTML=`<b>Discursiva/P4:</b> meta competitiva atual de <b>${TOP6_P4}%+</b>. Sem nota de treino registrada, a projeção final Top 6 permanece incompleta.`;
    const note=panel.querySelector(".top6-note");if(note)note.remove();
  }

  function arrange(){
    const page=document.getElementById("page-dashboard");if(!page)return;
    const grids=[...page.querySelectorAll(":scope > .grid2")];
    if(grids.length<2)return;
    const blockCard=document.getElementById("blockStats")?.closest(".card");
    const focusCard=document.getElementById("focusQueue")?.closest(".card");
    const subjectCard=document.getElementById("subjectSummary")?.closest(".card");
    const metasCard=document.getElementById("metaP1")?.closest(".card");
    if(!focusCard||!subjectCard||!metasCard)return;

    let compact=document.getElementById("dashboardCompactGrid");
    if(!compact){
      compact=document.createElement("div");compact.id="dashboardCompactGrid";compact.className="dashboard-compact-grid";
      const perf=document.getElementById("performanceVsTarget");
      (perf||document.getElementById("kpis")).insertAdjacentElement("afterend",compact);
    }
    if(focusCard.parentElement!==compact)compact.appendChild(focusCard);
    if(metasCard.parentElement!==compact)compact.appendChild(metasCard);
    if(blockCard){blockCard.classList.add("dashboard-legacy-block");blockCard.style.display="none";}

    let subjects=document.getElementById("dashboardSubjectsZone");
    if(!subjects){subjects=document.createElement("div");subjects.id="dashboardSubjectsZone";subjects.className="dashboard-subjects-zone";compact.insertAdjacentElement("afterend",subjects);}
    if(subjectCard.parentElement!==subjects)subjects.appendChild(subjectCard);
    grids.forEach(g=>{if(!g.children.length)g.remove();});

    const metasTitle=metasCard.querySelector("h3");if(metasTitle)metasTitle.textContent="Metas operacionais por bloco";
    let hint=metasCard.querySelector(".dash-meta-hint");
    if(!hint){hint=document.createElement("div");hint.className="dash-meta-hint";metasCard.appendChild(hint);}
    hint.innerHTML=`<b>Meta geral Top 6:</b> ${TOP6_FINAL.toFixed(1).replace('.',',')}/20 · ${TOP6_OBJ}% objetiva · ${TOP6_P4}%+ P4. <span>As metas P1/P2/P3 abaixo são gatilhos operacionais de revisão.</span>`;
  }

  function hero(){
    const h=document.querySelector("#page-dashboard .hero");if(!h)return;
    const badge=h.querySelector(".badge.p3");if(badge)badge.textContent="🎯 Top 6 · meta 16,0/20";
    const p=h.querySelector("p");if(p)p.textContent="Visão consolidada do seu ritmo: meta competitiva Top 6, desempenho líquido, cobertura do edital, pontos de revisão e próximos focos.";
  }

  function optimize(){
    const s=stats();hero();renderKpis(s);tunePerformance(s);arrange();renderFocus(s);renderSubjects();
  }

  if(!document.getElementById("dashboardOverviewStyle")){
    const st=document.createElement("style");st.id="dashboardOverviewStyle";st.textContent=`
      #page-dashboard{padding-top:18px}.dash-kpi{padding:13px 14px;min-height:105px;display:flex;flex-direction:column;justify-content:center}.dash-kpi .v{font-size:22px}.dash-kpi-detail{font-size:9px;color:#64748b;line-height:1.35;margin-top:5px}.dash-kpi.top6-main{background:linear-gradient(135deg,#f5f3ff,#fff);border-color:#c4b5fd}.dash-kpi.top6-main .v{color:#5b21b6}.dash-kpi.top6-ok{background:#f0fdf4;border-color:#bbf7d0}.dash-kpi.top6-warn{background:#fffbeb;border-color:#fde68a}.dash-kpi.top6-p4{background:#eff6ff;border-color:#bfdbfe}.dash-kpi.review-alert{background:#fff7ed;border-color:#fed7aa}
      #page-dashboard .kpis{grid-template-columns:repeat(6,minmax(135px,1fr));gap:9px;margin-bottom:12px}
      #performanceVsTarget{padding:14px;margin-bottom:12px}#performanceVsTarget .perf-head{margin-bottom:9px}#performanceVsTarget .perf-summary{gap:7px;margin-bottom:9px}#performanceVsTarget .perf-summary>div{padding:8px 9px}#performanceVsTarget .perf-summary b{font-size:16px}#performanceVsTarget .perf-legend{margin-bottom:5px}
      #performanceVsTarget .perf-list{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}#performanceVsTarget .perf-row{border:1px solid #e5e7eb!important;border-radius:10px;padding:9px!important;background:#fff}#performanceVsTarget .perf-values{grid-template-columns:1fr 1fr;gap:5px;margin:7px 0}#performanceVsTarget .perf-values>div{padding:5px 6px}#performanceVsTarget .perf-status{margin-top:6px}.perf-note{margin-top:9px}.perf-discursive{margin-top:7px}
      .dashboard-compact-grid{display:grid;grid-template-columns:minmax(0,1.35fr) minmax(300px,.65fr);gap:12px;margin-bottom:12px}.dashboard-compact-grid .card{margin:0;padding:14px}.dashboard-compact-grid .settings{gap:7px}.dashboard-compact-grid .setting{padding:9px}.dashboard-compact-grid .setting input{width:68px;padding:6px}.dash-meta-hint{margin-top:9px;padding:8px 9px;border:1px solid #c4b5fd;background:#faf5ff;border-radius:9px;color:#4c1d95;font-size:9px;line-height:1.4}.dash-meta-hint span{color:#64748b}
      .dash-focus{padding:8px 9px}.dash-focus-why{font-size:9px;color:#64748b;margin-top:4px}.dashboard-subjects-zone .card{padding:14px}.dash-subject-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}.dash-subject-card{text-align:left;border:1px solid #e5e7eb;background:#fff;border-radius:10px;padding:10px;cursor:pointer;min-width:0}.dash-subject-card:hover{border-color:#93a8c4;background:#fbfcff}.dash-subject-card>b{display:block;color:#17365D;font-size:10px;line-height:1.3;margin:7px 0}.dash-subject-top{display:flex;gap:5px;align-items:center}.dash-subject-status{margin-left:auto;font-size:8px;font-weight:900;padding:3px 6px;border-radius:999px}.dash-subject-status.ok{background:#dcfce7;color:#166534}.dash-subject-status.bad{background:#fee2e2;color:#991b1b}.dash-subject-status.pending{background:#f1f5f9;color:#64748b}.dash-subject-numbers{display:grid;grid-template-columns:repeat(3,1fr);gap:5px}.dash-subject-numbers span{font-size:9px;color:#64748b}.dash-subject-numbers strong,.dash-subject-numbers small{display:block}.dash-subject-numbers strong{font-size:11px;color:#0f172a}.dash-subject-numbers small{font-size:8px}.dash-mini-track{height:4px;background:#e5e7eb;border-radius:99px;margin-top:7px;overflow:hidden}.dash-mini-track i{display:block;height:100%;background:#2f75b5;border-radius:99px}
      @media(max-width:1250px){#page-dashboard .kpis{grid-template-columns:repeat(3,1fr)}#performanceVsTarget .perf-list{grid-template-columns:1fr}.dash-subject-grid{grid-template-columns:repeat(2,1fr)}}
      @media(max-width:900px){.dashboard-compact-grid{grid-template-columns:1fr}.dash-subject-grid{grid-template-columns:1fr 1fr}}
      @media(max-width:600px){#page-dashboard .kpis{grid-template-columns:1fr 1fr}.dash-subject-grid{grid-template-columns:1fr}.dash-kpi{min-height:95px}}
    `;document.head.appendChild(st);
  }

  const base=renderDashboard;
  renderDashboard=function(){const r=base.apply(this,arguments);optimize();return r;};
  window.CGU_optimizeDashboard=optimize;
  try{optimize();}catch(e){console.warn("Dashboard otimizado:",e)}
})();
