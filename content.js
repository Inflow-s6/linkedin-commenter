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

  btn.onclick = async () => {
    const textoParaGerar = encontrarTextoRelacionado(caixa);

    const resposta = await fetch('https://n8n-n8n.dodhyu.easypanel.host/webhook-test/comentario-linkedin', {
      method: 'POST',
      body: JSON.stringify({ texto: textoParaGerar }),
      headers: { 'Content-Type': 'application/json' }
    });

    const data = await resposta.json();
    const comentario = data.comentario;

    preencherComentario(caixa, comentario);
  };

  caixa.parentElement.appendChild(btn);
}

function preencherComentario(caixa, texto) {
  caixa.focus();
  caixa.innerHTML = ''; // limpa qualquer texto anterior

  texto.split('\n').forEach((linha, i) => {
    if (i > 0) caixa.appendChild(document.createElement('br'));
    caixa.appendChild(document.createTextNode(linha));
  });

  caixa.dispatchEvent(new InputEvent("input", { bubbles: true }));
}

function encontrarTextoRelacionado(caixa) {
  const comentarioPai = caixa.closest('[class*="comments-comment-item"]');

  if (comentarioPai) {
    const textoComentario = comentarioPai.innerText.trim();
    if (textoComentario) return textoComentario;
  }

  const postPai = caixa.closest('[data-id*="urn:li:activity"]');
  if (postPai) {
    return postPai.innerText.trim();
  }

  return document.body.innerText.slice(0, 1000); // fallback
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
