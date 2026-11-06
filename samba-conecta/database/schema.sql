-- =====================================================================
-- SAMBA CONECTA — Estrutura do banco de dados (Supabase / PostgreSQL)
--
-- Como usar:
--   Supabase > SQL Editor > New query > cole TODO este arquivo > Run.
--
-- Pode ser executado mais de uma vez sem quebrar (usa "if not exists",
-- "or replace" e "drop policy if exists").
-- =====================================================================


-- ---------------------------------------------------------------------
-- 1) TABELA DE RESPOSTAS
--    Guarda as respostas ANÔNIMAS do formulário (nenhum dado pessoal).
--    Os valores das perguntas fechadas são "códigos" (ex.: 'muito_ruim');
--    o site converte para o texto bonito na tela.
-- ---------------------------------------------------------------------
create table if not exists public.respostas (
  id                    uuid        primary key default gen_random_uuid(),
  criado_em             timestamptz not null default now(),

  faixa_etaria          text not null
    check (faixa_etaria in ('ate_17','18_24','25_34','35_44','45_59','60_mais','nao_informar')),

  frequencia            text not null
    check (frequencia in ('primeira_vez','raramente','algumas_vezes','frequentemente')),

  avaliacao_organizacao text not null
    check (avaliacao_organizacao in ('excelente','boa','regular','ruim','muito_ruim')),

  avaliacao_musical     text not null
    check (avaliacao_musical in ('excelente','boa','regular','ruim','muito_ruim')),

  avaliacao_atendimento text not null
    check (avaliacao_atendimento in ('excelente','boa','regular','ruim','muito_ruim')),

  avaliacao_estrutura   text not null
    check (avaliacao_estrutura in ('excelente','boa','regular','ruim','muito_ruim')),

  ambiente_acolhedor    text not null
    check (ambiente_acolhedor in ('sim','parcialmente','nao','nao_sei')),

  como_conheceu         text not null
    check (como_conheceu in ('redes_sociais','amigos_familiares','divulgacao_presencial','whatsapp','outros')),

  -- Campos de texto livre (opcionais, máximo de 1000 caracteres)
  gostou_mais           text
    check (gostou_mais is null or char_length(gostou_mais) <= 1000),

  melhorar              text
    check (melhorar is null or char_length(melhorar) <= 1000),

  sugestoes_atividades  text
    check (sugestoes_atividades is null or char_length(sugestoes_atividades) <= 1000),

  recomendacao          text not null
    check (recomendacao in ('com_certeza','provavelmente','talvez','provavelmente_nao','nao_recomendaria'))
);

comment on table public.respostas is
  'Respostas anônimas da pesquisa de satisfação dos eventos (Samba Conecta).';

-- Deixa a ordenação por data rápida no painel
create index if not exists respostas_criado_em_idx
  on public.respostas (criado_em desc);


-- ---------------------------------------------------------------------
-- 2) TABELA DE ADMINISTRADORES
--    Lista quais usuários (criados em Authentication > Users) podem ver
--    as respostas. Estar logado NÃO basta: precisa estar nesta lista.
-- ---------------------------------------------------------------------
create table if not exists public.administradores (
  user_id   uuid        primary key references auth.users (id) on delete cascade,
  criado_em timestamptz not null default now()
);

comment on table public.administradores is
  'Usuários autorizados a acessar o painel administrativo do Samba Conecta.';


-- ---------------------------------------------------------------------
-- 3) FUNÇÃO is_admin()
--    Responde "o usuário logado é administrador?". Usada nas regras (RLS).
--    "security definer" permite consultar a tabela de administradores
--    mesmo com as regras de segurança ligadas.
-- ---------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.administradores where user_id = auth.uid()
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;


-- ---------------------------------------------------------------------
-- 4) SEGURANÇA — ROW LEVEL SECURITY (RLS)
-- ---------------------------------------------------------------------
alter table public.respostas       enable row level security;
alter table public.administradores enable row level security;

-- Começa sem nenhuma permissão e libera só o necessário (defesa em camadas)
revoke all on public.respostas       from anon, authenticated;
revoke all on public.administradores from anon, authenticated;

grant insert on public.respostas       to anon, authenticated;  -- público envia respostas
grant select on public.respostas       to authenticated;        -- (só admins passam na regra abaixo)
grant select on public.administradores to authenticated;        -- cada um enxerga a própria linha

-- 4.1) Qualquer pessoa pode ENVIAR uma resposta...
drop policy if exists "publico_pode_enviar_resposta" on public.respostas;
create policy "publico_pode_enviar_resposta"
  on public.respostas
  for insert
  to anon, authenticated
  with check (true);

-- 4.2) ...mas SÓ administradores autenticados podem LER as respostas.
--      (Não existe regra de update nem delete: ninguém altera ou apaga pelo site.)
drop policy if exists "admins_podem_ler_respostas" on public.respostas;
create policy "admins_podem_ler_respostas"
  on public.respostas
  for select
  to authenticated
  using (public.is_admin());

-- 4.3) Cada usuário logado só consegue ver a PRÓPRIA linha em administradores
--      (o painel usa isso para confirmar se você é admin).
drop policy if exists "usuario_ve_propria_linha_admin" on public.administradores;
create policy "usuario_ve_propria_linha_admin"
  on public.administradores
  for select
  to authenticated
  using (user_id = auth.uid());


-- ---------------------------------------------------------------------
-- 5) CADASTRAR O PRIMEIRO ADMINISTRADOR  (faça DEPOIS de criar o usuário)
--
--   a) Supabase > Authentication > Users > Add user > Create new user
--      (informe e-mail e senha e marque "Auto Confirm User").
--   b) Troque o e-mail abaixo pelo MESMO e-mail, tire os "--" do começo
--      das 2 linhas e execute apenas estas linhas.
-- ---------------------------------------------------------------------
-- insert into public.administradores (user_id)
-- select id from auth.users where email = 'seu-email@exemplo.com';
