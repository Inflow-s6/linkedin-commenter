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
    const postTexto = encontrarTextoRelacionado(caixa);
    const resposta = await fetch('https://n8n-n8n.dodhyu.easypanel.host/webhook-test/comentario-linkedin', {
      method: 'POST',
      body: JSON.stringify({ texto: postTexto }),
      headers: { 'Content-Type': 'application/json' }
    });

    const data = await resposta.json();
    const comentario = data.comentario;

    // Preenche diretamente no campo de texto do comentário
    preencherComentario(caixa, comentario);
  };

  caixa.parentElement.appendChild(btn);
}

function preencherComentario(caixa, texto) {
  caixa.focus();

  // Define o conteúdo com quebra de linha respeitada
  caixa.innerHTML = ''; // limpa qualquer placeholder
  texto.split('\n').forEach((linha, i) => {
    if (i > 0) caixa.appendChild(document.createElement('br'));
    caixa.appendChild(document.createTextNode(linha));
  });

  // Aciona o evento de input para o botão "Comentar" ou "Responder" ativar
  caixa.dispatchEvent(new InputEvent("input", { bubbles: true }));
}

function encontrarTextoRelacionado(caixa) {
  let postPai = caixa.closest('[data-id]');
  if (postPai) {
    return postPai.innerText || '';
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
