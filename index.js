// URL base da API (BACKEND HOSTEADO NO RAILWAY)
const API_URL = "https://balanced-fascination.up.railway.app/api";

// ===============================
// 🔹 UTILITÁRIOS GERAIS
// ===============================

// Retorna o usuário logado salvo no localStorage
function obterUsuarioLogadoIndex() {
  try {
    return JSON.parse(localStorage.getItem("usuarioLogado"));
  } catch (e) {
    return null;
  }
}

// Formata para R$
function formatarBRL(valor) {
  return `R$ ${Number(valor || 0).toFixed(2).replace(".", ",")}`;
}

// Monta URL de imagem (backend → Railway)
function montarUrlImagemAnuncio(anuncio) {
  if (!anuncio || !anuncio.imagem) {
    return "https://via.placeholder.com/200x150?text=Sem+Imagem";
  }

  if (anuncio.imagem.startsWith("http")) return anuncio.imagem;

  return `https://balanced-fascination.up.railway.app${anuncio.imagem}`;
}

// Atualiza contador do carrinho global
function atualizarContadorIndex() {
  if (typeof atualizarContadorCarrinhoGlobal === "function") {
    atualizarContadorCarrinhoGlobal();
  }
}

// ===============================
// 🔹 LISTAGEM DE ANÚNCIOS
// ===============================

function criarCardAnuncio(anuncio) {
  const card = document.createElement("div");
  card.className = "card-anuncio";

  const imgUrl = montarUrlImagemAnuncio(anuncio);
  const nomeProduto = anuncio.nome_produto || anuncio.nome || "Produto";
  const preco = formatarBRL(anuncio.preco);
  const condicao = anuncio.condicao || "N/A";
  const vendedor = anuncio.vendedor_nome || "Vendedor";

  card.innerHTML = `
    <div class="card-imagem-wrapper">
      <img src="${imgUrl}" alt="${nomeProduto}" class="card-imagem">
    </div>
    <div class="card-corpo">
      <h3 class="card-titulo">${nomeProduto}</h3>
      <p class="card-preco">${preco}</p>
      <p class="card-condicao">Condição: ${condicao}</p>
      <p class="card-vendedor">Vendedor: ${vendedor}</p>
      <button class="btn-add-carrinho">Adicionar ao carrinho</button>
    </div>
  `;

  // Evento do botão
  const btnAdd = card.querySelector(".btn-add-carrinho");
  btnAdd.addEventListener("click", () => {
    const produto = {
      id: anuncio.id,
      anuncio_id: anuncio.id,
      nome_produto: nomeProduto,
      preco: anuncio.preco,
      condicao: condicao,
      descricao: anuncio.descricao,
      usuario_id: anuncio.usuario_id,
      vendedor_nome: anuncio.vendedor_nome,
      vendedor_telefone: anuncio.vendedor_telefone,
      vendedor_email: anuncio.vendedor_email,
      imagem: anuncio.imagem,
      quantidade: 1
    };

    if (typeof adicionarAoCarrinho === "function") {
      adicionarAoCarrinho(produto);
    } else {
      alert("Erro: carrinho-api.js não carregado.");
    }
  });

  return card;
}

async function carregarAnunciosHome() {
  const container = document.getElementById("listaAnuncios");
  if (!container) return;

  container.innerHTML = "<p>Carregando anúncios...</p>";

  try {
    const resp = await fetch(`${API_URL}/explorar/anuncios`);
    if (!resp.ok) {
      container.innerHTML = "<p>Erro ao carregar anúncios.</p>";
      return;
    }

    const data = await resp.json();
    const anuncios = data.anuncios || [];

    if (!anuncios.length) {
      container.innerHTML = "<p>Nenhum anúncio encontrado.</p>";
      return;
    }

    container.innerHTML = "";
    anuncios.forEach(a => container.appendChild(criarCardAnuncio(a)));

  } catch (error) {
    console.error(error);
    container.innerHTML = "<p>Erro ao carregar anúncios.</p>";
  }
}

