// ===============================
// 🔐 LOGIN DO USUÁRIO
// ===============================
const API_URL = "http://localhost:3001/api";
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

    // Evita múltiplos cliques
    btnLogin.disabled = true;
    btnLogin.textContent = "Entrando...";
    btnLogin.classList.add("loading");   // <--- ATIVA SPINNER

    try {
        console.log("📡 Enviando para API...");

        const response = await fetch(`${API_URL}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, senha })
        });

        const data = await response.json();
        console.log("📥 Resposta:", data);

        // 🔎 Tratamento de erros
        if (!data.success) {
            if (response.status === 401) {
                alert("❌ Usuário ou senha incorretos!");
            } else if (response.status === 404) {
                alert("❌ Usuário não encontrado!");
            } else {
                alert(data.message || "⚠️ Erro ao realizar login.");
            }
            return;
        }

        // 🎉 LOGIN OK
        alert(`👋 Bem-vindo(a) de volta, ${data.usuario.nome}!`);

        // ===============================
        // 🔐 AQUI está o código que você pediu:
        // ===============================
        if (data.success && data.usuario) {
            localStorage.setItem("usuarioLogado", JSON.stringify({
                id: data.usuario.id,
                nome: data.usuario.nome,
                email: data.usuario.email,
                tipo: data.usuario.tipo_usuario
            }));

            window.location.href = "index.html"; // <<--- SEU REDIRECIONAMENTO
            return; // garante que nada após isso execute
        }

    } catch (error) {
        console.error("❌ Erro de conexão:", error);
        alert("⚠️ Erro ao conectar com servidor. A API está rodando?");
    } finally {
        btnLogin.disabled = false;
        btnLogin.textContent = "Entrar";
        btnLogin.classList.remove("loading");
    }
});


// ===============================
// 🚪 CARREGAMENTO DA PÁGINA
// ===============================
document.addEventListener("DOMContentLoaded", () => {
    console.log("🚪 Página de login carregada.");
});
