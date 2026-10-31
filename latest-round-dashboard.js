/* Mantém volume histórico separado da projeção atual no Dashboard. */
(() => {
  function n(v){return Math.max(0,Number(v)||0)}
  function fmt(v,d=1){return v==null||!isFinite(v)?"—":Number(v).toFixed(d).replace(".",",")}
  function patch(){
    const rows=typeof topicsFlat==="function"?topicsFlat():[];
    if(!rows.length)return;
    const histQ=rows.reduce((s,x)=>s+n(x.m.histQ ?? x.m.q),0);
    const histA=rows.reduce((s,x)=>s+n(x.m.histA ?? x.m.a),0);
    const histE=rows.reduce((s,x)=>s+n(x.m.histE ?? x.m.e),0);
    const histB=rows.reduce((s,x)=>s+n(x.m.histB ?? x.m.b ?? x.m.s?.brancos),0);
    const weightedMax=rows.reduce((s,x)=>s+n(x.m.q)*(x.exam==="P3"?2:1),0);
    const weightedNet=rows.reduce((s,x)=>s+(n(x.m.a)-n(x.m.e))*(x.exam==="P3"?2:1),0);
    const currentPct=weightedMax?100*weightedNet/weightedMax:null;
    const projected=currentPct==null?null:260*currentPct/100;

    document.querySelectorAll('#kpis .kpi').forEach(card=>{
      const label=card.querySelector('.l')?.textContent?.trim()||"";
      const value=card.querySelector('.v'),detail=card.querySelector('.dash-kpi-detail');
      if(label==="Projeção atual / 260"&&detail){
        if(value&&projected!=null)value.textContent=fmt(projected,1);
        detail.textContent="Baseada na última rodada de cada tópico; não na média de todo o histórico.";
      }
      if(label==="Líquido ponderado atual"){
        if(value)value.textContent=currentPct==null?"—":fmt(currentPct,1)+"%";
        const l=card.querySelector('.l');if(l)l.textContent="Líquido atual · últimas rodadas";
        if(detail)detail.textContent="Retrato do nível atual por tópico.";
      }
      if(label==="Cobertura do edital"&&detail){
        detail.textContent=`${histQ} questões no histórico total`;
      }
      if(label==="Questões mapeadas"){
        if(value)value.textContent=String(histQ);
        if(detail)detail.textContent=`${histA} acertos · ${histE} erros · ${histB} em branco · histórico`;
      }
    });

    const hero=document.querySelector('#page-dashboard .hero p');
    if(hero)hero.textContent="A projeção usa a última rodada de cada tópico como retrato do desempenho atual. O volume acumulado permanece separado como histórico de questões.";
  }

  const baseRender=renderDashboard;
  renderDashboard=function(){const r=baseRender.apply(this,arguments);patch();return r;};
  window.CGU_patchLatestRoundDashboard=patch;
  try{patch();}catch(e){}
  window.addEventListener("cgu-question-recorded",()=>setTimeout(patch,0));
  window.addEventListener("cgu-cloud-ready",()=>setTimeout(patch,0));
})();