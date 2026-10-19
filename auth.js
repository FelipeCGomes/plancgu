/* Login real via Firebase Authentication. Nenhuma senha fica no código do site. */
(() => {
  const gate = document.getElementById("authGate");
  const form = document.getElementById("authForm");
  const email = document.getElementById("authEmail");
  const password = document.getElementById("authPassword");
  const error = document.getElementById("authError");
  const button = document.getElementById("authButton");
  const googleButton = document.getElementById("googleAuthButton");
  const toggle = document.getElementById("toggleAuthPassword");

  function setBusy(busy, text) {
    if (button) {
      button.disabled = !!busy;
      button.textContent = text || (busy ? "Entrando..." : "Entrar");
    }
    if (googleButton) googleButton.disabled = !!busy;
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
    setTimeout(() => email && email.focus(), 80);
  }

  function friendlyError(err) {
    const code = err && err.code ? err.code : "";
    if (code === "auth/invalid-email") return "E-mail inválido.";
    if (code === "auth/missing-password") return "Informe a senha.";
    if (code === "auth/invalid-credential" || code === "auth/wrong-password" || code === "auth/user-not-found") return "E-mail ou senha inválidos.";
    if (code === "auth/too-many-requests") return "Muitas tentativas. Aguarde alguns minutos e tente novamente.";
    if (code === "auth/popup-closed-by-user") return "Login com Google cancelado.";
    if (code === "auth/popup-blocked") return "O navegador bloqueou a janela do Google. Libere pop-ups e tente novamente.";
    if (code === "auth/operation-not-allowed") return "Este método de login ainda não foi habilitado no Firebase Authentication.";
    return "Não foi possível entrar. Confira o Firebase Authentication e tente novamente.";
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
    const label = user.displayName || user.email || "Usuário autenticado";
    box.innerHTML = `
      <div class="firebase-user-title">☁ Firebase</div>
      <div class="firebase-user-email">${escapeAuth(label)}</div>
      <div id="cloudStatus" class="firebase-cloud-status">Conectando...</div>
      <button type="button" id="firebaseLogout">Sair</button>
    `;
    document.getElementById("firebaseLogout")?.addEventListener("click", async () => {
      try { await window.FirebaseCGU.signOut(); } catch (e) { console.error(e); }
    });
  }

  function escapeAuth(value) {
    return String(value || "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
  }

  window.addEventListener("cgu-cloud-status", ev => {
    const el = document.getElementById("cloudStatus");
    if (!el) return;
    const detail = ev.detail || {};
    el.textContent = detail.message || "Firebase";
    el.dataset.status = detail.status || "";
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
        await window.FirebaseCGU.signInEmail(email.value, password.value);
      } catch (err) {
        error.textContent = friendlyError(err);
        setBusy(false, "Entrar");
      }
    });
  }

  if (googleButton) {
    googleButton.addEventListener("click", async () => {
      error.textContent = "";
      setBusy(true, "Abrindo Google...");
      try {
        await window.FirebaseCGU.signInGoogle();
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
