/* Sincronização do estado do plano com Firestore.
   Firestore é a fonte compartilhada; localStorage continua como cache/offline. */
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
      version: 5,
      state,
      settings,
      lessonState,
      adaptiveFlow: readAdaptiveFlowForCloud(),
      updatedAtMs
    };
  }

  function persistLocalSnapshot(snapshot, timestamp) {
    state = snapshot.state || {};
    settings = { ...DEFAULT_META, ...(snapshot.settings || {}) };
    lessonState = snapshot.lessonState || {};

    try {
      if (snapshot.adaptiveFlow) {
        localStorage.setItem(KEY + "-adaptive-flow-v2", JSON.stringify(snapshot.adaptiveFlow));
      } else {
        localStorage.removeItem(KEY + "-adaptive-flow-v2");
      }
      localStorage.setItem(KEY, JSON.stringify({
        version: 5,
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
    baseSave(silent);
    const now = Date.now();
    try { localStorage.setItem(CLOUD_META_KEY, String(now)); } catch (e) {}
    if (!applyingCloud && window.FirebaseCGU) {
      window.FirebaseCGU.scheduleSync(snapshotForCloud(now));
    }
  };

  async function initialCloudSync(user) {
    if (!user || !window.FirebaseCGU) return;

    try {
      window.FirebaseCGU.disableSync();
      const remote = await window.FirebaseCGU.readState();
      const boundUser = localStorage.getItem(CLOUD_USER_KEY);
      const localTimestamp = Number(localStorage.getItem(CLOUD_META_KEY) || 0);

      if (!remote) {
        const now = localTimestamp || Date.now();
        await window.FirebaseCGU.writeState(snapshotForCloud(now));
        localStorage.setItem(CLOUD_USER_KEY, user.uid);
        localStorage.setItem(CLOUD_META_KEY, String(now));
      } else {
        const remoteTimestamp = Number(remote.updatedAtMs || 0);
        const sameKnownUser = boundUser === user.uid;

        if (sameKnownUser && localTimestamp > remoteTimestamp) {
          await window.FirebaseCGU.writeState(snapshotForCloud(localTimestamp));
        } else {
          applyingCloud = true;
          persistLocalSnapshot(remote, remoteTimestamp || Date.now());
          applyingCloud = false;
          if (typeof renderAll === "function") renderAll();
          if (typeof renderPerformancePanel === "function") renderPerformancePanel();
        }

        localStorage.setItem(CLOUD_USER_KEY, user.uid);
      }

      window.FirebaseCGU.enableSync();
      window.dispatchEvent(new CustomEvent("cgu-cloud-ready", { detail: { uid: user.uid } }));
    } catch (error) {
      applyingCloud = false;
      console.error("Falha na sincronização inicial:", error);
      window.FirebaseCGU.enableSync();
      if (typeof toast === "function") {
        toast("Firebase indisponível: usando dados salvos neste navegador.");
      }
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
