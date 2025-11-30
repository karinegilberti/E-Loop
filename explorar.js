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
    
    // Categorias fixas conforme solicitado
    const categoriasFixas = [
      { id: 1, nome: "Eletrônicos" },
      { id: 2, nome: "Roupas" },
      { id: 3, nome: "Móveis" },
      { id: 4, nome: "Livros" },
      { id: 5, nome: "Artesanato" }
    ];
    
    explorarProdutos.categorias = categoriasFixas;
    console.log("✅ Categorias carregadas:", categoriasFixas);

  } catch (error) {
    console.error("❌ Erro ao carregar categorias:", error);
    // Fallback para categorias fixas
    const categoriasFixas = [
      { id: 1, nome: "Eletrônicos" },
      { id: 2, nome: "Roupas" },
      { id: 3, nome: "Móveis" },
      { id: 4, nome: "Livros" },
      { id: 5, nome: "Artesanato" }
    ];
    explorarProdutos.categorias = categoriasFixas;
  }
}

// ==========================================
// INICIALIZAR BUSCA POR TIPO
// ==========================================
async function buscarAnunciosPorTipo(tipoProduto) {
  try {
    console.log(`🔍 Buscando anúncios por tipo: ${tipoProduto}`);

    if (!explorarProdutos.todosAnuncios.length) {
      await carregarTodosAnuncios();
    }

    // Mapeamento tipo -> categoria_id do banco
    const mapaTipos = {
      eletronicos: 4,
      roupas: 2,
      moveis: 3,
      livros: 4,
      artesanato: 5
    };

    // Obtém ID correspondente
    const categoriaId = mapaTipos[tipoProduto];

    let anunciosFiltrados = explorarProdutos.todosAnuncios;

    if (categoriaId) {
      anunciosFiltrados = explorarProdutos.todosAnuncios.filter(a => Number(a.categoria_id) === categoriaId);
    }

    console.log(`✅ Encontrados ${anunciosFiltrados.length} anúncios`);

    // Remove título anterior
    document.querySelector(".tipo-header")?.remove();

    if (tipoProduto && anunciosFiltrados.length > 0) {
      const tipoNome = obterNomeTipo(tipoProduto);
      adicionarHeaderTipo(tipoNome);
    }

    exibirAnuncios(anunciosFiltrados);

  } catch (error) {
    console.error("❌ Erro ao buscar anúncios por tipo:", error);
    await carregarTodosAnuncios();
  }
}

// ==========================================
// BUSCAR ANÚNCIOS POR TIPO DE PRODUTO
// ==========================================
async function buscarAnunciosPorTipo(tipoProduto) {
  try {
    console.log(`🔍 Buscando anúncios por tipo: ${tipoProduto}`);

    // Se não há anúncios carregados, carrega primeiro
    if (!explorarProdutos.todosAnuncios.length) {
      await carregarTodosAnuncios();
    }

    let anunciosFiltrados = explorarProdutos.todosAnuncios;
    
    if (tipoProduto) {
      anunciosFiltrados = explorarProdutos.todosAnuncios.filter(anuncio => {
        return anuncio.tipo_produto === tipoProduto || 
               anuncio.categoria_nome?.toLowerCase().includes(tipoProduto.toLowerCase());
      });
    }

    console.log(`✅ Encontrados ${anunciosFiltrados.length} anúncios do tipo`);

    // Remove header anterior se existir
    const headerAnterior = document.querySelector(".tipo-header");
    if (headerAnterior) headerAnterior.remove();

    // Adiciona header de tipo se houver resultados
    if (tipoProduto && anunciosFiltrados.length > 0) {
      const tipoNome = obterNomeTipo(tipoProduto);
      adicionarHeaderTipo(tipoNome);
    }

    exibirAnuncios(anunciosFiltrados);

  } catch (error) {
    console.error("❌ Erro ao buscar anúncios por tipo:", error);
    // Fallback: carrega todos os anúncios
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
    console.log(`📂 Buscando anúncios por categoria: ${categoriaId}`);

    // Se não há anúncios carregados, carrega primeiro
    if (!explorarProdutos.todosAnuncios.length) {
      await carregarTodosAnuncios();
    }

    let anunciosFiltrados = explorarProdutos.todosAnuncios;
    
    if (categoriaId) {
      anunciosFiltrados = explorarProdutos.todosAnuncios.filter(anuncio => {
        return anuncio.categoria_id == categoriaId;
      });
    }

    console.log(`✅ Encontrados ${anunciosFiltrados.length} anúncios da categoria`);

    // Remove header anterior se existir
    const headerAnterior = document.querySelector(".tipo-header");
    if (headerAnterior) headerAnterior.remove();

    // Adiciona header de categoria se houver resultados
    if (categoriaId && anunciosFiltrados.length > 0) {
      const categoriaNome = explorarProdutos.categorias.find(c => c.id == categoriaId)?.nome || `Categoria ${categoriaId}`;
      adicionarHeaderTipo(categoriaNome, 'categoria');
    }

    exibirAnuncios(anunciosFiltrados);

  } catch (error) {
    console.error("❌ Erro ao buscar anúncios por categoria:", error);
    // Fallback: carrega todos os anúncios
    await carregarTodosAnuncios();
  }
}

