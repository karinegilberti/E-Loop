// ===========================
// FUNÇÕES GLOBAIS DO CARRINHO (API)
// ===========================

const API = "http://localhost:3001/api";

// Obtém o usuário logado
function obterUsuarioLogado() {
  try {
    return JSON.parse(localStorage.getItem("usuarioLogado"));
  } catch {
    return null;
  }
}

// Atualiza contador do carrinho (ícone no topo)
async function atualizarContadorCarrinhoGlobal() {
  const usuario = obterUsuarioLogado();
  const contadorEl = document.getElementById("contadorCarrinho");

  if (!contadorEl) return;
  if (!usuario || !usuario.id) {
    contadorEl.textContent = "0";
    return;
  }

  try {
    const resp = await fetch(`${API}/carrinho/${usuario.id}`);
    const data = await resp.json();
    contadorEl.textContent = (data.itens || []).length;
  } catch {
    contadorEl.textContent = "0";
  }
}

// ===========================
// 🚀 ADICIONAR AO CARRINHO (CORRIGIDO)
// ===========================
async function adicionarAoCarrinho(produto) {
  const usuario = obterUsuarioLogado();

  if (!usuario || !usuario.id) {
    alert("⚠️ Faça login para adicionar ao carrinho.");
    window.location.href = "login.html";
    return;
  }

  // 🔥 ATENÇÃO: SALVAMOS APENAS ID + quantidade
  const idProduto = produto.anuncio_id || produto.id;

  if (!idProduto) {
    console.error("❌ Produto sem ID válido:", produto);
    alert("Erro: produto inválido.");
    return;
  }

  try {
    // 1) Buscar carrinho atual
    const resp = await fetch(`${API}/carrinho/${usuario.id}`);
    const data = await resp.json();
    const itens = data.itens || [];

    // 2) Existe no carrinho?
    let existente = itens.find(p => p.anuncio_id === idProduto);
    if (existente) {
      existente.quantidade = (existente.quantidade || 1) + 1;
    } else {
      itens.push({ anuncio_id: idProduto, quantidade: 1 });
    }

    // 3) Enviar novamente ao banco
    await fetch(`${API}/carrinho/${usuario.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itens })
    });

    alert("🛒 Produto adicionado ao carrinho!");
    atualizarContadorCarrinhoGlobal();

  } catch (error) {
    console.error("❌ Erro ao adicionar ao carrinho:", error);
    alert("⚠️ Não foi possível adicionar ao carrinho.");
  }
}
