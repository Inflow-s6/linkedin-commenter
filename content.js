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
    const caixasComentario = document.querySelectorAll('div.comments-comment-box__form-container textarea, div.comments-comment-box__editor textarea');
    
    caixasComentario.forEach(caixa => {
      if (!caixa.parentElement.querySelector('.botao-comentario-ia')) {
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
          const textoReferencia = document.querySelector('[data-id*="urn:li:activity"]')?.innerText || 'Comentário no LinkedIn';
          gerarComentarioIA(textoReferencia, caixa);
        };
        
        caixa.parentElement.appendChild(btn);
      }
    });
  });

  observer.observe(document.body, { childList: true, subtree: true });
}

window.addEventListener('load', () => {
  setTimeout(observarComentarios, 3000);
});
