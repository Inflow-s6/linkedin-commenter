// content.js

function criarBotaoIA(caixa) {
  // evita botões duplicados
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

  btn.onclick = async (event) => {
    event.preventDefault();
    btn.disabled = true;
    btn.textContent = '⏳ Gerando...';

    const referencia = encontrarTextoRelacionado(caixa);

    const resp = await fetch('https://n8n-n8n.dodhyu.easypanel.host/webhook/comentario-linkedin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        texto: referencia.texto,
        tipoDetectado: referencia.tipo,
        nome: referencia.nome,
      }),
    });

    const data = await resp.json();
    const comentarioIA = data.comentario || '';

    preencherComentario(caixa, comentarioIA);

    btn.disabled = false;
    btn.textContent = '💬 Gerar comentário IA';
  };

  caixa.parentElement.appendChild(btn);
}

function preencherComentario(caixa, texto) {
  caixa.innerHTML = '';
  const fragment = document.createDocumentFragment();
  texto.trim().split('\n').forEach((linha, i) => {
    if (i > 0) fragment.appendChild(document.createElement('br'));
    fragment.appendChild(document.createTextNode(linha.trim()));
  });
  caixa.appendChild(fragment);
  caixa.dispatchEvent(new InputEvent('input', { bubbles: true }));
}


function encontrarTextoRelacionado(caixa) {
  // 1) se for resposta (comentário ou subcomentário)
  let elm = caixa;
  while (elm && !elm.classList.contains('comments-comment-item')) {
    elm = elm.parentElement;
  }
  if (elm) {
    // pega o texto do comentário mais longo
    const spans = elm.querySelectorAll('span[dir="ltr"], div[dir="ltr"]');
    let txt = '';
    spans.forEach(s => {
      if (s.innerText && s.innerText.length > txt.length) txt = s.innerText;
    });
    const isSub = !!elm.closest('.comments-comment-item__nested');
    const tipo = isSub ? 'subcomentario' : 'resposta';
    // pega nome do autor do comentário
    const nomeSpan = elm.querySelector('.comments-comment-meta__description-title');
    const nome = nomeSpan?.textContent.trim() || '';
    return { texto: txt.trim(), tipo, nome };
  }

  // 2) se for publicação no feed ou perfil
  let post = caixa.closest('[data-id]');  
  if (post) {
    const textoPost = post.innerText.trim().slice(0, 1000);
    const nomeActor = post.querySelector('.feed-shared-actor__name')?.innerText.trim()
                   || post.querySelector('.update-components-actor__name')?.innerText.trim()
                   || '';
    return { texto: textoPost, tipo: 'publicacao', nome: nomeActor };
  }

  // 3) se for newsletter / artigo imersivo
  post = caixa.closest('article[itemtype="http://schema.org/NewsArticle"]');
  if (post) {
    // autor
    const auth = post.querySelector('.reader-author-info__name')
               || post.querySelector('header [data-test-reader-author-name]');
    const nome = auth?.innerText.trim() || '';
    // todo o texto visível do container imersivo
    const root = post.querySelector('[data-scaffold-immersive-reader-content]');
    const texto = root ? root.innerText.trim() : '';
    return { texto, tipo: 'newsletter', nome };
  }

  // fallback genérico
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
