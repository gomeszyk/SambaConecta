/* =====================================================================
   config.js — CONFIGURAÇÕES QUE VOCÊ PRECISA PREENCHER
   ---------------------------------------------------------------------
   Este é o ÚNICO arquivo onde você coloca suas informações.
   Nunca coloque aqui a chave "service_role" / "secret" do Supabase.
   Use apenas a chave pública (anon / publishable).
   ===================================================================== */

const SAMBA_CONFIG = {
  // Supabase > Project Settings > API (ou "Connect") > Project URL
  SUPABASE_URL: 'COLE_AQUI_A_URL_DO_SEU_PROJETO',

  // Supabase > Project Settings > API Keys > anon (legacy) OU publishable key
  SUPABASE_ANON_KEY: 'COLE_AQUI_A_CHAVE_ANON_OU_PUBLISHABLE',

  // Nome oficial da instituição (aparece no topo e no rodapé das páginas)
  ONG_NOME: 'Nome da ONG (edite em js/config.js)',
};

const MENSAGEM_CONFIG =
  'O sistema ainda não foi conectado ao Supabase. Abra o arquivo js/config.js e preencha ' +
  'SUPABASE_URL e SUPABASE_ANON_KEY (veja o passo a passo no README).';

/** Confere se a URL e a chave foram preenchidas (e não são mais os textos de exemplo). */
function configuracaoSupabaseValida() {
  const url = String(SAMBA_CONFIG.SUPABASE_URL || '').trim();
  const chave = String(SAMBA_CONFIG.SUPABASE_ANON_KEY || '').trim();
  return (
    url.startsWith('https://') &&
    !url.includes('COLE_AQUI') &&
    chave.length > 20 &&
    !chave.includes('COLE_AQUI')
  );
}

/** Preenche o nome da ONG e o ano atual nos elementos marcados no HTML. */
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-ong-nome]').forEach((el) => {
    el.textContent = SAMBA_CONFIG.ONG_NOME;
  });
  document.querySelectorAll('[data-ano]').forEach((el) => {
    el.textContent = new Date().getFullYear();
  });
});
