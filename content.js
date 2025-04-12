// content.js

function gerarComentarioIA(texto, callback) {
  const botaoOriginal = document.querySelector('.gerar-comentario-ia');

  if (botaoOriginal) botaoOriginal.textContent = 'Gerando...';

  fetch('https://n8n-n8n.dodhyu.easypanel.host/webhook-test/comentario-linkedin', {
    method: 'POST',
    body: JSON.stringify({ texto }),
    headers: {
      'Content-Type': 'application/json'
    }
  })
    .then(res => res.json())
    .then(data => {
      if (botaoOriginal) botaoOriginal.textContent = 'Comentário pronto!';
      chrome.storage.local.set({ comentario: data.comentario });
      callback(data.comentario);
    })
    .catch(err => {
      console.error('Erro ao gerar comentário:', err);
      if (botaoOriginal) botaoOriginal.textContent = 'Erro ao gerar';
    });
}

function adicionarBotao(container, textarea, textoExtraido) {
  if (container.querySelector('.gerar-comentario-ia')) return;

  const btn = document.createElement('button');
  btn.textContent = '💬 Gerar comentário IA';
  btn.className = 'gerar-comentario-ia';
  btn.style.margin = '10px 0';
  btn.style.padding = '6px';
  btn.style.cursor = 'pointer';
  btn.style.background = '#0073b1';
  btn.style.color = '#fff';
  btn.style.border = 'none';
  btn.style.borderRadius = '4px';

  btn.onclick = () => {
    gerarComentarioIA(textoExtraido, (comentarioGerado) => {
      textarea.value = comentarioGerado;
      textarea.focus();
    });
  };

  container.appendChild(btn);
}

function observarComentarios() {
  const observer = new MutationObserver(() => {
    const caixasComentario = document.querySelectorAll('div.comments-comment-box__form, div.comments-comment-box__reply-form');

    caixasComentario.forEach(caixa => {
      const textarea = caixa.querySelector('textarea');
      if (!textarea) return;

      // Encontra o texto da publicação ou comentário associado
      let textoPost = '';
      const containerPost = caixa.closest('[data-id]');
      if (containerPost) {
        const elementoTexto = containerPost.querySelector('[dir="ltr"]');
        if (elementoTexto) textoPost = elementoTexto.innerText;
      }

      adicionarBotao(caixa, textarea, textoPost);
    });
  });

  observer.observe(document.body, { childList: true, subtree: true });
}

window.addEventListener('load', () => {
  setTimeout(observarComentarios, 2000);
});
