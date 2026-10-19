/* Firebase: autenticação real + persistência em nuvem.
   O firebaseConfig é público por design; a segurança está no Firebase Auth + Firestore Rules. */
(() => {
  const firebaseConfig = {
    apiKey: "AIzaSyAOrJl7WX6YaKGsjPAfPPMTByk-a7Y9Hi0",
    authDomain: "cgu-plan.firebaseapp.com",
    projectId: "cgu-plan",
    storageBucket: "cgu-plan.firebasestorage.app",
    messagingSenderId: "852220074743",
    appId: "1:852220074743:web:79ea0e296fa427772a11f2",
    measurementId: "G-3VCY0T63Q1"
  };

  const SDK = "13.0.0";
  const userListeners = new Set();
  let app = null;
  let auth = null;
  let db = null;
  let authMod = null;
  let fsMod = null;
  let currentUser;
  let syncEnabled = false;
  let syncTimer = null;

  function emitStatus(status, message) {
    window.dispatchEvent(new CustomEvent("cgu-cloud-status", { detail: { status, message } }));
  }

  const ready = (async () => {
    try {
      const [appModule, authModule, firestoreModule] = await Promise.all([
        import(`https://www.gstatic.com/firebasejs/${SDK}/firebase-app.js`),
        import(`https://www.gstatic.com/firebasejs/${SDK}/firebase-auth.js`),
        import(`https://www.gstatic.com/firebasejs/${SDK}/firebase-firestore.js`)
      ]);

      authMod = authModule;
      fsMod = firestoreModule;
      app = appModule.initializeApp(firebaseConfig);
      auth = authModule.getAuth(app);
      db = firestoreModule.getFirestore(app);

      authModule.onAuthStateChanged(auth, (user) => {
        currentUser = user || null;
        userListeners.forEach(fn => {
          try { fn(currentUser); } catch (e) { console.error(e); }
        });
        emitStatus(user ? "online" : "signed-out", user ? "Conectado ao Firebase" : "Desconectado");
      });

      return { app, auth, db };
    } catch (error) {
      console.error("Falha ao inicializar Firebase:", error);
      currentUser = null;
      emitStatus("error", "Falha ao conectar ao Firebase");
      throw error;
    }
  })();

  async function signInEmail(email, password) {
    await ready;
    return authMod.signInWithEmailAndPassword(auth, email.trim(), password);
  }

  async function signInGoogle() {
    await ready;
    const provider = new authMod.GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });
    return authMod.signInWithPopup(auth, provider);
  }

  async function signOutUser() {
    await ready;
    syncEnabled = false;
    return authMod.signOut(auth);
  }

  function onUser(callback) {
    userListeners.add(callback);
    if (currentUser !== undefined) {
      Promise.resolve().then(() => callback(currentUser));
    }
    return () => userListeners.delete(callback);
  }

  function stateRef() {
    if (!currentUser) throw new Error("Usuário não autenticado");
    return fsMod.doc(db, "users", currentUser.uid, "app", "state");
  }

  function sanitize(value) {
    return JSON.parse(JSON.stringify(value));
  }

  async function readState() {
    await ready;
    if (!currentUser) return null;
    emitStatus("syncing", "Carregando dados da nuvem...");
    const snap = await fsMod.getDoc(stateRef());
    emitStatus("online", snap.exists() ? "Dados sincronizados" : "Primeiro acesso: preparando nuvem");
    return snap.exists() ? snap.data() : null;
  }

  async function writeState(snapshot) {
    await ready;
    if (!currentUser) return false;
    const clean = sanitize(snapshot || {});
    const updatedAtMs = Number(clean.updatedAtMs) || Date.now();
    emitStatus("syncing", "Salvando na nuvem...");
    await fsMod.setDoc(stateRef(), {
      ...clean,
      updatedAtMs,
      updatedAt: fsMod.serverTimestamp()
    }, { merge: false });
    emitStatus("online", "Sincronizado agora");
    return true;
  }

  function scheduleSync(snapshot, delay = 700) {
    if (!syncEnabled || !currentUser) return;
    const clean = sanitize(snapshot || {});
    clearTimeout(syncTimer);
    syncTimer = setTimeout(() => {
      writeState(clean).catch(error => {
        console.error("Erro ao sincronizar Firestore:", error);
        emitStatus("error", "Não foi possível sincronizar; dados mantidos neste navegador");
      });
    }, Math.max(0, delay));
  }

  function enableSync() {
    syncEnabled = true;
  }

  function disableSync() {
    syncEnabled = false;
    clearTimeout(syncTimer);
  }

  window.FirebaseCGU = {
    ready,
    onUser,
    signInEmail,
    signInGoogle,
    signOut: signOutUser,
    readState,
    writeState,
    scheduleSync,
    enableSync,
    disableSync,
    get currentUser() { return currentUser || null; },
    get projectId() { return firebaseConfig.projectId; }
  };
})();
