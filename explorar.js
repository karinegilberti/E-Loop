// ===============================
// USUÁRIO LOGADO
// ===============================
let usuario = JSON.parse(localStorage.getItem("usuarioLogado")) || {
  nome: "Visitante",
  email: "",
  telefone: "",
  cidade: "",
  bio: "",
  foto: "",
  senha: "",
  favoritos: []
};

// ====== VARIÁVEL GLOBAL PARA BUSCA ======
let explorarProdutos = {
  categorias: [],
  tiposProduto: [],
  filtrosAtivos: {},
  todosAnuncios: []
};

// ====== URL BASE DO BACKEND (RAILWAY) — CORRIGIDA! ======
const API_BASE = "https://balanced-fascination-production.up.railway.app";

// ====== AO CARREGAR A PÁGINA ======
document.addEventListener("DOMContentLoaded", () => {
  console.log("🚀 Inicializando página Explorar...");
  inicializarPagina();
});

// ==========================================
// CARREGAR CATEGORIAS (SIMPLIFICADO)
// ==========================================
async function carregarCategorias() {
  try {
    console.log("📂 Carregando categorias...");

    const categoriasFixas = [
      { id: 1, nome: "Eletrônicos" },
      { id: 2, nome: "Roupas" },
      { id: 3, nome: "Móveis" },
      { id: 4, nome: "Livros" },
      { id: 5, nome: "Artesanato" }
    ];

    explorarProdutos.categorias = categoriasFixas;

  } catch (error) {
    console.error("❌ Erro ao carregar categorias:", error);
  }
}

// ==========================================
// BUSCAR ANÚNCIOS POR TIPO
// ==========================================
async function buscarAnunciosPorTipo(tipoProduto) {
  try {
    console.log(`🔍 Buscando anúncios por tipo: ${tipoProduto}`);

    if (!explorarProdutos.todosAnuncios.length) {
      await carregarTodosAnuncios();
    }

    let anunciosFiltrados = explorarProdutos.todosAnuncios.filter(a => 
      a.tipo_produto === tipoProduto ||
      a.categoria_nome?.toLowerCase().includes(tipoProduto)
    );

    console.log(`Encontrados ${anunciosFiltrados.length}`);

    document.querySelector(".tipo-header")?.remove();

    if (anunciosFiltrados.length > 0)
      adicionarHeaderTipo(obterNomeTipo(tipoProduto));

    exibirAnuncios(anunciosFiltrados);

  } catch (error) {
    console.error("❌ Erro:", error);
    await carregarTodosAnuncios();
  }
}

// ==========================================
// OBTER NOME DO TIPO
// ==========================================
function obterNomeTipo(tipoId) {
  const tipos = {
    'eletronicos': 'Eletrônicos',
    'roupas': 'Roupas',
    'moveis': 'Móveis',
    'livros': 'Livros',
    'artesanato': 'Artesanato'
  };
  return tipos[tipoId] || tipoId;
}

// ==========================================
// BUSCAR ANÚNCIOS POR CATEGORIA
// ==========================================
async function buscarAnunciosPorCategoria(categoriaId) {
  try {
    console.log(`📂 Categoria ${categoriaId}`);

    if (!explorarProdutos.todosAnuncios.length) {
      await carregarTodosAnuncios();
    }

    const anunciosFiltrados =
      explorarProdutos.todosAnuncios.filter(a => a.categoria_id == categoriaId);

    document.querySelector(".tipo-header")?.remove();

    const nomeCategoria =
      explorarProdutos.categorias.find(c => c.id == categoriaId)?.nome;

    adicionarHeaderTipo(nomeCategoria, "categoria");
    exibirAnuncios(anunciosFiltrados);

  } catch (error) {
    console.error(error);
  }
}

