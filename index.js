// URL base da API (a mesma do backend)
const API_URL = "http://localhost:3001/api";

// ===============================
// 🔹 UTILITÁRIOS GERAIS
// ===============================

/**
 * Retorna o usuário logado salvo no localStorage (pelo login.js)
 */
function obterUsuarioLogadoIndex() {
  try {
    return JSON.parse(localStorage.getItem("usuarioLogado"));
  } catch (e) {
    return null;
  }
}

/**
 * Formata valor em R$.
 */
function formatarBRL(valor) {
  return `R$ ${Number(valor || 0).toFixed(2).replace(".", ",")}`;
}

/**
 * Cria a URL completa da imagem de anúncio.
 * Seu backend salva `imagem` como `/uploads/arquivo.jpg`.
 */
function montarUrlImagemAnuncio(anuncio) {
  if (!anuncio || !anuncio.imagem) {
    // fallback, só para não quebrar layout
    return "https://via.placeholder.com/200x150?text=Sem+Imagem";
  }
  // Se já começa com http, deixa como está, senão prefixa com o host
  if (anuncio.imagem.startsWith("http")) return anuncio.imagem;
  return `http://localhost:3001${anuncio.imagem}`;
}

/**
 * Atualiza o contador do carrinho no topo da página.
 * Usa a função global do carrinho-api.js se existir.
 */
function atualizarContadorIndex() {
  if (typeof atualizarContadorCarrinhoGlobal === "function") {
    atualizarContadorCarrinhoGlobal();
  }
}

// ===============================
// 🔹 LISTAGEM DE ANÚNCIOS
// ===============================

/**
 * Monta o card HTML de um anúncio da home.
 * container: #listaAnuncios (por exemplo)
 */
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

  // ======== Evento do botão "Adicionar ao carrinho" ========
  const btnAdd = card.querySelector(".btn-add-carrinho");
  btnAdd.addEventListener("click", () => {
    // Montamos o objeto que será salvo no carrinho (no BANCO)
    const produtoParaCarrinho = {
      // ID do anúncio
      id: anuncio.id,
      anuncio_id: anuncio.id,

      // Dados principais do produto
      nome: nomeProduto,
      nome_produto: nomeProduto,
      preco: anuncio.preco,
      condicao: condicao,
      descricao: anuncio.descricao,

      // Imagem exibida no carrinho
      imagem: anuncio.imagem,

      // Dados do vendedor que o backend já traz no /api/explorar/anuncios
      usuario_id: anuncio.usuario_id,
      vendedor_nome: anuncio.vendedor_nome,
      vendedor_telefone: anuncio.vendedor_telefone,
      vendedor_email: anuncio.vendedor_email || null,

      // quantidade inicial
      quantidade: 1,
    };

    // Chama a função global que salva no banco (vem do carrinho-api.js)
    if (typeof adicionarAoCarrinho === "function") {
      adicionarAoCarrinho(produtoParaCarrinho);
    } else {
      console.error("Função adicionarAoCarrinho não encontrada. Certifique-se de incluir carrinho-api.js antes de index.js.");
      alert("Erro ao adicionar ao carrinho. (carrinho-api.js não carregado)");
    }
  });

  return card;
}


/**
 * Faz o fetch dos anúncios e preenche o container na home.
 */
async function carregarAnunciosHome() {
  const container = document.getElementById("listaAnuncios");
  if (!container) {
    console.warn("Elemento #listaAnuncios não encontrado na página.");
    return;
  }

  container.innerHTML = "<p>Carregando anúncios...</p>";

  try {
    // Usa sua rota /api/explorar/anuncios que já existe no backend
    const resp = await fetch(`${API_URL}/explorar/anuncios`);
    if (!resp.ok) {
      container.innerHTML = "<p>Erro ao carregar anúncios.</p>";
      console.error("Erro ao buscar anúncios:", resp.status);
      return;
    }

    const data = await resp.json();
    const anuncios = data.anuncios || data || [];

    if (!anuncios.length) {
      container.innerHTML = "<p>Nenhum anúncio encontrado.</p>";
      return;
    }

    container.innerHTML = "";
    anuncios.forEach((anuncio) => {
      const card = criarCardAnuncio(anuncio);
      container.appendChild(card);
    });
  } catch (error) {
    console.error("Erro ao carregar anúncios:", error);
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
       data-vendedor-nome="${prod.vendedor_nome || ''}"
       data-vendedor-telefone="${prod.telefone || ''}">
       
      <div class="favorite-icon"><i class="fa fa-heart"></i></div>

      <img src="${prod.img}" alt="${prod.nome}">

      <h3>${prod.nome}</h3>

      <p class="preco">R$ ${parseFloat(prod.preco).toFixed(2)}</p>

      <button class="btn-adicionar">Ver detalhes</button>
  </div>
  `;
}


// ===================== BUSCAR PRODUTOS API =====================
async function carregarProdutos() {
  try {
    const resposta = await fetch("http://localhost:3001/api/anuncios");
    const produtos = await resposta.json();
    const lista = document.getElementById("listaProdutos");

    lista.innerHTML = produtos.map(p =>
      produtoCard({
        id: p.id,
        nome: p.nome_produto,
        preco: p.preco,
        img: p.imagem ? `http://localhost:3001${p.imagem}` : "src/sem-imagem.png",
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

    // ===================== BOTÃO "VER DETALHES" =====================
    // Faz com que o botão "Ver detalhes" dispare o mesmo clique do card
    document.querySelectorAll(".btn-adicionar").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation(); // não deixa o clique "subir" sem querer

        const card = btn.closest(".card");
        if (!card) return;

        // Dispara o MESMO clique que o card usa
        card.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      });
    });

  } catch (erro) {
    console.error("❌ Erro ao carregar produtos:", erro);
  }
}


