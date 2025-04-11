// popup.js

// Espera receber mensagem com o comentário
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.comentario) {
    document.getElementById('comentario').textContent = request.comentario;
  }
});

// Botão de copiar
document.getElementById('copiar').addEventListener('click', () => {
  const texto = document.getElementById('comentario').textContent;
  navigator.clipboard.writeText(texto).then(() => {
    alert("Comentário copiado para a área de transferência!");
  });
});
