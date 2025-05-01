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
    // envia apenas texto e tipo; a automação já inclui o @nome
    const resposta = await fetch('https://n8n-n8n.dodhyu.easypanel.host/webhook/comentario-linkedin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        texto: referencia.texto,
        tipoDetectado: referencia.tipo
      }),
    });

    const data = await resposta.json();
    const comentarioIA = data.comentario || '';

    // preenche direto com o que a automação retornou
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
  // 1) resposta ou subcomentário
  let el = caixa;
  while (el && !el.classList.contains('comments-comment-item')) {
    el = el.parentElement;
  }
  if (el) {
    const spans = el.querySelectorAll('span[dir="ltr"], div[dir="ltr"]');
    let texto = '';
    spans.forEach(s => { if (s.innerText.length > texto.length) texto = s.innerText; });
    const tipo = el.closest('.comments-comment-item__nested') ? 'subcomentario' : 'resposta';
    return { texto: texto.trim(), tipo };
  }

  // 2) comentário em publicação (feed, perfil ou newsletter)
  let post = caixa.closest('[data-id]');
  if (!post) post = caixa.closest('article[data-urn]') || caixa.closest('article');
  const full = post?.innerText || '';
  let texto = full;
  const marker = '\nSugestões\n';
  const idx = full.indexOf(marker);
  if (idx !== -1) {
    texto = full.slice(idx + marker.length).split('\n').slice(1).join('\n');
  }
  return { texto: texto.trim().slice(0, 1000), tipo: 'publicacao' };
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
