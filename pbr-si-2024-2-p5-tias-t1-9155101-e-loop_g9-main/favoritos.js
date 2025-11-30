// ===== PEGAR USUÁRIO LOGADO (agora com ID) =====
let usuario = JSON.parse(localStorage.getItem("usuarioLogado"));
if (!usuario) usuario = null;

const API = "http://localhost:3001/api";

/**
 * Inicializa os favoritos para qualquer container de produtos.
 * @param {string} containerSelector - Container que possui card + coração
 */
async function inicializarFavoritos() {
  // Se não está logado, não faz nada
  if (!usuario || !usuario.id) {
    console.warn("🔒 Favoritos desabilitado: usuário não logado");
    return;
  }

  // Busca favoritos no banco
  const favoritosDB = await obterFavoritosDB(usuario.id);

  // Varre todos os corações
  document.querySelectorAll(".favorite-icon").forEach(fav => {
    const idProduto = Number(fav.closest(".card").dataset.id);
    const icon = fav.querySelector("i");

    // Se está favoritado no banco, marca em vermelho
    if (favoritosDB.includes(idProduto)) {
      icon.classList.add("active");
      icon.style.color = "red";
    }

    // Clique no botão
    fav.addEventListener("click", async (e) => {
      e.stopPropagation(); // impede abrir detalhes do anúncio

      if (icon.classList.contains("active")) {
        // 🔥 REMOVER do banco
        await removerFavoritoDB(usuario.id, idProduto);
        icon.classList.remove("active");
        icon.style.color = "";
      } else {
        // 💾 SALVAR no banco
        await salvarFavoritoDB(usuario.id, idProduto);
        icon.classList.add("active");
        icon.style.color = "red";
      }
    });
  });
}


// ======== FUNÇÕES BANCO ========
async function obterFavoritosDB(usuarioId) {
  try {
    const resp = await fetch(`${API}/favoritos/${usuarioId}`);
    const data = await resp.json();
    if (!data.success) return [];
    return data.favoritos.map(f => f.idAnuncio);
  } catch {
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

document.addEventListener("DOMContentLoaded", () => {
  carregarProdutos().then(() => {
    setTimeout(() => {
      atualizarContadorCarrinho();
      inicializarFavoritos("#listaProdutos"); // 👈 AGORA SIM!
    }, 250); // tempo suficiente para renderizar os cards
  });
});
