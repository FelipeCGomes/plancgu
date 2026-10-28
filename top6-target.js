/* Meta estratégica Top 6 v1.
   Não é nota de corte oficial. É um alvo operacional para disputar as 6 vagas AC do Cargo 3.
   Referência adotada: 75% líquido na objetiva + 85% na P4 => NFC-alvo 16,0/20.
*/
(() => {
  const TARGET_OBJECTIVE=75;
  const TARGET_DISCURSIVE=85;
  const TARGET_FINAL=TARGET_OBJECTIVE/10 + TARGET_DISCURSIVE/10; // 16,0 pela fórmula NFC = NFPO/26 + NFPD/10 quando objetivo é expresso em % do máximo.

  function currentObjective(){
    if(typeof topicsFlat!=="function")return null;
    const rows=topicsFlat();
    const max=rows.reduce((s,x)=>s+(Number(x.m.q)||0)*(x.exam==="P3"?2:1),0);
    const net=rows.reduce((s,x)=>s+((Number(x.m.a)||0)-(Number(x.m.e)||0))*(x.exam==="P3"?2:1),0);
    return max?100*net/max:null;
  }
  function pct(v){return v==null||!isFinite(v)?"—":`${v.toFixed(1).replace(".",",")}%`;}
  function decorate(){
    const kpis=document.getElementById("kpis");if(!kpis)return;
    kpis.querySelectorAll(".top6-kpi").forEach(el=>el.remove());
    const current=currentObjective();
    const gap=current==null?null:current-TARGET_OBJECTIVE;
    const gapText=gap==null?"sem amostra":`${gap>=0?"+":""}${gap.toFixed(1).replace(".",",")} p.p.`;
    const cards=[
      {v:`${TARGET_FINAL.toFixed(1).replace(".",",")}/20`,l:"Meta geral Top 6",d:"75% objetiva + 85% P4"},
      {v:`${TARGET_OBJECTIVE}%`,l:"Meta líquida objetiva",d:`Atual mapeado: ${pct(current)}`},
      {v:gapText,l:"Gap para meta objetiva",d:gap==null?"Registre questões para calcular":(gap>=0?"Meta estratégica alcançada":"Quanto falta para 75% líquido")}
    ];
    cards.forEach(c=>{
      const el=document.createElement("div");
      el.className="kpi top6-kpi";
      el.innerHTML=`<div class="v">${c.v}</div><div class="l">${c.l}</div><div class="top6-detail">${c.d}</div>`;
      kpis.appendChild(el);
    });

    const panel=document.getElementById("performanceVsTarget");
    if(panel&&!panel.querySelector(".top6-note")){
      const note=document.createElement("div");
      note.className="top6-note";
      note.innerHTML=`<b>🎯 Meta estratégica Top 6:</b> trabalhar para chegar a <b>75% líquido na objetiva</b> e <b>85%+ na discursiva</b>, equivalente a aproximadamente <b>16,0/20</b> na nota final. <span>Não é corte oficial; é um alvo de preparação para disputar as 6 vagas de ampla concorrência.</span>`;
      panel.insertBefore(note,panel.children[1]||null);
    }
  }

  if(!document.getElementById("top6Style")){
    const s=document.createElement("style");s.id="top6Style";s.textContent=`
      .top6-kpi{border:1px solid #c4b5fd!important;background:#faf5ff!important}.top6-kpi .v{color:#5b21b6!important}.top6-detail{font-size:8px;color:#6b7280;margin-top:4px;line-height:1.3}.top6-note{margin:10px 0 14px;padding:10px 12px;border:1px solid #c4b5fd;background:#faf5ff;border-radius:10px;color:#4c1d95;font-size:10px;line-height:1.45}.top6-note span{color:#6b7280}`;
    document.head.appendChild(s);
  }

  const previous=renderDashboard;
  renderDashboard=function(){const r=previous.apply(this,arguments);decorate();return r;};
  window.CGU_renderTop6Target=decorate;
  try{decorate();}catch(e){console.warn("Meta Top 6:",e)}
})();