// ===================== GERADOR DE CARD =====================

function produtoCard(prod) {
  return `
  <div class="card"
       data-id="${prod.id}"
       data-preco="${prod.preco}"
       data-condicao="${prod.condicao}"
       data-categoria="${prod.categoria_nome}"
       data-descricao="${prod.descricao}"
       data-vendedor-id="${prod.usuario_id}"
       data-vendedor-nome="${prod.vendedor_nome}"
       data-vendedor-telefone="${prod.telefone}">
       
      <div class="favorite-icon"><i class="fa fa-heart"></i></div>

      <img src="${prod.img}" alt="${prod.nome}">

      <h3>${prod.nome}</h3>

      <p class="preco">R$ ${parseFloat(prod.preco).toFixed(2)}</p>

      <button class="btn-adicionar">Ver detalhes</button>
  </div>`;
}

// ===================== BUSCAR PRODUTOS API =====================

async function carregarProdutos() {
  try {
    const resp = await fetch("https://balanced-fascination.up.railway.app/api/anuncios");
    const produtos = await resp.json();
    const lista = document.getElementById("listaProdutos");

    lista.innerHTML = produtos.map(p =>
      produtoCard({
        id: p.id,
        nome: p.nome_produto,
        preco: p.preco,
        img: p.imagem ? `https://balanced-fascination.up.railway.app${p.imagem}` : "src/sem-imagem.png",
        condicao: p.condicao,
        descricao: p.descricao,
        usuario_id: p.usuario_id,
        vendedor_nome: p.vendedor_nome,
        telefone: p.telefone,
        categoria_nome: p.categoria_nome
      })
    ).join("");

    inicializarFavoritos();
    inicializarCliqueCard();

    document.querySelectorAll(".btn-adicionar").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        btn.closest(".card").click();
      });
    });

  } catch (erro) {
    console.error("❌ Erro ao carregar produtos:", erro);
  }
}

// ===================== FAVORITOS (FRONT-END SIMPLES) =====================

function inicializarFavoritos() {
  document.querySelectorAll(".favorite-icon").forEach(fav => {
    fav.addEventListener("click", (e) => {
      e.stopPropagation();
      const icon = fav.querySelector("i");

      if (icon.style.color === "red") {
        icon.style.color = "";
      } else {
        icon.style.color = "red";
      }
    });
  });
}

// ===================== ABRIR DETALHES =====================

function inicializarCliqueCard() {
  document.querySelectorAll(".card").forEach(card => {
    card.addEventListener("click", (e) => {
      if (e.target.closest(".favorite-icon")) return;

      const produto = {
        id: parseInt(card.dataset.id),
        nome_produto: card.querySelector("h3").textContent.trim(),
        preco: parseFloat(card.dataset.preco),
        imagem: card.querySelector("img").src,
        condicao: card.dataset.condicao,
        descricao: card.dataset.descricao,
        categoria: card.dataset.categoria,
        vendedor_nome: card.dataset.vendedorNome,
        vendedor_telefone: card.dataset.vendedorTelefone
      };

      localStorage.setItem("produtoDetalhes", JSON.stringify(produto));
      window.location.href = "detalhes.html";
    });
  });
}

// ===================== CONTADOR DO CARRINHO =====================

function atualizarContadorCarrinho() {
  const contador = document.getElementById("contadorCarrinho");
  if (!contador) return;

  const carrinho = JSON.parse(localStorage.getItem("carrinhoEloop")) || [];
  contador.textContent = carrinho.reduce((acc, p) => acc + (p.quantidade || 1), 0);
}

// ===================== INICIALIZAÇÃO =====================

document.addEventListener("DOMContentLoaded", () => {
  carregarProdutos().then(() => {
    setTimeout(() => atualizarContadorCarrinho(), 150);
  });
});
