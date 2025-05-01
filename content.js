function criarBotaoIA(caixa) {
  if (caixa.parentElement.querySelector('.btn-gerar-ia')) return;

  const btn = document.createElement('button');
  btn.textContent = '💬 Gerar comentário IA';
  btn.className = 'btn-gerar-ia';
  btn.style.cssText = `
    margin-top:6px;
    padding:6px 10px;
    cursor:pointer;
    background:#0073b1;
    color:#fff;
    border:none;
    border-radius:4px;
    font-size:14px;
    display:block;
  `;

  btn.onclick = async (event) => {
    event.preventDefault();
    btn.disabled = true;
    btn.textContent = '⏳ Gerando...';

    const { texto, tipo, nome } = encontrarTextoRelacionado(caixa);

    const resp = await fetch(
      'https://n8n-n8n.dodhyu.easypanel.host/webhook/comentario-linkedin',
      {
        method: 'POST',
        body: JSON.stringify({ texto, tipo, nome }),
        headers: { 'Content-Type': 'application/json' },
      }
    );
    const data = await resp.json();
    const comentarioIA = data.comentario || '';

    // já injeta @nome na automação, aqui só cola o resultado
    preencherComentario(caixa, comentarioIA);

    btn.disabled = false;
    btn.textContent = '💬 Gerar comentário IA';
  };

  caixa.parentElement.appendChild(btn);
}

function preencherComentario(caixa, texto) {
  caixa.innerHTML = '';
  const frag = document.createDocumentFragment();
  texto.trim().split('\n').forEach((linha, i) => {
    if (i) frag.appendChild(document.createElement('br'));
    frag.appendChild(document.createTextNode(linha.trim()));
  });
  caixa.appendChild(frag);
  caixa.dispatchEvent(new InputEvent('input', { bubbles: true }));
}

function encontrarTextoRelacionado(caixa) {
  // 1) Se for resposta a comentário/feed ou subcomentário
  let el = caixa;
  while (el && !el.classList.contains('comments-comment-item')) {
    el = el.parentElement;
  }
  if (el) {
    const spans = el.querySelectorAll('span[dir="ltr"], div[dir="ltr"]');
    let texto = '';
    spans.forEach(s => {
      if (s.innerText.length > texto.length) texto = s.innerText;
    });
    const isSub = !!el.closest('.comments-comment-item__nested');
    const tipo = isSub ? 'subcomentario' : 'resposta';
    const nomeNode = el.querySelector('.comments-comment-meta__description-title');
    const nome = nomeNode?.innerText.trim() || '';
    return { texto: texto.trim(), tipo, nome };
  }

  // 2) Se for comentário em feed
  let post = caixa.closest('[data-id]');
  if (post) {
    const actor = post.querySelector('.feed-shared-actor__name');
    const nome = actor?.innerText.trim() || '';
    const full = post.innerText || '';
    // pulando horas e “Gostei/Responder…”
    const after = full.split(/\d{1,2}(?: h|d)\n/).pop() || full;
    const texto = after
      .split('\n')
      .filter(line => line && !/^(Gostei|Comentar|Compartilhar)/i.test(line))
      .join('\n')
      .trim();
    return { texto, tipo: 'publicacao', nome };
  }

  // 3) Se for comentário em newsletter/perfil (immersive reader)
  post = caixa.closest('article[itemtype="http://schema.org/NewsArticle"]');
  if (post) {
    const author = post.querySelector('.reader-author-info__name') ||
                   post.querySelector('header [data-test-reader-author-name]') ||
                   post.querySelector('header h1 + div span');
    const nome = author?.innerText.trim() || '';

    const blocks = post.querySelectorAll('.reader-article-content--content-blocks p, .reader-article-content--content-blocks h3');
    let texto = '';
    blocks.forEach(p => texto += p.innerText + '\n');
    texto = texto.trim();

    return { texto, tipo: 'newsletter', nome };
  }

  // 4) fallback geral: todo o documento
  const fallbackText = document.body.innerText.slice(0, 1000).trim();
  return { texto: fallbackText, tipo: 'publicacao', nome: '' };
}

function monitorarFoco() {
  document.body.addEventListener('focusin', e => {
    if (e.target.getAttribute('contenteditable') === 'true') {
      criarBotaoIA(e.target);
    }
  });
}

window.addEventListener('load', () => {
  setTimeout(monitorarFoco, 1500);
});
