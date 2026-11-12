# MalakaTV — Guias de ARPG

Hub independente feito por fã para reunir as builds, guias de atos, estratégias de farm e ferramentas recomendadas pelo canal [MalakaTV](https://www.youtube.com/@MalakaTV).

Começou focado em **Path of Exile 1** e já conta com estrutura preparada para **Path of Exile 2** e **Hero Siege**, liberados conforme a abertura das respectivas temporadas.

## O que tem no site

- **Builds da liga**: vitrine de league starters e builds em destaque com busca instantânea por skill, classe/ascendancy e tags, além de página dedicada com vídeo embutido e compartilhamento.
- **Guias e Farms**: guias de atos, Atlas e estratégias de farm da primeira semana em cards diretos.
- **Ferramentas**: catálogo organizado por categoria (comércio, leveling, overlays, filtros e builds) com busca rápida e explicação de cada site.
- **Painel `/admin`**: editor protegido por autenticação para atualizar textos, jogos, builds, guias, links e imagens sem precisar mexer no código.

## Stack

- **Next.js 15** (App Router) & **React 19**
- **TypeScript**
- **Tailwind CSS v4** & **Lucide Icons**
- **Supabase** (autenticação, banco de conteúdo e Storage — com fallback automático para os JSONs em `content/` em desenvolvimento local)

## Rodando localmente

```bash
npm install
npm run dev
```

Acesse `http://localhost:3000`. Sem variáveis de ambiente do Supabase configuradas, o projeto lê e grava diretamente nos arquivos de `content/`.

---

Desenvolvido por **Luan Victor** — [GitHub](https://github.com/Luanvictordev)
