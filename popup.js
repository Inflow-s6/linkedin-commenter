// popup.js

// Quando o popup carregar, busca o comentário salvo
chrome.storage.local.get("comentario", (data) => {
  const comentario = data.comentario || "Nenhum comentário encontrado.";
  document.getElementById("comentario").textContent = comentario;
});

// Botão copiar
document.getElementById("copiar").addEventListener("click", () => {
  const texto = document.getElementById("comentario").textContent;
  navigator.clipboard.writeText(texto).then(() => {
    alert("Comentário copiado!");
  });
});
