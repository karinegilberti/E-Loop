/* vinil.js — carregando vinis do banco + carrinho via API (MySQL) */

document.addEventListener("DOMContentLoaded", () => {

  const API_URL = "http://localhost:3001/api/explorar/anuncios";
  const container = document.querySelector(".grid-index");

  const modal = document.getElementById("modalCarrinho");
  const mensagemModal = document.getElementById("mensagemModal");
  const btnContinuar = document.getElementById("btnContinuar");
  const btnIrCarrinho = document.getElementById("btnIrCarrinho");
  const fecharModalSpan = document.querySelector(".fechar-modal");
  const contadorEl = document.getElementById("contadorCarrinho");

  // ==================== USUÁRIO ====================
  let usuarioRaw = JSON.parse(localStorage.getItem("usuarioLogado"));
  let usuario = usuarioRaw && typeof usuarioRaw === "object" ? usuarioRaw : {};
  if (!Array.isArray(usuario.favoritos)) usuario.favoritos = [];
  localStorage.setItem("usuarioLogado", JSON.stringify(usuario));

  // ==================== FORMATADOR ====================
  function formatarBRL(valor) {
    return `R$ ${Number(valor).toFixed(2).replace(".", ",")}`;
  }

  function atualizarContador() {
    // contador oficial do carrinho via banco
    if (typeof atualizarContadorCarrinhoGlobal === "function") {
      atualizarContadorCarrinhoGlobal();
    } else if (contadorEl) contadorEl.textContent = "0";
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

  // ==================== BUSCAR VINIS ====================
  async function carregarVinis() {
    try {
      const resp = await fetch(API_URL);
      const data = await resp.json();

      const vinis = data.anuncios.filter(p => p.categoria_nome === "Vinil");

      if (!vinis.length) {
        container.innerHTML = "<p style='text-align:center;'>Nenhum vinil cadastrado 🎶🙂</p>";
        return;
      }

      container.innerHTML = vinis.map(v => {
        const imgPath = v.imagem || null; // /uploads/arquivo.jpg
        const imgUrl = imgPath ? `http://localhost:3001${imgPath}` : "src/sem-imagem.png";
        const precoConvertido = formatarBRL(v.preco);

        return `
          <div class="card"
               data-id="${v.id}"
               data-nome="${v.nome_produto}"
               data-preco="${v.preco}"
               data-condicao="${v.condicao || ''}"
               data-imagem="${imgPath || ''}"
               data-vendedor-id="${v.usuario_id || ''}"
               data-vendedor-nome="${v.vendedor_nome || ''}"
               data-vendedor-telefone="${v.vendedor_telefone || ''}"
               data-vendedor-cidade="${v.vendedor_cidade || ''}"
               data-descricao="${v.descricao || ''}">
    
            <div class="img-box">
              <img src="${imgUrl}" alt="${v.nome_produto}">
              <div class="favorite-icon"><i class="fa fa-heart"></i></div>
            </div>
    
            <h3>${v.nome_produto}</h3>
            <p class="preco">${precoConvertido}</p>
            <button class="btn-adicionar">Comprar</button>
          </div>
        `;
      }).join("");

      inicializarEventos();

    } catch (err) {
      console.error("Erro ao carregar vinis: ", err);
      container.innerHTML = "<p style='text-align:center;color:red;'>Erro ao carregar vinis.</p>";
    }
  }

  // ==================== EVENTOS ====================
  function inicializarEventos() {

    // ❤️ Favoritar
    document.querySelectorAll(".favorite-icon").forEach(icon => {
      icon.addEventListener("click", e => {
        e.stopPropagation();
        icon.classList.toggle("favoritado");
      });
    });

    // 🛒 Comprar → Carrinho NO BANCO
    document.querySelectorAll(".btn-adicionar").forEach(btn => {
      btn.addEventListener("click", async e => {
        e.stopPropagation();
        const card = e.target.closest(".card");
        if (!card) return;

        const produto = {
          // IDs
          id: parseInt(card.dataset.id),
          anuncio_id: parseInt(card.dataset.id),

          // Dados
          nome: card.dataset.nome,
          nome_produto: card.dataset.nome,
          preco: parseFloat(card.dataset.preco),
          condicao: card.dataset.condicao || "",
          descricao: card.dataset.descricao || "",

          // Imagem (salvar só o caminho original!)
          imagem: card.dataset.imagem || null,

          // Vendedor
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
          alert("Erro ao adicionar ao carrinho: carrinho-api.js não encontrado.");
          console.error("adicionarAoCarrinho não encontrada! Inclua carrinho-api.js antes de vinil.js.");
        }
      });
    });

    // 🔍 Ver detalhes
    document.querySelectorAll(".card").forEach(card => {
      card.addEventListener("click", e => {
        // Se clicou no coração ou comprar, não abre detalhes
        if (e.target.closest(".btn-adicionar") || e.target.closest(".favorite-icon")) return;

        const produtoDetalhes = {
          id: parseInt(card.dataset.id),
          nome_produto: card.dataset.nome,
          preco: parseFloat(card.dataset.preco),
          imagem: card.dataset.imagem || null,
          condicao: card.dataset.condicao,
          descricao: card.dataset.descricao,
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
  btnContinuar?.addEventListener("click", fecharModal);
  fecharModalSpan?.addEventListener("click", fecharModal);
  btnIrCarrinho?.addEventListener("click", () => window.location.href = "carrinho.html");
  window.addEventListener("click", e => { if (e.target === modal) fecharModal(); });

  // ==================== INICIAR ====================
  carregarVinis();
  atualizarContador();
});
