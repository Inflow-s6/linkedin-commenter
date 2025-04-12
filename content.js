function gerarComentario(texto, campoTexto) {
  fetch('https://n8n-n8n.dodhyu.easypanel.host/webhook-test/comentario-linkedin', {
    method: 'POST',
    body: JSON.stringify({ texto }),
    headers: {
      'Content-Type': 'application/json'
    }
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
  const botao = document.createElement('button');
  botao.textContent = '💬 Gerar comentário IA';
  botao.style.margin = '10px 0';
  botao.style.padding = '6px 12px';
  botao.style.background = '#0073b1';
  botao.style.color = '#fff';
  botao.style.border = 'none';
  botao.style.borderRadius = '4px';
  botao.style.cursor = 'pointer';
  botao.setAttribute('data-gerador', 'true');

  botao.onclick = () => gerarComentario(textoOriginal, campoTexto);

  // Evita duplicação
  const jaExiste = campoTexto.parentElement.querySelector('[data-gerador]');
  if (!jaExiste) {
    campoTexto.parentElement.appendChild(botao);
  }
}

function observarComentarioOuResposta() {
  const observer = new MutationObserver(() => {
    const areasTexto = document.querySelectorAll('textarea');

    areasTexto.forEach(textarea => {
      if (textarea && !textarea.hasAttribute('data-verificado')) {
        textarea.setAttribute('data-verificado', 'true');

        let post = '';
        let containerPost = textarea.closest('[data-id*="urn:li:activity"]');

        // Quando for resposta de comentário
        if (!containerPost) {
          const bloco = textarea.closest('[class*="comments-comment-item"]');
          if (bloco) {
            const textoComentario = bloco.innerText || '';
            post = textoComentario;
          }
        } else {
          // Quando for comentário à publicação
          post = containerPost.innerText || '';
        }

        if (post.length > 30) {
          criarBotaoIA(textarea, post);
        }
      }
    });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

window.addEventListener('load', () => {
  setTimeout(observarComentarioOuResposta, 3000);
});
