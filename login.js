// ===============================
// 🔐 LOGIN DO USUÁRIO (PRODUÇÃO)
// ===============================

// 🔗 SUA API NO RAILWAY
const API_URL = "https://balanced-fascination.up.railway.app/api";

const formLogin = document.getElementById("formLogin");
const btnLogin = document.getElementById("btnLogin");

formLogin.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const senha = document.getElementById("senha").value.trim();

    if (!email || !senha) {
        alert("⚠️ Preencha todos os campos.");
        return;
    }

    // 🔄 Evita múltiplos cliques
    btnLogin.disabled = true;
    btnLogin.textContent = "Entrando...";
    btnLogin.classList.add("loading");

    try {
        console.log("📡 Enviando dados para API...");

        const response = await fetch(`${API_URL}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, senha })
        });

        const data = await response.json();
        console.log("📥 Resposta da API:", data);

        // ❌ ERROS
        if (!data.success) {
            if (response.status === 401) {
                alert("❌ Usuário ou senha incorretos!");
            } else if (response.status === 404) {
                alert("❌ Usuário não encontrado!");
            } else {
                alert(data.message || "⚠️ Erro ao fazer login.");
            }
            return;
        }

        // 🎉 LOGIN CORRETO
        alert(`👋 Bem-vindo(a), ${data.usuario.nome}!`);

        // 🔐 Salvar usuário no localStorage
        localStorage.setItem("usuarioLogado", JSON.stringify({
            id: data.usuario.id,
            nome: data.usuario.nome,
            email: data.usuario.email,
            tipo: data.usuario.tipo_usuario
        }));

        // 🚀 Redirecionar para homepage
        window.location.href = "index.html";
        return;

    } catch (error) {
        console.error("❌ Erro de conexão:", error);
        alert("⚠️ Erro ao conectar com o servidor. A API está ativa no Railway?");
    } finally {
        btnLogin.disabled = false;
        btnLogin.textContent = "Entrar";
        btnLogin.classList.remove("loading");
    }
});


// ===============================
// 🚪 AO CARREGAR A PÁGINA
// ===============================
document.addEventListener("DOMContentLoaded", () => {
    console.log("🚪 Página de login carregada.");
});
