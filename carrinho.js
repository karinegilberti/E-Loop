// ================================================================
// 🛒 CARRINHO.JS — E-Loop (sem quantidade, sincronizado com MySQL)
// ================================================================

let usuarioLogado = null;

try {
  usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));
} catch (e) {
  usuarioLogado = null;
}


document.addEventListener("DOMContentLoaded", () => {

  const API = "http://localhost:3001/api";

  const tabelaCarrinhoBody = document.getElementById("listaCarrinho");
  const subtotalEl = document.getElementById("subtotal");
  const taxasEl = document.getElementById("taxas");
  const totalFinalEl = document.getElementById("totalFinal");
  const contadorEl = document.getElementById("contadorCarrinho");
  const btnFinalizar = document.getElementById("btnFinalizar");

  let carrinho = [];
  let usuario = JSON.parse(localStorage.getItem("usuarioLogado")) || null;

  // ============= FUNÇÕES AUXILIARES =============
  const formataBRL = v => `R$ ${Number(v || 0).toFixed(2).replace(".", ",")}`;

  const nomeProduto = p => p.nome || p.nome_produto || p.titulo || "Produto";
  const condicaoProduto = p => p.condicao || "N/A";

  const fotoProduto = p => {
    if (p.img) return p.img;
    if (p.imagem) return `http://localhost:3001${p.imagem}`;
    return "https://via.placeholder.com/80?text=Sem+Imagem";
  };

  const dadosVendedor = p => ({
    id: p.usuario_id,
    nome: p.vendedor_nome || "Vendedor",
    telefone: p.vendedor_telefone || null,
    email: p.vendedor_email || null,
  });

  // ============= CONTADOR =============
  async function atualizarContador() {
    if (!contadorEl) return;
    if (!usuario || !usuario.id) return contadorEl.textContent = 0;

    try {
      const r = await fetch(`${API}/carrinho/${usuario.id}`);
      const d = await r.json();
      contadorEl.textContent = (d.itens || []).length;
    } catch {
      contadorEl.textContent = 0;
    }
  }

  // ============= BUSCAR ITENS COMPLETOS NO SERVIDOR =============
  async function carregarCarrinho() {
    if (!usuario || !usuario.id) {
      carrinho = [];
      atualizarCarrinhoNaTela();
      atualizarContador();
      return;
    }

    try {
      const resp = await fetch(`${API}/carrinho/${usuario.id}`);
      const data = await resp.json();
      const itens = data.itens || [];

      const lista = [];
      for (const item of itens) {
        const r = await fetch(`${API}/anuncios/${item.anuncio_id}`);
        const d = await r.json();
        if (d && d.anuncio) lista.push(d.anuncio);
      }
      carrinho = lista;
    } catch {
      carrinho = [];
    }

    atualizarCarrinhoNaTela();
    atualizarContador();
  }

  // ============= REMOVER ITEM =============
  async function removerItem(index) {
    const anuncioID = carrinho[index].id;
    carrinho.splice(index, 1);

    try {
      let itens = carrinho.map(i => ({ anuncio_id: i.id }));
      await fetch(`${API}/carrinho/${usuario.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itens })
      });
    } catch (e) {
      console.error("Erro ao remover:", e);
    }

    atualizarCarrinhoNaTela();
    atualizarContador();
  }

  // ============= TABELA NA TELA =============
  function atualizarCarrinhoNaTela() {
    tabelaCarrinhoBody.innerHTML = "";

    if (!carrinho.length) {
      tabelaCarrinhoBody.innerHTML = `
        <tr><td colspan="6" style="text-align:center;">Seu carrinho está vazio 🛒</td></tr>`;
      subtotalEl.textContent = taxasEl.textContent = totalFinalEl.textContent = "R$ 0,00";
      return;
    }

    carrinho.forEach((p, i) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td style="display:flex;align-items:center;gap:10px;">
          <img src="${fotoProduto(p)}" style="width:60px;height:60px;border-radius:8px;object-fit:cover;">
          <strong>${nomeProduto(p)}</strong>
        </td>
        <td>${condicaoProduto(p)}</td>
        <td>${formataBRL(p.preco)}</td>
        <td><button class="btn-remover" data-index="${i}">Remover</button></td>
      `;

      tr.querySelector(".btn-remover").onclick = () => removerItem(i);
      tabelaCarrinhoBody.appendChild(tr);
    });

    let total = carrinho.reduce((s, p) => s + Number(p.preco), 0);
    subtotalEl.textContent = totalFinalEl.textContent = formataBRL(total);
    taxasEl.textContent = "R$ 0,00";
  }

  // ============= FINALIZAR COMPRA (WHATSAPP + E-MAIL) =============
function finalizar() {
  if (!carrinho.length) return alert("Carrinho está vazio!");

  if (!usuarioLogado || !usuarioLogado.id) {
    alert("Você precisa estar logado para finalizar a compra.");
    window.location.href = "login.html";
    return;
  }

  // Agrupar itens por vendedor
  const grupos = {};
  carrinho.forEach(p => {
    const v = dadosVendedor(p);
    if (!grupos[v.id]) grupos[v.id] = { ...v, itens: [] };
    grupos[v.id].itens.push(p);
  });

  // ===== Overlay e Container do Modal =====
  const overlay = document.createElement("div");
  overlay.className = "modal-overlay-finalizar";
  overlay.innerHTML = `
    <div class="modal-finalizar">
      <button class="modal-fechar" aria-label="Fechar">&times;</button>
      <h2>Finalizar compra - Contato com o vendedor</h2>
      <p class="texto-modal">Entre em contato com o vendedor para combinar pagamento e retirada.</p>
      <div class="modal-corpo"></div>
      <div class="area-fechar">
        <button class="btn-fechar-global">Fechar</button>
      </div>
    </div>`;
  document.body.appendChild(overlay);

  const corpo = overlay.querySelector(".modal-corpo");

  // ===== Blocos do vendedor =====
  Object.values(grupos).forEach(v => {
    const itens = v.itens.map(i => `• ${nomeProduto(i)} - ${formataBRL(i.preco)}`).join("<br>");
    const msg = `Olá ${v.nome}, tenho interesse em: ${v.itens.map(i => `"${nomeProduto(i)}"`).join(", ")}. Podemos combinar pagamento e entrega?`;

    const bloco = document.createElement("div");
    bloco.className = "vendedor-bloco";
    bloco.innerHTML = `
      <div class="vendedor-info">
        <h3>${v.nome}</h3>
        <p class="vendedor-contato">${v.telefone ? "📱 " + v.telefone : "Sem WhatsApp informado"}</p>
        <p class="vendedor-contato">${v.email ? "✉ " + v.email : ""}</p>
        <div class="vendedor-itens">${itens}</div>
        <div class="vendedor-acoes"></div>
      </div>`;

    const acoes = bloco.querySelector(".vendedor-acoes");

    if (v.telefone) {
      const b = document.createElement("button");
      b.className = "btn-whatsapp";
      b.innerHTML = "💬 WhatsApp";
      b.onclick = () => window.open("https://wa.me/" + v.telefone.replace(/\D/g, "") + "?text=" + encodeURIComponent(msg));
      acoes.appendChild(b);
    }

    if (v.email) {
      const b = document.createElement("button");
      b.className = "btn-email";
      b.innerHTML = "📧 E-mail";
      b.onclick = () => window.location.href = `mailto:${v.email}?subject=Interesse nos produtos&body=${encodeURIComponent(msg)}`;
      acoes.appendChild(b);
    }

    corpo.appendChild(bloco);
  });

  // ===== Fechar modal =====
  overlay.querySelector(".modal-fechar").onclick =
  overlay.querySelector(".btn-fechar-global").onclick =
    () => overlay.remove();
}

  // ============= BOTÃO FINALIZAR =============
  btnFinalizar && (btnFinalizar.onclick = finalizar);

  // ============= INICIALIZAÇÃO =============
  carregarCarrinho();
  atualizarContador();

});
