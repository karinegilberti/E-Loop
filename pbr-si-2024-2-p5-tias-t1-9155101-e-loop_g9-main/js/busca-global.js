// ============================
// BUSCA GLOBAL (funciona em qualquer página)
// ============================

document.addEventListener("DOMContentLoaded", () => {
    const campoBusca = document.getElementById("campo-busca");

    if (!campoBusca) return; // se a página não tiver campo de busca, ignora

    campoBusca.addEventListener("keyup", (e) => {
        if (e.key === "Enter") {
            const texto = campoBusca.value.trim();

            if (texto.length > 0) {
                // salva a busca para o explorar.js usar
                localStorage.setItem("buscaTermo", texto);

                // redireciona para explorar
                window.location.href = "explorar.html";
            }
        }
    });
});
