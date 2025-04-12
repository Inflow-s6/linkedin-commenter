function adicionarBotao(container, textarea) {
  const btn = document.createElement('button');
  btn.textContent = '💬 Gerar comentário IA';
  btn.style.marginTop = '8px';
  btn.style.padding = '6px';
  btn.style.cursor = 'pointer';
  btn.style.background = '#0073b1';
  btn.style.color = '#fff';
  btn.style.border = 'none';
  btn.style.borderRadius = '4px';
  btn.setAttribute('data-inserido', 'true');

  btn.onclick = () => {
    const texto = container.innerText || '';
    fetch('https://n8n-n8n.dodhyu.easypanel.host/webhook-test/comentario-linkedin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ texto })
    })
      .then(res => res.json())
      .then(data => {
        textarea.value = data.comentario || 'Comentário gerado com IA.';
        textarea.dispatchEvent(new Event('input', { bubbles: true }));
      })
      .catch(err => {
        console.error('Erro ao gerar comentário IA:', err);
        alert('Erro ao gerar comentário.');
      });
  };

  textarea.parentNode.appendChild(btn);
}

function observarCamposDeComentario() {
  const observer = new MutationObserver(() => {
    document.querySelectorAll('form').forEach(form => {
      const textarea = form.querySelector('textarea');
      const jaTemBotao = form.querySelector('button[data-inserido]');

      if (textarea && !jaTemBotao) {
        adicionarBotao(form, textarea);
      }
    });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

window.addEventListener('load', () => {
  setTimeout(observarCamposDeComentario, 2000);
});
