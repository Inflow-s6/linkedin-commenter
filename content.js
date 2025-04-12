function adicionarBotao(caixaComentario, tipo) {
  const btn = document.createElement('button');
  btn.textContent = '💬 Gerar comentário IA';
  btn.style.marginTop = '10px';
  btn.style.padding = '6px';
  btn.style.cursor = 'pointer';
  btn.style.background = '#0073b1';
  btn.style.color = '#fff';
  btn.style.border = 'none';
  btn.style.borderRadius = '4px';

  btn.onclick = () => {
    let textoPublicacao = '';
    let textoComentario = '';

    if (tipo === 'resposta') {
      // Encontra o comentário ao qual estamos respondendo
      const comentario = caixaComentario.closest('[data-id]');
      textoComentario = comentario?.innerText || '';

      // Tenta encontrar a publicação principal (ancestral)
      const publicacao = comentario?.closest('[data-id*="urn:li:activity"]');
      textoPublicacao = publicacao?.innerText || '';
    } else {
      // Apenas publicação
      const publicacao = caixaComentario.closest('[data-id*="urn:li:activity"]');
      textoPublicacao = publicacao?.innerText || '';
    }

    // Envia ambos para o webhook
    fetch('https://n8n-n8n.dodhyu.easypanel.host/webhook-test/comentario-linkedin', {
      method: 'POST',
      body: JSON.stringify({
        texto: textoPublicacao,
        comentario: textoComentario
      }),
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then(res => res.json())
      .then(data => {
        const campoTexto = caixaComentario.querySelector('[contenteditable="true"]');
        if (campoTexto) {
          campoTexto.focus();
          document.execCommand('insertText', false, data.comentario);
        } else {
          alert('Comentário sugerido:\n\n' + data.comentario);
        }

        chrome.storage.local.set({ comentario: data.comentario });
      })
      .catch(error => {
        console.error('Erro ao gerar comentário:', error);
        alert('Erro ao gerar comentário.');
      });
  };

  caixaComentario.appendChild(btn);
}

function observarComentarios() {
  const observer = new MutationObserver(() => {
    // Para campo de comentário em publicações
    document.querySelectorAll('[data-id*="urn:li:activity"]').forEach(post => {
      const caixaComentario = post.querySelector('div[contenteditable="true"]')?.closest('div');
      if (caixaComentario && !caixaComentario.querySelector('button[data-inserido]')) {
        adicionarBotao(caixaComentario, 'publicacao');
        caixaComentario.querySelector('button:last-of-type').setAttribute('data-inserido', 'true');
      }
    });

    // Para campo de resposta a comentário
    document.querySelectorAll('div[contenteditable="true"]').forEach(editavel => {
      const caixaComentario = editavel.closest('[class*=comments-comment-box]');
      if (caixaComentario && !caixaComentario.querySelector('button[data-inserido]')) {
        adicionarBotao(caixaComentario, 'resposta');
        caixaComentario.querySelector('button:last-of-type').setAttribute('data-inserido', 'true');
      }
    });
  });

  observer.observe(document.body, { childList: true, subtree: true });
}

window.addEventListener('load', () => {
  setTimeout(observarComentarios, 3000);
});
