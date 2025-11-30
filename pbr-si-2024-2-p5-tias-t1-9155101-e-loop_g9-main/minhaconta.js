/* =======================================================================
   VARIÁVEIS GLOBAIS
   ====================================================================== */
let usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado")) || null;
let meusAnuncios = [];

/* =======================================================================
   INICIALIZAÇÃO
   ====================================================================== */
document.addEventListener("DOMContentLoaded", function () {
    console.log("🚀 Inicializando página Minha Conta...");

    if (!usuarioLogado || !usuarioLogado.id) {
        console.warn("⚠️ Usuário não logado - redirecionando...");
        localStorage.removeItem("usuarioLogado");
        window.location.href = "login.html";
        return;
    }

    carregarDadosUsuario();
    carregarMeusAnuncios();
    configurarEventListeners();
    carregarFavoritos();
});

/* =======================================================================
   CONFIGURAR EVENT LISTENERS
   ====================================================================== */
function configurarEventListeners() {
    const modal = document.getElementById("modalEditarPerfil");
    const btnEditar = document.getElementById("btn-editar-perfil");
    const fechar = document.getElementById("fecharModal");

    if (btnEditar) {
        btnEditar.addEventListener("click", () => {
            preencherModalPerfil();
            modal.style.display = "flex";
        });
    }

    if (fechar) fechar.addEventListener("click", () => modal.style.display = "none");

    window.addEventListener("click", (e) => {
        if (e.target === modal) modal.style.display = "none";
    });

    document.getElementById("modalFormPerfil").addEventListener("submit", salvarPerfil);
    document.getElementById("modalCancelar").addEventListener("click", () => modal.style.display = "none");

    // Modal anúncio
    const modalAnuncio = document.getElementById("modalEditarAnuncio");
    const fecharAnuncio = document.getElementById("fecharModalAnuncio");

    if (fecharAnuncio) fecharAnuncio.addEventListener("click", () => modalAnuncio.style.display = "none");

    window.addEventListener("click", (e) => {
        if (e.target === modalAnuncio) modalAnuncio.style.display = "none";
    });

    document.getElementById("formEditarAnuncio").addEventListener("submit", salvarEdicaoAnuncio);
    document.getElementById("cancelarEdicaoAnuncio").addEventListener("click", () => {
        modalAnuncio.style.display = "none";
    });
}

/* =======================================================================
   CARREGAR DADOS DO USUÁRIO
   ====================================================================== */
