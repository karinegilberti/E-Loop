// Exibe saudação dinâmica
document.addEventListener("DOMContentLoaded", () => {
  const saudacao = document.querySelector("#saudacao");
  const hora = new Date().getHours();

  if (hora < 12) saudacao.textContent = "Bom dia!";
  else if (hora < 18) saudacao.textContent = "Boa tarde!";
  else saudacao.textContent = "Boa noite!";

  // Animação simples no banner
  const banner = document.querySelector(".banner");
  if (banner) {
    banner.style.opacity = "0";
    setTimeout(() => {
      banner.style.transition = "opacity 1.2s";
      banner.style.opacity = "1";
    }, 300);
  }
});

// Ações rápidas no menu
document.querySelectorAll(".menu-item").forEach((item) => {
  item.addEventListener("mouseenter", () => {
    item.classList.add("hovered");
  });
  item.addEventListener("mouseleave", () => {
    item.classList.remove("hovered");
  });
});