// ==========================================
// ADICIONAR HEADER DE TIPO/CATEGORIA
// ==========================================
function adicionarHeaderTipo(nomeTipo, tipo = 'produto') {
  const gridProdutos = document.getElementById("gridProdutos");
  if (!gridProdutos) return;

  const header = document.createElement("div");
  header.className = "tipo-header";

  const icone = tipo === 'categoria' ? 'fas fa-folder' : 'fas fa-tag';

  header.innerHTML = `
    <div class="tipo-info">
      <i class="${icone}"></i>
      <span>Mostrando anúncios de ${nomeTipo}</span>
    </div>
    <button onclick="carregarTodosAnuncios()" class="btn-todos">Ver todos os anúncios</button>
  `;

  gridProdutos.parentElement.insertBefore(header, gridProdutos);
}

// ==========================================
// CARREGAR TODOS ANÚNCIOS
// ==========================================
async function carregarTodosAnuncios() {
  try {
    console.log("📦 Carregando todos os anúncios...");

    // Remove header de tipo se existir
    const header = document.querySelector(".tipo-header");
    if (header) header.remove();

    // Reseta filtros
    const tipoSelect = document.getElementById("filtroTipo");
    const categoriaSelect = document.getElementById("filtroCategoria");
    
    if (tipoSelect) tipoSelect.value = "";
    if (categoriaSelect) categoriaSelect.value = "";

    await carregarAnunciosDoBanco();
    
  } catch (error) {
    console.error("❌ Erro ao carregar todos os anúncios:", error);
  }
}

