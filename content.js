// content.js

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

    const resposta = await fetch(
      'https://n8n-n8n.dodhyu.easypanel.host/webhook/comentario-linkedin',
      {
        method: 'POST',
        body: JSON.stringify({
          texto: referencia.texto,
          tipoDetectado: referencia.tipo
        }),
        headers: { 'Content-Type': 'application/json' }
      }
    );

    const data = await resposta.json();
    const comentario = data.comentario || '';

    preencherComentario(caixa, comentario);

    btn.disabled = false;
    btn.textContent = '💬 Gerar comentário IA';
  };

  caixa.parentElement.appendChild(btn);
}

function preencherComentario(caixa, texto) {
  caixa.innerHTML = '';
  const fragment = document.createDocumentFragment();
  texto
    .trim()
    .split('\n')
    .forEach((linha, i) => {
      if (i > 0) fragment.appendChild(document.createElement('br'));
      fragment.appendChild(document.createTextNode(linha.trim()));
    });
  caixa.appendChild(fragment);
  caixa.dispatchEvent(new InputEvent('input', { bubbles: true }));
}

function encontrarTextoRelacionado(caixa) {
  // 1) Se for resposta/subcomentário:
  let comentarioEl = caixa;
  while (comentarioEl && !comentarioEl.classList.contains('comments-comment-item')) {
    comentarioEl = comentarioEl.parentElement;
  }
  if (comentarioEl) {
    const spans = comentarioEl.querySelectorAll('span[dir="ltr"], div[dir="ltr"]');
    let texto = '';
    spans.forEach((s) => {
      if (s.innerText.length > texto.length) texto = s.innerText;
    });
    const isNested = !!comentarioEl.closest('.comments-comment-item__nested');
    return { texto: texto.trim(), tipo: isNested ? 'subcomentario' : 'resposta' };
  }

  // 2) Publicação no feed ou profile:
  const post = caixa.closest('[data-id]');
  if (post) {
    // tenta texto do feed:
    let textoPost = post.innerText || '';
    return { texto: textoPost.trim().slice(0, 1000), tipo: 'publicacao' };
  }

  // 3) Newsletter / artigo:
  const article = document.querySelector('main article[itemtype="http://schema.org/NewsArticle"]');
  if (article) {
    // pega h1, h2, h3 e p dentro do conteúdo:
    const blocks = article.querySelectorAll(
      '.reader-article-content--content-blocks h1, ' +
      '.reader-article-content--content-blocks h2, ' +
      '.reader-article-content--content-blocks h3, ' +
      '.reader-article-content--content-blocks p'
    );
    let texto = '';
    blocks.forEach((blk) => {
      texto += blk.innerText.trim() + '\n';
    });
    return { texto: texto.trim(), tipo: 'publicacao' };
  }

  // fallback vazio
  return { texto: '', tipo: 'publicacao' };
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
