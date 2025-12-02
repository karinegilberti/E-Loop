// === URLs DO BACKEND (VERSÃO RAILWAY) ===
const API_BASE = "https://balanced-fascination-production.up.railway.app";

const API_URL_RECUPERAR = `${API_BASE}/api/recuperar-senha`;
const API_URL_REDEFINIR = `${API_BASE}/api/redefinir-senha`;

// === ELEMENTOS ===
const formEmail = document.getElementById("form-email");
const formRedefinir = document.getElementById("form-redefinir");
const mensagem = document.getElementById("mensagem");
const btnLogin = document.getElementById("btn-login");
const titulo = document.getElementById("titulo");
const descricao = document.getElementById("descricao");

// === TOKEN ===
const token = new URLSearchParams(window.location.search).get("token");

// ===================== MODO 1: RECUPERAR =====================
if (!token) {
  formEmail.classList.remove("hidden");

  formEmail.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value.trim();

    const resp = await fetch(API_URL_RECUPERAR, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await resp.json();
    mensagem.textContent = data.message;
    mensagem.style.color = data.success ? "green" : "red";
  });
}

// ===================== MODO 2: REDEFINIR =====================
if (token) {
  titulo.textContent = "Redefinir Senha";
  descricao.textContent = "Digite sua nova senha";
  formEmail.classList.add("hidden");
  formRedefinir.classList.remove("hidden");

  formRedefinir.addEventListener("submit", async (e) => {
    e.preventDefault();
    const novaSenha = document.getElementById("nova-senha").value.trim();

    const resp = await fetch(API_URL_REDEFINIR, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, novaSenha }),
    });

    const data = await resp.json();
    mensagem.textContent = data.message;
    mensagem.style.color = data.success ? "green" : "red";

    if (data.success) {
      formRedefinir.classList.add("hidden");
      btnLogin.classList.remove("hidden");
    }
  });
}