// ==========================================
// HEADER DINÂMICO
// ==========================================
function adicionarHeaderTipo(nomeTipo, tipo = "produto") {
  const gridProdutos = document.getElementById("gridProdutos");

  const header = document.createElement("div");
  header.className = "tipo-header";
  header.innerHTML = `
    <div class="tipo-info">
      <i class="fas fa-tag"></i>
      <span>${nomeTipo}</span>
    </div>
    <button onclick="carregarTodosAnuncios()" class="btn-todos">Ver todos</button>
  `;

  gridProdutos.parentElement.insertBefore(header, gridProdutos);
}

// ==========================================
// CARREGAR TODOS ANÚNCIOS
// ==========================================
async function carregarTodosAnuncios() {
  try {
    console.log("📦 Carregando anúncios...");

    document.querySelector(".tipo-header")?.remove();

    const res = await fetch(`${API_BASE}/api/anuncios`);
    const data = await res.json();

    explorarProdutos.todosAnuncios = Array.isArray(data) ? data : data.anuncios || [];

    exibirAnuncios(explorarProdutos.todosAnuncios);

  } catch (err) {
    console.error("❌ Erro ao carregar:", err);
  }
}

// ==========================================
// EXIBIR ANÚNCIOS
// ==========================================
function exibirAnuncios(anuncios) {
  const grid = document.getElementById("gridProdutos");
  grid.innerHTML = "";

  if (!anuncios.length) {
    mostrarMensagemSemAnuncios();
    return;
  }

  anuncios.forEach(a => grid.appendChild(criarCardAnuncio(a)));

  setTimeout(inicializarFavoritosExplorar, 100);
}

// ==========================================
// CRIAR CARD
// ==========================================
function criarCardAnuncio(a) {
  const card = document.createElement("div");
  card.className = "card";

  const imgUrl = a.imagem
    ? `${API_BASE}${a.imagem}`
    : "https://via.placeholder.com/300x200?text=Sem+Imagem";

  card.innerHTML = `
    <div class="favorite-icon"><i class="fas fa-heart"></i></div>
    <div class="img-box">
      <img src="${imgUrl}">
    </div>
    <h3>${a.nome_produto}</h3>
    <p class="preco">R$ ${a.preco.toFixed(2)}</p>
    <p class="condicao">Condição: ${a.condicao}</p>
    <button onclick="verDetalhesAnuncio(${a.id})">Ver Detalhes</button>
  `;

  return card;
}

// ==========================================
// DETALHES
// ==========================================
function verDetalhesAnuncio(id) {
  window.location.href = `detalhes.html?id=${id}`;
}

// ==========================================
// FAVORITOS
// ==========================================
function inicializarFavoritosExplorar() {
  const cards = document.querySelectorAll(".card");

  if (!Array.isArray(usuario.favoritos)) usuario.favoritos = [];

  cards.forEach(card => {
    const icon = card.querySelector(".favorite-icon i");
    const nome = card.querySelector("h3")?.textContent;

    const fav = usuario.favoritos.some(f => f.nome === nome);
    if (fav) icon.style.color = "red";

    card.querySelector(".favorite-icon").addEventListener("click", () => {
      const pos = usuario.favoritos.findIndex(f => f.nome === nome);

      if (pos > -1) {
        usuario.favoritos.splice(pos, 1);
        icon.style.color = "";
      } else {
        usuario.favoritos.push({ nome });
        icon.style.color = "red";
      }

      localStorage.setItem("usuarioLogado", JSON.stringify(usuario));
    });
  });
}

// ==========================================
// MENSAGEM QUANDO NÃO HÁ ANÚNCIOS
// ==========================================
function mostrarMensagemSemAnuncios() {
  const grid = document.getElementById("gridProdutos");
  grid.innerHTML = `
    <div class="sem-anuncios">
      <h3>📭 Nenhum anúncio encontrado</h3>
      <button onclick="location.href='anunciar.html'">Criar Anúncio</button>
    </div>
  `;
}

// ==========================================
// INICIALIZAR PÁGINA
// ==========================================
async function inicializarPagina() {
  await carregarCategorias();
  inicializarFiltros();
  await carregarTodosAnuncios();
  inicializarFavoritosExplorar();
}