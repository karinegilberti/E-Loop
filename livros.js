/* livros.js — carregando livros do banco + carrinho via API (MySQL) */

document.addEventListener("DOMContentLoaded", () => {

  // 🔗 BACKEND DO RAILWAY
  const API_URL = "https://balanced-fascination-production.up.railway.app/api/anuncios";
  const BACKEND_URL = "https://balanced-fascination-production.up.railway.app";

  const lista = document.getElementById("listaLivros");

  const contadorEl = document.getElementById("contadorCarrinho");
  const modal = document.getElementById("modalCarrinho");
  const mensagemModal = document.getElementById("mensagemModal");
  const btnFecharModal = document.querySelector(".fechar-modal");
  const btnContinuar = document.getElementById("btnContinuar");
  const btnIrCarrinho = document.getElementById("btnIrCarrinho");

  // ==================== USUÁRIO LOGADO ====================
  let usuarioRaw = JSON.parse(localStorage.getItem("usuarioLogado"));
  let usuario = usuarioRaw && typeof usuarioRaw === "object" ? usuarioRaw : {};
  if (!Array.isArray(usuario.favoritos)) usuario.favoritos = [];
  localStorage.setItem("usuarioLogado", JSON.stringify(usuario));

  // ==================== FUNÇÕES AUXILIARES ====================

  function formatarBRL(valor) {
    return `R$ ${Number(valor || 0).toFixed(2).replace(".", ",")}`;
  }

  function montarImagem(imagem) {
    if (!imagem) return "src/sem-imagem.png";
    if (imagem.startsWith("http")) return imagem;
    return `${BACKEND_URL}${imagem}`;
  }

  function atualizarContador() {
    if (typeof atualizarContadorCarrinhoGlobal === "function") {
      atualizarContadorCarrinhoGlobal();
    }
  }

  // ==================== BUSCAR LIVROS ====================

  async function carregarLivros() {
    try {
      const resp = await fetch(API_URL);
      const dados = await resp.json();

      // 🔎 Filtrar apenas livros
      const livros = dados.filter(p => p.categoria_nome === "Livros");

      if (livros.length === 0) {
        lista.innerHTML =
          "<p style='text-align:center;'>Nenhum livro encontrado 📚🙂</p>";
        return;
      }

      // 📌 Montar cards
      lista.innerHTML = livros
        .map(l => {
          const preco = formatarBRL(l.preco);
          const imgUrl = montarImagem(l.imagem);

          return `
        <div class="produto-card"
             data-id="${l.id}"
             data-nome="${l.nome_produto}"
             data-preco="${l.preco}"
             data-descricao="${l.descricao || ""}"
             data-condicao="${l.condicao || ""}"
             data-imagem="${l.imagem || ""}"
             data-vendedor-id="${l.usuario_id || ""}"
             data-vendedor-nome="${l.vendedor_nome || ""}"
             data-vendedor-telefone="${l.vendedor_telefone || ""}"
             data-vendedor-cidade="${l.vendedor_cidade || ""}">

          <img src="${imgUrl}" alt="${l.nome_produto}">
          <h3>${l.nome_produto}</h3>
          <p>${l.descricao || "Livro usado"}</p>
          <div class="preco">${preco}</div>
          <button class="add-carrinho">Adicionar ao carrinho</button>
        </div>
      `;
        })
        .join("");

      inicializarEventos();

    } catch (erro) {
      console.error("Erro ao carregar livros:", erro);
      lista.innerHTML =
        "<p style='text-align:center;color:red;'>Erro ao carregar livros.</p>";
    }
  }

  // ==================== EVENTOS ====================

  function inicializarEventos() {

    // ➕ Adicionar ao carrinho
    document.querySelectorAll(".add-carrinho").forEach(btn => {
      btn.addEventListener("click", async e => {
        e.stopPropagation();
        const card = e.target.closest(".produto-card");
        if (!card) return;

        const produto = {
          id: Number(card.dataset.id),
          anuncio_id: Number(card.dataset.id),

          nome_produto: card.dataset.nome,
          preco: Number(card.dataset.preco),
          descricao: card.dataset.descricao,
          condicao: card.dataset.condicao,

          imagem: card.dataset.imagem,

          usuario_id: Number(card.dataset.vendedorId),
          vendedor_id: Number(card.dataset.vendedorId),
          vendedor_nome: card.dataset.vendedorNome,
          vendedor_telefone: card.dataset.vendedorTelefone,
          vendedor_cidade: card.dataset.vendedorCidade,

          quantidade: 1
        };

        // 🔥 Enviar para o banco (carrinho-api.js)
        if (typeof adicionarAoCarrinho === "function") {
          await adicionarAoCarrinho(produto);
          atualizarContador();

          if (mensagemModal) {
            mensagemModal.textContent = `"${produto.nome_produto}" foi adicionado ao carrinho!`;
            modal.style.display = "flex";
          }

        } else {
          alert("Erro: carrinho-api.js não carregado.");
        }
      });
    });

    // 👉 Ver detalhes
    document.querySelectorAll(".produto-card").forEach(card => {
      card.addEventListener("click", e => {
        if (e.target.closest(".add-carrinho")) return;

        const produtoDetalhes = {
          id: Number(card.dataset.id),
          nome_produto: card.dataset.nome,
          preco: Number(card.dataset.preco),
          imagem: montarImagem(card.dataset.imagem),
          descricao: card.dataset.descricao,
          condicao: card.dataset.condicao,
          vendedor_nome: card.dataset.vendedorNome,
          vendedor_telefone: card.dataset.vendedorTelefone,
          vendedor_cidade: card.dataset.vendedorCidade
        };

        localStorage.setItem("produtoDetalhes", JSON.stringify(produtoDetalhes));
        window.location.href = "detalhes.html";
      });
    });
  }

  // ==================== MODAL ====================

  if (btnFecharModal)
    btnFecharModal.addEventListener("click", () => modal.style.display = "none");

  if (btnContinuar)
    btnContinuar.addEventListener("click", () => modal.style.display = "none");

  if (btnIrCarrinho)
    btnIrCarrinho.addEventListener("click", () => window.location.href = "carrinho.html");

  if (modal) {
    modal.addEventListener("click", e => {
      if (e.target === modal) modal.style.display = "none";
    });
  }

  // ==================== INICIAR ====================
  carregarLivros();
  atualizarContador();
});