// ==========================================
// BUSCAR ANÚNCIOS DO BANCO
// ==========================================
async function carregarAnunciosDoBanco() {
  try {
    console.log("🔍 Buscando anúncios na API...");
    
    // Tenta diferentes endpoints
    let response = await fetch("http://localhost:3001/api/anuncios");
    
    if (!response.ok) {
      // Fallback para outro endpoint
      response = await fetch("http://localhost:3001/api/explorar/anuncios");
    }

    if (!response.ok) {
      throw new Error(`Erro HTTP: ${response.status}`);
    }

    const data = await response.json();
    
    // Verifica a estrutura da resposta
    let anuncios = [];
    if (Array.isArray(data)) {
      anuncios = data; // Resposta direta do /api/anuncios
    } else if (data.anuncios && Array.isArray(data.anuncios)) {
      anuncios = data.anuncios; // Resposta do /api/explorar/anuncios
    } else if (data.success && Array.isArray(data.anuncios)) {
      anuncios = data.anuncios; // Outra estrutura possível
    }

    explorarProdutos.todosAnuncios = anuncios;
    
    if (anuncios.length > 0) {
      exibirAnuncios(anuncios);
      console.log(`✅ ${anuncios.length} anúncios carregados`);
    } else {
      mostrarMensagemSemAnuncios();
    }

  } catch (error) {
    console.error("❌ Erro ao carregar anúncios:", error);
    mostrarMensagemSemAnuncios();
    
    // Dados de exemplo para desenvolvimento
    console.log("🛠️ Usando dados de exemplo para desenvolvimento");
    const anunciosExemplo = [
      {
        id: 1,
        nome_produto: "Smartphone Samsung",
        preco: 899.99,
        descricao: "Smartphone em ótimo estado",
        condicao: "Usado",
        imagem: "/uploads/phone.jpg",
        categoria_id: 1,
        categoria_nome: "Eletrônicos",
        tipo_produto: "eletronicos"
      },
      {
        id: 2,
        nome_produto: "Camiseta Básica",
        preco: 29.99,
        descricao: "Camiseta 100% algodão",
        condicao: "Novo",
        imagem: "/uploads/camiseta.jpg",
        categoria_id: 2,
        categoria_nome: "Roupas",
        tipo_produto: "roupas"
      },
      {
        id: 3,
        nome_produto: "Mesa de Centro",
        preco: 150.00,
        descricao: "Mesa de madeira maciça",
        condicao: "Seminovo",
        imagem: "/uploads/mesa.jpg",
        categoria_id: 3,
        categoria_nome: "Móveis",
        tipo_produto: "moveis"
      },
      {
        id: 4,
        nome_produto: "Dom Casmurro",
        preco: 25.00,
        descricao: "Livro clássico da literatura",
        condicao: "Usado",
        imagem: "/uploads/livro.jpg",
        categoria_id: 4,
        categoria_nome: "Livros",
        tipo_produto: "livros"
      },
      {
        id: 5,
        nome_produto: "Vaso de Cerâmica",
        preco: 45.00,
        descricao: "Vaso artesanal pintado à mão",
        condicao: "Novo",
        imagem: "/uploads/vaso.jpg",
        categoria_id: 5,
        categoria_nome: "Artesanato",
        tipo_produto: "artesanato"
      }
    ];
    explorarProdutos.todosAnuncios = anunciosExemplo;
    exibirAnuncios(anunciosExemplo);
  }
}

// ==========================================
// EXIBIR ANÚNCIOS
// ==========================================
function exibirAnuncios(anuncios) {
  const gridProdutos = document.getElementById("gridProdutos");
  if (!gridProdutos) {
    console.error("❌ Elemento gridProdutos não encontrado");
    return;
  }

  gridProdutos.innerHTML = "";

  if (!anuncios || anuncios.length === 0) {
    mostrarMensagemSemAnuncios();
    return;
  }

  anuncios.forEach((anuncio) => {
    const card = criarCardAnuncio(anuncio);
    if (card) {
      gridProdutos.appendChild(card);
    }
  });

  // Re-inicializa os favoritos após renderizar os cards
  setTimeout(() => {
    inicializarFavoritosExplorar();
  }, 100);
}

// ==========================================
// CRIAR CARD DE ANÚNCIO
// ==========================================
function criarCardAnuncio(anuncio) {
  try {
    const card = document.createElement("div");
    card.className = "card";
    
    // Adiciona dados para filtros
    card.dataset.categoria = anuncio.categoria_id || "";
    card.dataset.preco = anuncio.preco || 0;
    card.dataset.condicao = anuncio.condicao || "";
    //card.dataset.tipo = anuncio.tipo_produto || "";

    // Formatar categoria/tipo
    const categoriaTipo = formatarCategoriaTipo(anuncio);

    card.innerHTML = `
      <div class="favorite-icon"><i class="fas fa-heart"></i></div>
      <div class="img-box">
        <img src="${anuncio.imagem ? 'http://localhost:3001' + anuncio.imagem : 'https://picsum.photos/300/200'}" 
             alt="${anuncio.nome_produto || 'Produto'}"
             onerror="this.src='https://via.placeholder.com/300x200/5CE1E6/ffffff?text=Imagem+Indisponível'">
      </div>
      <h3>${anuncio.nome_produto || "Produto sem nome"}</h3>
      <p class="descricao">${anuncio.descricao || "Descrição não disponível"}</p>
      <p class="categoria-tipo"><i class="fas fa-tag"></i> ${categoriaTipo}</p>
      <p class="preco">R$ ${parseFloat(anuncio.preco || 0).toFixed(2)}</p>
      <p class="condicao">Condição: ${anuncio.condicao || "Não informada"}</p>
      <button class="btn-detalhes" onclick="verDetalhesAnuncio(${anuncio.id})">Ver Detalhes</button>
    `;

    return card;
  } catch (error) {
    console.error("❌ Erro ao criar card de anúncio:", error, anuncio);
    return null;
  }
}

