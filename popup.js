// popup.js

// Escuta a mensagem vinda do content.js
chrome.runtime.onMessage.addListener((request) => {
  if (request.comentario) {
    document.getElementById('comentario').textContent = request.comentario;
  }
});

// Botão copiar
document.getElementById('copiar').addEventListener('click', () => {
  const texto = document.getElementById('comentario').textContent;
  navigator.clipboard.writeText(texto).then(() => {
    alert("Comentário copiado!");
  });
});
