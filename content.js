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

    const referencia = encontrarTextoRelacionado(caixa);

    const resposta = await fetch('https://n8n-n8n.dodhyu.easypanel.host/webhook/comentario-linkedin', {
      method: 'POST',
      body: JSON.stringify({
        texto: referencia.texto,
        tipoDetectado: referencia.tipo,
        nome: referencia.nome
      }),
      headers: { 'Content-Type': 'application/json' }
    });

    const data = await resposta.json();
    const comentario = `@${referencia.nome} ${data.comentario}`;

    preencherComentario(caixa, comentario);

    btn.disabled = false;
    btn.textContent = '💬 Gerar comentário IA';
  };

  caixa.parentElement.appendChild(btn);
}

function preencherComentario(caixa, texto) {
  caixa.innerHTML = '';

  const fragment = document.createDocumentFragment();
  fragment.appendChild(document.createTextNode(texto.trim()));

  caixa.appendChild(fragment);
  caixa.dispatchEvent(new InputEvent("input", { bubbles: true }));
}

function encontrarTextoRelacionado(caixa) {
  let comentarioElement = caixa.closest('.comments-comment-item');

  if (comentarioElement) {
    // Comentário ou resposta
    const spans = comentarioElement.querySelectorAll('span[dir="ltr"], div[dir="ltr"]');
    let textoComentario = '';
    spans.forEach(span => {
      if (span.innerText && span.innerText.length > textoComentario.length) {
        textoComentario = span.innerText;
      }
    });

    const isSubcomentario = comentarioElement.closest('.comments-comment-item__nested');
    const tipo = isSubcomentario ? 'subcomentario' : 'resposta';

    const nome = comentarioElement.querySelector('.comments-comment-item__main-content span.comments-comment-meta__description-title')?.innerText.trim() || '';

    return {
      texto: textoComentario.trim(),
      tipo,
      nome
    };
  }

  // Caso seja comentário principal na publicação
  const post = caixa.closest('[data-id]');
  const textoPost = post?.innerText || '';
  const nomePost = post?.querySelector('span.update-components-actor__title > span > span')?.innerText?.trim() || '';

  return {
    texto: textoPost.trim().slice(0, 1000),
    tipo: 'publicacao',
    nome: nomePost
  };
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
