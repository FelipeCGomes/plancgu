/* Sincronização do estado do plano com Firestore.
   Firestore é a fonte compartilhada; localStorage continua como cache/offline.
   A sincronização preserva o registro mais recente por tópico para evitar telas divergentes. */
(() => {
  const CLOUD_META_KEY = KEY + "-cloud-meta-v1";
  const CLOUD_USER_KEY = KEY + "-cloud-user-v1";
  let applyingCloud = false;
  const baseSave = save;

  function readAdaptiveFlowForCloud() {
    try {
      return JSON.parse(localStorage.getItem(KEY + "-adaptive-flow-v2") || "null");
    } catch (e) {
      return null;
    }
  }

  function snapshotForCloud(updatedAtMs = Date.now()) {
    return {
      version: 6,
      state,
      settings,
      lessonState,
      adaptiveFlow: readAdaptiveFlowForCloud(),
      updatedAtMs
    };
  }

  function stateHasProgress(obj){
    return Object.values(obj||{}).some(v=>Number(v?.questoes)>0 || Number(v?.acertos)>0 || Number(v?.erros)>0 || Number(v?.brancos)>0 || !!v?.done);
  }

  function topicScore(v){
    return (Number(v?.questoes)||0)+(Number(v?.acertos)||0)+(Number(v?.erros)||0)+(Number(v?.brancos)||0)+(v?.done?1:0);
  }

  function mergeTopic(localItem,remoteItem,localFallback,remoteFallback){
    if(!localItem)return remoteItem;
    if(!remoteItem)return localItem;
    const lt=Number(localItem.updatedAtMs)||Number(localFallback)||0;
    const rt=Number(remoteItem.updatedAtMs)||Number(remoteFallback)||0;
    if(lt>rt)return localItem;
    if(rt>lt)return remoteItem;
    // Migração de versões antigas sem timestamp por tópico: preserva o registro mais completo.
    return topicScore(localItem)>=topicScore(remoteItem)?localItem:remoteItem;
  }

  function mergeSnapshots(localSnap,remoteSnap){
    const lt=Number(localSnap?.updatedAtMs)||0;
    const rt=Number(remoteSnap?.updatedAtMs)||0;
    const mergedState={};
    const keys=new Set([...Object.keys(localSnap?.state||{}),...Object.keys(remoteSnap?.state||{})]);
    keys.forEach(k=>{mergedState[k]=mergeTopic(localSnap?.state?.[k],remoteSnap?.state?.[k],lt,rt)});
    const localNewer=lt>=rt;
    return {
      version:6,
      state:mergedState,
      settings:{...DEFAULT_META,...(localNewer?(localSnap?.settings||{}):(remoteSnap?.settings||{}))},
      lessonState:localNewer?(localSnap?.lessonState||{}):(remoteSnap?.lessonState||{}),
      adaptiveFlow:localNewer?(localSnap?.adaptiveFlow||null):(remoteSnap?.adaptiveFlow||null),
      updatedAtMs:Math.max(lt,rt,Date.now())
    };
  }

  function persistLocalSnapshot(snapshot, timestamp) {
    state = snapshot.state || {};
    settings = { ...DEFAULT_META, ...(snapshot.settings || {}) };
    lessonState = snapshot.lessonState || {};

    if(typeof ensureKnownHistory==="function")ensureKnownHistory();

    try {
      if (snapshot.adaptiveFlow) {
        localStorage.setItem(KEY + "-adaptive-flow-v2", JSON.stringify(snapshot.adaptiveFlow));
      } else {
        localStorage.removeItem(KEY + "-adaptive-flow-v2");
      }
      localStorage.setItem(KEY, JSON.stringify({
        version: 6,
        state,
        settings,
        lessonState
      }));
      localStorage.setItem(CLOUD_META_KEY, String(Number(timestamp) || Date.now()));
    } catch (e) {
      console.warn("Falha ao atualizar cache local:", e);
    }
  }

  save = function(silent = true) {
    if(typeof ensureKnownHistory==="function")ensureKnownHistory();
    baseSave(silent);
    const now = Date.now();
    try { localStorage.setItem(CLOUD_META_KEY, String(now)); } catch (e) {}
    window.dispatchEvent(new CustomEvent("cgu-state-saved",{detail:{updatedAtMs:now}}));
    if (!applyingCloud && window.FirebaseCGU) {
      window.FirebaseCGU.scheduleSync(snapshotForCloud(now));
    }
  };

  async function initialCloudSync(user) {
    if (!user || !window.FirebaseCGU) return;

    try {
      window.FirebaseCGU.disableSync();
      const localTimestampBefore=Number(localStorage.getItem(CLOUD_META_KEY)||0);
      const localBefore=snapshotForCloud(localTimestampBefore||Date.now());
      const remote = await window.FirebaseCGU.readState();
      const localTimestampNow=Number(localStorage.getItem(CLOUD_META_KEY)||0);
      const localNow=snapshotForCloud(localTimestampNow||localBefore.updatedAtMs);

      if (!remote) {
        if(typeof ensureKnownHistory==="function")ensureKnownHistory();
        const now=Date.now();
        const snap=snapshotForCloud(now);
        await window.FirebaseCGU.writeState(snap);
        persistLocalSnapshot(snap,now);
      } else {
        const merged=mergeSnapshots(localNow,remote);
        applyingCloud=true;
        persistLocalSnapshot(merged,merged.updatedAtMs);
        applyingCloud=false;
        await window.FirebaseCGU.writeState(merged);
      }

      localStorage.setItem(CLOUD_USER_KEY, user.uid);
      window.FirebaseCGU.enableSync();
      if (typeof renderAll === "function") renderAll();
      if (typeof renderPerformancePanel === "function") renderPerformancePanel();
      window.dispatchEvent(new CustomEvent("cgu-cloud-ready", { detail: { uid: user.uid } }));
    } catch (error) {
      applyingCloud = false;
      console.error("Falha na sincronização inicial:", error);
      window.FirebaseCGU.enableSync();
      if(typeof ensureKnownHistory==="function")ensureKnownHistory();
      if (typeof renderAll === "function") renderAll();
      if (typeof toast === "function") toast("Firebase indisponível: usando dados salvos neste navegador.");
    }
  }

  window.addEventListener("load", () => {
    if (!window.FirebaseCGU) return;
    window.FirebaseCGU.onUser(user => {
      if (user) initialCloudSync(user);
      else window.FirebaseCGU.disableSync();
    });
  });
})();
