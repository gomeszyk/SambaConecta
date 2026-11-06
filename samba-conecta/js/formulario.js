/* =====================================================================
   formulario.js — monta o formulário em etapas, valida e envia ao Supabase
   Depende de: config.js, labels.js e supabase.js (carregados antes).
   ===================================================================== */

(function () {
  'use strict';

  const form = document.getElementById('form-pesquisa');
  if (!form) return;

  // ----- Elementos da página -----
  const areaEtapas = document.getElementById('etapas');
  const btnVoltar = document.getElementById('btn-voltar');
  const btnProximo = document.getElementById('btn-proximo');
  const btnEnviar = document.getElementById('btn-enviar');
  const alerta = document.getElementById('form-alerta');
  const avisoConfig = document.getElementById('aviso-config');
  const barra = document.getElementById('progresso-barra');
  const progresso = document.getElementById('progresso');
  const progressoTexto = document.getElementById('progresso-texto');
  const cartaoForm = document.getElementById('cartao-form');
  const telaSucesso = document.getElementById('tela-sucesso');
  const btnOutra = document.getElementById('btn-outra');

  const totalEtapas = SAMBA.etapas.length;
  let etapaAtual = 0;
  let enviando = false; // trava contra clique duplo

  // ----- Utilitário para criar elementos HTML sem usar innerHTML (mais seguro) -----
  function el(tag, props = {}, filhos = []) {
    const no = document.createElement(tag);
    Object.entries(props).forEach(([chave, valor]) => {
      if (chave === 'class') no.className = valor;
      else if (chave === 'text') no.textContent = valor;
      else no.setAttribute(chave, valor);
    });
    [].concat(filhos).forEach((filho) => no.append(filho));
    return no;
  }

  // ----- Montagem do formulário -----
  function montarPergunta(pergunta, numero) {
    const idTitulo = 'titulo-' + pergunta.campo;
    const idErro = 'erro-' + pergunta.campo;
    const bloco = el('div', { class: 'pergunta', 'data-campo': pergunta.campo });

    const conteudoTitulo = [
      el('span', { class: 'pergunta-num', text: String(numero), 'aria-hidden': 'true' }),
      el('span', {}, [
        pergunta.titulo,
        pergunta.obrigatoria ? '' : el('span', { class: 'opcional', text: '(opcional)' }),
      ]),
    ];

    if (pergunta.tipo === 'opcoes') {
      bloco.append(el('p', { class: 'pergunta-titulo', id: idTitulo }, conteudoTitulo));

      const grupo = el('div', {
        class: 'opcoes',
        role: 'radiogroup',
        'aria-labelledby': idTitulo,
        'aria-describedby': idErro,
      });
      SAMBA.opcoes[pergunta.campo].forEach((opcao) => {
        const rotulo = el('label', { class: 'opcao' }, [
          el('input', { type: 'radio', name: pergunta.campo, value: opcao.valor }),
          el('span', { text: opcao.rotulo }),
        ]);
        grupo.append(rotulo);
      });
      bloco.append(grupo);
    } else {
      bloco.append(el('label', { class: 'pergunta-titulo', id: idTitulo, for: pergunta.campo }, conteudoTitulo));

      const campo = el('textarea', {
        class: 'campo-texto',
        id: pergunta.campo,
        name: pergunta.campo,
        maxlength: String(SAMBA.limiteTexto),
        rows: '4',
        placeholder: pergunta.placeholder || '',
        'aria-describedby': idErro,
      });
      const contador = el('span', { class: 'contador', id: 'cont-' + pergunta.campo, text: '0/' + SAMBA.limiteTexto });
      campo.addEventListener('input', () => {
        contador.textContent = campo.value.length + '/' + SAMBA.limiteTexto;
      });
      bloco.append(campo, contador);
    }

    bloco.append(el('p', { class: 'erro-campo', id: idErro, role: 'alert', hidden: '' }));
    return bloco;
  }

  function montarEtapas() {
    let numero = 0;
    SAMBA.etapas.forEach((etapa, indice) => {
      const secao = el('section', {
        class: 'etapa',
        'data-etapa': String(indice),
        'aria-labelledby': 'titulo-etapa-' + indice,
        hidden: '',
      });
      secao.append(
        el('h2', { id: 'titulo-etapa-' + indice, tabindex: '-1', text: etapa.titulo }),
        el('p', { class: 'etapa-descricao', text: etapa.descricao })
      );
      SAMBA.perguntas
        .filter((p) => p.etapa === indice)
        .forEach((p) => {
          numero += 1;
          secao.append(montarPergunta(p, numero));
        });
      areaEtapas.append(secao);
    });
  }

  // ----- Avisos e erros -----
  function mostrarAlerta(mensagem) {
    alerta.textContent = mensagem;
    alerta.hidden = false;
  }

  function limparAlerta() {
    alerta.hidden = true;
    alerta.textContent = '';
  }

  function mostrarErro(campo, mensagem) {
    const bloco = form.querySelector('[data-campo="' + campo + '"]');
    const erro = document.getElementById('erro-' + campo);
    if (!bloco || !erro) return;
    erro.textContent = mensagem;
    erro.hidden = !mensagem;
    bloco.classList.toggle('com-erro', Boolean(mensagem));
  }

  // ----- Navegação entre etapas -----
  function mostrarEtapa(indice, rolar) {
    etapaAtual = indice;
    areaEtapas.querySelectorAll('.etapa').forEach((secao, i) => {
      secao.hidden = i !== indice;
    });

    const ultima = indice === totalEtapas - 1;
    btnVoltar.hidden = indice === 0;
    btnProximo.hidden = ultima;
    btnEnviar.hidden = !ultima;

    const porcentagem = Math.round(((indice + 1) / totalEtapas) * 100);
    barra.style.width = porcentagem + '%';
    progresso.setAttribute('aria-valuenow', String(porcentagem));
    progressoTexto.textContent = 'Etapa ' + (indice + 1) + ' de ' + totalEtapas + ' — ' + SAMBA.etapas[indice].titulo;

    limparAlerta();

    if (rolar) {
      const titulo = areaEtapas.querySelector('.etapa[data-etapa="' + indice + '"] h2');
      if (titulo) titulo.focus({ preventScroll: true });
      cartaoForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  function valorDoCampo(campo) {
    const controle = form.elements[campo];
    return controle ? String(controle.value || '') : '';
  }

  /** Confere as perguntas obrigatórias de uma etapa. Retorna true se está tudo certo. */
  function validarEtapa(indice) {
    let primeiroComErro = null;

    SAMBA.perguntas
      .filter((p) => p.etapa === indice)
      .forEach((p) => {
        if (!p.obrigatoria) return;
        const vazio = valorDoCampo(p.campo) === '';
        mostrarErro(p.campo, vazio ? 'Por favor, escolha uma opção para continuar.' : '');
        if (vazio && !primeiroComErro) primeiroComErro = p.campo;
      });

    if (primeiroComErro) {
      mostrarAlerta('Quase lá! Responda as perguntas marcadas para continuar.');
      const bloco = form.querySelector('[data-campo="' + primeiroComErro + '"]');
      if (bloco) bloco.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return false;
    }

    limparAlerta();
    return true;
  }

  function avancar() {
    if (!validarEtapa(etapaAtual)) return;
    mostrarEtapa(Math.min(etapaAtual + 1, totalEtapas - 1), true);
  }

  // ----- Envio -----
  function montarRegistro() {
    const registro = {};
    SAMBA.perguntas.forEach((p) => {
      const valor = valorDoCampo(p.campo).trim();
      // Textos vazios viram null (o banco guarda "nada" em vez de texto vazio)
      registro[p.campo] = valor === '' ? null : valor;
    });
    return registro;
  }

  function definirEnviando(estado) {
    enviando = estado;
    btnEnviar.disabled = estado;
    btnEnviar.classList.toggle('carregando', estado);
    btnEnviar.textContent = estado ? 'Enviando…' : 'Enviar respostas';
    btnVoltar.disabled = estado;
  }

  function mostrarSucesso() {
    cartaoForm.hidden = true;
    telaSucesso.hidden = false;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.getElementById('titulo-sucesso').focus({ preventScroll: true });
  }

  async function enviar(evento) {
    evento.preventDefault();
    if (enviando) return; // ignora cliques repetidos

    // Enter numa etapa intermediária só avança
    if (etapaAtual < totalEtapas - 1) {
      avancar();
      return;
    }

    // Valida todas as etapas antes de enviar
    for (let i = 0; i < totalEtapas; i += 1) {
      if (!validarEtapa(i)) {
        if (i !== etapaAtual) {
          mostrarEtapa(i, true);
          validarEtapa(i);
        }
        return;
      }
    }

    // Campo-isca preenchido = robô. Finge sucesso e não envia nada.
    if (form.elements.website && form.elements.website.value) {
      mostrarSucesso();
      return;
    }

    if (!sb) {
      mostrarAlerta(MENSAGEM_CONFIG);
      return;
    }

    definirEnviando(true);
    try {
      const { error } = await sb.from('respostas').insert([montarRegistro()]);
      if (error) throw error;
      mostrarSucesso();
    } catch (erro) {
      console.error('Erro ao enviar resposta:', erro);
      mostrarAlerta('Não foi possível enviar sua resposta agora. Verifique sua conexão e tente novamente em instantes.');
      definirEnviando(false);
    }
  }

  // ----- Recomeçar (útil quando vários convidados usam o mesmo aparelho) -----
  function recomecar() {
    form.reset();
    form.querySelectorAll('.contador').forEach((c) => {
      c.textContent = '0/' + SAMBA.limiteTexto;
    });
    SAMBA.perguntas.forEach((p) => mostrarErro(p.campo, ''));
    definirEnviando(false);
    telaSucesso.hidden = true;
    cartaoForm.hidden = false;
    mostrarEtapa(0, true);
  }

  // ----- Inicialização -----
  montarEtapas();
  mostrarEtapa(0, false);

  if (!sb) {
    avisoConfig.textContent = MENSAGEM_CONFIG;
    avisoConfig.hidden = false;
  }

  // Limpa o erro de uma pergunta assim que a pessoa responde
  form.addEventListener('change', (evento) => {
    const campo = evento.target && evento.target.name;
    if (campo) mostrarErro(campo, '');
  });

  btnProximo.addEventListener('click', avancar);
  btnVoltar.addEventListener('click', () => mostrarEtapa(Math.max(etapaAtual - 1, 0), true));
  btnOutra.addEventListener('click', recomecar);
  form.addEventListener('submit', enviar);
})();
