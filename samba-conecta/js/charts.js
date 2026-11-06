/* =====================================================================
   charts.js — gráficos do painel (Chart.js)
   Depende de: Chart.js (CDN) e labels.js.
   Uso: SambaCharts.renderizar(listaDeRespostas)
   ===================================================================== */

const SambaCharts = (() => {
  const instancias = {}; // guarda os gráficos para destruir antes de redesenhar

  // Paleta de marca para gráficos sem "bom/ruim" (frequência, divulgação)
  const paletaMarca = ['#6B1E2E', '#D9A441', '#A8465A', '#EBCB85', '#3E0B18', '#C98A8F'];

  function configurarPadroes() {
    Chart.defaults.font.family = "'Inter', system-ui, sans-serif";
    Chart.defaults.font.size = 13;
    Chart.defaults.color = '#5b4a4e';
  }

  /** Conta quantas respostas existem para cada opção de um campo. */
  function contar(respostas, campo) {
    const mapa = {};
    respostas.forEach((r) => {
      mapa[r[campo]] = (mapa[r[campo]] || 0) + 1;
    });
    return SAMBA.opcoes[campo].map((opcao) => mapa[opcao.valor] || 0);
  }

  function porcentagem(valor, total) {
    return total ? Math.round((valor / total) * 100) : 0;
  }

  function criar(idCanvas, tipo, campo, respostas, cores) {
    const canvas = document.getElementById(idCanvas);
    if (!canvas) return;

    if (instancias[idCanvas]) instancias[idCanvas].destroy();

    const opcoes = SAMBA.opcoes[campo];
    const valores = contar(respostas, campo);
    const total = valores.reduce((a, b) => a + b, 0);

    // Sem respostas: mostra a mensagem "Ainda sem respostas" no lugar do gráfico
    const area = canvas.parentElement;
    area.classList.toggle('sem-dados', total === 0);
    if (total === 0) return;

    const rotulos = opcoes.map((o) => o.rotulo);
    const ehRosca = tipo === 'doughnut';

    const opcoesTooltip = {
      callbacks: {
        label: (item) => {
          const v = item.raw; // quantidade de respostas da barra/fatia
          return ' ' + v + (v === 1 ? ' resposta' : ' respostas') + ' (' + porcentagem(v, total) + '%)';
        },
      },
    };

    instancias[idCanvas] = new Chart(canvas, {
      type: tipo === 'barra-horizontal' ? 'bar' : tipo,
      data: {
        labels: rotulos,
        datasets: [
          {
            data: valores,
            backgroundColor: cores,
            borderColor: '#ffffff',
            borderWidth: ehRosca ? 3 : 0,
            borderRadius: ehRosca ? 0 : 8,
            maxBarThickness: 46,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: tipo === 'barra-horizontal' ? 'y' : 'x',
        cutout: ehRosca ? '58%' : undefined,
        animation: { duration: 700 },
        plugins: {
          legend: ehRosca
            ? { position: 'bottom', labels: { usePointStyle: true, boxWidth: 8, padding: 14 } }
            : { display: false },
          tooltip: opcoesTooltip,
        },
        scales: ehRosca
          ? {}
          : {
              x: { grid: { display: false }, ticks: { precision: 0 } },
              y: { beginAtZero: true, ticks: { precision: 0 }, grid: { color: '#f0e7dc' } },
            },
      },
    });
  }

  /** Desenha todos os gráficos do painel. */
  function renderizar(respostas) {
    if (typeof Chart === 'undefined') {
      console.error('Chart.js não carregou (verifique a internet).');
      return false;
    }
    configurarPadroes();

    const cores = (campo) => SAMBA.opcoes[campo].map((o) => o.cor);

    criar('grafico-organizacao', 'bar', 'avaliacao_organizacao', respostas, cores('avaliacao_organizacao'));
    criar('grafico-musical', 'bar', 'avaliacao_musical', respostas, cores('avaliacao_musical'));
    criar('grafico-atendimento', 'bar', 'avaliacao_atendimento', respostas, cores('avaliacao_atendimento'));
    criar('grafico-estrutura', 'bar', 'avaliacao_estrutura', respostas, cores('avaliacao_estrutura'));
    criar('grafico-frequencia', 'doughnut', 'frequencia', respostas, paletaMarca);
    criar('grafico-conheceu', 'barra-horizontal', 'como_conheceu', respostas, paletaMarca[0]);
    criar('grafico-recomendacao', 'doughnut', 'recomendacao', respostas, cores('recomendacao'));
    return true;
  }

  return { renderizar };
})();
