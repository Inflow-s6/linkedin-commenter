function gerarComentarioIA(texto, campoComentario) {
  fetch('https://n8n-n8n.dodhyu.easypanel.host/webhook-test/comentario-linkedin', {
    method: 'POST',
    body: JSON.stringify({ texto }),
    headers: {
      'Content-Type': 'application/json'
    }
  })
  .then(res => res.json())
  .then(data => {
    campoComentario.value = data.comentario;
    campoComentario.dispatchEvent(new Event('input', { bubbles: true }));
  })
  .catch(error => {
    console.error('Erro ao gerar comentário:', error);
    alert('Erro ao gerar comentário.');
  });
}

function observarComentarios() {
  const observer = new MutationObserver(() => {
    // Seletor para caixas de comentários e respostas
    const caixasComentario = document.querySelectorAll('textarea[aria-label="Adicionar comentário"], textarea[aria-label="Adicionar uma resposta"]');

    caixasComentario.forEach(caixa => {
      const jaTemBotao = caixa.parentElement.querySelector('.botao-comentario-ia');
      if (!jaTemBotao) {
        const btn = document.createElement('button');
        btn.textContent = '💬 Gerar comentário IA';
        btn.className = 'botao-comentario-ia';
        btn.style.marginTop = '8px';
        btn.style.padding = '6px 10px';
        btn.style.cursor = 'pointer';
        btn.style.background = '#0073b1';
        btn.style.color = '#fff';
        btn.style.border = 'none';
        btn.style.borderRadius = '4px';

        btn.onclick = () => {
          // Captura o texto do post ou comentário
          const postPai = caixa.closest('[data-id]');
          const textoReferencia = postPai?.innerText || document.body.innerText.slice(0, 1000);
          gerarComentarioIA(textoReferencia, caixa);
        };

        // Adiciona o botão depois da caixa de texto
        caixa.parentElement.appendChild(btn);
      }
    });
  });

  observer.observe(document.body, { childList: true, subtree: true });
}

window.addEventListener('load', () => {
  setTimeout(observarComentarios, 3000);
});
