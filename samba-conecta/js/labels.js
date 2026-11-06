/* =====================================================================
   labels.js — perguntas, opções e textos usados pelo formulário,
   pelo painel e pelos gráficos. Fica num só lugar para não repetir.
   Os "valor" precisam ser IGUAIS aos do database/schema.sql.
   ===================================================================== */

const SAMBA = (() => {
  // Escala usada nas 4 perguntas de avaliação (nota 5 = melhor, 1 = pior)
  const escalaAvaliacao = [
    { valor: 'excelente',  rotulo: 'Excelente',  nota: 5, cor: '#2E7D5B' },
    { valor: 'boa',        rotulo: 'Boa',        nota: 4, cor: '#8DB580' },
    { valor: 'regular',    rotulo: 'Regular',    nota: 3, cor: '#E0B84C' },
    { valor: 'ruim',       rotulo: 'Ruim',       nota: 2, cor: '#D9803F' },
    { valor: 'muito_ruim', rotulo: 'Muito ruim', nota: 1, cor: '#A63A3A' },
  ];

  const opcoes = {
    faixa_etaria: [
      { valor: 'ate_17',       rotulo: 'Até 17 anos' },
      { valor: '18_24',        rotulo: '18 a 24 anos' },
      { valor: '25_34',        rotulo: '25 a 34 anos' },
      { valor: '35_44',        rotulo: '35 a 44 anos' },
      { valor: '45_59',        rotulo: '45 a 59 anos' },
      { valor: '60_mais',      rotulo: '60 anos ou mais' },
      { valor: 'nao_informar', rotulo: 'Prefiro não informar' },
    ],
    frequencia: [
      { valor: 'primeira_vez',   rotulo: 'É a primeira vez' },
      { valor: 'raramente',      rotulo: 'Raramente' },
      { valor: 'algumas_vezes',  rotulo: 'Algumas vezes' },
      { valor: 'frequentemente', rotulo: 'Frequentemente' },
    ],
    avaliacao_organizacao: escalaAvaliacao,
    avaliacao_musical:     escalaAvaliacao,
    avaliacao_atendimento: escalaAvaliacao,
    avaliacao_estrutura:   escalaAvaliacao,
    ambiente_acolhedor: [
      { valor: 'sim',          rotulo: 'Sim' },
      { valor: 'parcialmente', rotulo: 'Parcialmente' },
      { valor: 'nao',          rotulo: 'Não' },
      { valor: 'nao_sei',      rotulo: 'Não sei informar' },
    ],
    como_conheceu: [
      { valor: 'redes_sociais',         rotulo: 'Instagram ou outras redes sociais' },
      { valor: 'amigos_familiares',     rotulo: 'Amigos ou familiares' },
      { valor: 'divulgacao_presencial', rotulo: 'Divulgação presencial' },
      { valor: 'whatsapp',              rotulo: 'WhatsApp' },
      { valor: 'outros',                rotulo: 'Outros' },
    ],
    recomendacao: [
      { valor: 'com_certeza',       rotulo: 'Com certeza!',      cor: '#2E7D5B' },
      { valor: 'provavelmente',     rotulo: 'Provavelmente',     cor: '#8DB580' },
      { valor: 'talvez',            rotulo: 'Talvez',            cor: '#E0B84C' },
      { valor: 'provavelmente_nao', rotulo: 'Provavelmente não', cor: '#D9803F' },
      { valor: 'nao_recomendaria',  rotulo: 'Não recomendaria',  cor: '#A63A3A' },
    ],
  };

  // As 4 perguntas de avaliação (usadas nos indicadores de positivas/negativas)
  const camposAvaliacao = [
    'avaliacao_organizacao',
    'avaliacao_musical',
    'avaliacao_atendimento',
    'avaliacao_estrutura',
  ];

  // Etapas do formulário (a propriedade "etapa" das perguntas é o índice daqui)
  const etapas = [
    { titulo: 'Sobre você',           descricao: 'Duas perguntas rápidas. Nada de nome, telefone ou e-mail.' },
    { titulo: 'Sua avaliação',        descricao: 'Como foi a sua experiência no evento?' },
    { titulo: 'Ambiente e divulgação', descricao: 'Conte como foi o clima do evento e como você soube dele.' },
    { titulo: 'Sua opinião',          descricao: 'Aqui você pode escrever com liberdade. Críticas construtivas são muito bem-vindas!' },
  ];

  const limiteTexto = 1000;

  const perguntas = [
    { campo: 'faixa_etaria', titulo: 'Qual é a sua faixa etária?', tipo: 'opcoes', obrigatoria: true, etapa: 0 },
    { campo: 'frequencia', titulo: 'Com que frequência você participa dos nossos eventos?', tipo: 'opcoes', obrigatoria: true, etapa: 0 },

    { campo: 'avaliacao_organizacao', titulo: 'Como você avalia a organização do evento?', tipo: 'opcoes', obrigatoria: true, etapa: 1 },
    { campo: 'avaliacao_musical', titulo: 'Como você avalia as apresentações musicais e a qualidade do samba?', tipo: 'opcoes', obrigatoria: true, etapa: 1 },
    { campo: 'avaliacao_atendimento', titulo: 'Como você avalia o atendimento e a receptividade das pessoas responsáveis pelo evento?', tipo: 'opcoes', obrigatoria: true, etapa: 1 },
    { campo: 'avaliacao_estrutura', titulo: 'Como você avalia o espaço físico e a estrutura do local?', tipo: 'opcoes', obrigatoria: true, etapa: 1 },

    { campo: 'ambiente_acolhedor', titulo: 'Você considera que o ambiente é acolhedor e adequado para receber pessoas de diferentes idades?', tipo: 'opcoes', obrigatoria: true, etapa: 2 },
    { campo: 'como_conheceu', titulo: 'Como você ficou sabendo do evento?', tipo: 'opcoes', obrigatoria: true, etapa: 2 },

    { campo: 'gostou_mais', titulo: 'O que você mais gostou no evento?', tipo: 'texto', obrigatoria: false, etapa: 3, placeholder: 'Conte o que mais te marcou…' },
    { campo: 'melhorar', titulo: 'O que você acredita que poderia ser melhorado nos próximos eventos?', tipo: 'texto', obrigatoria: false, etapa: 3, placeholder: 'Sua crítica construtiva ajuda a gente a evoluir…' },
    { campo: 'sugestoes_atividades', titulo: 'Que tipo de atividade ou atração você gostaria de encontrar nas próximas edições?', tipo: 'texto', obrigatoria: false, etapa: 3, placeholder: 'Ex.: roda de samba, oficina, atração infantil…' },
    { campo: 'recomendacao', titulo: 'Você recomendaria nossos eventos para amigos ou familiares?', tipo: 'opcoes', obrigatoria: true, etapa: 3 },
  ];

  // Nomes curtos dos campos (detalhes da resposta e cabeçalho do CSV)
  const nomesCampos = {
    faixa_etaria: 'Faixa etária',
    frequencia: 'Frequência de participação',
    avaliacao_organizacao: 'Organização',
    avaliacao_musical: 'Apresentações musicais',
    avaliacao_atendimento: 'Atendimento',
    avaliacao_estrutura: 'Estrutura do local',
    ambiente_acolhedor: 'Ambiente acolhedor',
    como_conheceu: 'Como conheceu o evento',
    gostou_mais: 'O que mais gostou',
    melhorar: 'O que pode melhorar',
    sugestoes_atividades: 'Sugestões de atividades',
    recomendacao: 'Recomendação',
  };

  /** Converte o código guardado no banco (ex.: 'muito_ruim') no texto da tela. */
  function rotulo(campo, valor) {
    const lista = opcoes[campo] || [];
    const achada = lista.find((o) => o.valor === valor);
    return achada ? achada.rotulo : valor || '—';
  }

  /** Nota de 1 a 5 para uma avaliação (0 se o valor for desconhecido). */
  function nota(valor) {
    const achada = escalaAvaliacao.find((o) => o.valor === valor);
    return achada ? achada.nota : 0;
  }

  return { opcoes, perguntas, etapas, camposAvaliacao, nomesCampos, limiteTexto, rotulo, nota };
})();
