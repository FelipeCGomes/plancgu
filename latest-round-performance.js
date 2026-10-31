/* Desempenho atual por última rodada.
   - A última rodada registrada representa o nível atual do tópico.
   - Totais históricos continuam preservados para volume e evolução.
   - Tópicos sem histórico por rodada usam o acumulado legado como referência atual.
*/
(() => {
  function n(v){return Math.max(0,Number(v)||0)}
  function lastRound(s){
    const rs=Array.isArray(s?.questionRounds)?s.questionRounds:[];
    return rs.length?rs[rs.length-1]:null;
  }
  function historical(id){
    const s=normalizeTopic(id);
    return {q:n(s.questoes),a:n(s.acertos),e:n(s.erros),b:n(s.brancos),s};
  }
  function current(id){
    const h=historical(id),r=lastRound(h.s);
    if(!r)return {...h,source:"legado",round:null};
    const q=n(r.questoes),a=n(r.acertos),b=n(r.brancos),e=n(r.erros ?? (q-a-b));
    return {q,a,b,e,s:h.s,source:"ultima-rodada",round:r};
  }

  metrics=function(id,exam){
    const h=historical(id),c=current(id);
    const bruto=c.q?100*c.a/c.q:null;
    const liquido=c.q?100*(c.a-c.e)/c.q:null;
    const histBruto=h.q?100*h.a/h.q:null;
    const histLiquido=h.q?100*(h.a-h.e)/h.q:null;
    const meta=examMeta(exam);
    const status=!c.q?"Pendente":liquido>=meta?"Atendeu":"Revisar";
    return {
      s:h.s,
      q:c.q,a:c.a,e:c.e,b:c.b,
      bruto,liquido,meta,status,
      performanceSource:c.source,
      lastRound:c.round,
      histQ:h.q,histA:h.a,histE:h.e,histB:h.b,
      histBruto,histLiquido
    };
  };

  subjectStats=function(d){
    const rows=topicsFlat().filter(x=>x.d.id===d.id);
    const q=rows.reduce((s,x)=>s+n(x.m.histQ ?? x.m.q),0);
    const aHist=rows.reduce((s,x)=>s+n(x.m.histA ?? x.m.a),0);
    const eHist=rows.reduce((s,x)=>s+n(x.m.histE ?? x.m.e),0);
    const currentQ=rows.reduce((s,x)=>s+n(x.m.q),0);
    const currentA=rows.reduce((s,x)=>s+n(x.m.a),0);
    const currentE=rows.reduce((s,x)=>s+n(x.m.e),0);
    const done=rows.filter(x=>x.m.s.done).length;
    return {
      q,a:aHist,e:eHist,done,total:rows.length,
      bruto:currentQ?100*currentA/currentQ:null,
      liquido:currentQ?100*(currentA-currentE)/currentQ:null,
      currentQ,currentA,currentE
    };
  };

  blockStats=function(exam){
    const rows=topicsFlat().filter(x=>x.exam===exam);
    const q=rows.reduce((s,x)=>s+n(x.m.histQ ?? x.m.q),0);
    const aHist=rows.reduce((s,x)=>s+n(x.m.histA ?? x.m.a),0);
    const eHist=rows.reduce((s,x)=>s+n(x.m.histE ?? x.m.e),0);
    const currentQ=rows.reduce((s,x)=>s+n(x.m.q),0);
    const currentA=rows.reduce((s,x)=>s+n(x.m.a),0);
    const currentE=rows.reduce((s,x)=>s+n(x.m.e),0);
    const done=rows.filter(x=>x.m.s.done).length;
    return {
      q,a:aHist,e:eHist,done,total:rows.length,
      bruto:currentQ?100*currentA/currentQ:null,
      liquido:currentQ?100*(currentA-currentE)/currentQ:null,
      meta:examMeta(exam),currentQ,currentA,currentE
    };
  };

  window.CGU_currentTopicPerformance=current;
  window.CGU_historicalTopicPerformance=historical;
})();