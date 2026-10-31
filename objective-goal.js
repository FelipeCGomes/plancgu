/* Meta objetiva 210–230 pontos líquidos.
   Piso competitivo: 210/260 = 80,8%.
   Alvo central: 220/260 = 84,6%.
   Meta superior: 230/260 = 88,5%.
   Metas operacionais por bloco: P1 75%, P2 80%, P3 88% ≈ 220,4/260.
*/
(() => {
  const GOAL={
    maxPoints:260,
    floor:210,
    target:220,
    stretch:230,
    floorPct:100*210/260,
    targetPct:100*220/260,
    stretchPct:100*230/260,
    blockMeta:{P1:75,P2:80,P3:88},
    p4Target:85
  };
  window.CGU_OBJECTIVE_GOAL=GOAL;

  function apply(){
    if(typeof settings!=="object")return;
    settings={...settings,...GOAL.blockMeta};
    try{save();}catch(e){console.warn("Não foi possível salvar a nova meta objetiva",e)}
  }

  apply();
  window.addEventListener("cgu-cloud-ready",()=>{
    apply();
    try{renderAll();}catch(e){}
  });

  window.CGU_applyObjectiveGoal=apply;
})();
