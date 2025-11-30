// ============================
// 🔹 Carrinho Sync Global - E-Loop
// ============================

// Atualiza o contador do carrinho
function atualizarContadorCarrinhoGlobal() {
  const contador = document.getElementById("contadorCarrinho");
  if (!contador) return;

  const carrinho = JSON.parse(localStorage.getItem("carrinhoEloop")) ||
                   JSON.parse(localStorage.getItem("carrinho")) || [];

  contador.textContent = carrinho.length;
}

// 🔸 Executa quando a página carrega
document.addEventListener("DOMContentLoaded", atualizarContadorCarrinhoGlobal);

// 🔸 Atualiza também quando mudar o carrinho em outra aba/página
window.addEventListener("storage", (event) => {
  if (event.key === "carrinhoEloop" || event.key === "carrinho") {
    atualizarContadorCarrinhoGlobal();
  }
});
