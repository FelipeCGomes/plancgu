/* Interface da meta objetiva 210–230 pontos.
   Executa por último para alinhar Dashboard e Plano com a meta definida em objective-goal.js.
*/
(() => {
  const G=window.CGU_OBJECTIVE_GOAL||{maxPoints:260,floor:210,target:220,stretch:230,floorPct:80.769,targetPct:84.615,stretchPct:88.462,blockMeta:{P1:75,P2:80,P3:88},p4Target:85};

  function n(v){return Math.max(0,Number(v)||0)}
  function fmt(v,d=1){return v==null||!isFinite(v)?"—":Number(v).toFixed(d).replace('.',',')}
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
    const pct=weightedMax?100*weightedNet/weightedMax:null;
    const projected=pct==null?null:G.maxPoints*pct/100;
    return {rows,q,a,e,b,studied,review,pct,projected};
  }

  function patchDashboard(){
    const host=document.getElementById("kpis");if(!host)return;
    const s=stats();
    const coverage=s.rows.length?100*s.studied/s.rows.length:0;
    const gapFloor=s.projected==null?null:s.projected-G.floor;
    const gapTarget=s.projected==null?null:s.projected-G.target;
    const status=s.projected==null?"Sem projeção":s.projected>=G.stretch?"Meta superior alcançada":s.projected>=G.floor?"Dentro da faixa-alvo":"Abaixo do piso de 210";
    const statusCls=s.projected!=null&&s.projected>=G.floor?"top6-ok":"top6-warn";

    host.innerHTML=`
      <div class="kpi dash-kpi top6-main"><div class="v">210–230</div><div class="l">Meta objetiva líquida</div><div class="dash-kpi-detail">de ${G.maxPoints} pontos · alvo central 220</div></div>
      <div class="kpi dash-kpi ${statusCls}"><div class="v">${s.projected==null?"—":fmt(s.projected,1)}</div><div class="l">Projeção atual / 260</div><div class="dash-kpi-detail">${status} · baseada na amostra mapeada</div></div>
      <div class="kpi dash-kpi"><div class="v">${s.pct==null?"—":fmt(s.pct,1)+"%"}</div><div class="l">Líquido ponderado atual</div><div class="dash-kpi-detail">Piso 210 = ${fmt(G.floorPct,1)}% · alvo 220 = ${fmt(G.targetPct,1)}%</div></div>
      <div class="kpi dash-kpi"><div class="v">${gapFloor==null?"—":(gapFloor>=0?"+":"")+fmt(gapFloor,1)}</div><div class="l">Gap para 210 pontos</div><div class="dash-kpi-detail">Gap para 220: ${gapTarget==null?"—":(gapTarget>=0?"+":"")+fmt(gapTarget,1)} pts</div></div>
      <div class="kpi dash-kpi"><div class="v">${s.studied}/${s.rows.length}</div><div class="l">Cobertura do edital</div><div class="dash-kpi-detail">${fmt(coverage,1)}% · ${s.q} questões mapeadas</div></div>
      <div class="kpi dash-kpi ${s.review?"review-alert":""}"><div class="v">${s.review}</div><div class="l">Revisar agora</div><div class="dash-kpi-detail">Meta operacional: P1 ${G.blockMeta.P1}% · P2 ${G.blockMeta.P2}% · P3 ${G.blockMeta.P3}%</div></div>`;

    const hero=document.querySelector("#page-dashboard .hero");
    if(hero){
      const badge=hero.querySelector(".badge.p3");if(badge)badge.textContent="🎯 Objetiva: 210–230 pts líquidos";
      const p=hero.querySelector("p");if(p)p.textContent="Meta central de 220/260 pontos líquidos. O painel projeta sua pontuação pela amostra atual e usa P1 75%, P2 80% e P3 88% como gatilhos operacionais de revisão.";
    }

    const panel=document.getElementById("performanceVsTarget");
    if(panel){
      const signal=panel.querySelector(".perf-signal");
      if(signal){
        signal.classList.remove("ok","medium","bad");
        let cls="medium",label="Sem projeção suficiente",text="Continue registrando questões para estimar os pontos líquidos.";
        if(s.projected!=null){
          if(s.projected>=G.stretch){cls="ok";label="Acima de 230 projetados";text="Faixa superior da meta objetiva atingida na amostra atual.";}
          else if(s.projected>=G.floor){cls="ok";label="Na faixa 210–230";text=`Projeção atual: ${fmt(s.projected,1)}/${G.maxPoints}. Próximo alvo: ${s.projected<G.target?"220 pontos":"230 pontos"}.`;}
          else if(s.projected>=190){cls="medium";label="Em aproximação";text=`Faltam ${fmt(G.floor-s.projected,1)} pontos projetados para entrar na faixa de 210.`;}
          else{cls="bad";label="Abaixo da faixa-alvo";text=`Projeção atual: ${fmt(s.projected,1)}/${G.maxPoints}; piso estratégico: 210.`;}
        }
        signal.classList.add(cls);signal.innerHTML=`<span>${label}</span><small>${text}</small>`;
      }
      const boxes=panel.querySelectorAll(".perf-summary>div");
      if(boxes.length>=4){
        const label=boxes[3].querySelector("span"),value=boxes[3].querySelector("b"),small=boxes[3].querySelector("small");
        if(label)label.textContent="Meta objetiva líquida";
        if(value)value.textContent="210–230 pts";
        if(small)small.textContent="alvo central: 220/260";
      }
      const disc=panel.querySelector(".perf-discursive");
      if(disc)disc.innerHTML=`<b>P4/Discursiva:</b> continua com meta de treino de <b>${G.p4Target}%+</b>. A meta de 210–230 pontos refere-se à <b>prova objetiva líquida</b>.`;
    }

    const metasCard=document.getElementById("metaP1")?.closest(".card");
    if(metasCard){
      const title=metasCard.querySelector("h3");if(title)title.textContent="Metas operacionais para 220 pontos";
      const hint=metasCard.querySelector(".dash-meta-hint");
      if(hint)hint.innerHTML=`<b>Objetivo:</b> 210–230/260 líquidos, com alvo central em <b>220</b>. <span>P1 ${G.blockMeta.P1}% + P2 ${G.blockMeta.P2}% + P3 ${G.blockMeta.P3}% projetam cerca de <b>220,4 pontos</b>.</span>`;
    }
  }

  function patchPlan(){
    const page=document.getElementById("page-hoje");if(!page)return;
    let box=document.getElementById("objectiveGoalPlanBox");
    if(!box){
      box=document.createElement("div");box.id="objectiveGoalPlanBox";box.className="objective-goal-plan";
      const hero=page.querySelector(".hero");hero?.insertAdjacentElement("afterend",box);
    }
    box.innerHTML=`<b>🎯 Meta objetiva: 210–230 pontos líquidos</b><span>Alvo central: <b>220/260</b>. O motor considera P1 ${G.blockMeta.P1}%, P2 ${G.blockMeta.P2}% e P3 ${G.blockMeta.P3}% como metas operacionais; tópicos abaixo desses níveis ganham prioridade de revisão e questões.</span>`;
  }

  if(!document.getElementById("objectiveGoalUiStyle")){
    const st=document.createElement("style");st.id="objectiveGoalUiStyle";st.textContent=`
      .objective-goal-plan{margin:-4px 0 12px;padding:10px 12px;border:1px solid #c4b5fd;background:#faf5ff;border-radius:10px;color:#4c1d95;font-size:10px;line-height:1.45}.objective-goal-plan b,.objective-goal-plan span{display:block}.objective-goal-plan span{margin-top:3px;color:#64748b}
    `;document.head.appendChild(st);
  }

  const baseDashboard=renderDashboard;
  renderDashboard=function(){const r=baseDashboard.apply(this,arguments);patchDashboard();return r;};
  const baseToday=renderToday;
  renderToday=function(){const r=baseToday.apply(this,arguments);patchPlan();return r;};

  window.CGU_renderObjectiveGoal=()=>{patchDashboard();patchPlan();};
  try{patchDashboard();patchPlan();}catch(e){console.warn("Interface da meta 210–230:",e)}
})();
