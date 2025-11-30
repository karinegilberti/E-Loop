function produtoCard(prod) {
  const indisponivel = prod.estoque === 0;

  return `
    <div class="card"
      data-id="${prod.id}"
      data-preco="${prod.preco}"
      data-condicao="${prod.condicao}"
      data-cidade="${prod.cidade}"
      data-tamanho="${prod.tamanho}"
      data-vendedor="${prod.vendedor}"
      data-vendedor-info="${prod.vendedorInfo}"
      data-descricao="${prod.descricao}"
    >

      <div class="favorite-icon">
        <i class="fa fa-heart"></i>
      </div>

      <img src="${prod.img}" alt="${prod.nome}">

      <h3>${prod.nome}</h3>

      <p class="preco">R$ ${prod.preco.toFixed(2)}</p>

      ${indisponivel
        ? `<button class="btn-adicionar btn-indisponivel" disabled>Indisponível</button>`
        : `<button class="btn-adicionar">Adicionar ao Carrinho</button>`
      }
    </div>
  `;
}
