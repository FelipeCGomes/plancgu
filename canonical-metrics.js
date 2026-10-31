/* Regra canônica das questões Cebraspe em todo o app.
   TOTAL = ACERTOS + ERROS + EM BRANCO.
   Corrige a função base antiga que desconsiderava brancos ao calcular erros. */
(() => {
  normalizeTopic=function(id){
    const s=getTS(id)||{};
    const a=Math.max(0,Number(s.acertos)||0);
    const b=Math.max(0,Number(s.brancos)||0);
    const oldE=Math.max(0,Number(s.erros)||0);
    let q=Math.max(0,Number(s.questoes)||0);
    if(!q&&(a||b||oldE))q=a+b+oldE;
    if(q<a+b)q=a+b;
    const e=Math.max(q-a-b,0);
    return {...s,acertos:a,brancos:b,questoes:q,erros:e};
  };
})();