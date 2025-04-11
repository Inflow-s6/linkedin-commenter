function adicionarBotao(post) {
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
    const texto = post.innerText;
    fetch('https://n8n-n8n.dodhyu.easypanel.host/webhook-test/comentario-linkedin', {
      method: 'POST',
      body: JSON.stringify({ texto }),
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then(res => res.json())
    .then(data => {
      // Mostra alerta
      alert('Comentário sugerido:\n\n' + data.comentario);

      // Salva o comentário localmente para o popup pegar depois
      chrome.storage.local.set({ comentario: data.comentario });
    })
    .catch(error => {
      console.error('Erro ao gerar comentário:', error);
      alert('Erro ao gerar comentário.');
    });
  };

  post.appendChild(btn);
}

function observarPosts() {
  const observer = new MutationObserver(() => {
    document.querySelectorAll('[data-id*="urn:li:activity"]').forEach(post => {
      if (!post.querySelector('button[data-inserido]')) {
        adicionarBotao(post);
        post.querySelector('button:last-of-type').setAttribute('data-inserido', 'true');
      }
    });
  });

  observer.observe(document.body, { childList: true, subtree: true });
}

window.addEventListener('load', () => {
  setTimeout(observarPosts, 3000);
});
