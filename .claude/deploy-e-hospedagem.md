# Skill — Deploy e Hospedagem

## Objetivo

Manter o sistema no ar sem custo, com deploy simples e reprodutível, conforme decidido em `stack-tecnologico.md`.

## Frontend (Angular → Vercel)

- Repositório Git conectado ao Vercel; cada push na branch principal gera deploy de produção, cada PR gera preview deploy.
- Build: `ng build` (output estático). Configurar no Vercel o *framework preset* Angular ou, se necessário, um `vercel.json` com `outputDirectory` apontando para `dist/<projeto>/browser` e rewrite de todas as rotas para `index.html` (SPA com Angular Router em modo history):
  ```json
  {
    "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
  }
  ```
- Variáveis de ambiente do Angular (URL do projeto Supabase e `anon key`) ficam em `src/environments/environment.ts` (dev) e `environment.prod.ts` (prod), lidas em build time. Não versionar nenhum segredo — a `anon key` não é segredo, mas manter o padrão de não hardcodear em múltiplos arquivos.
- Plano gratuito do Vercel é suficiente para um site estático de uso interno; não há necessidade de plano pago enquanto o tráfego for baixo.

## Backend (Supabase)

- Um projeto Supabase (free tier) hospeda Postgres, Auth e Edge Functions.
- Limites relevantes do free tier a monitorar conforme o projeto cresce: projeto pausado após período de inatividade (reativação manual), limite de linhas/armazenamento e de invocações de Edge Functions. Para um sistema interno de uma galeteria isso deve ser confortável no início; reavaliar se o uso crescer.
- Migrations aplicadas via Supabase CLI (`supabase db push` ou fluxo de migration versionada), nunca edição manual direta do schema em produção.
- Edge Functions publicadas via `supabase functions deploy <nome>`.

## Ambientes

- Mínimo viável: um projeto Supabase de produção. Se o orçamento permitir no futuro, considerar um projeto Supabase separado (ou branch de banco) para desenvolvimento/staging, para não testar migrations direto em produção.
- Enquanto houver um único ambiente, testar migrations localmente (Supabase CLI com Docker) antes de aplicar em produção.

## Domínio

- Vercel fornece subdomínio gratuito (`*.vercel.app`); domínio próprio é opcional e não necessário para o objetivo de custo zero.

## Checklist de deploy

1. Migration de schema testada localmente e aplicada no Supabase de produção.
2. Tipos TypeScript regenerados (`supabase gen types typescript`) se o schema mudou.
3. Variáveis de ambiente do Angular conferidas (URL/anon key do projeto correto).
4. Build local (`ng build`) sem erros antes do push.
5. Deploy de produção via push na branch principal; validar preview deploy antes quando a mudança for relevante.
