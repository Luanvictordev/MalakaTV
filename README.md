# MalakaTV — guias de ARPG

Site com os guias do canal [MalakaTV](https://www.youtube.com/@MalakaTV). Começou com Path of Exile 1 e está preparado para **Path of Exile 2** e **Hero Siege** — as duas seções existem no menu, mas ficam desativadas ("em breve") até a data de lançamento.

Next.js (App Router) + Tailwind + Supabase (login do admin, banco do conteúdo e imagens).

## Rodar no seu computador

```bash
npm install
npm run dev
```

Abre em http://localhost:3000. **Sem** as variáveis do Supabase o site funciona normalmente e o editor salva nos arquivos de `content/` — é o modo de desenvolvimento.

## Supabase (login + banco + imagens)

1. Crie um projeto em [supabase.com](https://supabase.com).
2. Em **SQL Editor → New query**, cole e rode o conteúdo de [`supabase/schema.sql`](supabase/schema.sql). Isso cria a tabela `content`, as políticas de acesso e o bucket público `malaka` para as imagens.
3. Em **Authentication → Users → Add user**, crie o usuário do Malaka com email e senha (marque "Auto Confirm User"). Não existe cadastro público: só quem você criar entra.
4. Em **Project Settings → API**, copie a `Project URL` e a `anon public key`.
5. Crie um arquivo `.env.local` na raiz (use o `.env.example` como base):

```bash
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key
```

Com isso, `/admin` pede login em `/login`, o conteúdo é lido/gravado no banco e as fotos vão para o Storage.

> Depois de conectar, entre em `/admin` e clique em **Salvar** uma vez em cada aba para subir o conteúdo que já está nos arquivos JSON para o banco.

## Páginas

| Página | O que tem |
| --- | --- |
| `/` | Identidade do canal, capa da liga, os três jogos e os destaques do jogo ativo |
| `/jogos/poe1` | Hub do jogo: builds com filtro, guias e farms |
| `/jogos/poe2`, `/jogos/hero-siege` | Tela "em breve" (desativadas no menu) |
| `/jogos/[jogo]/builds/[slug]` | Página da build com o vídeo embutido |
| `/ferramentas` | Os sites e overlays, com logo e explicação |
| `/login` | Login do admin |
| `/admin` | Editor de conteúdo (protegido) |

## Como editar

1. `npm run dev` e abra http://localhost:3000/admin (ou o site publicado, logado).
2. Edite, suba fotos se quiser e clique em **Salvar** — com Supabase, já está no ar.
3. Sem Supabase, o save grava em `content/*.json` e você publica com `git push`.

Detalhes:

- **Abrir PoE 2 / Hero Siege:** em **Jogos**, troque o status de `em-breve` para `ativo` e cadastre builds/guias com aquele `game`. A data de lançamento é só a etiqueta `releaseLabel`.
- **Capa da liga:** fica em `public/images/liga-3-30.jpg` e pode ser trocada em **Textos do site → Capa da liga**.
- **Foto do canal:** `public/images/malaka-profile.jpg` (usada pequena, no header e na seção do canal).
- **Thumb dos vídeos:** só o ID do vídeo já traz a capa do YouTube.
- **Logo das ferramentas:** vem do favicon do site; "Inverter logo" serve pra logo escura em fundo escuro.
- **Slug:** é o endereço da página; evite mudar depois de publicado.

## Publicar no Vercel

```bash
git init
git add .
git commit -m "site de guias do MalakaTV"
```

1. Crie o repositório no GitHub e faça o push.
2. Em [vercel.com](https://vercel.com) → **Add New → Project** → importe o repositório. Framework Next.js é detectado sozinho.
3. Em **Settings → Environment Variables**, adicione `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` (mesmos valores do `.env.local`).
4. **Deploy**. Cada push gera um deploy novo.

Conteúdo, imagens e login vivem no Supabase, então editar pelo site publicado não exige redeploy.
