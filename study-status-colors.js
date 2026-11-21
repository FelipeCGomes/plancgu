/* Indicadores visuais de meta: nao altera notas, estados ou persistencia.
   0 ou nenhuma rodada -> neutro. Verde >= meta, laranja ate 5 p.p. abaixo, vermelho caso contrario.
   Usa as metricas atuais (ultima rodada quando houver) ja expostas por topicsFlat(). */
(() => {
  "use strict";
  const LEVELS=["cgu-score-healthy","cgu-score-near","cgu-score-low","cgu-score-unknown"];
  const LABELS={
    "cgu-score-healthy":"Meta atingida",
    "cgu-score-near":"Quase na meta",
    "cgu-score-low":"Abaixo da meta",
    "cgu-score-unknown":"Sem amostra"
  };

  function tone(liquido, meta, questoes) {
    const q=Number(questoes), value=Number(liquido), goal=Number(meta);
    if(!(q>0)||liquido===null||liquido===undefined||!Number.isFinite(value)||!Number.isFinite(goal)){
      return "cgu-score-unknown";
    }
    if(value>=goal)return "cgu-score-healthy";
    if(value>=goal-5)return "cgu-score-near";
    return "cgu-score-low";
  }

  function label(liquido,meta,questoes){
    return LABELS[tone(liquido,meta,questoes)];
  }

  function paintCards(selector,rows){
    document.querySelectorAll(selector).forEach(card=>{
      const x=rows.get(card.dataset.topicId);
      if(!x)return;
      const m=x.m||{},css=tone(m.liquido,m.meta,m.q);
      card.classList.remove(...LEVELS);
      card.classList.add(css);

      const top=card.querySelector(".topic-top");
      if(top){
        let pill=top.querySelector(".cgu-score-pill");
        if(!pill){
          pill=document.createElement("span");
          pill.className="cgu-score-pill";
          top.appendChild(pill);
        }
        pill.classList.remove(...LEVELS);
        pill.classList.add(css);
        pill.textContent=LABELS[css];
        pill.title=css==="cgu-score-unknown"
          ?"Sem questoes para este subitem."
          :"Ultimo desempenho liquido: "+Number(m.liquido).toFixed(1)+"%. Meta: "+Number(m.meta).toFixed(1)+"%.";
      }

      card.querySelectorAll(".field").forEach(field=>{
        const text=field.querySelector("label")?.textContent?.trim()||"";
        if(text!=="% líquido"&&text!=="Meta / status")return;
        const el=field.querySelector(".metric");
        if(!el)return;
        el.classList.add("cgu-score-metric");
        el.classList.remove(...LEVELS);
        el.classList.add(css);
        if(text==="Meta / status")el.textContent=(Number(m.meta)||0)+"% · "+LABELS[css];
      });
    });
  }

  function repaint(){
    if(typeof topicsFlat!=="function")return;
    const rows=new Map(topicsFlat().map(x=>[x.id,x]));
    paintCards("#editalList .topic[data-topic-id]",rows);
    paintCards("#reviewList .review-card[data-topic-id]",rows);
  }

  // Esses dois renders sao substituidos por outros modulos antes desta instalacao.
  // Fazer o acabamento depois da renderizacao evita depender da ordem dos CSS antigos.
  if(typeof renderEdital==="function"){
    const baseEdital=renderEdital;
    renderEdital=function(){const r=baseEdital.apply(this,arguments);repaint();return r;};
  }
  if(typeof renderReview==="function"){
    const baseReview=renderReview;
    renderReview=function(){const r=baseReview.apply(this,arguments);repaint();return r;};
  }

  function repaintSoon(){
    if(typeof requestAnimationFrame==="function")requestAnimationFrame(repaint);
    else setTimeout(repaint,0);
  }
  window.addEventListener("cgu-question-recorded",repaintSoon);
  window.addEventListener("cgu-cloud-ready",repaintSoon);
  window.addEventListener("cgu-data-hydrated",repaintSoon);

  window.CGU_StudyStatusColors={tone,label,repaint};
  repaint();
})();