// ==========================================
// FORMATAR CATEGORIA/TIPO
// ==========================================
function formatarCategoriaTipo(anuncio) {
  if (anuncio.categoria_nome) {
    return anuncio.categoria_nome;
  }
  
  if (anuncio.tipo_produto) {
    return obterNomeTipo(anuncio.tipo_produto);
  }
  
  return "Categoria não informada";
}

// ==========================================
// VER DETALHES DO ANÚNCIO
// ==========================================
function verDetalhesAnuncio(anuncioId) {
  if (!anuncioId || isNaN(anuncioId)) {
    console.error("❌ ID do anúncio inválido:", anuncioId);
    alert("Erro: ID do anúncio inválido");
    return;
  }
  window.location.href = `detalhes.html?id=${anuncioId}`;
}

// ==========================================
// MENSAGEM QUANDO NÃO HÁ ANÚNCIOS
// ==========================================
function mostrarMensagemSemAnuncios() {
  const grid = document.getElementById("gridProdutos");
  if (!grid) {
    console.error("❌ Elemento gridProdutos não encontrado para mensagem");
    return;
  }

  grid.innerHTML = `
    <div class="sem-anuncios">
      <h3>📭 Nenhum anúncio encontrado</h3>
      <p>Não encontramos anúncios no momento.</p>
      <button onclick="location.href='anunciar.html'" class="btn-anunciar">
        ➕ Criar Primeiro Anúncio
      </button>
    </div>
  `;
}

// ==========================================
// FAVORITOS
// ==========================================
function inicializarFavoritosExplorar() {
  const cards = document.querySelectorAll("#gridProdutos .card");

  if (!Array.isArray(usuario.favoritos)) {
    usuario.favoritos = [];
  }

  cards.forEach((card) => {
    const favoriteIcon = card.querySelector(".favorite-icon");  // <- aqui
    const heart = favoriteIcon?.querySelector("i");
    const produtoId = card.getAttribute("data-id"); // se você usa ID, mantenha
    const nome = card.querySelector("h3")?.textContent;

    if (!heart || !nome) return;

    // aplica estilo caso já esteja favoritado
    const jaFavoritou = usuario.favoritos.some(f => f.nome === nome);
    if (jaFavoritou) {
      heart.classList.add("favorito");
      heart.style.color = "red";
    }

    // evento de clique
    favoriteIcon.addEventListener("click", () => {
      const index = usuario.favoritos.findIndex(f => f.nome === nome);

      if (index > -1) {
        usuario.favoritos.splice(index, 1);
        heart.classList.remove("favorito");
        heart.style.color = "";
      } else {
        usuario.favoritos.push({ nome });
        heart.classList.add("favorito");
        heart.style.color = "red";
      }

      localStorage.setItem("usuarioLogado", JSON.stringify(usuario));
    });
  });
}

