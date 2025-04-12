function gerarComentario(texto, campoTexto) {
  fetch('https://n8n-n8n.dodhyu.easypanel.host/webhook-test/comentario-linkedin', {
    method: 'POST',
    body: JSON.stringify({ texto }),
    headers: { 'Content-Type': 'application/json' }
  })
    .then(res => res.json())
    .then(data => {
      if (campoTexto) {
        if (campoTexto.tagName === 'TEXTAREA') {
          campoTexto.value = data.comentario;
          campoTexto.dispatchEvent(new Event('input', { bubbles: true }));
        } else {
          campoTexto.innerText = data.comentario;
          campoTexto.dispatchEvent(new Event('input', { bubbles: true }));
        }
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
    // Verifica campos de texto visíveis e válidos
    const campos = Array.from(document.querySelectorAll('[contenteditable="true"], textarea'))
      .filter(el =>
        !el.hasAttribute('data-verificado') &&
        el.offsetParent !== null &&
        (el.getAttribute('aria-label')?.toLowerCase().includes('comentar') ||
         el.getAttribute('aria-label')?.toLowerCase().includes('responder') ||
         el.placeholder?.toLowerCase().includes('comentar') ||
         el.placeholder?.toLowerCase().includes('responder'))
      );

    campos.forEach(campo => {
      campo.setAttribute('data-verificado', 'true');

      let textoOriginal = '';

      // Tenta achar o texto anterior da publicação
      const blocoPai = campo.closest('[data-id*="urn:li:activity"]');
      if (blocoPai) {
        const possivelTexto = blocoPai.querySelector('span, p, div');
        if (possivelTexto) textoOriginal = possivelTexto.innerText.trim();
      }

      // Se estiver dentro de comentário
      const comentarioPai = campo.closest('[class*="comments-comment-item"]');
      if (comentarioPai) {
        const comentario = comentarioPai.querySelector('span, div, p');
        if (comentario) textoOriginal = comentario.innerText.trim();
      }

      if (textoOriginal && textoOriginal.length > 20) {
        criarBotaoIA(campo, textoOriginal);
      }
    });
  });

  observer.observe(document.body, { childList: true, subtree: true });
}

window.addEventListener('load', () => {
  setTimeout(observarCamposDinamicos, 2000);
});
