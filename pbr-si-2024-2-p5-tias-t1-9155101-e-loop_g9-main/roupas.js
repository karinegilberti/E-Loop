/* roupas.js — carregando roupas do banco + carrinho via API (MySQL) */

document.addEventListener("DOMContentLoaded", () => {
  const API_URL = "http://localhost:3001/api/anuncios/categoria/1"; // categoria 1 = Roupas?
  const container = document.querySelector(".grid-index");

  const contadorEl = document.getElementById("contadorCarrinho");
  const modal = document.getElementById("modalCarrinho");
  const mensagemModal = document.getElementById("mensagemModal");
  const btnContinuar = document.getElementById("btnContinuar");
  const btnIrCarrinho = document.getElementById("btnIrCarrinho");
  const fecharModalSpan = document.querySelector(".fechar-modal");

  // ========================= USUÁRIO LOGADO (só pra manter compat) =========================
  let usuarioRaw = JSON.parse(localStorage.getItem("usuarioLogado"));
  let usuario = usuarioRaw && typeof usuarioRaw === "object" ? usuarioRaw : {};
  if (!Array.isArray(usuario.favoritos)) {
    usuario.favoritos = [];
  }
  localStorage.setItem("usuarioLogado", JSON.stringify(usuario));

  // ========================= AUXILIARES =========================
  function formatarBRL(valor) {
    return `R$ ${Number(valor || 0).toFixed(2).replace(".", ",")}`;
  }

  function atualizarContador() {
    if (typeof atualizarContadorCarrinhoGlobal === "function") {
      atualizarContadorCarrinhoGlobal();
    } else if (contadorEl) {
      contadorEl.textContent = "0";
    }
  }

  function abrirModal(msg) {
    if (!modal || !mensagemModal) return;
    mensagemModal.textContent = msg;
    modal.style.display = "flex";
  }

  function fecharModal() {
    if (!modal) return;
    modal.style.display = "none";
  }

  // ========================= CARREGAR ROUPAS =========================
  async function carregarRoupas() {
    try {
      const res = await fetch(API_URL);
      const data = await res.json();

      const lista = data.anuncios || data || [];
      mostrarCards(lista);
      inicializarEventos();

    } catch (erro) {
      console.error("Erro ao carregar roupas:", erro);
      if (container) {
        container.innerHTML = "<p style='text-align:center;color:red;'>Erro ao carregar roupas.</p>";
      }
    }
  }

  function mostrarCards(lista) {
    if (!container) return;
    container.innerHTML = "";

    if (!lista.length) {
      container.innerHTML = "<p style='text-align:center;'>Nenhuma roupa encontrada 👕🙂</p>";
      return;
    }

    lista.forEach(produto => {
      const imgPath = produto.imagem || null; // ex: /uploads/arquivo.jpg
      const imgUrl = imgPath
        ? `http://localhost:3001${imgPath}`
        : "src/sem-imagem.png";

      const precoFormatado = formatarBRL(produto.preco);

      container.innerHTML += `
      <div class="card"
           data-id="${produto.id}"
           data-nome="${produto.nome_produto}"
           data-preco="${produto.preco}"
           data-descricao="${produto.descricao || ""}"
           data-condicao="${produto.condicao || ""}"
           data-imagem="${imgPath || ""}"
           data-vendedor-id="${produto.usuario_id || ""}"
           data-vendedor-nome="${produto.vendedor_nome || ""}"
           data-vendedor-telefone="${produto.vendedor_telefone || ""}"
           data-vendedor-cidade="${produto.vendedor_cidade || ""}">
        <div class="img-box">
          <img src="${imgUrl}" alt="${produto.nome_produto}">
          <div class="favorite-icon"><i class="fa fa-heart"></i></div>
        </div>
        <h3>${produto.nome_produto}</h3>
        <p class="preco">${precoFormatado}</p>
        <button class="btn-adicionar">Comprar</button>
      </div>
    `;
    });
  }

  // ========================= EVENTOS INTERNOS =========================
  function inicializarEventos() {
    // Favoritar (visual)
    document.querySelectorAll(".favorite-icon").forEach(icon => {
      icon.addEventListener("click", e => {
        e.stopPropagation();
        icon.classList.toggle("favorito");
        // aqui você poderia salvar nos favoritos do usuário se quiser
      });
    });

    // Comprar (Adicionar ao carrinho via API)
    document.querySelectorAll(".btn-adicionar").forEach(btn => {
      btn.addEventListener("click", async e => {
        e.stopPropagation();
        const card = e.target.closest(".card");
        if (!card) return;

        const produto = {
          // IDs
          id: parseInt(card.dataset.id),
          anuncio_id: parseInt(card.dataset.id),

          // Dados do produto
          nome: card.dataset.nome,
          nome_produto: card.dataset.nome,
          preco: parseFloat(card.dataset.preco),
          descricao: card.dataset.descricao || "",
          condicao: card.dataset.condicao || "",

          // Imagem (somente caminho salvo no banco)
          imagem: card.dataset.imagem || null,

          // Dados do vendedor
          usuario_id: parseInt(card.dataset.vendedorId) || null,
          vendedor_id: parseInt(card.dataset.vendedorId) || null,
          vendedor_nome: card.dataset.vendedorNome || "Vendedor",
          vendedor_telefone: card.dataset.vendedorTelefone || "",
          vendedor_cidade: card.dataset.vendedorCidade || "",

          // Quantidade
          quantidade: 1
        };

        if (typeof adicionarAoCarrinho === "function") {
          await adicionarAoCarrinho(produto);
          atualizarContador();
          abrirModal(`"${produto.nome_produto}" foi adicionado ao carrinho!`);
        } else {
          console.error("adicionarAoCarrinho não encontrada. Inclua carrinho-api.js antes de roupas.js.");
          alert("Erro ao adicionar ao carrinho (carrinho-api.js não carregado).");
        }
      });
    });

    // Detalhes da roupa
    document.querySelectorAll(".card").forEach(card => {
      card.addEventListener("click", e => {
        // se clicou no botão ou no coração, não vai para detalhes
        if (e.target.closest(".btn-adicionar") || e.target.closest(".favorite-icon")) return;

        const produtoDetalhes = {
          id: parseInt(card.dataset.id),
          nome_produto: card.dataset.nome,
          preco: parseFloat(card.dataset.preco),
          imagem: card.dataset.imagem || null, // só o caminho (ex: /uploads/...)
          descricao: card.dataset.descricao || "",
          condicao: card.dataset.condicao || "",
          vendedor_nome: card.dataset.vendedorNome || "",
          vendedor_telefone: card.dataset.vendedorTelefone || "",
          vendedor_cidade: card.dataset.vendedorCidade || ""
        };

        localStorage.setItem("produtoDetalhes", JSON.stringify(produtoDetalhes));
        window.location.href = "detalhes.html";
      });
    });
  }

  // ========================= EVENTOS DO MODAL =========================
  btnContinuar?.addEventListener("click", fecharModal);
  fecharModalSpan?.addEventListener("click", fecharModal);
  btnIrCarrinho?.addEventListener("click", () => (window.location.href = "carrinho.html"));
  window.addEventListener("click", e => { if (e.target === modal) fecharModal(); });

  // ========================= INICIAR =========================
  carregarRoupas();
  atualizarContador();
});
