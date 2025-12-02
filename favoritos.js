// ===== PEGAR USUÁRIO LOGADO =====
let usuario = JSON.parse(localStorage.getItem("usuarioLogado"));
if (!usuario) usuario = null;

// ===== URL DO BACKEND NO RAILWAY — CORRIGIDA! =====
const API = "https://balanced-fascination-production.up.railway.app/api";

/**
 * Inicializa os favoritos para qualquer container de produtos.
 */
async function inicializarFavoritos() {
  if (!usuario || !usuario.id) {
    console.warn("🔒 Favoritos desabilitado: usuário não logado");
    return;
  }

  // Buscar favoritos do banco
  const favoritosDB = await obterFavoritosDB(usuario.id);

  // Procurar todos os cards com coração
  document.querySelectorAll(".favorite-icon").forEach(fav => {
    const card = fav.closest(".card");
    if (!card) return;

    const idProduto = Number(card.dataset.id);
    const icon = fav.querySelector("i");

    // Se estiver no banco → marca como ativo
    if (favoritosDB.includes(idProduto)) {
      icon.classList.add("active");
      icon.style.color = "red";
    }

    // Clique para favoritar / desfavoritar
    fav.addEventListener("click", async (e) => {
      e.stopPropagation();

      if (icon.classList.contains("active")) {
        await removerFavoritoDB(usuario.id, idProduto);
        icon.classList.remove("active");
        icon.style.color = "";
      } else {
        await salvarFavoritoDB(usuario.id, idProduto);
        icon.classList.add("active");
        icon.style.color = "red";
      }
    });
  });
}

// ========================
// FUNÇÕES DO BANCO (API)
// ========================

async function obterFavoritosDB(usuarioId) {
  try {
    const resp = await fetch(`${API}/favoritos/${usuarioId}`);
    const data = await resp.json();

    if (!data.success || !Array.isArray(data.favoritos)) return [];

    return data.favoritos.map(f => f.idAnuncio);
  } catch (err) {
    console.error("Erro ao buscar favoritos:", err);
    return [];
  }
}

async function salvarFavoritoDB(usuarioId, anuncioId) {
  return fetch(`${API}/favoritos/add`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ usuario_id: usuarioId, anuncio_id: anuncioId })
  });
}

async function removerFavoritoDB(usuarioId, anuncioId) {
  return fetch(`${API}/favoritos/remove`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ usuario_id: usuarioId, anuncio_id: anuncioId })
  });
}

// ========================
// INICIALIZAÇÃO
// ========================

document.addEventListener("DOMContentLoaded", () => {
  // Primeiro: carrega os produtos
  carregarProdutos().then(() => {
    // Depois inicializa contador e favoritos
    setTimeout(() => {
      if (typeof atualizarContadorCarrinho === "function") {
        atualizarContadorCarrinho();
      }
      inicializarFavoritos();
    }, 250);
  });
});
