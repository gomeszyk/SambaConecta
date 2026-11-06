/* =====================================================================
   auth.js — login, logout e proteção das páginas administrativas
   Depende de: config.js e supabase.js (carregados antes).

   Como a proteção funciona (duas camadas):
   1) Aqui no navegador: quem não está logado (ou não é admin) é
      mandado de volta para o login.
   2) No banco (RLS): mesmo que alguém burle o passo 1, o Supabase só
      entrega as respostas para usuários que estão na tabela
      "administradores". A segurança de verdade é a camada 2.
   ===================================================================== */

const Auth = (() => {
  /** Verifica na tabela "administradores" se este usuário tem permissão. */
  async function ehAdmin(idUsuario) {
    const { data, error } = await sb
      .from('administradores')
      .select('user_id')
      .eq('user_id', idUsuario)
      .maybeSingle();
    if (error) throw error;
    return Boolean(data);
  }

  /**
   * Chamada no começo do dashboard. Retorna o usuário admin logado
   * ou redireciona para o login (e retorna null).
   */
  async function exigirAdmin() {
    if (!sb) {
      window.location.replace('login.html');
      return null;
    }

    const { data } = await sb.auth.getSession();
    const sessao = data && data.session;
    if (!sessao) {
      window.location.replace('login.html');
      return null;
    }

    try {
      if (!(await ehAdmin(sessao.user.id))) {
        await sb.auth.signOut();
        window.location.replace('login.html?erro=sem-permissao');
        return null;
      }
    } catch (erro) {
      console.error('Erro ao verificar permissão:', erro);
      window.location.replace('login.html?erro=verificacao');
      return null;
    }

    // Se a sessão terminar em outra aba, volta para o login
    sb.auth.onAuthStateChange((evento) => {
      if (evento === 'SIGNED_OUT') window.location.replace('login.html');
    });

    return sessao.user;
  }

  async function sair() {
    try {
      if (sb) await sb.auth.signOut();
    } finally {
      window.location.replace('login.html');
    }
  }

  /** Lógica da página login.html */
  function iniciarLogin() {
    const form = document.getElementById('form-login');
    const campoEmail = document.getElementById('email');
    const campoSenha = document.getElementById('senha');
    const btnEntrar = document.getElementById('btn-entrar');
    const btnMostrar = document.getElementById('btn-mostrar-senha');
    const alerta = document.getElementById('login-alerta');

    function mostrarAlerta(mensagem, info) {
      alerta.textContent = mensagem;
      alerta.classList.toggle('alerta-info', Boolean(info));
      alerta.hidden = false;
    }

    function ocupado(estado) {
      btnEntrar.disabled = estado;
      btnEntrar.classList.toggle('carregando', estado);
      btnEntrar.textContent = estado ? 'Entrando…' : 'Entrar';
    }

    // Mensagens vindas de redirecionamentos
    const motivo = new URLSearchParams(window.location.search).get('erro');
    if (motivo === 'sem-permissao') {
      mostrarAlerta('Este usuário não tem permissão de administrador. Peça para ser cadastrado na tabela "administradores".');
    } else if (motivo === 'verificacao') {
      mostrarAlerta('Não foi possível verificar sua permissão. Confira se o schema.sql foi executado no Supabase.');
    }

    if (!sb) {
      mostrarAlerta(MENSAGEM_CONFIG, true);
    }

    // Se já está logado como admin, vai direto para o painel
    (async () => {
      if (!sb) return;
      try {
        const { data } = await sb.auth.getSession();
        if (data && data.session && (await ehAdmin(data.session.user.id))) {
          window.location.replace('dashboard.html');
        }
      } catch (erro) {
        console.error(erro);
      }
    })();

    btnMostrar.addEventListener('click', () => {
      const visivel = campoSenha.type === 'text';
      campoSenha.type = visivel ? 'password' : 'text';
      btnMostrar.textContent = visivel ? 'Mostrar' : 'Ocultar';
      btnMostrar.setAttribute('aria-pressed', String(!visivel));
      btnMostrar.setAttribute('aria-label', visivel ? 'Mostrar senha' : 'Ocultar senha');
    });

    form.addEventListener('submit', async (evento) => {
      evento.preventDefault();
      alerta.hidden = true;

      if (!sb) {
        mostrarAlerta(MENSAGEM_CONFIG, true);
        return;
      }

      const email = campoEmail.value.trim();
      const senha = campoSenha.value;
      if (!email || !senha) {
        mostrarAlerta('Preencha o e-mail e a senha.');
        return;
      }

      ocupado(true);
      try {
        const { data, error } = await sb.auth.signInWithPassword({ email, password: senha });
        if (error) throw error;

        if (!(await ehAdmin(data.user.id))) {
          await sb.auth.signOut();
          mostrarAlerta('Este usuário não tem permissão de administrador.');
          ocupado(false);
          return;
        }
        window.location.replace('dashboard.html');
      } catch (erro) {
        console.error('Erro no login:', erro);
        const credenciaisInvalidas = erro && /invalid login credentials/i.test(erro.message || '');
        mostrarAlerta(
          credenciaisInvalidas
            ? 'E-mail ou senha incorretos.'
            : 'Não foi possível entrar agora. Verifique sua conexão e tente novamente.'
        );
        ocupado(false);
      }
    });
  }

  return { exigirAdmin, sair, iniciarLogin };
})();

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('form-login')) Auth.iniciarLogin();
});
