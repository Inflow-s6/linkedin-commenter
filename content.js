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

  btn.onclick = async (event) => {
    event.preventDefault();
    btn.disabled = true;
    btn.textContent = '⏳ Gerando...';

    const { texto, tipo, nome } = encontrarTextoRelacionado(caixa);

    const resp = await fetch(
      'https://n8n-n8n.dodhyu.easypanel.host/webhook/comentario-linkedin',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ texto, tipoDetectado: tipo, nome })
      }
    );
    const data = await resp.json();
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
  texto.trim().split('\n').forEach((line, i) => {
    if (i) frag.appendChild(document.createElement('br'));
    frag.appendChild(document.createTextNode(line.trim()));
  });
  caixa.appendChild(frag);
  caixa.dispatchEvent(new InputEvent('input', { bubbles: true }));
}

function encontrarTextoRelacionado(caixa) {
  // 1) Resposta ou subcomentário
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

  // 2) Publicação no feed ou perfil
  const post = caixa.closest('[data-id]');
  if (post) {
    const textoPost = post.innerText || '';
    return { texto: textoPost.trim().slice(0,1000), tipo: 'publicacao', nome: '' };
  }

  // 3) Newsletter / Article (schema.org/NewsArticle)
  const article = document.querySelector('article[itemtype="http://schema.org/NewsArticle"]');
  if (article) {
    // Extrai nome do autor: busca primeiro um <h2>, senão texto no header abaixo do título
    let nomeAutor = '';
    const h2 = article.querySelector('h2.text-heading-medium, h2');
    if (h2 && h2.innerText.trim().length > 0) {
      nomeAutor = h2.innerText.trim();
    } else {
      // fallback genérico: pega primeiro link de perfil dentro do artigo
      const link = article.querySelector('a[href*="/in/"]');
      if (link) nomeAutor = link.innerText.trim();
    }
    // Extrai blocos de conteúdo: heading / parágrafos
    const sel = [
      '.reader-article-content--content-blocks h1',
      '.reader-article-content--content-blocks h2',
      '.reader-article-content--content-blocks h3',
      '.reader-article-content--content-blocks p'
    ].join(',');
    const blocks = article.querySelectorAll(sel);
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

  // 4) fallback vazio
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
