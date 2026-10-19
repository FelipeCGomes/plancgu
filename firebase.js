/* Firebase: autenticação real + persistência em nuvem.
   O firebaseConfig é público por design; a segurança está no Firebase Auth + Firestore Rules.
   A conta permitida não fica gravada como texto legível no HTML/JS. */
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

  // SHA-256 do e-mail autorizado. O endereço em si não fica exposto como string no código.
  const ALLOWED_EMAIL_HASH = "2c63bb36f75ebba101b6513bca5fc74fda0b5abcd54ea90767457193e7e22126";

  // O Firebase Auth por e-mail/senha precisa receber o endereço em tempo de execução.
  // Os bytes abaixo evitam exposição casual em texto claro, mas NÃO devem ser tratados como segredo criptográfico.
  const PRIVATE_LOGIN_BYTES = [102,108,112,100,97,99,111,115,116,97,103,111,109,101,115,64,103,109,97,105,108,46,99,111,109];

  const userListeners = new Set();
  let app = null;
  let auth = null;
  let db = null;
  let authMod = null;
  let fsMod = null;
  let currentUser;
  let syncEnabled = false;
  let syncTimer = null;
  let authCheckRunning = false;

  function emitStatus(status, message) {
    window.dispatchEvent(new CustomEvent("cgu-cloud-status", { detail: { status, message } }));
  }

  function privateLoginEmail() {
    return new TextDecoder().decode(new Uint8Array(PRIVATE_LOGIN_BYTES));
  }

  async function sha256(text) {
    const bytes = new TextEncoder().encode(String(text || "").trim().toLowerCase());
    const digest = await crypto.subtle.digest("SHA-256", bytes);
    return Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, "0")).join("");
  }

  async function isAllowedUser(user) {
    if (!user || !user.email || !window.crypto || !crypto.subtle) return false;
    return (await sha256(user.email)) === ALLOWED_EMAIL_HASH;
  }

  function notifyUser(user) {
    currentUser = user || null;
    userListeners.forEach(fn => {
      try { fn(currentUser); } catch (e) { console.error(e); }
    });
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

      authModule.onAuthStateChanged(auth, async (user) => {
        if (authCheckRunning) return;
        authCheckRunning = true;
        try {
          if (!user) {
            syncEnabled = false;
            notifyUser(null);
            emitStatus("signed-out", "Desconectado");
            return;
          }

          const allowed = await isAllowedUser(user);
          if (!allowed) {
            syncEnabled = false;
            notifyUser(null);
            emitStatus("denied", "Conta não autorizada");
            await authModule.signOut(auth);
            window.dispatchEvent(new CustomEvent("cgu-auth-denied"));
            return;
          }

          notifyUser(user);
          emitStatus("online", "Conectado ao Firebase");
        } finally {
          authCheckRunning = false;
        }
      });

      return { app, auth, db };
    } catch (error) {
      console.error("Falha ao inicializar Firebase:", error);
      currentUser = null;
      emitStatus("error", "Falha ao conectar ao Firebase");
      throw error;
    }
  })();

  async function signInPrivate(password) {
    await ready;
    return authMod.signInWithEmailAndPassword(auth, privateLoginEmail(), password);
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
    signInPrivate,
    signOut: signOutUser,
    readState,
    writeState,
    scheduleSync,
    enableSync,
    disableSync,
    isAllowedUser,
    get currentUser() { return currentUser || null; },
    get projectId() { return firebaseConfig.projectId; }
  };
})();