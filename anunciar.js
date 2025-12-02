document.addEventListener("DOMContentLoaded", () => {
  const API_URL = "https://balanced-fascination-production.up.railway.app";

  const form = document.getElementById("form-anuncio");
  const estadoSelect = document.getElementById("estado");
  const cidadeSelect = document.getElementById("cidade");

  const categoriasMap = {
    'roupas': 1,
    'livros': 2,
    'Vinil': 3, 
    'CD': 4,
  };

  // ====== CARREGAR ESTADOS DA API IBGE ======
  async function carregarEstadosIBGE() {
    try {
      console.log("🌎 Carregando estados da API IBGE...");
      const res = await fetch("https://servicodados.ibge.gov.br/api/v1/localidades/estados");
      const estados = await res.json();
      estados.sort((a, b) => a.nome.localeCompare(b.nome));
      
      estadoSelect.innerHTML = '<option value="">Selecione o estado...</option>';
      
      estados.forEach(estado => {
        const option = document.createElement("option");
        option.value = estado.sigla;
        option.textContent = estado.nome;
        estadoSelect.appendChild(option);
      });
      
      console.log(`✅ ${estados.length} estados carregados`);
    } catch (error) {
      console.error("❌ Erro ao carregar estados:", error);
      alert("Erro ao carregar lista de estados. Tente recarregar a página.");
    }
  }

  // ====== CARREGAR CIDADES ======
  estadoSelect.addEventListener("change", async () => {
    const sigla = estadoSelect.value;
    cidadeSelect.innerHTML = '<option value="">Selecione a cidade...</option>';
    cidadeSelect.disabled = true;
    
    if (!sigla) return;

    try {
      console.log(`🏙️ Carregando cidades do estado ${sigla}...`);

      const res = await fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${sigla}/municipios`);
      const cidades = await res.json();
      
      cidades.forEach(cidade => {
        const option = document.createElement("option");
        option.value = cidade.nome;
        option.textContent = cidade.nome;
        cidadeSelect.appendChild(option);
      });
      
      cidadeSelect.disabled = false;
      console.log(`✅ ${cidades.length} cidades carregadas`);
    } catch (error) {
      console.error("❌ Erro ao carregar cidades:", error);
      cidadeSelect.innerHTML = '<option value="">Erro ao carregar cidades</option>';
      alert("Erro ao carregar lista de cidades.");
    }
  });

  // ====== VALIDAÇÕES ======
  function validarFormulario(formData) {
    const errors = [];
    
    const camposObrigatorios = [
      'nome_produto', 'tipo_anuncio', 'categoria_id', 
      'preco', 'condicao', 'descricao', 'estado', 'cidade'
    ];
    
    camposObrigatorios.forEach(campo => {
      if (!formData.get(campo)) {
        errors.push(`O campo ${campo.replace('_', ' ')} é obrigatório`);
      }
    });

    const preco = parseFloat(formData.get('preco'));
    if (preco < 0) errors.push('O preço não pode ser negativo');

    const imagem = formData.get('imagem');
    if (!imagem || imagem.size === 0) {
      errors.push('A imagem do produto é obrigatória');
    }

    return errors;
  }

  // ====== ENVIO DO FORMULÁRIO ======
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));
    const userId = usuarioLogado ? usuarioLogado.id : null;
    
    if (!userId) {
      alert("⚠️ Você precisa estar logado para criar um anúncio!");
      return window.location.href = "login.html";
    }

    const errors = validarFormulario(formData);
    if (errors.length > 0) {
      return alert("❌ Erros no formulário:\n" + errors.join('\n'));
    }

    const categoriaSelecionada = formData.get("categoria_id");
    const categoriaId = categoriasMap[categoriaSelecionada] || categoriaSelecionada;

    formData.set("usuario_id", userId);
    formData.set("categoria_id", categoriaId);

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fa fa-spinner fa-spin"></i> Publicando...';
    submitBtn.disabled = true;

    try {
      const response = await fetch(`${API_URL}/api/anuncios`, {
        method: "POST",
        body: formData
      });

      submitBtn.innerHTML = originalText;
      submitBtn.disabled = false;

      const data = await response.json();

      if (data.success) {
        alert("✅ Anúncio criado com sucesso!");
        form.reset();

        estadoSelect.innerHTML = '<option value="">Selecione o estado...</option>';
        cidadeSelect.innerHTML = '<option value="">Selecione a cidade...</option>';
        cidadeSelect.disabled = true;

        await carregarEstadosIBGE();

        setTimeout(() => {
          window.location.href = "minhaconta.html";
        }, 1000);
      } else {
        alert("❌ Erro ao criar anúncio:\n" + (data.message || "Erro desconhecido"));
      }

    } catch (error) {
      console.error("💥 Erro de conexão:", error);
      submitBtn.innerHTML = originalText;
      submitBtn.disabled = false;
      alert("🔌 Erro ao conectar com o servidor.");
    }
  });

  // ====== INICIALIZAÇÃO ======
  carregarEstadosIBGE();

  const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));
  if (!usuarioLogado || !usuarioLogado.id) {
    alert("⚠️ Você precisa estar logado para criar um anúncio!");
    return window.location.href = "login.html";
  }

  console.log("👤 Usuário logado:", usuarioLogado.nome);
});