// ===================== FAVORITOS =====================
function inicializarFavoritos() {
  document.querySelectorAll(".favorite-icon").forEach(fav => {
    fav.addEventListener("click", (e) => {
      e.stopPropagation();
      fav.classList.toggle("active");
      fav.querySelector("i").style.color = fav.classList.contains("active") ? "red" : "";
    });
  });
}


// ===================== BOTÃO ADICIONAR =====================
function inicializarBotoes() {
  document.querySelectorAll(".btn-adicionar").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();

      const card = btn.closest(".card");

      const produto = {
        anuncio_id: parseInt(card.dataset.id),
        nome_produto: card.querySelector("h3").textContent.trim(),
        preco: parseFloat(card.dataset.preco),
        imagem: card.querySelector("img").src,
        quantidade: 1,
        condicao: card.dataset.condicao,
        descricao: card.dataset.descricao,
        vendedor_id: parseInt(card.dataset.vendedorId) || null,
        vendedor_nome: card.dataset.vendedorNome || "Vendedor Demo",
        vendedor_telefone: card.dataset.vendedorTelefone || "",
      };

      const existente = carrinho.find(p => p.anuncio_id === produto.anuncio_id);
      existente ? existente.quantidade++ : carrinho.push(produto);

      localStorage.setItem("carrinhoEloop", JSON.stringify(carrinho));
      atualizarContadorCarrinho();

      Swal.fire({
        title: "🛒 Produto adicionado!",
        html: `
          <p><strong>${produto.nome_produto}</strong> foi adicionado ao seu carrinho.</p>
          <div style="margin-top: 15px;">
            <button id="verCarrinho" class="swal2-confirm swal2-styled" style="background:#007f7f;">Ver Carrinho</button>
            <button id="continuarComprando" class="swal2-cancel swal2-styled" style="background:#aaa;">Continuar Comprando</button>
          </div>
        `,
        showConfirmButton: false,
        allowOutsideClick: false,
        didOpen: () => {
          document.getElementById("verCarrinho").addEventListener("click", () => {
            window.location.href = "carrinho.html";
          });
          document.getElementById("continuarComprando").addEventListener("click", () => Swal.close());
        },
      });
    });
  });
}


// ===================== CLIQUE NO CARD: DETALHES =====================
function inicializarCliqueCard() {
  document.querySelectorAll(".card").forEach(card => {
    card.addEventListener("click", (e) => {
      // Coração não abre detalhes
      if (e.target.closest(".favorite-icon")) return;

      const produto = {
        id: parseInt(card.dataset.id),
        nome_produto: card.querySelector("h3").textContent.trim(),
        preco: parseFloat(card.dataset.preco),

        // 👇 AQUI É O PONTO IMPORTANTE: salvando como "imagem"
        imagem: card.querySelector("img").src, // URL COMPLETA da imagem

        condicao: card.dataset.condicao,
        descricao: card.dataset.descricao,
        categoria: card.dataset.categoria,
        vendedor_nome: card.dataset.vendedorNome || "",
        vendedor_telefone: card.dataset.vendedorTelefone || ""
      };

      // 👇 Sempre salva como "produtoDetalhes"
      localStorage.setItem("produtoDetalhes", JSON.stringify(produto));
      window.location.href = "detalhes.html";
    });
  });
}

// ===================== CARREGAR PAGINA DE DETALHES =====================
function irParaDetalhes(id) {
  localStorage.setItem("produtoID", id);
  window.location.href = "detalhes.html";
}

// ===================== CONTADOR DO CARRINHO =====================
function atualizarContadorCarrinho() {
  const contador = document.getElementById("contadorCarrinho");
  if (!contador) return;
  contador.textContent = carrinho.reduce((acc, p) => acc + p.quantidade, 0);
}


// ===================== INICIALIZAÇÃO =====================
document.addEventListener("DOMContentLoaded", () => {
  carregarProdutos().then(() => {
    setTimeout(() => {
      atualizarContadorCarrinho();
    }, 150);
  });
});
