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

  btn.onclick = async () => {
    const postTexto = encontrarTextoRelacionado(caixa);
    const resposta = await fetch('https://n8n-n8n.dodhyu.easypanel.host/webhook-test/comentario-linkedin', {
      method: 'POST',
      body: JSON.stringify({ texto: postTexto }),
      headers: { 'Content-Type': 'application/json' }
    });

    const data = await resposta.json();
    const comentario = data.comentario;

    preencherComentario(caixa, comentario);
  };

  caixa.parentElement.appendChild(btn);
}

function preencherComentario(caixa, texto) {
  caixa.focus();
  caixa.innerHTML = '';
  texto.split('\n').forEach((linha, i) => {
    if (i > 0) caixa.appendChild(document.createElement('br'));
    caixa.appendChild(document.createTextNode(linha));
  });
  caixa.dispatchEvent(new InputEvent("input", { bubbles: true }));
}

function encontrarTextoRelacionado(caixa) {
  // Tenta encontrar o bloco de comentário pai (resposta a um comentário)
  const blocoResposta = caixa.closest('div.comments-comment-item');

  if (blocoResposta) {
    const textoComentarioPai = blocoResposta.querySelector('.update-components-text') || blocoResposta.querySelector('[data-testid="comment-body"]');
    if (textoComentarioPai) {
      return textoComentarioPai.innerText || textoComentarioPai.textContent || '';
    }
  }

  // Se não for resposta, procura o conteúdo da publicação principal
  const postPai = caixa.closest('[data-id]');
  if (postPai) {
    const textoPost = postPai.innerText || postPai.textContent;
    return textoPost || '';
  }

  // Fallback
  return document.body.innerText.slice(0, 1000);
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
