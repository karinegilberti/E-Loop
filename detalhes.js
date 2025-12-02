// ====== VARIÁVEL GLOBAL ======
let usuario = JSON.parse(localStorage.getItem("usuarioLogado")) || {};
let produtoSelecionado = JSON.parse(localStorage.getItem("produtoDetalhes")) || null;

console.log("📌 detalhes.js carregou!");
console.log("🧪 Produto vindo do backend/localStorage:", produtoSelecionado);

// 🔧 URL BASE DO RAILWAY — CORRIGIDA!
const BASE_URL = "https://balanced-fascination-production.up.railway.app";

// ====== AO CARREGAR ======
document.addEventListener("DOMContentLoaded", () => {
  if (!produtoSelecionado) return alert("Produto não encontrado!");

  preencherProduto(); 
  inicializarGaleria(); 
  inicializarBotoes();
  atualizarCarrinho();
});

// ====== PREENCHER INFORMAÇÕES DO PRODUTO ======
function preencherProduto() {
  document.getElementById("produtoNome").textContent =
    produtoSelecionado.nome_produto || produtoSelecionado.nome;

  document.getElementById("produtoPreco").textContent =
    `R$ ${Number(produtoSelecionado.preco).toFixed(2).replace(".", ",")}`;

  document.getElementById("produtoDesc").textContent =
    produtoSelecionado.descricao || "Descrição do produto não disponível";

  document.getElementById("produtoCondicao").textContent =
    produtoSelecionado.condicao || "Não informado";

  document.getElementById("produtoTamanho").textContent =
    produtoSelecionado.tamanho || "Único";

  document.getElementById("produtoCidade").textContent =
    produtoSelecionado.vendedor_cidade || produtoSelecionado.cidade || "Não informado";

  // Dados do vendedor
  document.getElementById("vendedorNome").textContent =
    produtoSelecionado.vendedor_nome || "Vendedor";

  document.getElementById("vendedorLocal").textContent =
    produtoSelecionado.vendedor_cidade || "Não informado";

  document.getElementById("vendedorInfo").textContent =
    produtoSelecionado.vendedorInfo || "Informações do vendedor não disponíveis.";
}

// ====== GALERIA DE FOTOS ======
function inicializarGaleria() {
  console.log("🔍 inicializarGaleria() chamado");

  const mainPhoto = document.getElementById("mainPhoto");
  const thumbs = document.getElementById("thumbs");

  if (!mainPhoto) {
    console.error("❌ Elemento #mainPhoto não encontrado!");
    return;
  }

  let fotoFinal = produtoSelecionado.imagem;

  // 🔧 Se a imagem NÃO começar com http, adiciona a URL do Railway (CORRIGIDO)
  if (fotoFinal && !fotoFinal.startsWith("http")) {
    fotoFinal = BASE_URL + fotoFinal;
  }

  if (!fotoFinal) {
    fotoFinal = "https://via.placeholder.com/400x300?text=Sem+Imagem";
  }

  console.log("📸 Definindo mainPhoto.src =", fotoFinal);

  mainPhoto.src = fotoFinal;
  mainPhoto.alt =
    produtoSelecionado.nome_produto ||
    produtoSelecionado.nome ||
    "Produto";

  if (thumbs) {
    thumbs.innerHTML = "";
    thumbs.style.display = "none";
  }
}

// ====== INICIALIZA BOTÕES ======
function inicializarBotoes() {

  document.getElementById("btnAddCarrinho").addEventListener("click", async () => {
    if (typeof adicionarAoCarrinho === "function") {
      await adicionarAoCarrinho(produtoSelecionado);
      alert("Produto adicionado ao carrinho! 🛒");
      atualizarCarrinho();
    } else {
      alert("Erro: carrinho-api.js não encontrado.");
    }
  });

  document.getElementById("btnComprarAgora").addEventListener("click", () => {
    alert("Funcionalidade de compra imediata ainda não disponível.");
  });

  document.getElementById("btnVerPerfil").addEventListener("click", e => {
    e.preventDefault();
    window.location.href = "minhaconta.html";
  });
}

// ====== CONTADOR DO CARRINHO ======
function atualizarCarrinho() {
  if (typeof atualizarContadorCarrinhoGlobal === "function") {
    atualizarContadorCarrinhoGlobal();
  }
}