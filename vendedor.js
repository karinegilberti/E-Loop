// =========================
// 🌐 API EM PRODUÇÃO
// =========================
const BASE_URL = "https://balanced-fascination.up.railway.app";
const API = `${BASE_URL}/api`;

document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const vendedorId = params.get("id");

  if (!vendedorId) return alert("Erro: vendedor não informado!");

  await carregarPerfil(vendedorId);
  await carregarProdutos(vendedorId);
  await carregarAvaliacoes(vendedorId);
});

// =========================
// 👤 PERFIL DO VENDEDOR
// =========================
async function carregarPerfil(id) {
  try {
    const res = await fetch(`${API}/usuario/${id}`);
    const data = await res.json();

    if (!data.success || !data.usuario) return;

    const u = data.usuario;

    document.getElementById("nomeVendedor").textContent = u.nome;
    document.getElementById("cidadeVendedor").textContent = u.endereco || "Cidade não informada";
    document.getElementById("telefoneVendedor").textContent =
      u.telefone ? `Telefone: ${u.telefone}` : "Telefone não disponível";

    // Foto
    document.getElementById("fotoVendedor").src =
      u.foto ? `${BASE_URL}${u.foto}` : "https://i.pravatar.cc/150?img=12";

    // Botão WhatsApp
    document.getElementById("btnWhatsapp").onclick = () => {
      if (!u.telefone) return alert("Vendedor não possui telefone cadastrado!");
      window.open(`https://wa.me/55${u.telefone}`, "_blank");
    };

  } catch (error) {
    console.error("Erro ao carregar perfil:", error);
  }
}

// =========================
// 🛍 PRODUTOS DO VENDEDOR
// =========================
async function carregarProdutos(id) {
  try {
    const res = await fetch(`${API}/anuncios/user/${id}`);
    const produtos = await res.json();

    const lista = document.getElementById("listaProdutosVendedor");
    lista.innerHTML = "";

    if (!Array.isArray(produtos) || produtos.length === 0) {
      lista.innerHTML = "<p>Este vendedor ainda não possui produtos.</p>";
      return;
    }

    produtos.forEach(p => {
      const img = p.imagem ? `${BASE_URL}${p.imagem}` : "src/sem-imagem.png";

      lista.innerHTML += `
        <div class="card" onclick="verProduto(${p.id})">
          <img src="${img}" alt="${p.nome_produto}">
          <h4>${p.nome_produto}</h4>
          <p>R$ ${Number(p.preco).toFixed(2)}</p>
        </div>
      `;
    });

  } catch (error) {
    console.error("Erro ao carregar produtos:", error);
  }
}

function verProduto(id) {
  localStorage.setItem("produtoID", id);
  window.location.href = "detalhes.html";
}

// =========================
// ⭐ AVALIAÇÕES DO VENDEDOR
// =========================
async function carregarAvaliacoes(id) {
  try {
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
        </div>
      `;
    });

  } catch (error) {
    console.error("Erro ao carregar avaliações:", error);
  }
}
