/* =======================================================================
   🔗 API DO RAILWAY (PRODUÇÃO)
   ====================================================================== */
const API_URL = "https://balanced-fascination-production.up.railway.app/api";

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

    if (btnEditar) btnEditar.addEventListener("click", () => {
        preencherModalPerfil();
        modal.style.display = "flex";
    });

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
        const response = await fetch(`${API_URL}/usuario/${usuarioLogado.id}`);

        const data = await response.json();
        if (!data.success) throw new Error("Usuário não encontrado");

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
   PREENCHER MODAL PERFIL
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
        const response = await fetch(`${API_URL}/usuario/${usuarioLogado.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nome, email, telefone, endereco, bio })
        });

        if (!response.ok) throw new Error("Erro no servidor");

        alert("✅ Perfil atualizado!");
        document.getElementById("modalEditarPerfil").style.display = "none";
        carregarDadosUsuario();

    } catch (error) {
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
        const resp = await fetch(`${API_URL}/favoritos/${usuarioLogado.id}`);
        const data = await resp.json();

        const lista = data.favoritos || [];

        if (!lista.length) {
            msgVazio.style.display = "block";
            return;
        }

        msgVazio.style.display = "none";

        const promessas = lista.map(f =>
            fetch(`${API_URL}/anuncios/${f.idAnuncio}`).then(r => r.json())
        );

        const resultados = await Promise.all(promessas);

        container.innerHTML = resultados.map(item => {
            if (!item.success) return "";
            const a = item.anuncio;

            return `
                <div class="card">
                    <div class="img-box">
                        <img src="${API_URL.replace('/api','')}${a.imagem}" onerror="this.src='src/placeholder.png'">
                    </div>
                    <h3>${a.nome_produto}</h3>
                    <p class="preco">R$ ${parseFloat(a.preco).toFixed(2)}</p>
                    <button onclick="location.href='detalhes.html?id=${a.id}'" class="btn-detalhes">Ver detalhes</button>
                </div>
            `;
        }).join("");

    } catch (error) {
        console.error("Erro ao carregar favoritos:", error);
    }
}

/* =======================================================================
   CARREGAR MEUS ANÚNCIOS
   ====================================================================== */
async function carregarMeusAnuncios() {
    try {
        const response = await fetch(`${API_URL}/anuncios/user/${usuarioLogado.id}`);
        const anuncios = await response.json();

        meusAnuncios = anuncios;
        exibirMeusAnuncios(anuncios);

    } catch (error) {
        document.getElementById("container-dos-anuncios").innerHTML =
            "<p class='erro'>❌ Erro ao carregar anúncios.</p>";
    }
}

/* =======================================================================
   EXIBIR ANÚNCIOS
   ====================================================================== */
function exibirMeusAnuncios(anuncios) {
    const container = document.getElementById("container-dos-anuncios");

    if (!anuncios.length) {
        container.innerHTML = `
            <div class="sem-anuncios">
                <h3>📭 Ainda sem anúncios</h3>
                <button onclick="location.href='anunciar.html'" class="btn-criar-anuncio">Criar anúncio</button>
            </div>
        `;
        return;
    }

    container.innerHTML = anuncios.map(anuncio => `
        <div class="card">
            <div class="img-box">
                <img src="${API_URL.replace('/api','')}${anuncio.imagem}" 
                     onerror="this.src='https://picsum.photos/250/200?random=1'">
            </div>
            <h3>${anuncio.nome_produto}</h3>
            <p class="preco">R$ ${parseFloat(anuncio.preco).toFixed(2)}</p>
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
    if (!confirm("Excluir este anúncio?")) return;

    try {
        const response = await fetch(`${API_URL}/anuncios/${anuncioId}`, {
            method: "DELETE"
        });

        if (!response.ok) throw new Error();

        alert("🗑️ Anúncio removido!");
        carregarMeusAnuncios();

    } catch (error) {
        alert("Erro ao excluir.");
    }
}

/* =======================================================================
   FUNÇÕES GLOBAIS
   ====================================================================== */
window.abrirModalEditarAnuncio = abrirModalEditarAnuncio;
window.salvarEdicaoAnuncio = salvarEdicaoAnuncio;
window.excluirAnuncio = excluirAnuncio;

/* =======================================================================
   ABRIR MODAL DE EDIÇÃO
   ====================================================================== */
function abrirModalEditarAnuncio(id) {
    const anuncio = meusAnuncios.find(a => a.id === id);
    if (!anuncio) return alert("Anúncio não encontrado.");

    document.getElementById("inputTituloAnuncio").value = anuncio.nome_produto;
    document.getElementById("inputPrecoAnuncio").value = anuncio.preco;
    document.getElementById("inputCondicaoAnuncio").value = anuncio.condicao;
    document.getElementById("inputDescricaoAnuncio").value = anuncio.descricao;
    document.getElementById("previewImagemAnuncio").src =
        `${API_URL.replace('/api','')}${anuncio.imagem}`;

    document.getElementById("modalEditarAnuncio").style.display = "flex";
    document.getElementById("formEditarAnuncio").setAttribute("data-id", id);
}

/* =======================================================================
   SALVAR EDIÇÃO DO ANÚNCIO
   ====================================================================== */
async function salvarEdicaoAnuncio(event) {
    event.preventDefault();

    const anuncioId = document
        .getElementById("formEditarAnuncio")
        .getAttribute("data-id");

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
        const resp = await fetch(`${API_URL}/anuncios/${anuncioId}`, {
            method: "PUT",
            body
        });

        if (!resp.ok) throw new Error();

        alert("✏️ Anúncio atualizado!");
        document.getElementById("modalEditarAnuncio").style.display = "none";
        carregarMeusAnuncios();

    } catch (error) {
        alert("Erro ao editar anúncio.");
    }
}

/* =======================================================================
   SAIR
   ====================================================================== */
function sair() {
    if (confirm("Sair da conta?")) {
        localStorage.removeItem("usuarioLogado");
        window.location.href = "login.html";
    }
}
