/* cds.js — carregamento do banco + carrinho padronizado + vendedor */

document.addEventListener("DOMContentLoaded", () => {

  // 🔧 API DO RAILWAY — APENAS URL CORRIGIDA!
  const API_URL = "https://balanced-fascination-production.up.railway.app/api/anuncios";
  const BASE_URL = "https://balanced-fascination-production.up.railway.app";

  const lista = document.querySelector(".grid-index");

  const modal = document.querySelector(".modal");
  const modalTitle = document.querySelector(".modal-content h2");
  const btnContinuar = document.getElementById("btnContinuar");
  const btnIrCarrinho = document.getElementById("btnIrCarrinho");
  const contadorCarrinho = document.getElementById("contadorCarrinho");

  // ==================== USUÁRIO ====================
  let usuarioRaw = JSON.parse(localStorage.getItem("usuarioLogado"));
  let usuario = usuarioRaw && typeof usuarioRaw === "object" ? usuarioRaw : {};
  if (!Array.isArray(usuario.favoritos)) usuario.favoritos = [];
  localStorage.setItem("usuarioLogado", JSON.stringify(usuario));

  // ================= BUSCAR CDs DO BANCO ====================
  async function carregarCDs() {
    try {
      const resposta = await fetch(API_URL);
      const todos = await resposta.json();

      const cds = todos.filter(p => p.categoria_nome === "CDs");

      if (cds.length === 0) {
        lista.innerHTML = `<p style="text-align:center;">Nenhum CD cadastrado 🎵🙁</p>`;
        return;
      }

      lista.innerHTML = cds.map(c => `
        <div class="card"
             data-id="${c.id}"
             data-nome="${c.nome_produto}"
             data-preco="${c.preco}"
             data-img="${c.imagem ? `${BASE_URL}${c.imagem}` : "src/sem-imagem.png"}"
             data-descricao="${c.descricao || ''}"
             data-condicao="${c.condicao || ''}"
             data-vendedor-id="${c.usuario_id || ''}"
             data-vendedor-nome="${c.vendedor_nome || ''}"
             data-vendedor-telefone="${c.telefone || ''}">

          <div class="img-box">
            <img src="${c.imagem ? `${BASE_URL}${c.imagem}` : "src/sem-imagem.png"}">
            <div class="favorite-icon"><i class="fa fa-heart"></i></div>
          </div>

          <h3>${c.nome_produto}</h3>
          <p class="preco">R$ ${parseFloat(c.preco).toFixed(2)}</p>
          <button class="btn-adicionar">Comprar</button>
        </div>
      `).join("");

      inicializarEventos();
    } catch (e) {
      console.log("Erro ao buscar CDs:", e);
    }
  }

  // ================= FAVORITAR =================
  function eventoFavoritar() {
    document.querySelectorAll(".favorite-icon").forEach(icon => {
      icon.addEventListener("click", (e) => {
        e.stopPropagation();
        icon.classList.toggle("favoritado");
      });
    });
  }

  // ================= DETALHES =================
  function eventoDetalhes() {
    document.querySelectorAll(".card").forEach(card => {
      card.addEventListener("click", (e) => {
        if (e.target.closest(".btn-adicionar") || e.target.closest(".favorite-icon")) return;

        const produtoDetalhes = {
          id: parseInt(card.dataset.id),
          nome: card.dataset.nome,
          preco: parseFloat(card.dataset.preco),
          img: card.dataset.img,
          descricao: card.dataset.descricao,
          condicao: card.dataset.condicao,
          vendedor_nome: card.dataset.vendedorNome || "Vendedor Demo",
          vendedor_telefone: card.dataset.vendedorTelefone || ""
        };

        localStorage.setItem("produtoDetalhes", JSON.stringify(produtoDetalhes));
        window.location.href = "detalhes.html";
      });
    });
  }

  // ================= ADICIONAR AO CARRINHO =================
  function eventoCarrinho() {
    document.querySelectorAll(".btn-adicionar").forEach(button => {
      button.addEventListener("click", (e) => {
        e.stopPropagation();
        const card = e.target.closest(".card");

        const produto = {
          anuncio_id: parseInt(card.dataset.id),
          nome_produto: card.dataset.nome,
          preco: parseFloat(card.dataset.preco),
          imagem: card.dataset.img,
          quantidade: 1,
          condicao: card.dataset.condicao,
          descricao: card.dataset.descricao,
          vendedor_id: parseInt(card.dataset.vendedorId) || null,
          vendedor_nome: card.dataset.vendedorNome || "Vendedor Demo",
          vendedor_telefone: card.dataset.vendedorTelefone || ""
        };

        let carrinho = JSON.parse(localStorage.getItem("carrinhoEloop")) || [];

        const existente = carrinho.find(p => p.anuncio_id === produto.anuncio_id);
        if (existente) existente.quantidade++;
        else carrinho.push(produto);

        localStorage.setItem("carrinhoEloop", JSON.stringify(carrinho));

        contadorCarrinho.textContent = carrinho.reduce((acc, el) => acc + (el.quantidade || 1), 0);

        modalTitle.textContent = `${produto.nome_produto} foi adicionado ao carrinho!`;
        modal.style.display = "flex";
      });
    });
  }

  // ================= MODAL =================
  btnContinuar.addEventListener("click", () => modal.style.display = "none");
  btnIrCarrinho.addEventListener("click", () => window.location.href = "carrinho.html");
  window.addEventListener("click", (e) => { if (e.target === modal) modal.style.display = "none"; });

  // ================= INICIALIZAR EVENTOS =================
  function inicializarEventos() {
    eventoFavoritar();
    eventoDetalhes();
    eventoCarrinho();
  }

  // ================= CARREGAR =================
  carregarCDs();

  contadorCarrinho.textContent = (JSON.parse(localStorage.getItem("carrinhoEloop")) || [])
    .reduce((acc, el) => acc + (el.quantidade || 1), 0);
});