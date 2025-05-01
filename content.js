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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          texto: referencia.texto,
          tipoDetectado: referencia.tipo,
          nome: referencia.nome
        })
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
  const frag = document.createDocumentFragment();
  texto
    .trim()
    .split('\n')
    .forEach((line, i) => {
      if (i > 0) frag.appendChild(document.createElement('br'));
      frag.appendChild(document.createTextNode(line.trim()));
    });
  caixa.appendChild(frag);
  caixa.dispatchEvent(new InputEvent('input', { bubbles: true }));
}

function encontrarTextoRelacionado(caixa) {
  // 1) Se for resposta (nível 1) ou subcomentário (nível 2)
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
    const isNested = !!el.closest('.comments-comment-item__nested');
    return { texto: texto.trim(), tipo: isNested ? 'subcomentario' : 'resposta', nome: '' };
  }

  // 2) Se for publicação no feed ou perfil
  const post = caixa.closest('[data-id]');
  if (post) {
    const textoPost = post.innerText || '';
    return { texto: textoPost.trim().slice(0,1000), tipo: 'publicacao', nome: '' };
  }

  // 3) Se for newsletter / artigo
  const article = document.querySelector('main article[itemtype="http://schema.org/NewsArticle"]');
  if (article) {
    // extrai nome do autor via <h2 class="text-heading-medium">
    const authorEl = article.querySelector('h2.text-heading-medium');
    const nomeAutor = authorEl?.innerText.trim() || '';

    // extrai blocos de texto: h1-h3 e p
    const blocks = article.querySelectorAll(
      '.reader-article-content--content-blocks h1, ' +
      '.reader-article-content--content-blocks h2, ' +
      '.reader-article-content--content-blocks h3, ' +
      '.reader-article-content--content-blocks p'
    );
    let texto = '';
    blocks.forEach(b => {
      texto += b.innerText.trim() + '\n';
    });

    return {
      texto: texto.trim(),
      tipo: 'publicacao',
      nome: nomeAutor
    };
  }

  // 4) fallback
  return { texto: '', tipo: 'publicacao', nome: '' };
}

function monitorarFoco() {
  document.body.addEventListener('focusin', e => {
    if (e.target.getAttribute('contenteditable') === 'true') {
      criarBotaoIA(e.target);
    }
  });
}

window.addEventListener('load', () => {
  setTimeout(monitorarFoco, 2000);
});
