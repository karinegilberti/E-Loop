const API = "http://localhost:3001/api";

document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const vendedorId = params.get("id");
  if (!vendedorId) return alert("Erro: vendedor não informado!");

  await carregarPerfil(vendedorId);
  await carregarProdutos(vendedorId);
  await carregarAvaliacoes(vendedorId);
});

// ==== PERFIL ====
async function carregarPerfil(id) {
  const res = await fetch(`${API}/usuario/${id}`);
  const data = await res.json();
  if (!data.success) return;

  const u = data.usuario;

  document.getElementById("nomeVendedor").textContent = u.nome;
  document.getElementById("cidadeVendedor").textContent = u.endereco || "Cidade não informada";
  document.getElementById("telefoneVendedor").textContent = u.telefone ? `Telefone: ${u.telefone}` : "Telefone não disponível";
  document.getElementById("fotoVendedor").src = u.foto || "https://i.pravatar.cc/150?img=12";

  document.getElementById("btnWhatsapp").onclick = () => {
    if (!u.telefone) return alert("Vendedor não possui telefone cadastrado!");
    window.open(`https://wa.me/55${u.telefone}`, "_blank");
  };
}

// ==== PRODUTOS ====
async function carregarProdutos(id) {
  const res = await fetch(`${API}/anuncios/user/${id}`);
  const produtos = await res.json();

  const lista = document.getElementById("listaProdutosVendedor");
  lista.innerHTML = "";

  if (!produtos.length) return lista.innerHTML = "<p>Este vendedor ainda não possui produtos.</p>";

  produtos.forEach(p => {
    lista.innerHTML += `
      <div class="card" onclick="verProduto(${p.id})">
        <img src="http://localhost:3001${p.imagem}">
        <h4>${p.nome_produto}</h4>
        <p>R$ ${Number(p.preco).toFixed(2)}</p>
      </div>`;
  });
}

function verProduto(id) {
  localStorage.setItem("produtoID", id);
  window.location.href = "detalhes.html";
}

// ==== AVALIAÇÕES ====
async function carregarAvaliacoes(id) {
  const res = await fetch(`${API}/avaliacoes/${id}`);
  const data = await res.json();
  if (!data.success) return;

  document.getElementById("mediaAvaliacao").textContent = data.media.toFixed(1);
  document.getElementById("totalAvaliacoes").textContent = `${data.total} avaliações`;

  const lista = document.getElementById("listaAvaliacoes");
  lista.innerHTML = "";

  data.avaliacoes.forEach(a => {
    lista.innerHTML += `
      <div class="avaliacao-item">
        <strong>${a.avaliador}</strong> - ${a.nota} ⭐
        <p>${a.comentario || ""}</p>
      </div>`;
  });
}