async function carregarDadosUsuario() {
    try {
        const response = await fetch(`http://localhost:3001/api/usuario/${usuarioLogado.id}`);

        if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`);

        const data = await response.json();

        if (!data.success || !data.usuario) throw new Error("Usuário não encontrado");

        exibirDadosUsuario(data.usuario);

        localStorage.setItem("usuarioLogado", JSON.stringify(data.usuario));
        usuarioLogado = data.usuario;

    } catch (error) {
        console.error("❌ Erro ao carregar usuário:", error);
        exibirDadosUsuario(usuarioLogado);
    }
}

/* =======================================================================
   EXIBIR PERFIL
   ====================================================================== */
function exibirDadosUsuario(usuario) {
    const campos = {
        "user-name": usuario.nome,
        "user-email": usuario.email,
        "user-telefone": usuario.telefone || "Não informado",
        "user-endereco": usuario.endereco || "Não informado",
        "user-tipo": usuario.tipo_usuario || "Consumidor",
        "user-bio": usuario.bio || "Nenhuma biografia fornecida."
    };

    for (const id in campos) {
        const el = document.getElementById(id);
        if (el) el.textContent = campos[id];
    }
}

/* =======================================================================
   PREENCHER MODAL
   ====================================================================== */
function preencherModalPerfil() {
    document.getElementById("modalNome").value = usuarioLogado.nome;
    document.getElementById("modalEmail").value = usuarioLogado.email;
    document.getElementById("modalTelefone").value = usuarioLogado.telefone || "";
    document.getElementById("modalCidade").value = usuarioLogado.endereco || "";
    document.getElementById("modalBio").value = usuarioLogado.bio || "";
}

/* =======================================================================
   SALVAR PERFIL
   ====================================================================== */
async function salvarPerfil(event) {
    event.preventDefault();

    const nome = document.getElementById("modalNome").value;
    const email = document.getElementById("modalEmail").value;
    const telefone = document.getElementById("modalTelefone").value;
    const endereco = document.getElementById("modalCidade").value;
    const bio = document.getElementById("modalBio").value;

    try {
        const response = await fetch(`http://localhost:3001/api/usuario/${usuarioLogado.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nome, email, telefone, endereco, bio })
        });

        if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`);

        alert("✅ Perfil atualizado com sucesso!");
        document.getElementById("modalEditarPerfil").style.display = "none";
        carregarDadosUsuario();

    } catch (error) {
        console.error("❌ Erro ao salvar perfil:", error);
        alert("❌ Erro ao salvar perfil.");
    }
}

/* =======================================================================
   CARREGAR FAVORITOS
   ====================================================================== */
async function carregarFavoritos() {
  const container = document.getElementById("containerFavoritos");
  const msgVazio = document.getElementById("mensagemFavoritosVazio");

  try {
    const resp = await fetch(`http://localhost:3001/api/favoritos/${usuarioLogado.id}`);
    if (!resp.ok) throw new Error("Erro ao buscar favoritos");

    const data = await resp.json();
    const lista = data.favoritos || [];

    if (!lista.length) {
      msgVazio.style.display = "block";
      return;
    }

    msgVazio.style.display = "none";

    // Buscar detalhes de cada anúncio favorito
    const promessas = lista.map(f =>
      fetch(`http://localhost:3001/api/anuncios/${f.idAnuncio}`).then(r => r.json())
    );

    const resultados = await Promise.all(promessas);

    // Montar cards
    container.innerHTML = resultados.map(item => {
      if (!item.success || !item.anuncio) return "";
      const a = item.anuncio;

      return `
        <div class="card">
          <div class="img-box">
            <img src="http://localhost:3001${a.imagem || ""}" onerror="this.src='src/placeholder.png'">
          </div>
          <h3>${a.nome_produto}</h3>
          <p class="preco">R$ ${parseFloat(a.preco || 0).toFixed(2)}</p>
          <button class="btn-detalhes" onclick="window.location.href='detalhes.html?id=${a.id}'">
            Ver detalhes
          </button>
        </div>
      `;
    }).join("");

  } catch (error) {
    console.error("❌ Erro ao carregar favoritos:", error);
  }
}


/* =======================================================================
   CARREGAR ANÚNCIOS
   ====================================================================== */
async function carregarMeusAnuncios() {
    try {
        const response = await fetch(`http://localhost:3001/api/anuncios/user/${usuarioLogado.id}`);
        const anuncios = await response.json();

        meusAnuncios = anuncios;
        exibirMeusAnuncios(anuncios);

    } catch (error) {
        document.getElementById("container-dos-anuncios").innerHTML =
            "<p class='erro'>❌ Erro ao carregar anúncios.</p>";
    }
}

/* =======================================================================
   EXIBIR LISTA
   ====================================================================== */
function exibirMeusAnuncios(anuncios) {
    const container = document.getElementById("container-dos-anuncios");

    if (!anuncios || !anuncios.length) {
        container.innerHTML = `
            <div class="sem-anuncios">
                <h3>📭 Nenhum anúncio encontrado</h3>
                <button onclick="location.href='anunciar.html'" class="btn-criar-anuncio">
                    ➕ Criar Primeiro Anúncio
                </button>
            </div>
        `;
        return;
    }

    container.innerHTML = anuncios.map(anuncio => `
        <div class="card">
            <div class="img-box">
                <img src="http://localhost:3001${anuncio.imagem || ''}" 
                     onerror="this.src='https://picsum.photos/250/200?random=1'">
            </div>
            <h3>${anuncio.nome_produto}</h3>
            <p class="preco">R$ ${parseFloat(anuncio.preco || 0).toFixed(2)}</p>
            <p class="descricao">${anuncio.descricao || "Sem descrição"}</p>
            <div class="card-actions">
                <button onclick="abrirModalEditarAnuncio(${anuncio.id})" class="btn-editar">
                    <i class="fa fa-edit"></i> Editar
                </button>
                <button onclick="excluirAnuncio(${anuncio.id})" class="btn-excluir">
                    <i class="fa fa-trash"></i> Excluir
                </button>
            </div>
        </div>
    `).join("");
}