// ==========================================
// FILTROS
// ==========================================
function inicializarFiltros() {
  const form = document.getElementById("formFiltro");
  if (!form) {
    console.warn("⚠️ Formulário de filtros não encontrado");
    return;
  }

  const mensagem = document.getElementById("mensagemNenhum");

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    let algumVisivel = false;

    const categoria = document.getElementById("filtroCategoria")?.value || "";
    const tipo = document.getElementById("filtroTipo")?.value || "";
    const preco = document.getElementById("filtroPreco")?.value || "";
    const condicao = document.getElementById("filtroCondicao")?.value || "";

    document.querySelectorAll("#gridProdutos .card").forEach((card) => {
      let mostrar = true;

      if (categoria && card.dataset.categoria !== categoria) mostrar = false;
      if (tipo && card.dataset.tipo !== tipo) mostrar = false;

      const precoValor = parseFloat(card.dataset.preco || 0);

      if (preco) {
        if (preco === "50" && precoValor > 50) mostrar = false;
        if (preco === "100" && (precoValor < 50 || precoValor > 100)) mostrar = false;
        if (preco === "300" && (precoValor < 100 || precoValor > 300)) mostrar = false;
        if (preco === "301" && precoValor <= 300) mostrar = false;
      }

      if (condicao && card.dataset.condicao !== condicao) mostrar = false;

      card.style.display = mostrar ? "block" : "none";

      if (mostrar) algumVisivel = true;
    });

    if (mensagem) {
      mensagem.style.display = algumVisivel ? "none" : "block";
    }
  });

  // Botão limpar filtros
  const limpar = document.getElementById("limparFiltros");
  if (limpar) {
    limpar.addEventListener("click", () => {
      form.reset();
      document.querySelectorAll("#gridProdutos .card").forEach((card) => {
        card.style.display = "block";
      });
      if (mensagem) {
        mensagem.style.display = "none";
      }
    });
  }
}

// ============================
// 🛒 CARRINHO - LISTAR ITENS
// ============================
app.get("/api/carrinho/:usuarioId", async (req, res) => {
  const usuarioId = parseInt(req.params.usuarioId);

  try {
    const [rows] = await db.promise().query(`
      SELECT c.id, c.quantidade, a.id AS anuncio_id, a.nome_produto, a.preco, a.imagem,
             u.nome AS vendedor_nome, u.telefone AS vendedor_telefone
      FROM Carrinho c
      JOIN Anuncio a ON c.anuncio_id = a.id
      JOIN Usuarios u ON a.usuario_id = u.id
      WHERE c.usuario_id = ?
    `, [usuarioId]);

    res.json({ itens: rows });

  } catch (error) {
    console.error("❌ Erro ao buscar carrinho:", error);
    res.sendStatus(500);
  }
});

// ============================
// 🛒 CARRINHO - ADICIONAR ITEM
// ============================
app.post("/api/carrinho/:usuarioId", async (req, res) => {
  const usuarioId = parseInt(req.params.usuarioId);
  const { anuncio_id, quantidade = 1 } = req.body;

  try {
    const [exist] = await db.promise().query(`
      SELECT id FROM Carrinho WHERE usuario_id = ? AND anuncio_id = ?
    `, [usuarioId, anuncio_id]);

    if (exist.length > 0) {
      await db.promise().query(`
        UPDATE Carrinho SET quantidade = quantidade + ? WHERE id = ?
      `, [quantidade, exist[0].id]);
    } else {
      await db.promise().query(`
        INSERT INTO Carrinho (usuario_id, anuncio_id, quantidade)
        VALUES (?, ?, ?)
      `, [usuarioId, anuncio_id, quantidade]);
    }

    res.json({ success: true });

  } catch (error) {
    console.error("❌ Erro ao adicionar item no carrinho:", error);
    res.sendStatus(500);
  }
});

// ============================
// 🛒 CARRINHO - REMOVER ITEM
// ============================
app.delete("/api/carrinho/:usuarioId/:anuncioId", async (req, res) => {
  const { usuarioId, anuncioId } = req.params;

  try {
    await db.promise().query(`
      DELETE FROM Carrinho WHERE usuario_id = ? AND anuncio_id = ?
    `, [usuarioId, anuncioId]);

    res.json({ success: true });

  } catch (error) {
    console.error("❌ Erro ao remover item do carrinho:", error);
    res.sendStatus(500);
  }
});


// ===================== CARREGAR PAGINA DE DETALHES =====================
function irParaDetalhes(id) {
  localStorage.setItem("produtoID", id);
  window.location.href = "detalhes.html";
}

// ==========================================
// INICIALIZAR PÁGINA
// ==========================================
async function inicializarPagina() {
  try {
    await carregarCategorias();
    inicializarFiltros();
    await carregarTodosAnuncios();
    inicializarFavoritosExplorar();
  } catch (error) {
    console.error("❌ Erro ao inicializar página:", error);
  }
}