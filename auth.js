(() => {
  const EXPECTED_HASH = "5a3b5b4be8e4cb50361ae8a19bcfc470c213972be8aa5b2ec828b05e243deb15";
  const SESSION_KEY = "cgu3_authenticated_v1";
  const ATTEMPT_KEY = "cgu3_auth_attempts_v1";
  const BLOCK_KEY = "cgu3_auth_block_until_v1";

  const gate = document.getElementById("authGate");
  const form = document.getElementById("authForm");
  const input = document.getElementById("authPassword");
  const error = document.getElementById("authError");
  const button = document.getElementById("authButton");
  const toggle = document.getElementById("toggleAuthPassword");

  function unlock() {
    sessionStorage.setItem(SESSION_KEY, "1");
    document.body.classList.remove("auth-locked");
    gate.hidden = true;
    input.value = "";
  }

  function lockMessage() {
    const until = Number(localStorage.getItem(BLOCK_KEY) || 0);
    const now = Date.now();
    if (until > now) {
      const sec = Math.ceil((until - now) / 1000);
      error.textContent = `Muitas tentativas. Aguarde ${sec}s.`;
      button.disabled = true;
      setTimeout(lockMessage, 1000);
      return true;
    }
    button.disabled = false;
    return false;
  }

  async function sha256(text) {
    const data = new TextEncoder().encode(text);
    const digest = await crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2,"0")).join("");
  }

  async function validatePassword(value) {
    if (!window.crypto || !crypto.subtle) {
      error.textContent = "Este navegador não oferece o recurso seguro necessário. Abra a página via HTTPS.";
      return false;
    }
    return (await sha256(value)) === EXPECTED_HASH;
  }

  if (sessionStorage.getItem(SESSION_KEY) === "1") {
    document.body.classList.remove("auth-locked");
    gate.hidden = true;
  } else {
    setTimeout(() => input.focus(), 60);
    lockMessage();
  }

  toggle.addEventListener("click", () => {
    input.type = input.type === "password" ? "text" : "password";
    toggle.textContent = input.type === "password" ? "◉" : "◎";
    input.focus();
  });

  form.addEventListener("submit", async (ev) => {
    ev.preventDefault();
    if (lockMessage()) return;
    button.disabled = true;
    error.textContent = "Verificando...";
    try {
      const ok = await validatePassword(input.value);
      if (ok) {
        localStorage.removeItem(ATTEMPT_KEY);
        localStorage.removeItem(BLOCK_KEY);
        error.textContent = "";
        unlock();
        return;
      }
      const attempts = Number(localStorage.getItem(ATTEMPT_KEY) || 0) + 1;
      localStorage.setItem(ATTEMPT_KEY, String(attempts));
      input.value = "";
      if (attempts >= 5) {
        localStorage.setItem(BLOCK_KEY, String(Date.now() + 30000));
        localStorage.setItem(ATTEMPT_KEY, "0");
        lockMessage();
      } else {
        error.textContent = `Senha incorreta. Tentativa ${attempts} de 5.`;
        button.disabled = false;
        input.focus();
      }
    } catch (e) {
      error.textContent = "Não foi possível validar a senha. Abra a página via HTTPS.";
      button.disabled = false;
    }
  });
})();
