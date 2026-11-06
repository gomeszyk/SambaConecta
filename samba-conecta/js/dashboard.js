/* =====================================================================
   dashboard.js — lógica do painel administrativo
   Depende de: config.js, labels.js, supabase.js, auth.js e charts.js.
   ===================================================================== */

(async function () {
  'use strict';

  const $ = (id) => document.getElementById(id);
  const formatadorData = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
  const TAMANHO_PAGINA = 20;

  // Estado do painel (tudo que muda com o uso fica aqui)
  const estado = {
    todas: [],
    filtradas: [],
    visiveis: TAMANHO_PAGINA,
    busca: '',
    avaliacao: 'todas',
    recomendacao: 'todas',
    ordem: 'recentes',
    abaSugestao: 'melhorar',
  };

  // ---------------------------------------------------------------
  // Utilitários
  // ---------------------------------------------------------------
  function textoLimpo(valor) {
    return (valor || '').trim();
  }

  /** Minúsculas e sem acento, para a busca achar "musica" em "música". */
  function normalizar(texto) {
    return String(texto || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '');
  }

  function formatarPorcentagem(parte, total) {
    if (!total) return '—';
    return ((parte / total) * 100).toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + '%';
  }

  function formatarData(iso) {
    return formatadorData.format(new Date(iso));
  }

  function mostrarAlerta(mensagem) {
    const alerta = $('dash-alerta');
    alerta.textContent = mensagem;
    alerta.hidden = !mensagem;
  }

  function resumir(texto, limite) {
    return texto.length > limite ? texto.slice(0, limite).trimEnd() + '…' : texto;
  }

  /** Média das 4 avaliações (1 a 5) de uma resposta. */
  function notaMedia(r) {
    const notas = SAMBA.camposAvaliacao.map((campo) => SAMBA.nota(r[campo]));
    return notas.reduce((a, b) => a + b, 0) / notas.length;
  }

  /** positiva (média >= 4), neutra (>= 2,5) ou negativa. */
  function sentimento(r) {
    const media = notaMedia(r);
    if (media >= 4) return 'positiva';
    if (media >= 2.5) return 'neutra';
    return 'negativa';
  }

  const nomeSentimento = { positiva: 'Positiva', neutra: 'Neutra', negativa: 'Negativa' };

  function criarSelo(r) {
    const tipo = sentimento(r);
    const selo = document.createElement('span');
    selo.className = 'selo selo-' + tipo;
    selo.textContent = nomeSentimento[tipo] + ' · ' + notaMedia(r).toLocaleString('pt-BR', { maximumFractionDigits: 1 });
    return selo;
  }

  // ---------------------------------------------------------------
  // Carregar dados do Supabase (de 1000 em 1000, que é o limite por consulta)
  // ---------------------------------------------------------------
  async function buscarTodas() {
    const tamanho = 1000;
    let inicio = 0;
    const todas = [];

    while (true) {
      const { data, error } = await sb
        .from('respostas')
        .select('*')
        .order('criado_em', { ascending: false })
        .order('id', { ascending: true })
        .range(inicio, inicio + tamanho - 1);
      if (error) throw error;
      todas.push(...data);
      if (data.length < tamanho) break;
      inicio += tamanho;
    }
    return todas;
  }

  /** Texto usado na busca: textos livres + rótulos de todas as opções. */
  function montarTextoBusca(r) {
    const partes = [r.gostou_mais, r.melhorar, r.sugestoes_atividades];
    Object.keys(SAMBA.opcoes).forEach((campo) => partes.push(SAMBA.rotulo(campo, r[campo])));
    partes.push(formatarData(r.criado_em));
    return normalizar(partes.join(' '));
  }

  async function carregar() {
    $('dados-status').textContent = 'Carregando respostas…';
    mostrarAlerta('');
    $('btn-atualizar').disabled = true;

    try {
      const respostas = await buscarTodas();
      respostas.forEach((r) => {
        r._busca = montarTextoBusca(r);
      });
      estado.todas = respostas;
      $('dados-status').textContent = '';
      atualizarTudo();
    } catch (erro) {
      console.error('Erro ao carregar respostas:', erro);
      $('dados-status').textContent = '';
      mostrarAlerta('Não foi possível carregar as respostas. Confira sua conexão e se o schema.sql foi executado no Supabase.');
    } finally {
      $('btn-atualizar').disabled = false;
    }
  }

  // ---------------------------------------------------------------
  // Indicadores
  // ---------------------------------------------------------------
  function temSugestao(r) {
    return textoLimpo(r.melhorar) !== '' || textoLimpo(r.sugestoes_atividades) !== '';
  }

  function renderizarIndicadores() {
    const respostas = estado.todas;
    let positivas = 0;
    let negativas = 0;
    let totalAvaliacoes = 0;

    respostas.forEach((r) => {
      SAMBA.camposAvaliacao.forEach((campo) => {
        const nota = SAMBA.nota(r[campo]);
        totalAvaliacoes += 1;
        if (nota >= 4) positivas += 1;
        else if (nota <= 2) negativas += 1;
      });
    });

    $('kpi-total').textContent = respostas.length.toLocaleString('pt-BR');
    $('kpi-positivas').textContent = formatarPorcentagem(positivas, totalAvaliacoes);
    $('kpi-negativas').textContent = formatarPorcentagem(negativas, totalAvaliacoes);
    $('kpi-sugestoes').textContent = respostas.filter(temSugestao).length.toLocaleString('pt-BR');
  }

  // ---------------------------------------------------------------
  // Lista de respostas (tabela)
  // ---------------------------------------------------------------
  function aplicarFiltros() {
    const termo = normalizar(estado.busca.trim());

    const lista = estado.todas.filter((r) => {
      if (estado.avaliacao !== 'todas' && sentimento(r) !== estado.avaliacao) return false;
      if (estado.recomendacao !== 'todas' && r.recomendacao !== estado.recomendacao) return false;
      if (termo && !r._busca.includes(termo)) return false;
      return true;
    });

    lista.sort((a, b) => {
      const diferenca = new Date(a.criado_em) - new Date(b.criado_em);
      return estado.ordem === 'recentes' ? -diferenca : diferenca;
    });

    estado.filtradas = lista;
  }

  function celula(texto, classe) {
    const td = document.createElement('td');
    if (classe) td.className = classe;
    td.textContent = texto;
    return td;
  }

  function renderizarTabela() {
    const corpo = $('tabela-corpo');
    corpo.replaceChildren();

    if (estado.filtradas.length === 0) {
      const tr = document.createElement('tr');
      const td = celula(estado.todas.length === 0 ? 'Nenhuma resposta recebida ainda.' : 'Nenhuma resposta encontrada com esses filtros.', 'vazio');
      td.colSpan = 6;
      tr.append(td);
      corpo.append(tr);
    }

    estado.filtradas.slice(0, estado.visiveis).forEach((r) => {
      const tr = document.createElement('tr');

      const tdAvaliacao = document.createElement('td');
      tdAvaliacao.append(criarSelo(r));

      const comentario = textoLimpo(r.melhorar) || textoLimpo(r.gostou_mais) || textoLimpo(r.sugestoes_atividades);

      const botao = document.createElement('button');
      botao.type = 'button';
      botao.className = 'btn btn-secundario btn-pequeno';
      botao.textContent = 'Ver detalhes';
      botao.addEventListener('click', () => abrirDetalhes(r));
      const tdAcao = document.createElement('td');
      tdAcao.append(botao);

      tr.append(
        celula(formatarData(r.criado_em)),
        celula(SAMBA.rotulo('faixa_etaria', r.faixa_etaria)),
        tdAvaliacao,
        celula(SAMBA.rotulo('recomendacao', r.recomendacao)),
        celula(comentario ? resumir(comentario, 110) : '—', 'resumo'),
        tdAcao
      );
      corpo.append(tr);
    });

    const mostradas = Math.min(estado.visiveis, estado.filtradas.length);
    $('contagem-respostas').textContent =
      'Mostrando ' + mostradas + ' de ' + estado.filtradas.length + ' (total: ' + estado.todas.length + ')';
    $('btn-mais').hidden = estado.visiveis >= estado.filtradas.length;
  }

  // ---------------------------------------------------------------
  // Detalhes de uma resposta (janela)
  // ---------------------------------------------------------------
  function abrirDetalhes(r) {
    const corpo = $('dialogo-corpo');
    corpo.replaceChildren();

    const lista = document.createElement('dl');
    lista.className = 'detalhe';

    function adicionar(titulo, valor, ehTexto) {
      const dt = document.createElement('dt');
      dt.textContent = titulo;
      const dd = document.createElement('dd');
      if (ehTexto && !valor) {
        dd.textContent = 'Não respondeu';
        dd.className = 'sem-texto';
      } else {
        dd.textContent = valor;
      }
      lista.append(dt, dd);
    }

    adicionar('Enviada em', formatarData(r.criado_em));
    adicionar('Avaliação geral', nomeSentimento[sentimento(r)] + ' (média ' + notaMedia(r).toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + ' de 5)');

    Object.keys(SAMBA.opcoes).forEach((campo) => {
      adicionar(SAMBA.nomesCampos[campo], SAMBA.rotulo(campo, r[campo]));
    });
    ['gostou_mais', 'melhorar', 'sugestoes_atividades'].forEach((campo) => {
      adicionar(SAMBA.nomesCampos[campo], textoLimpo(r[campo]), true);
    });

    corpo.append(lista);
    $('dialogo-resposta').showModal();
  }

  // ---------------------------------------------------------------
  // Sugestões e críticas
  // ---------------------------------------------------------------
  function renderizarSugestoes() {
    const campo = estado.abaSugestao;
    const itens = estado.todas
      .filter((r) => textoLimpo(r[campo]) !== '')
      .sort((a, b) => new Date(b.criado_em) - new Date(a.criado_em));

    const nomes = {
      melhorar: 'comentários sobre o que pode melhorar',
      sugestoes_atividades: 'sugestões de novas atividades',
      gostou_mais: 'elogios e pontos positivos',
    };
    $('sugestoes-contagem').textContent = itens.length + ' ' + nomes[campo];

    document.querySelectorAll('[data-sug]').forEach((botao) => {
      botao.setAttribute('aria-pressed', String(botao.dataset.sug === campo));
    });

    const area = $('sugestoes-lista');
    area.replaceChildren();

    if (itens.length === 0) {
      const vazio = document.createElement('p');
      vazio.className = 'vazio-geral';
      vazio.style.gridColumn = '1 / -1';
      vazio.textContent = 'Nada por aqui ainda.';
      area.append(vazio);
      return;
    }

    itens.forEach((r) => {
      const cartao = document.createElement('article');
      cartao.className = 'sug-card';

      const texto = document.createElement('p');
      texto.className = 'sug-texto';
      texto.textContent = textoLimpo(r[campo]);

      const rodape = document.createElement('div');
      rodape.className = 'sug-rodape';
      const data = document.createElement('time');
      data.dateTime = r.criado_em;
      data.textContent = formatarData(r.criado_em);
      rodape.append(data, criarSelo(r));

      cartao.append(texto, rodape);
      area.append(cartao);
    });
  }

  // ---------------------------------------------------------------
  // Exportação CSV (abre direto no Excel / Google Planilhas)
  // ---------------------------------------------------------------
  function celulaCsv(valor) {
    let texto = valor === null || valor === undefined ? '' : String(valor);
    // Evita "injeção de fórmula" em planilhas: texto que começa com = + - @ vira texto comum
    if (/^[=+\-@\t\r]/.test(texto)) texto = "'" + texto;
    return '"' + texto.replace(/"/g, '""') + '"';
  }

  function exportarCsv(lista, prefixoNome) {
    if (lista.length === 0) {
      mostrarAlerta('Não há respostas para exportar.');
      return;
    }
    mostrarAlerta('');

    const campos = Object.keys(SAMBA.nomesCampos);
    const cabecalho = ['Data e horário'].concat(campos.map((c) => SAMBA.nomesCampos[c]));

    const linhas = lista.map((r) => {
      const valores = [formatarData(r.criado_em)].concat(
        campos.map((campo) => (SAMBA.opcoes[campo] ? SAMBA.rotulo(campo, r[campo]) : textoLimpo(r[campo])))
      );
      return valores.map(celulaCsv).join(';');
    });

    // ";" como separador e BOM no início: o Excel em português abre com acentos corretos
    const conteudo = '﻿' + [cabecalho.map(celulaCsv).join(';')].concat(linhas).join('\r\n');
    const blob = new Blob([conteudo], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const hoje = new Date();
    const dataArquivo =
      hoje.getFullYear() + '-' + String(hoje.getMonth() + 1).padStart(2, '0') + '-' + String(hoje.getDate()).padStart(2, '0');
    const link = document.createElement('a');
    link.href = url;
    link.download = prefixoNome + '-' + dataArquivo + '.csv';
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  // ---------------------------------------------------------------
  // Atualização geral da tela
  // ---------------------------------------------------------------
  function atualizarTudo() {
    renderizarIndicadores();
    if (!SambaCharts.renderizar(estado.todas)) {
      mostrarAlerta('Os gráficos não carregaram (verifique a internet). O restante do painel continua funcionando.');
    }
    aplicarFiltros();
    renderizarTabela();
    renderizarSugestoes();
  }

  function atualizarLista() {
    estado.visiveis = TAMANHO_PAGINA;
    aplicarFiltros();
    renderizarTabela();
  }

  function mostrarSecao(nome) {
    ['visao', 'respostas', 'sugestoes'].forEach((secao) => {
      $('secao-' + secao).hidden = secao !== nome;
    });
    document.querySelectorAll('.dash-nav button').forEach((botao) => {
      botao.setAttribute('aria-current', String(botao.dataset.secao === nome));
    });
    window.scrollTo({ top: 0 });
  }

  // ---------------------------------------------------------------
  // Início: confirma que é admin e liga os botões
  // ---------------------------------------------------------------
  const usuario = await Auth.exigirAdmin();
  if (!usuario) return; // foi redirecionado para o login

  $('usuario-email').textContent = usuario.email || '';
  $('tela-carregando').hidden = true;
  $('app').hidden = false;

  // Opções do filtro de recomendação
  const selectRecomendacao = $('filtro-recomendacao');
  [{ valor: 'todas', rotulo: 'Todas' }].concat(SAMBA.opcoes.recomendacao).forEach((opcao) => {
    const item = document.createElement('option');
    item.value = opcao.valor;
    item.textContent = opcao.rotulo;
    selectRecomendacao.append(item);
  });

  document.querySelectorAll('.dash-nav button').forEach((botao) => {
    botao.addEventListener('click', () => mostrarSecao(botao.dataset.secao));
  });

  document.querySelectorAll('[data-sug]').forEach((botao) => {
    botao.addEventListener('click', () => {
      estado.abaSugestao = botao.dataset.sug;
      renderizarSugestoes();
    });
  });

  document.querySelectorAll('[data-exportar]').forEach((botao) => {
    botao.addEventListener('click', () => {
      const filtradas = botao.dataset.exportar === 'filtradas';
      exportarCsv(filtradas ? estado.filtradas : estado.todas, filtradas ? 'samba-conecta-respostas-filtradas' : 'samba-conecta-respostas');
    });
  });

  let temporizadorBusca = null;
  $('filtro-busca').addEventListener('input', (evento) => {
    clearTimeout(temporizadorBusca);
    temporizadorBusca = setTimeout(() => {
      estado.busca = evento.target.value;
      atualizarLista();
    }, 200);
  });
  $('filtro-avaliacao').addEventListener('change', (e) => { estado.avaliacao = e.target.value; atualizarLista(); });
  $('filtro-recomendacao').addEventListener('change', (e) => { estado.recomendacao = e.target.value; atualizarLista(); });
  $('filtro-ordem').addEventListener('change', (e) => { estado.ordem = e.target.value; atualizarLista(); });
  $('filtros').addEventListener('submit', (e) => e.preventDefault());

  $('btn-mais').addEventListener('click', () => {
    estado.visiveis += TAMANHO_PAGINA;
    renderizarTabela();
  });

  $('btn-atualizar').addEventListener('click', carregar);
  $('btn-sair').addEventListener('click', () => Auth.sair());

  const dialogo = $('dialogo-resposta');
  $('dialogo-fechar').addEventListener('click', () => dialogo.close());
  dialogo.addEventListener('click', (evento) => {
    if (evento.target === dialogo) dialogo.close(); // clique no fundo escuro fecha
  });

  await carregar();
})();
