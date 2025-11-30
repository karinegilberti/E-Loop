/* livros.js — carregando livros do banco + carrinho via API (MySQL) */

document.addEventListener("DOMContentLoaded", () => {
  const API_URL = "http://localhost:3001/api/anuncios";
  const lista = document.getElementById("listaLivros");

  const contadorEl = document.getElementById("contadorCarrinho");
  const modal = document.getElementById("modalCarrinho");
  const mensagemModal = document.getElementById("mensagemModal");
  const btnFecharModal = document.querySelector(".fechar-modal");
  const btnContinuar = document.getElementById("btnContinuar");
  const btnIrCarrinho = document.getElementById("btnIrCarrinho");

  // ==================== USUÁRIO LOGADO (apenas pra manter compat) ====================
  let usuarioRaw = JSON.parse(localStorage.getItem("usuarioLogado"));
  let usuario = usuarioRaw && typeof usuarioRaw === "object" ? usuarioRaw : {};
  if (!Array.isArray(usuario.favoritos)) usuario.favoritos = [];
  localStorage.setItem("usuarioLogado", JSON.stringify(usuario));

  // ==================== FUNÇÕES AUXILIARES ====================

  function formatarBRL(valor) {
    return `R$ ${Number(valor || 0).toFixed(2).replace(".", ",")}`;
  }

  function atualizarContador() {
    // usa função global do carrinho-api.js, se existir
    if (typeof atualizarContadorCarrinhoGlobal === "function") {
      atualizarContadorCarrinhoGlobal();
    } else if (contadorEl) {
      // fallback: deixa zero
      contadorEl.textContent = "0";
    }
  }

  // ==================== BUSCAR LIVROS ====================
  async function carregarLivros() {
    try {
      const resp = await fetch(API_URL);
      const dados = await resp.json();

      // Filtra apenas anúncios da categoria "Livros"
      const livros = dados.filter(p => p.categoria_nome === "Livros");

      if (livros.length === 0) {
        lista.innerHTML =
          "<p style='text-align:center;'>Nenhum livro encontrado 📚🙂</p>";
        return;
      }

      // Monta os cards de livros
      lista.innerHTML = livros
        .map(l => {
          const preco = formatarBRL(l.preco);
          const imgPath = l.imagem || null;    // /uploads/...
          const imgUrl = imgPath
            ? `http://localhost:3001${imgPath}`
            : "src/sem-imagem.png";

          return `
        <div class="produto-card"
             data-id="${l.id}"
             data-nome="${l.nome_produto}"
             data-preco="${l.preco}"
             data-descricao="${l.descricao || ""}"
             data-condicao="${l.condicao || ""}"
             data-imagem="${imgPath || ""}"
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

  // ==================== EVENTOS DO CARD ====================
  function inicializarEventos() {
    // ➕ Adicionar ao carrinho
    document.querySelectorAll(".add-carrinho").forEach(btn => {
      btn.addEventListener("click", async e => {
        e.stopPropagation();
        const card = e.target.closest(".produto-card");
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

          // Imagem (apenas o caminho salvo no banco, ex: /uploads/...)
          imagem: card.dataset.imagem || null,

          // Vendedor
          usuario_id: parseInt(card.dataset.vendedorId) || null,
          vendedor_id: parseInt(card.dataset.vendedorId) || null,
          vendedor_nome: card.dataset.vendedorNome || "Vendedor",
          vendedor_telefone: card.dataset.vendedorTelefone || "",
          vendedor_cidade: card.dataset.vendedorCidade || "",

          // Quantidade inicial
          quantidade: 1
        };

        // Usa a função global que salva o carrinho NO BANCO (carrinho-api.js)
        if (typeof adicionarAoCarrinho === "function") {
          await adicionarAoCarrinho(produto);
          atualizarContador();

          // Mostra modal de confirmação
          if (mensagemModal && modal) {
            mensagemModal.textContent = `"${produto.nome_produto}" foi adicionado ao carrinho!`;
            modal.style.display = "flex";
          }
        } else {
          console.error(
            "Função adicionarAoCarrinho não encontrada. Certifique-se de incluir carrinho-api.js antes de livros.js."
          );
          alert("Erro ao adicionar ao carrinho (carrinho-api.js não carregado).");
        }
      });
    });

    // 🔍 Ver detalhes do livro
    document.querySelectorAll(".produto-card").forEach(card => {
      card.addEventListener("click", e => {
        // se clicou no botão de carrinho, não vai para detalhes
        if (e.target.closest(".add-carrinho")) return;

        const produtoDetalhes = {
          id: parseInt(card.dataset.id),
          nome_produto: card.dataset.nome,
          preco: parseFloat(card.dataset.preco),
          imagem: card.dataset.imagem || null, // só o caminho
          descricao: card.dataset.descricao || "",
          condicao: card.dataset.condicao || "",
          vendedor_nome: card.dataset.vendedorNome || "",
          vendedor_telefone: card.dataset.vendedorTelefone || "",
          vendedor_cidade: card.dataset.vendedorCidade || ""
        };

        localStorage.setItem(
          "produtoDetalhes",
          JSON.stringify(produtoDetalhes)
        );
        window.location.href = "detalhes.html";
      });
    });
  }

  // ==================== MODAL ====================
  if (btnFecharModal)
    btnFecharModal.addEventListener(
      "click",
      () => (modal.style.display = "none")
    );
  if (btnContinuar)
    btnContinuar.addEventListener(
      "click",
      () => (modal.style.display = "none")
    );
  if (btnIrCarrinho)
    btnIrCarrinho.addEventListener(
      "click",
      () => (window.location.href = "carrinho.html")
    );

  if (modal) {
    modal.addEventListener("click", e => {
      if (e.target === modal) modal.style.display = "none";
    });
  }

  // ==================== INICIAR ====================
  carregarLivros();
  atualizarContador();
});
