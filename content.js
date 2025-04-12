function gerarComentario(texto, campoTexto) {
  fetch('https://n8n-n8n.dodhyu.easypanel.host/webhook-test/comentario-linkedin', {
    method: 'POST',
    body: JSON.stringify({ texto }),
    headers: { 'Content-Type': 'application/json' }
  })
    .then(res => res.json())
    .then(data => {
      if (campoTexto) {
        campoTexto.value = data.comentario;
        campoTexto.dispatchEvent(new Event('input', { bubbles: true }));
      }
    })
    .catch(error => {
      console.error('Erro ao gerar comentário:', error);
    });
}

function criarBotaoIA(campoTexto, textoOriginal) {
  if (campoTexto.parentElement.querySelector('[data-gerador]')) return;

  const botao = document.createElement('button');
  botao.textContent = '💬 Gerar comentário IA';
  botao.style.marginTop = '10px';
  botao.style.padding = '6px 12px';
  botao.style.background = '#0073b1';
  botao.style.color = '#fff';
  botao.style.border = 'none';
  botao.style.borderRadius = '4px';
  botao.style.cursor = 'pointer';
  botao.setAttribute('data-gerador', 'true');

  botao.onclick = () => gerarComentario(textoOriginal, campoTexto);
  campoTexto.parentElement.appendChild(botao);
}

function observarCamposDinamicos() {
  const observer = new MutationObserver(() => {
    const textareas = Array.from(document.querySelectorAll('textarea'))
      .filter(el => !el.hasAttribute('data-verificado') &&
                    (el.placeholder?.toLowerCase().includes('comentar') ||
                     el.placeholder?.toLowerCase().includes('responder')));

    textareas.forEach(textarea => {
      textarea.setAttribute('data-verificado', 'true');

      let textoOriginal = '';

      // Se for resposta de comentário
      const comentarioPai = textarea.closest('[class*="comments-comment-item"]');
      if (comentarioPai) {
        const comentario = comentarioPai.querySelector('span, div, p');
        if (comentario) {
          textoOriginal = comentario.innerText.trim();
        }
      }

      // Se for comentário à publicação
      if (!textoOriginal) {
        const postContainer = textarea.closest('[data-id*="urn:li:activity"]');
        if (postContainer) {
          textoOriginal = postContainer.innerText.trim();
        }
      }

      if (textoOriginal && textoOriginal.length > 30) {
        criarBotaoIA(textarea, textoOriginal);
      }
    });
  });

  observer.observe(document.body, { childList: true, subtree: true });
}

window.addEventListener('load', () => {
  setTimeout(observarCamposDinamicos, 3000);
});
