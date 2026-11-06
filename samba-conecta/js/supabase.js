/* =====================================================================
   supabase.js — cria a conexão com o Supabase
   ---------------------------------------------------------------------
   Depende de: biblioteca supabase-js (CDN) e js/config.js.
   Cria a variável global "sb", usada pelos outros arquivos.
   Se a configuração estiver incompleta, "sb" fica null e cada página
   mostra uma mensagem amigável em vez de quebrar.
   ===================================================================== */

const sb = (() => {
  if (!window.supabase || typeof window.supabase.createClient !== 'function') {
    console.error('Biblioteca do Supabase não carregou (verifique a internet).');
    return null;
  }
  if (!configuracaoSupabaseValida()) {
    console.warn(MENSAGEM_CONFIG);
    return null;
  }
  return window.supabase.createClient(
    SAMBA_CONFIG.SUPABASE_URL.trim(),
    SAMBA_CONFIG.SUPABASE_ANON_KEY.trim(),
    {
      auth: {
        persistSession: true, // mantém o admin logado ao recarregar a página
        autoRefreshToken: true,
        detectSessionInUrl: false,
      },
    }
  );
})();
