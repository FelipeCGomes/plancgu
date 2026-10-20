/* Sincronização Firestore v8.
   Fonte única: state[topicId] + dailyPlans. LocalStorage funciona como cache/offline. */
(() => {
  const CLOUD_META_KEY=KEY+"-cloud-meta-v1";
  const CLOUD_USER_KEY=KEY+"-cloud-user-v1";
  const PLAN_KEY=KEY+"-daily-plans-v1";
  let applyingCloud=false;
  const baseSave=save;

  function readPlans(){try{return JSON.parse(localStorage.getItem(PLAN_KEY)||"{}")||{}}catch(e){return {}}}
  function writePlans(v){try{localStorage.setItem(PLAN_KEY,JSON.stringify(v||{}));}catch(e){}}
  function snapshot(updatedAtMs=Date.now()){
    return {version:8,state,settings,lessonState,dailyPlans:readPlans(),updatedAtMs};
  }

  function topicScore(v){return (Number(v?.questoes)||0)+(Number(v?.acertos)||0)+(Number(v?.erros)||0)+(Number(v?.brancos)||0)+(v?.done?1:0);}
  function mergeTopic(l,r,lf,rf){
    if(!l)return r;if(!r)return l;
    const lt=Number(l.updatedAtMs)||Number(lf)||0,rt=Number(r.updatedAtMs)||Number(rf)||0;
    if(lt>rt)return l;if(rt>lt)return r;
    return topicScore(l)>=topicScore(r)?l:r;
  }
  function mergePlans(l={},r={}){
    const out={};const keys=new Set([...Object.keys(l),...Object.keys(r)]);
    keys.forEach(k=>{
      const a=l[k],b=r[k];if(!a)out[k]=b;else if(!b)out[k]=a;else out[k]=(Number(a.updatedAtMs)||0)>=(Number(b.updatedAtMs)||0)?a:b;
    });
    return out;
  }
  function mergeSnapshots(local,remote){
    const lt=Number(local?.updatedAtMs)||0,rt=Number(remote?.updatedAtMs)||0;
    const mergedState={},keys=new Set([...Object.keys(local?.state||{}),...Object.keys(remote?.state||{})]);
    keys.forEach(k=>mergedState[k]=mergeTopic(local?.state?.[k],remote?.state?.[k],lt,rt));
    const localNewer=lt>=rt;
    return {
      version:8,
      state:mergedState,
      settings:{...DEFAULT_META,...(localNewer?(local?.settings||{}):(remote?.settings||{}))},
      lessonState:localNewer?(local?.lessonState||{}):(remote?.lessonState||{}),
      dailyPlans:mergePlans(local?.dailyPlans||{},remote?.dailyPlans||{}),
      updatedAtMs:Math.max(lt,rt,Date.now())
    };
  }

  function persist(snap,timestamp){
    state=snap.state||{};
    settings={...DEFAULT_META,...(snap.settings||{})};
    lessonState=snap.lessonState||{};
    if(typeof ensureKnownHistory==="function")ensureKnownHistory();
    writePlans(snap.dailyPlans||{});
    try{
      localStorage.setItem(KEY,JSON.stringify({version:8,state,settings,lessonState}));
      localStorage.setItem(CLOUD_META_KEY,String(Number(timestamp)||Date.now()));
    }catch(e){console.warn("Falha ao persistir cache local:",e);}
  }

  save=function(silent=true){
    if(typeof ensureKnownHistory==="function")ensureKnownHistory();
    baseSave(silent);
    const now=Date.now();
    try{localStorage.setItem(CLOUD_META_KEY,String(now));}catch(e){}
    window.dispatchEvent(new CustomEvent("cgu-state-saved",{detail:{updatedAtMs:now}}));
    if(!applyingCloud&&window.FirebaseCGU)window.FirebaseCGU.scheduleSync(snapshot(now));
  };

  window.addEventListener("cgu-plan-changed",()=>{
    if(applyingCloud||!window.FirebaseCGU)return;
    const now=Date.now();
    try{localStorage.setItem(CLOUD_META_KEY,String(now));}catch(e){}
    window.FirebaseCGU.scheduleSync(snapshot(now));
  });

  async function initialCloudSync(user){
    if(!user||!window.FirebaseCGU)return;
    try{
      window.FirebaseCGU.disableSync();
      const localTs=Number(localStorage.getItem(CLOUD_META_KEY)||0);
      const local=snapshot(localTs||Date.now());
      const remote=await window.FirebaseCGU.readState();
      let merged;
      if(!remote)merged=local;
      else merged=mergeSnapshots(local,remote);
      applyingCloud=true;persist(merged,merged.updatedAtMs);applyingCloud=false;
      await window.FirebaseCGU.writeState(merged);
      localStorage.setItem(CLOUD_USER_KEY,user.uid);
      window.FirebaseCGU.enableSync();
      if(typeof renderAll==="function")renderAll();
      if(typeof renderPerformancePanel==="function")renderPerformancePanel();
      window.dispatchEvent(new CustomEvent("cgu-cloud-ready",{detail:{uid:user.uid}}));
    }catch(error){
      applyingCloud=false;console.error("Falha na sincronização inicial:",error);
      window.FirebaseCGU.enableSync();
      if(typeof ensureKnownHistory==="function")ensureKnownHistory();
      if(typeof renderAll==="function")renderAll();
      if(typeof toast==="function")toast("Firebase indisponível: usando dados salvos neste navegador.");
    }
  }

  window.addEventListener("load",()=>{
    if(!window.FirebaseCGU)return;
    window.FirebaseCGU.onUser(user=>{if(user)initialCloudSync(user);else window.FirebaseCGU.disableSync();});
  });
})();
