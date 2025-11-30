// Simulação de carrinho de compras
const carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];

function adicionarAoCarrinho(nome, preco) {
  const produto = { nome, preco };
  carrinho.push(produto);
  localStorage.setItem("carrinho", JSON.stringify(carrinho));
  atualizarCarrinho();
}

function atualizarCarrinho() {
  const totalEl = document.querySelector("#total-carrinho");
  const listaEl = document.querySelector("#lista-carrinho");
  if (!totalEl || !listaEl) return;

  listaEl.innerHTML = "";
  let total = 0;
  carrinho.forEach((item, i) => {
    total += item.preco;
    const li = document.createElement("li");
    li.textContent = `${item.nome} - R$ ${item.preco.toFixed(2)}`;
    const btn = document.createElement("button");
    btn.textContent = "Remover";
    btn.onclick = () => removerItem(i);
    li.appendChild(btn);
    listaEl.appendChild(li);
  });

  totalEl.textContent = `Total: R$ ${total.toFixed(2)}`;
}

function removerItem(index) {
  carrinho.splice(index, 1);
  localStorage.setItem("carrinho", JSON.stringify(carrinho));
  atualizarCarrinho();
}

document.addEventListener("DOMContentLoaded", () => {
  atualizarCarrinho();

  document.querySelectorAll(".btn-comprar").forEach((botao) => {
    botao.addEventListener("click", () => {
      const nome = botao.dataset.nome;
      const preco = parseFloat(botao.dataset.preco);
      adicionarAoCarrinho(nome, preco);
    });
  });
});

// --- Carrinho ---
const listaCarrinho = document.getElementById("listaCarrinho");
if (listaCarrinho) {
  const atualizarTotais = () => {
    let subtotal = 0;
    document.querySelectorAll(".tabela-carrinho tbody tr").forEach((linha) => {
      const preco = parseFloat(linha.children[2].textContent.replace("R$", "").replace(",", "."));
      const qtd = parseInt(linha.querySelector(".quantidade").value);
      const totalItem = preco * qtd;
      linha.querySelector(".total-item").textContent = `R$ ${totalItem.toFixed(2).replace(".", ",")}`;
      subtotal += totalItem;
    });

    document.getElementById("subtotal").textContent = `R$${subtotal.toFixed(2).replace(".", ",")}`;
    document.getElementById("totalFinal").textContent = `R$${subtotal.toFixed(2).replace(".", ",")}`;
  };

  listaCarrinho.addEventListener("input", atualizarTotais);

  document.getElementById("btnFinalizar").addEventListener("click", () => {
    alert("✅ Compra finalizada com sucesso! Obrigado por usar o E-Loop 💚");
  });
}
