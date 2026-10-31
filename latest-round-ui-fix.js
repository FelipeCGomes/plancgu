/* Ajustes visuais finais para o modelo de última rodada. */
(() => {
  const baseTopicHtml=topicHtml;
  topicHtml=function(x){
    let html=baseTopicHtml(x);
    const branco=Number(x.m?.b ?? x.m?.s?.brancos ?? 0);
    html=html.replace(/(<div class="field"><label>Em branco<\/label><div class="metric readonly-accumulated">)[^<]*(<\/div><\/div>)/,`$1${branco}$2`);
    return html;
  };

  const baseRenderEdital=renderEdital;
  renderEdital=function(){return baseRenderEdital.apply(this,arguments)};
  try{renderEdital();renderReview();}catch(e){}
})();