// ============================
// 📝 Cadastro com Backend + CEP + Correções
// ============================

// URL da sua API
const API_URL = "http://localhost:3001/api/cadastro";

window.addEventListener("DOMContentLoaded", () => {
  const cepInput = document.getElementById("cep");
  const estadoInput = document.getElementById("estado");
  const cidadeInput = document.getElementById("cidade");
  const form = document.getElementById("formCadastro");
  const btn = document.querySelector(".btn-cadastrar");

  // ============================
  // 📌 Buscar CEP via ViaCEP
  // ============================
  cepInput.addEventListener("blur", async () => {
    const cep = cepInput.value.replace(/\D/g, "");
    if (cep.length !== 8) return alert("CEP inválido. Digite 8 números.");

    try {
      const resposta = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const dados = await resposta.json();

      if (dados.erro) {
        cidadeInput.value = "";
        estadoInput.value = "";
        return alert("CEP não encontrado!");
      }

      cidadeInput.value = dados.localidade;
      estadoInput.value = dados.uf;

    } catch (err) {
      console.error(err);
      alert("Erro ao consultar o CEP. Tente novamente.");
    }
  });

  // ============================
  // 📌 Enviar Cadastro para API
  // ============================
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    btn.disabled = true;
    btn.classList.add("loading");
    btn.textContent = "Cadastrando...";

    const nome = document.getElementById("nome").value.trim();
    const email = document.getElementById("email").value.trim();
    const dataNascimento = document.getElementById("dataNascimento").value;

    // 🔧 REMOVE MÁSCARAS
    const cpf = document.getElementById("cpf").value.replace(/\D/g, "");
    const telefone = document.getElementById("telefone").value.replace(/\D/g, "");

    const estado = estadoInput.value.trim();
    const cidade = cidadeInput.value.trim();
    const senha = document.getElementById("senha").value;
    const confirmarSenha = document.getElementById("confirmarSenha").value;

    if (senha !== confirmarSenha) {
      alert("As senhas não coincidem!");
      resetButton();
      return;
    }

    try {
      console.log({
        nome,
        email,
        dataNascimento,
        cpf,
        telefone,
        cidade,
        estado,
        senha
      });

      const resp = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome,
          email,
          dataNascimento,
          cpf,
          telefone,
          cidade,
          estado,
          senha
        })
      });

      const dados = await resp.json();

      // ❌ Erros da API
      if (!resp.ok) {

        // E-mail ou CPF já existe
        if (resp.status === 409) {
          alert(dados.message || "⚠️ Este e-mail já está cadastrado!");
          resetButton();
          return;
        }

        alert(dados.message || "Erro ao cadastrar usuário!");
        resetButton();
        return;
      }

      // ✅ Sucesso
      alert("🎉 Cadastro realizado com sucesso!");
      form.reset();
      window.location.href = "login.html";

    } catch (error) {
      console.error("Erro ao cadastrar:", error);
      alert("Erro ao conectar com o servidor!");
    } finally {
      resetButton();
    }
  });

  function resetButton() {
    btn.disabled = false;
    btn.classList.remove("loading");
    btn.textContent = "Cadastrar";
  }
});
