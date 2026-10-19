/* Login real via Firebase Authentication.
   A tela pede apenas a senha; a conta autorizada não é exibida ao usuário. */
(() => {
  const gate = document.getElementById("authGate");
  const form = document.getElementById("authForm");
  const email = document.getElementById("authEmail");
  const password = document.getElementById("authPassword");
  const error = document.getElementById("authError");
  const button = document.getElementById("authButton");
  const googleButton = document.getElementById("googleAuthButton");
  const toggle = document.getElementById("toggleAuthPassword");

  // O e-mail continua existindo no HTML por compatibilidade, mas fica invisível e não é usado.
  if (email) {
    const field = email.closest(".auth-field");
    if (field) field.hidden = true;
    email.required = false;
    email.value = "";
    email.setAttribute("aria-hidden", "true");
    email.tabIndex = -1;
  }

  // Login Google foi removido deste fluxo: só a conta privada cadastrada por e-mail/senha é aceita.
  if (googleButton) googleButton.hidden = true;

  const title = document.getElementById("authTitle");
  if (title) title.textContent = "Acesso privado ao plano de estudos";
  const intro = gate?.querySelector(".auth-card > p");
  if (intro) intro.textContent = "Digite somente a senha da conta autorizada. O endereço de acesso não é exibido nesta tela.";
  const note = gate?.querySelector(".auth-note");
  if (note) note.textContent = "A senha nunca fica gravada no código. O acesso usa Firebase Authentication e os dados permanecem protegidos pelas regras do Firestore.";

  function setBusy(busy, text) {
    if (button) {
      button.disabled = !!busy;
      button.textContent = text || (busy ? "Entrando..." : "Entrar");
    }
  }

  function unlock(user) {
    document.body.classList.remove("auth-locked");
    if (gate) gate.hidden = true;
    if (password) password.value = "";
    renderFirebaseUser(user);
  }

  function lock() {
    document.body.classList.add("auth-locked");
    if (gate) gate.hidden = false;
    setBusy(false, "Entrar");
    setTimeout(() => password && password.focus(), 80);
  }

  function friendlyError(err) {
    const code = err && err.code ? err.code : "";
    if (code === "auth/missing-password") return "Informe a senha.";
    if (code === "auth/invalid-credential" || code === "auth/wrong-password" || code === "auth/user-not-found") return "Senha inválida.";
    if (code === "auth/too-many-requests") return "Muitas tentativas. Aguarde alguns minutos e tente novamente.";
    if (code === "auth/operation-not-allowed") return "Login por e-mail/senha ainda não foi habilitado no Firebase Authentication.";
    return "Não foi possível entrar. Confira a senha e a configuração do Firebase Authentication.";
  }

  function renderFirebaseUser(user) {
    const sidebar = document.querySelector(".sidebar-scroll") || document.querySelector(".sidebar");
    if (!sidebar) return;
    let box = document.getElementById("firebaseUserBox");
    if (!box) {
      box = document.createElement("div");
      box.id = "firebaseUserBox";
      box.className = "firebase-user-box";
      const backup = sidebar.querySelector(".backup");
      if (backup) backup.insertAdjacentElement("beforebegin", box);
      else sidebar.appendChild(box);
    }
    if (!user) {
      box.innerHTML = "";
      return;
    }
    box.innerHTML = `
      <div class="firebase-user-title">☁ Firebase</div>
      <div class="firebase-user-email">Conta autorizada</div>
      <div id="cloudStatus" class="firebase-cloud-status">Conectando...</div>
      <button type="button" id="firebaseLogout">Sair</button>
    `;
    document.getElementById("firebaseLogout")?.addEventListener("click", async () => {
      try { await window.FirebaseCGU.signOut(); } catch (e) { console.error(e); }
    });
  }

  window.addEventListener("cgu-cloud-status", ev => {
    const el = document.getElementById("cloudStatus");
    if (!el) return;
    const detail = ev.detail || {};
    el.textContent = detail.message || "Firebase";
    el.dataset.status = detail.status || "";
  });

  window.addEventListener("cgu-auth-denied", () => {
    if (error) error.textContent = "Conta não autorizada para este painel.";
    lock();
  });

  if (toggle && password) {
    toggle.addEventListener("click", () => {
      password.type = password.type === "password" ? "text" : "password";
      toggle.textContent = password.type === "password" ? "◉" : "◎";
      password.focus();
    });
  }

  if (form) {
    form.addEventListener("submit", async ev => {
      ev.preventDefault();
      if (!window.FirebaseCGU) return;
      error.textContent = "";
      setBusy(true, "Entrando...");
      try {
        await window.FirebaseCGU.signInPrivate(password.value);
      } catch (err) {
        error.textContent = friendlyError(err);
        setBusy(false, "Entrar");
      }
    });
  }

  async function init() {
    if (!window.FirebaseCGU) {
      if (error) error.textContent = "Firebase não foi carregado.";
      return;
    }
    try {
      await window.FirebaseCGU.ready;
      window.FirebaseCGU.onUser(user => {
        if (user) unlock(user);
        else {
          renderFirebaseUser(null);
          lock();
        }
      });
    } catch (err) {
      if (error) error.textContent = "Falha ao conectar ao Firebase. Verifique sua internet e a configuração do projeto.";
      lock();
    }
  }

  init();
})();