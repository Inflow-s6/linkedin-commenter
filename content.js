function criarBotaoIA(caixa) {
  if (caixa.parentElement.querySelector('.btn-gerar-ia')) return;

  const btn = document.createElement('button');
  btn.textContent = '💬 Gerar comentário IA';
  btn.className = 'btn-gerar-ia';
  btn.style.marginTop = '6px';
  btn.style.padding = '6px 10px';
  btn.style.cursor = 'pointer';
  btn.style.background = '#0073b1';
  btn.style.color = '#fff';
  btn.style.border = 'none';
  btn.style.borderRadius = '4px';
  btn.style.fontSize = '14px';
  btn.style.display = 'block';

  btn.onclick = () => {
    const postTexto = encontrarTextoRelacionado(caixa);
    fetch('https://n8n-n8n.dodhyu.easypanel.host/webhook-test/comentario-linkedin', {
      method: 'POST',
      body: JSON.stringify({ texto: postTexto }),
      headers: { 'Content-Type': 'application/json' }
    })
    .then(res => res.json())
    .then(data => {
      chrome.storage.local.set({ comentario: data.comentario });
      alert("Comentário sugerido:\n\n" + data.comentario);
    })
    .catch(err => {
      console.error("Erro ao gerar comentário IA:", err);
      alert("Erro ao gerar comentário.");
    });
  };

  caixa.parentElement.appendChild(btn);
}

function encontrarTextoRelacionado(caixa) {
  let postPai = caixa.closest('[data-id]');
  if (postPai) {
    return postPai.innerText || '';
  }
  return document.body.innerText.slice(0, 1000); // fallback
}

function monitorarFoco() {
  document.body.addEventListener('focusin', (e) => {
    if (e.target.getAttribute('contenteditable') === 'true') {
      criarBotaoIA(e.target);
    }
  });
}

window.addEventListener('load', () => {
  setTimeout(monitorarFoco, 2000);
});
