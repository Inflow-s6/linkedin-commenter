// content.js

function criarBotaoIA(caixa) {
  if (caixa.parentElement.querySelector('.btn-gerar-ia')) return;

  const btn = document.createElement('button');
  btn.textContent = '💬 Gerar comentário IA';
  btn.className = 'btn-gerar-ia';
  Object.assign(btn.style, {
    marginTop: '6px',
    padding: '6px 10px',
    cursor: 'pointer',
    background: '#0073b1',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    fontSize: '14px',
    display: 'block',
  });

  btn.onclick = async (e) => {
    e.preventDefault();
    btn.disabled = true;
    btn.textContent = '⏳ Gerando...';

    const ref = encontrarTextoRelacionado(caixa);
    const res = await fetch('https://n8n-n8n.dodhyu.easypanel.host/webhook/comentario-linkedin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        texto: ref.texto,
        tipoDetectado: ref.tipo,
        nome: ref.nome,
      }),
    });

    const data = await res.json();
    preencherComentario(caixa, data.comentario || '');

    btn.disabled = false;
    btn.textContent = '💬 Gerar comentário IA';
  };

  caixa.parentElement.appendChild(btn);
}

function preencherComentario(caixa, texto) {
  caixa.innerHTML = '';
  const frag = document.createDocumentFragment();
  texto.trim().split('\n').forEach((ln, i) => {
    if (i > 0) frag.appendChild(document.createElement('br'));
    frag.appendChild(document.createTextNode(ln.trim()));
  });
  caixa.appendChild(frag);
  caixa.dispatchEvent(new InputEvent('input', { bubbles: true }));
}

function encontrarTextoRelacionado(caixa) {
  // 1) resposta ou subcomentário
  let elm = caixa;
  while (elm && !elm.classList.contains('comments-comment-item')) {
    elm = elm.parentElement;
  }
  if (elm) {
    const spans = elm.querySelectorAll('span[dir="ltr"], div[dir="ltr"]');
    let txt = '';
    spans.forEach(s => {
      if (s.innerText.length > txt.length) txt = s.innerText;
    });
    const isSub = !!elm.closest('.comments-comment-item__nested');
    const tipo = isSub ? 'subcomentario' : 'resposta';
    const nome = elm.querySelector('.comments-comment-meta__description-title')?.innerText.trim() || '';
    return { texto: txt.trim(), tipo, nome };
  }

  // 2) publicação em feed ou perfil
  let post = caixa.closest('[data-id]');
  if (post) {
    const txt = post.innerText.trim().slice(0, 1000);
    const nome = post.querySelector('.feed-shared-actor__name, .update-components-actor__name')?.innerText.trim() || '';
    return { texto: txt, tipo: 'publicacao', nome };
  }

  // 3) newsletter / artigo imersivo
  post = caixa.closest('article[itemtype="http://schema.org/NewsArticle"]');
  if (post) {
    // pega nome do autor (header da newsletter)
    const nome = post.querySelector('[data-scaffold-immersive-reader-author]')?.innerText.trim()
              || post.querySelector('.reader-author-info__name')?.innerText.trim()
              || '';
    // seleciona o container inteiro do texto
    const container =
      post.querySelector('[data-scaffold-immersive-reader-content]') ||
      post.querySelector('.reader-content-blocks-container');
    const texto = container?.innerText.trim() || '';
    return { texto, tipo: 'newsletter', nome };
  }

  // fallback
  return { texto: caixa.innerText.trim(), tipo: 'publicacao', nome: '' };
}

function monitorarFoco() {
  document.body.addEventListener('focusin', e => {
    if (e.target.getAttribute('contenteditable') === 'true') {
      criarBotaoIA(e.target);
    }
  });
}

window.addEventListener('load', () => setTimeout(monitorarFoco, 2000));
