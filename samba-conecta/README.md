# 🎶 Samba Conecta

**Tecnologia, cultura e comunidade.**

Sistema web de pesquisa de satisfação e feedback para uma ONG que organiza atividades culturais e eventos de samba. Os frequentadores respondem a uma pesquisa **anônima** pelo celular e os responsáveis pela instituição acompanham tudo em um **painel administrativo** com gráficos, lista de respostas, sugestões e exportação para planilha.

> Projeto da disciplina **Atividades de Extensão II** — Análise e Desenvolvimento de Sistemas (ADS) — UNIP.

---

## Sumário

1. [O que é o Samba Conecta](#1-o-que-é-o-samba-conecta)
2. [Problema que o sistema busca resolver](#2-problema-que-o-sistema-busca-resolver)
3. [Objetivos](#3-objetivos)
4. [Requisitos do sistema](#4-requisitos-do-sistema)
5. [Tecnologias utilizadas](#5-tecnologias-utilizadas)
6. [Estrutura dos arquivos](#6-estrutura-dos-arquivos)
7. [Configurar o Supabase (passo a passo)](#7-configurar-o-supabase-passo-a-passo)
8. [Executar o projeto no VS Code](#8-executar-o-projeto-no-vs-code)
9. [Criar o primeiro usuário administrativo](#9-criar-o-primeiro-usuário-administrativo)
10. [Acessar o painel](#10-acessar-o-painel)
11. [Visualizar e exportar as respostas](#11-visualizar-e-exportar-as-respostas)
12. [Segurança: como os dados são protegidos](#12-segurança-como-os-dados-são-protegidos)
13. [Publicar na internet (opcional)](#13-publicar-na-internet-opcional)
14. [Problemas comuns](#14-problemas-comuns)
15. [Limitações e próximos passos](#15-limitações-e-próximos-passos)

---

## 1. O que é o Samba Conecta

Duas áreas em um só projeto:

- **Área pública** (`index.html` e `formulario.html`): página de apresentação e uma pesquisa de satisfação com 12 perguntas, dividida em 4 etapas com barra de progresso. Não pede nome, telefone, CPF nem e-mail.
- **Área administrativa** (`login.html` e `dashboard.html`): acesso com e-mail e senha, indicadores, 7 gráficos, tabela de respostas com busca e filtros, seção de sugestões e críticas construtivas, e exportação em CSV.

## 2. Problema que o sistema busca resolver

A instituição precisa de uma forma simples de coletar a opinião de quem frequenta os eventos, identificar pontos positivos, receber críticas construtivas e descobrir o que melhorar nas próximas edições. Sem um sistema, essas opiniões ficam espalhadas (conversas, mensagens, papéis) e é difícil organizá-las para tomar decisões.

> ⚠️ Este README **não** descreve dados reais da instituição (nome, responsáveis, resultados ou uso). Complete essas informações no seu relatório da atividade, a partir do que você levantar com a própria ONG.

## 3. Objetivos

**Objetivo geral:** desenvolver uma solução tecnológica que facilite a coleta, a organização, o armazenamento e a análise das opiniões dos frequentadores dos eventos promovidos pela instituição.

**Objetivos específicos:**

- Oferecer um formulário simples, acolhedor e anônimo, que funcione bem no celular.
- Armazenar as respostas de forma segura em um banco de dados.
- Apresentar indicadores e gráficos que facilitem a leitura dos resultados.
- Reunir sugestões e críticas construtivas em um só lugar.
- Permitir exportar os dados para planilhas (Excel / Google Planilhas).

## 4. Requisitos do sistema

Úteis para a etapa de *levantamento e análise de requisitos* da atividade de extensão. Eles vêm do que o sistema faz hoje; ajuste conforme o que a ONG validar com você.

**Requisitos funcionais**

| Código | Requisito |
|--------|-----------|
| RF01 | O sistema deve exibir uma página inicial apresentando o projeto e convidando o público a responder. |
| RF02 | O sistema deve apresentar o formulário de satisfação em etapas, com barra de progresso e navegação entre etapas. |
| RF03 | O sistema deve validar as perguntas obrigatórias e mostrar mensagens de erro amigáveis. |
| RF04 | O sistema deve armazenar as respostas anonimamente no banco de dados. |
| RF05 | O sistema deve impedir o envio duplicado por clique acidental. |
| RF06 | O sistema deve exigir login para acessar o painel administrativo. |
| RF07 | O painel deve exibir indicadores: total de respostas, % de avaliações positivas, % de negativas e quantidade de sugestões. |
| RF08 | O painel deve exibir gráficos sobre organização, música, atendimento, estrutura, frequência, divulgação e recomendação. |
| RF09 | O painel deve listar as respostas com pesquisa, filtros e ordenação por data. |
| RF10 | O painel deve ter uma seção específica para sugestões e críticas construtivas. |
| RF11 | O painel deve exportar as respostas em CSV. |

**Requisitos não funcionais**

| Código | Requisito |
|--------|-----------|
| RNF01 | Interface responsiva (computador, tablet e celular). |
| RNF02 | Nenhum dado pessoal deve ser coletado no formulário. |
| RNF03 | Somente administradores autenticados podem ler as respostas (controle no banco, via RLS). |
| RNF04 | Nenhuma chave secreta pode ficar no código do navegador. |
| RNF05 | Código simples, organizado e sem frameworks, para facilitar o aprendizado e a manutenção. |

## 5. Tecnologias utilizadas

- **HTML5**, **CSS3** e **JavaScript** puro (sem React, Angular ou Vue).
- **Supabase** (PostgreSQL + autenticação + regras de segurança RLS) como banco de dados.
- **Chart.js** para os gráficos.
- Fontes **Inter** e **Playfair Display** (Google Fonts).

Supabase e Chart.js são carregados por CDN (links dentro dos arquivos `.html`), então **não há nada para instalar** além de um editor. Você precisa estar com internet para o projeto funcionar.

## 6. Estrutura dos arquivos

```text
samba-conecta/
│
├── index.html            Página inicial (apresentação)
├── formulario.html       Pesquisa de satisfação
├── login.html            Login do painel
├── dashboard.html        Painel administrativo
│
├── css/
│   ├── style.css         Estilos compartilhados (cores, botões, topo, rodapé, página inicial)
│   ├── formulario.css    Estilos do formulário
│   ├── login.css         Estilos do login
│   └── dashboard.css     Estilos do painel
│
├── js/
│   ├── config.js         ⭐ SUAS configurações (URL e chave do Supabase, nome da ONG)
│   ├── labels.js         Perguntas, opções e textos (compartilhado)
│   ├── supabase.js       Cria a conexão com o Supabase
│   ├── formulario.js     Lógica do formulário (etapas, validação, envio)
│   ├── auth.js           Login, logout e proteção do painel
│   ├── dashboard.js      Lógica do painel (indicadores, tabela, sugestões, CSV)
│   └── charts.js         Gráficos (Chart.js)
│
├── database/
│   └── schema.sql        Tabelas e regras de segurança do banco
│
└── README.md
```

Além dos arquivos que você pediu, foram acrescentados apenas **`js/config.js`** (um lugar único para suas chaves e o nome da ONG) e **`js/labels.js`** (evita repetir as perguntas em vários arquivos).

## 7. Configurar o Supabase (passo a passo)

O Supabase é o "banco de dados na nuvem" do projeto. Tem plano gratuito. Os nomes dos menus podem mudar um pouco com o tempo, mas a ideia é a mesma.

### 7.1 Criar a conta e o projeto

1. Acesse **supabase.com** e crie uma conta (pode entrar com o GitHub).
2. Clique em **New project**.
3. Escolha um nome (ex.: `samba-conecta`), crie uma **senha do banco** (guarde em local seguro; você quase não vai usá-la) e escolha uma região próxima (ex.: South America — São Paulo).
4. Clique em **Create new project** e aguarde alguns minutos.

### 7.2 Criar as tabelas e as regras de segurança

1. No menu lateral, abra **SQL Editor**.
2. Clique em **New query**.
3. Abra o arquivo `database/schema.sql`, **copie tudo** e cole no editor.
4. Clique em **Run**. Deve aparecer "Success. No rows returned".

Isso cria a tabela `respostas`, a tabela `administradores`, a função `is_admin()` e as regras RLS. Se rodar duas vezes, não tem problema.

### 7.3 Copiar a URL e a chave pública

1. Vá em **Project Settings** (ícone de engrenagem) → **API** (em alguns projetos aparece em **API Keys** ou no botão **Connect**).
2. Copie a **Project URL** (algo como `https://abcdefgh.supabase.co`).
3. Copie a chave pública: a **anon public** ou a **publishable key**. As duas servem.

> 🚫 **Nunca use** a chave `service_role` ou `secret` no projeto. Ela dá acesso total ao banco e não pode aparecer em arquivos do navegador. Use somente a chave pública.

### 7.4 Colocar as chaves no projeto

Abra `js/config.js` e preencha:

```js
const SAMBA_CONFIG = {
  SUPABASE_URL: 'https://SEU-PROJETO.supabase.co',
  SUPABASE_ANON_KEY: 'sua-chave-anon-ou-publishable',
  ONG_NOME: 'Nome oficial da ONG',
};
```

Aproveite para trocar `ONG_NOME` pelo nome oficial da instituição.

### 7.5 Impedir cadastros públicos (recomendado)

Como o painel é só para a equipe, desligue o cadastro aberto:

1. **Authentication** → **Sign In / Providers** (ou **Settings**).
2. Desative a opção **Allow new users to sign up**.

Mesmo sem isso, quem se cadastrasse **não** conseguiria ver as respostas (precisa estar na tabela `administradores`), mas desligar evita contas desnecessárias.

## 8. Executar o projeto no VS Code

1. Instale o **Visual Studio Code** (code.visualstudio.com).
2. Crie a pasta `samba-conecta` e as subpastas `css`, `js` e `database`, como na estrutura acima.
3. Crie cada arquivo e cole o código correspondente.
4. No VS Code: **File → Open Folder** e escolha `samba-conecta`.
5. Abra a aba de extensões (`Ctrl+Shift+X`), procure **Live Server** (autor Ritwick Dey) e instale.
6. Clique com o botão direito em `index.html` → **Open with Live Server**.
7. O navegador abre em algo como `http://127.0.0.1:5500/index.html`.

> Use o Live Server (ou outro servidor local). Abrir o arquivo com duplo clique (`file://...`) pode atrapalhar o login do painel.

Teste rápido: abra o formulário, responda e envie. No Supabase, em **Table Editor → respostas**, a linha deve aparecer.

## 9. Criar o primeiro usuário administrativo

São dois passos: criar o usuário e autorizá-lo como administrador.

**Passo 1 — Criar o usuário**

1. No Supabase: **Authentication → Users → Add user → Create new user**.
2. Informe o **e-mail** e uma **senha forte**.
3. Marque **Auto Confirm User** (assim não precisa confirmar por e-mail).
4. Clique em **Create user**.

**Passo 2 — Autorizar como administrador**

1. Vá em **SQL Editor → New query**.
2. Cole o comando abaixo, trocando pelo **mesmo e-mail** do passo 1:

```sql
insert into public.administradores (user_id)
select id from auth.users where email = 'seu-email@exemplo.com';
```

3. Clique em **Run**. Deve aparecer "Success. 1 row affected" (ou similar).

Para dar acesso a outra pessoa da ONG, repita os dois passos com o e-mail dela.

> Por que dois passos? Estar logado não basta. O banco só libera as respostas para quem está na tabela `administradores`.

## 10. Acessar o painel

1. Com o Live Server aberto, vá em `login.html` (ou clique em "Área administrativa" no topo/rodapé do site).
2. Entre com o e-mail e a senha do administrador.
3. Você será levado ao `dashboard.html`.
4. Para sair, use o botão **Sair**.

Quem tentar abrir `dashboard.html` sem login volta para a tela de entrada.

## 11. Visualizar e exportar as respostas

O painel tem três seções (menu no topo):

- **Visão geral:** indicadores (total de respostas, % positivas, % negativas, sugestões recebidas) e 7 gráficos.
- **Respostas:** tabela com data, faixa etária, avaliação geral, recomendação e comentário.
  - **Pesquisar:** busca em qualquer texto ou opção.
  - **Filtrar:** por avaliação geral (positiva, neutra, negativa) e por recomendação.
  - **Ordenar:** por data (mais recentes ou mais antigas).
  - **Ver detalhes:** abre todas as respostas daquela pessoa (anônima).
- **Sugestões e críticas:** cartões com o que o público escreveu, separados em *O que pode melhorar*, *Novas atividades* e *O que mais gostaram*.

**Como os indicadores são calculados**

- **% positivas / negativas:** considera as 4 perguntas de avaliação (organização, música, atendimento, estrutura) de todas as respostas. "Excelente" e "Boa" contam como positivas; "Ruim" e "Muito ruim", como negativas; "Regular" não entra em nenhuma.
- **Avaliação geral (por resposta):** média das 4 avaliações (Excelente = 5 … Muito ruim = 1). Média 4 ou mais = positiva; de 2,5 a menos de 4 = neutra; abaixo de 2,5 = negativa.
- **Sugestões recebidas:** respostas com texto em "o que melhorar" ou "novas atividades".

**Exportar CSV:** use o botão **Exportar CSV** (visão geral ou respostas). Na seção *Respostas* você pode exportar **todas** ou só as **filtradas**. O arquivo usa `;` como separador e abre direto no Excel (em português) ou no Google Planilhas (**Arquivo → Importar**).

## 12. Segurança: como os dados são protegidos

- **Chave pública no navegador:** só a chave anon/publishable fica em `js/config.js`. Ela é pública por natureza; quem protege os dados são as regras do banco (RLS).
- **RLS ativado:** o público só consegue **inserir** respostas. **Ler** só quem está logado **e** é administrador. Ninguém altera ou apaga respostas pelo site.
- **Anonimato:** o formulário não pede nem grava nome, telefone, CPF ou e-mail. O banco não guarda IP nem dispositivo.
- **Validação em duas camadas:** o navegador valida o formulário e o banco só aceita valores permitidos (limite de 1000 caracteres nos textos).
- **Sem HTML injetado:** o texto escrito pelo público é sempre mostrado como texto simples, o que evita ataques de scripts (XSS).
- **CSV seguro:** textos que começam com `=`, `+`, `-` ou `@` são neutralizados para não virarem fórmulas na planilha.
- **Painel protegido:** a página confere login e permissão; e, mesmo que alguém burlasse isso, o banco não entregaria os dados.

## 13. Publicar na internet (opcional)

Para a ONG usar de verdade (por exemplo, com um QR Code no evento), publique os arquivos em uma hospedagem de sites estáticos gratuita, como **GitHub Pages**, **Netlify** ou **Vercel**. Depois de publicar:

1. No Supabase: **Authentication → URL Configuration**.
2. Coloque o endereço do seu site em **Site URL**.

Não é preciso mudar nada no código. Sugestão: gere um QR Code apontando para `formulario.html` e coloque em cartazes no evento.

## 14. Problemas comuns

| Sintoma | O que fazer |
|---------|-------------|
| Aviso "O sistema ainda não foi conectado ao Supabase" | Preencha `SUPABASE_URL` e `SUPABASE_ANON_KEY` em `js/config.js` e atualize a página. |
| "Não foi possível enviar sua resposta" | Confira a internet, se o `schema.sql` foi executado e se a URL/chave estão certas. Veja o erro no console (F12). |
| Login diz "E-mail ou senha incorretos" | Confira os dados do usuário em Authentication → Users. |
| Login diz "sem permissão de administrador" | Falta o passo 2 da seção 9 (inserir o usuário em `administradores`). |
| Painel abre mas sem respostas | Normal se ninguém respondeu ainda. Se há linhas no Table Editor, confirme que o usuário está em `administradores`. |
| Gráficos não aparecem | Os gráficos vêm de CDN; confira a internet. |
| Acentos estranhos no CSV | Importe como UTF-8 ou abra o arquivo direto no Excel (ele já vem com a marcação certa). |

## 15. Limitações e próximos passos

- **Spam:** como qualquer pessoa pode enviar respostas sem login, alguém mal-intencionado poderia enviar muitas respostas falsas. O formulário tem um campo-isca contra robôs simples e o banco valida os valores, mas não há bloqueio forte. Para uso em grande escala, o próximo passo seria adicionar um captcha (ex.: Cloudflare Turnstile) e limitar envios por servidor.
- **Respostas duplicadas:** por ser anônimo, o sistema não consegue saber se a mesma pessoa respondeu duas vezes (isso é uma escolha de privacidade).
- **Apagar respostas** (ex.: spam) só é possível pelo painel do Supabase (**Table Editor**), de propósito.
- **Internet necessária:** as bibliotecas vêm de CDN. Para uso offline, seria preciso baixar os arquivos e servir localmente.

---

Feito com 🎶 para fortalecer a comunidade e valorizar a cultura do samba.
