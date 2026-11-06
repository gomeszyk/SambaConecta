/* =====================================================================
   config.js — CONFIGURAÇÕES QUE VOCÊ PRECISA PREENCHER
   ---------------------------------------------------------------------
   Este é o ÚNICO arquivo onde você coloca suas informações.
   Nunca coloque aqui a chave "service_role" / "secret" do Supabase.
   Use apenas a chave pública (anon / publishable).
   ===================================================================== */

const SAMBA_CONFIG = {
  // Supabase > Project Settings > API (ou "Connect") > Project URL
  SUPABASE_URL: 'https://ohbkwkfjbnbfchnachew.supabase.co',

  // Supabase > Project Settings > API Keys > anon (legacy) OU publishable key
  SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9oYmt3a2ZqYm5iZmNobmFjaGV3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM5OTYyNzYsImV4cCI6MjEwOTU3MjI3Nn0.70dOOsfW4YUujNRmYQibahB2lFlndic4naoFN0xL_YI',

  // Nome oficial da instituição (aparece no topo e no rodapé das páginas)
  ONG_NOME: 'Samba Conecta',
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
