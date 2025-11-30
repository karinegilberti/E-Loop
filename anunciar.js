document.addEventListener("DOMContentLoaded", () => {
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
      
      // Limpa options existentes (mantendo o primeiro)
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

  // ====== CARREGAR CIDADES QUANDO ESTADO MUDAR ======
  estadoSelect.addEventListener("change", async () => {
    const sigla = estadoSelect.value;
    cidadeSelect.innerHTML = '<option value="">Selecione a cidade...</option>';
    cidadeSelect.disabled = true;
    
    if (!sigla) {
      cidadeSelect.disabled = true;
      return;
    }

    try {
      console.log(`🏙️ Carregando cidades do estado ${sigla}...`);
      cidadeSelect.disabled = true;
      
      const res = await fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${sigla}/municipios`);
      const cidades = await res.json();
      
      cidades.forEach(cidade => {
        const option = document.createElement("option");
        option.value = cidade.nome;
        option.textContent = cidade.nome;
        cidadeSelect.appendChild(option);
      });
      
      cidadeSelect.disabled = false;
      console.log(`✅ ${cidades.length} cidades carregadas para ${sigla}`);
    } catch (error) {
      console.error("❌ Erro ao carregar cidades:", error);
      cidadeSelect.innerHTML = '<option value="">Erro ao carregar cidades</option>';
      alert("Erro ao carregar lista de cidades. Tente selecionar o estado novamente.");
    }
  });

  // ====== VALIDAÇÃO DO FORMULÁRIO ======
  function validarFormulario(formData) {
    const errors = [];
    
    // Validação básica de campos obrigatórios
    const camposObrigatorios = [
      'nome_produto', 'tipo_anuncio', 'categoria_id', 
      'preco', 'condicao', 'descricao', 'estado', 'cidade'
    ];
    
    camposObrigatorios.forEach(campo => {
      if (!formData.get(campo)) {
        errors.push(`O campo ${campo.replace('_', ' ')} é obrigatório`);
      }
    });

    // Validação de preço
    const preco = parseFloat(formData.get('preco'));
    if (preco < 0) {
      errors.push('O preço não pode ser negativo');
    }

    // Validação de imagem
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
    let userId = usuarioLogado ? usuarioLogado.id : null;
    
    // Verificar se usuário está logado
    if (!userId) {
      console.error("❌ Usuário não está logado!");
      alert("⚠️ Você precisa estar logado para criar um anúncio!");
      window.location.href = "login.html";
      return;
    }

    // Validação do formulário
    const errors = validarFormulario(formData);
    if (errors.length > 0) {
      alert("❌ Erros no formulário:\n" + errors.join('\n'));
      return;
    }

    // Processar categoria
    const categoriaSelecionada = formData.get("categoria_id");
    const categoriaId = categoriasMap[categoriaSelecionada] || categoriaSelecionada;

    // Adicionar dados ao FormData
    formData.set("usuario_id", userId);
    formData.set("categoria_id", categoriaId);

    console.log("📤 Enviando dados do anúncio:", {
      usuario_id: userId,
      categoria_id: categoriaId,
      nome_produto: formData.get("nome_produto"),
      tipo_anuncio: formData.get("tipo_anuncio"),
      preco: formData.get("preco"),
      condicao: formData.get("condicao"),
      estado: formData.get("estado"),
      cidade: formData.get("cidade"),
      descricao: formData.get("descricao").substring(0, 50) + "..."
    });

    try {
      // Mostrar loading
      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;
      submitBtn.innerHTML = '<i class="fa fa-spinner fa-spin"></i> Publicando...';
      submitBtn.disabled = true;

      const response = await fetch("http://localhost:3001/api/anuncios", {
        method: "POST",
        body: formData
      });

      // Restaurar botão
      submitBtn.innerHTML = originalText;
      submitBtn.disabled = false;

      const data = await response.json();

      if (data.success) {
        console.log("✅ Anúncio criado com sucesso! Resposta:", data);
        alert("✅ Anúncio criado com sucesso!");
        
        // Reset do formulário
        form.reset();
        
        // Reset dos selects de localização
        estadoSelect.innerHTML = '<option value="">Selecione o estado...</option>';
        cidadeSelect.innerHTML = '<option value="">Selecione a cidade...</option>';
        cidadeSelect.disabled = true;
        
        // Recarregar estados
        await carregarEstadosIBGE();

        // Redireciona para Minha Conta após 1 segundo
        setTimeout(() => {
          window.location.href = "minhaconta.html";
        }, 1000);

      } else {
        console.error("❌ Erro na resposta:", data);
        let errorMessage = "Erro ao criar anúncio";
        if (data.message) errorMessage += ": " + data.message;
        if (data.error) errorMessage += "\nDetalhes: " + data.error;
        alert("❌ " + errorMessage);
      }
    } catch (error) {
      console.error("💥 Erro de conexão:", error);
      
      // Restaurar botão em caso de erro
      const submitBtn = form.querySelector('button[type="submit"]');
      submitBtn.innerHTML = '<i class="fa fa-paper-plane"></i> Publicar';
      submitBtn.disabled = false;
      
      alert("🔌 Erro ao conectar com o servidor. Verifique:\n- Se a API está rodando na porta 3001\n- Sua conexão com a internet");
    }
  });

  // ====== DEBUG DO FORMULÁRIO ======
  form.addEventListener("click", (e) => {
    if (e.target.type === 'submit') {
      const formData = new FormData(form);
      console.log("🔍 Debug FormData (antes do envio):");
      for (let [key, value] of formData.entries()) {
        if (key !== 'imagem') {
          console.log(`  ${key}: ${value}`);
        } else {
          console.log(`  ${key}: ${value.name} (${value.size} bytes)`);
        }
      }
    }
  });

  // ====== PREVENIR ENVIO COM ENTER NOS SELECTS ======
  form.addEventListener("keypress", (e) => {
    if (e.target.tagName === 'SELECT' && e.key === 'Enter') {
      e.preventDefault();
    }
  });

  // ====== INICIALIZAÇÃO DA PÁGINA ======
  console.log("🚀 Inicializando página de anúncio...");
  carregarEstadosIBGE();

  // Verificar se usuário está logado ao carregar a página
  const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));
  if (!usuarioLogado || !usuarioLogado.id) {
    console.warn("⚠️ Usuário não logado - redirecionando para login");
    alert("⚠️ Você precisa estar logado para criar um anúncio!");
    window.location.href = "login.html";
    return;
  }

  console.log("👤 Usuário logado:", usuarioLogado.nome);
});

// ====== FUNÇÃO PARA PREVIEW DE IMAGEM (OPCIONAL) ======
function previewImagem(input) {
  if (input.files && input.files[0]) {
    const reader = new FileReader();
    reader.onload = function(e) {
      // Aqui você pode adicionar um preview da imagem se quiser
      console.log("📸 Preview da imagem carregada");
    };
    reader.readAsDataURL(input.files[0]);
  }
}

// Adicione este event listener se quiser preview de imagem
document.addEventListener("DOMContentLoaded", () => {
  const inputImagem = document.getElementById("imagem");
  if (inputImagem) {
    inputImagem.addEventListener("change", function() {
      previewImagem(this);
    });
  }
});