/* =======================================================================
   EXCLUIR ANÚNCIO
   ====================================================================== */
async function excluirAnuncio(anuncioId) {
    if (!confirm("❓ Tem certeza que deseja excluir este anúncio?")) return;

    try {
        const response = await fetch(`http://localhost:3001/api/anuncios/${anuncioId}`, { method: "DELETE" });

        if (!response.ok) throw new Error("Erro ao excluir");

        alert("🗑️ Anúncio excluído com sucesso!");
        carregarMeusAnuncios();

    } catch (error) {
        alert("❌ Erro ao excluir.");
    }
}

/* =======================================================================
   FUNÇÕES QUE PRECISAM SER GLOBAIS (ACESSÍVEIS PELO HTML)
   ====================================================================== */

// tornar disponível no HTML
window.abrirModalEditarAnuncio = abrirModalEditarAnuncio;
window.salvarEdicaoAnuncio = salvarEdicaoAnuncio;
window.excluirAnuncio = excluirAnuncio;

/* =======================================================================
   ABRIR MODAL DE EDIÇÃO DE ANÚNCIO
   ====================================================================== */
function abrirModalEditarAnuncio(id) {
    const anuncio = meusAnuncios.find(a => a.id === id);
    if (!anuncio) return alert("❌ Erro ao carregar anúncio.");

    document.getElementById("inputTituloAnuncio").value = anuncio.nome_produto;
    document.getElementById("inputPrecoAnuncio").value = anuncio.preco;
    document.getElementById("inputCondicaoAnuncio").value = anuncio.condicao;
    document.getElementById("inputDescricaoAnuncio").value = anuncio.descricao;
    document.getElementById("previewImagemAnuncio").src = anuncio.imagem
        ? `http://localhost:3001${anuncio.imagem}`
        : "https://via.placeholder.com/150";

    document.getElementById("modalEditarAnuncio").style.display = "flex";
    document.getElementById("formEditarAnuncio").setAttribute("data-id", id);
}

/* =======================================================================
   SALVAR EDIÇÃO DE ANÚNCIO
   ====================================================================== */
async function salvarEdicaoAnuncio(event) {
    event.preventDefault();

    const anuncioId = document.getElementById("formEditarAnuncio").getAttribute("data-id");
    const nome_produto = document.getElementById("inputTituloAnuncio").value;
    const preco = document.getElementById("inputPrecoAnuncio").value;
    const condicao = document.getElementById("inputCondicaoAnuncio").value;
    const descricao = document.getElementById("inputDescricaoAnuncio").value;

    const body = new FormData();
    body.append("nome_produto", nome_produto);
    body.append("preco", preco);
    body.append("condicao", condicao);
    body.append("descricao", descricao);

    const file = document.getElementById("inputImagemAnuncio").files[0];
    if (file) body.append("imagem", file);

    try {
        const resp = await fetch(`http://localhost:3001/api/anuncios/${anuncioId}`, {
            method: "PUT",
            body
        });

        if (!resp.ok) throw new Error("Erro HTTP");

        alert("✏️ Anúncio atualizado com sucesso!");
        document.getElementById("modalEditarAnuncio").style.display = "none";
        carregarMeusAnuncios();

    } catch (error) {
        alert("❌ Erro ao salvar edição do anúncio.");
    }
}

/* =======================================================================
   SAIR
   ====================================================================== */
function sair() {
    if (confirm("Tem certeza que deseja sair?")) {
        localStorage.removeItem("usuarioLogado");
        window.location.href = "login.html";
    }
}