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

    const referencia = encontrarTextoRelacionado(caixa);

    const resposta = await fetch(
      'https://n8n-n8n.dodhyu.easypanel.host/webhook/comentario-linkedin',
      {
        method: 'POST',
        body: JSON.stringify({
          texto: referencia.texto,
          tipoDetectado: referencia.tipo,
          nome: referencia.nome,
        }),
        headers: { 'Content-Type': 'application/json' },
      }
    );

    const data = await resposta.json();
    const comentarioIA = data.comentario || '';

    // Garante @Nome no início, sem duplicar
    let comentarioFinal = comentarioIA;
    const nome = referencia.nome?.trim();
    if (nome && !comentarioIA.startsWith(`@${nome}`)) {
      comentarioFinal = `@${nome} ${comentarioIA}`;
    }

    preencherComentario(caixa, comentarioFinal);

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
  caixa.dispatchEvent(new InputEvent('input', { bubbles: true }));
}

function encontrarTextoRelacionado(caixa) {
  // 1) tenta resposta/subcomentário
  let el = caixa;
  while (el && !el.classList.contains('comments-comment-item')) {
    el = el.parentElement;
  }
  if (el) {
    const spans = el.querySelectorAll('span[dir="ltr"], div[dir="ltr"]');
    let texto = '';
    spans.forEach((s) => {
      if (s.innerText.length > texto.length) texto = s.innerText;
    });

    const isNested = !!el.closest('.comments-comment-item__nested');
    const tipo = isNested ? 'subcomentario' : 'resposta';

    // nome na resposta fica em .comments-comment-meta__description-title
    const nomeSpan = el.querySelector('.comments-comment-meta__description-title');
    const nome = nomeSpan?.textContent?.trim() || '';

    return { texto: texto.trim(), tipo, nome };
  }

  // 2) comentário em post (feed, perfil ou newsletter)
  //   tenta container feed
  let post = caixa.closest('[data-id]');
  //   fallback para perfil/newsletter (article[data-urn])
  if (!post) post = caixa.closest('article[data-urn]') || caixa.closest('article');

  const full = post?.innerText || '';
  let nome = '';

  // se encontrar "\nSugestões\n", captura o que vem depois como nome
  const marker = '\nSugestões\n';
  const idx = full.indexOf(marker);
  let texto = full;
  if (idx !== -1) {
    const after = full.slice(idx + marker.length);
    const [capturado, ...rest] = after.split('\n');
    nome = capturado.trim();
    texto = rest.join('\n');
  }

  return {
    texto: texto.trim().slice(0, 1000),
    tipo: 'publicacao',
    nome,
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
