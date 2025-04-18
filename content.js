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

  btn.onclick = async (event) => {
    event.preventDefault();

    btn.disabled = true;
    btn.textContent = '⏳ Gerando...';

    const textoReferencia = encontrarTextoRelacionado(caixa);

    const resposta = await fetch('https://n8n-n8n.dodhyu.easypanel.host/webhook/comentario-linkedin', {
      method: 'POST',
      body: JSON.stringify({ texto: textoReferencia }),
      headers: { 'Content-Type': 'application/json' }
    });

    const data = await resposta.json();
    const comentario = data.comentario;

    preencherComentario(caixa, comentario);

    btn.disabled = false;
    btn.textContent = '💬 Gerar comentário IA';
  };

  caixa.parentElement.appendChild(btn);
}

function preencherComentario(caixa, texto) {
  caixa.innerHTML = '';

  const fragment = document.createDocumentFragment();
  const linhas = texto.trim().split('\n');

  linhas.forEach((linha, index) => {
    if (index > 0) fragment.appendChild(document.createElement('br'));
    fragment.appendChild(document.createTextNode(linha.trim()));
  });

  caixa.appendChild(fragment);
  caixa.dispatchEvent(new InputEvent("input", { bubbles: true }));
}

// ✅ AJUSTE QUE RESOLVE O PROBLEMA DE SUBCOMENTÁRIOS
function encontrarTextoRelacionado(caixa) {
  let comentarioElement = caixa;

  // Sobe até encontrar o comentário diretamente relacionado (mais próximo)
  while (comentarioElement && !comentarioElement.classList.contains('comments-comment-item')) {
    comentarioElement = comentarioElement.parentElement;
  }

  if (comentarioElement) {
    const spans = comentarioElement.querySelectorAll('span[dir="ltr"], div[dir="ltr"]');
    let textoComentario = '';
    spans.forEach(span => {
      if (span.innerText && span.innerText.length > textoComentario.length) {
        textoComentario = span.innerText;
      }
    });
    return textoComentario.trim();
  }

  // Se não encontrar comentário (publicação principal)
  const post = caixa.closest('[data-id]');
  const textoPost = post?.innerText || '';
  return textoPost.trim().slice(0, 1000);
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
