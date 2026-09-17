# Skill — Stack Tecnológico

## Decisão

- Frontend: **Angular + TypeScript**.
- Backend: **Supabase** (Postgres + Auth + Row Level Security + Postgres Functions/Triggers + Edge Functions). Não existe servidor Node/Nest/Express separado.
- Hospedagem do frontend: **Vercel**.
- Hospedagem do backend: **Supabase Cloud (free tier)**.
- Controle de versão: Git, repositório conectado ao Vercel para deploy automático.

Essa combinação é 100% operável nos planos gratuitos das duas plataformas, o que atende à restrição de custo do projeto. Se o uso crescer além do free tier, o upgrade é apenas de plano — a arquitetura não muda.

## Por que não um backend próprio (Node/Nest/Django/etc.)

`arquitetura.md` exige que o domínio financeiro (saldo, parcelas, permissões, regras) não seja autoridade do frontend. Isso normalmente pede um backend dedicado. Só que hospedar um backend com estado (API própria) de graça e de forma confiável é o ponto de atrito.

A resolução adotada: o **papel de "backend"** definido em `arquitetura.md` é cumprido pelo Postgres do Supabase, não pelo Angular:

- **Row Level Security (RLS)** faz o papel de autorização por perfil (admin/operador).
- **Funções e triggers em PL/pgSQL** fazem o papel de regras financeiras críticas (parcelas, saldo, status, transferências) — rodam dentro do banco, então nenhum cliente (Angular ou qualquer outro) consegue contornar.
- **Edge Functions (Deno + TypeScript)** cobrem lógica que não cabe bem em SQL (ex.: regras condicionais complexas, integrações externas futuras, envio de e-mail).
- **Supabase Auth** cobre login, sessão e hash de senha — não reinventar isso.

O Angular fala diretamente com o Supabase (via `@supabase/supabase-js`) para leitura e para operações simples protegidas por RLS, e chama **funções RPC do Postgres** ou **Edge Functions** para qualquer operação que precise ser atômica ou validada com regra financeira (ex.: registrar pagamento de parcela, criar movimentação parcelada, fazer transferência entre contas).

Detalhe de implementação em `supabase-e-seguranca.md`.

## Por que Angular

Framework completo (roteamento, forms reativos, DI, HTTP client) adequado para um ERP com muitas telas de formulário/tabela — reduz a necessidade de escolher e integrar bibliotecas soltas. TypeScript nativo em todo o projeto (frontend, Edge Functions, tipos gerados do banco) mantém um único idioma de código do início ao fim.

Padrões de código Angular específicos: `angular-padroes.md`.

## Por que Vercel para o frontend

Build estático do Angular (`ng build`) publicado como site estático — plano gratuito do Vercel cobre isso confortavelmente, com deploy automático a cada push e preview por branch/PR.

Detalhes de deploy: `deploy-e-hospedagem.md`.

## O que isso NÃO muda

- As regras de `regras-financeiras.md` continuam valendo integralmente — a única mudança é *onde* elas são aplicadas (banco em vez de um servidor de aplicação).
- O princípio "frontend não é autoridade" continua valendo: o Angular nunca deve calcular saldo, resultado ou validar regra financeira crítica e simplesmente gravar o resultado — ele exibe, coleta input, e delega a gravação/validação para RLS + funções do Postgres.
- Auditoria (`created_by`, `updated_at`, histórico) continua obrigatória, ver `supabase-e-seguranca.md`.
