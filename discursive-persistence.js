/* Persistência dedicada da Discursiva/P4.
   Mantém uma cópia própria fora de dailyPlans e espelha o bloco legado para compatibilidade.
   Também protege o histórico contra sobrescritas feitas pelos módulos do planejador.
*/
(() => {
  const PLAN_KEY = KEY + "-daily-plans-v1";
  const P4_KEY = KEY + "-discursive-p4-v1";
  const LEGACY_META = "__discursiveTrackerV1";

  function normalize(bucket){
    const b = bucket && typeof bucket === "object" ? bucket : {};
    return {
      version: Number(b.version)||1,
      entries: Array.isArray(b.entries) ? b.entries : [],
      updatedAtMs: Number(b.updatedAtMs)||0
    };
  }
  function readJson(key){try{return JSON.parse(localStorage.getItem(key)||"null")}catch(e){return null}}
  function readPlansRaw(){return readJson(PLAN_KEY)||{}}
  function writePlansRaw(v){try{localStorage.setItem(PLAN_KEY,JSON.stringify(v||{}))}catch(e){console.warn("Falha ao salvar dailyPlans:",e)}}
  function readDedicated(){return normalize(readJson(P4_KEY))}
  function readLegacy(){return normalize(readPlansRaw()?.[LEGACY_META])}
  function newer(a,b){
    const aa=normalize(a),bb=normalize(b);
    if(aa.updatedAtMs>bb.updatedAtMs)return aa;
    if(bb.updatedAtMs>aa.updatedAtMs)return bb;
    return aa.entries.length>=bb.entries.length?aa:bb;
  }
  function writeDedicated(bucket,emit=false){
    const b=normalize(bucket);
    try{localStorage.setItem(P4_KEY,JSON.stringify(b))}catch(e){console.warn("Falha ao salvar P4 local:",e)}
    if(emit)window.dispatchEvent(new CustomEvent("cgu-p4-changed",{detail:{updatedAtMs:b.updatedAtMs}}));
    return b;
  }
  function current(){return newer(readDedicated(),readLegacy())}

  function protectPlans(value){
    const plans={...(value||{})};
    const incoming=normalize(plans[LEGACY_META]);
    const dedicated=readDedicated();
    const chosen=newer(incoming,dedicated);
    if(chosen.updatedAtMs||chosen.entries.length){
      plans[LEGACY_META]=chosen;
      writeDedicated(chosen,false);
    }
    return plans;
  }

  function installWriterProtection(){
    const base=window.CGU_writeDailyPlans;
    if(typeof base!=="function"||base.__p4Protected)return false;
    const wrapped=function(v){return base(protectPlans(v));};
    wrapped.__p4Protected=true;
    wrapped.__p4Base=base;
    window.CGU_writeDailyPlans=wrapped;
    return true;
  }

  function syncLegacy(bucket=current(),emit=false){
    const b=normalize(bucket);
    writeDedicated(b,false);
    const plans=readPlansRaw();
    plans[LEGACY_META]=b;
    const writer=window.CGU_writeDailyPlans;
    if(typeof writer==="function")writer(plans);else writePlansRaw(plans);
    if(emit)window.dispatchEvent(new CustomEvent("cgu-p4-changed",{detail:{updatedAtMs:b.updatedAtMs}}));
    return b;
  }

  function saveBucket(bucket){
    const b=normalize({...bucket,updatedAtMs:Number(bucket?.updatedAtMs)||Date.now()});
    writeDedicated(b,false);
    syncLegacy(b,false);
    window.dispatchEvent(new CustomEvent("cgu-p4-changed",{detail:{updatedAtMs:b.updatedAtMs}}));
    return b;
  }

  // Migra automaticamente qualquer registro já existente no bloco legado.
  const migrated=current();
  if(migrated.updatedAtMs||migrated.entries.length)writeDedicated(migrated,false);

  // planner-balance define CGU_writeDailyPlans antes deste módulo; protege imediatamente.
  installWriterProtection();
  syncLegacy(current(),false);

  // Após a sincronização da nuvem, garante que a P4 continue espelhada no formato esperado pela UI antiga.
  window.addEventListener("cgu-cloud-ready",()=>{
    installWriterProtection();
    syncLegacy(current(),false);
    try{window.CGU_renderDiscursiveTracker?.()}catch(e){}
  });

  window.CGU_P4Store={
    key:P4_KEY,
    legacyKey:LEGACY_META,
    read:current,
    write:saveBucket,
    syncLegacy,
    protectPlans
  };
})();