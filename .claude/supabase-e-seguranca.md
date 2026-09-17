# Skill — Supabase (Backend, Dados e Segurança)

## Objetivo

Definir como o Supabase cumpre o papel de "backend" exigido por `arquitetura.md` e `padroes-de-desenvolvimento.md`: autenticação, autorização, integridade e regras financeiras críticas vivem no banco, não no Angular.

## Autenticação

- Usar **Supabase Auth** (email + senha) em vez de reimplementar hash/sessão. Isso substitui os campos `password_hash` do `users` sugerido em `banco-de-dados.md`.
- Criar uma tabela `public.profiles` com `id` = `auth.users.id` (FK), contendo `name`, `role` (`admin` | `operador`), `active`, `created_at`, `updated_at`. É a adaptação do `users` de `banco-de-dados.md` ao modelo do Supabase — ver nota no próprio arquivo.
- Um trigger em `auth.users` (`on_auth_user_created`) cria automaticamente a linha correspondente em `profiles`.
- Usuário inativo (`active = false`) deve ser bloqueado nas policies de RLS, não apenas escondido na UI.

## Autorização (Row Level Security)

RLS **sempre ligado** em toda tabela de negócio. Nunca desabilitar RLS como atalho.

Padrão de policy:

```sql
create policy "operador can insert movimentacoes"
on financial_transactions
for insert
to authenticated
with check (
  exists (
    select 1 from profiles
    where profiles.id = auth.uid()
      and profiles.active = true
  )
);
```

Regras gerais de perfil:
- `admin`: acesso total (CRUD em configurações, usuários, financeiro, relatórios).
- `operador`: pode criar/consultar movimentações e o que `autenticacao-e-permissoes.md` permitir; não pode mexer em configurações críticas (categorias, contas financeiras, usuários) nem apagar registros financeiros pagos/recebidos.
- Nunca confiar em um `role` ou `id` enviado pelo cliente — toda policy deve resolver o perfil a partir de `auth.uid()` consultando `profiles`, nunca a partir de um valor que o Angular manda no payload.

## Onde vive a regra financeira crítica

Regra financeira que **não pode ser violada por nenhum cliente** vai em função de banco (PL/pgSQL), não em serviço Angular nem em Edge Function chamando múltiplas tabelas sem transação.

Exemplos que devem ser funções/RPC (`security definer` quando precisar passar por cima de RLS de forma controlada, sempre validando perfil manualmente dentro da função):

- `criar_movimentacao_parcelada(...)`: cria a movimentação e todas as parcelas (`installments`) em uma única transação, garantindo que a soma das parcelas bate com o valor total.
- `registrar_pagamento_parcela(...)`: atualiza status da parcela, `paid_at`, valor pago, e reflete no saldo da conta financeira — tudo atômico.
- `registrar_transferencia(...)`: debita conta origem, credita conta destino, sem gerar receita/despesa (regra 9 de `regras-financeiras.md`).
- `cancelar_movimentacao(...)`: nunca faz `DELETE` de registro com impacto financeiro já efetivado; marca `status = 'cancelado'` e preserva histórico (regra 14/15 de `regras-financeiras.md`).

O Angular chama essas funções via `supabase.rpc('nome_da_funcao', { ... })` em vez de fazer múltiplos `insert`/`update` diretos quando a operação afeta mais de uma entidade.

Leituras simples (listar movimentações, categorias ativas, etc.) podem usar o client do Supabase direto (`select`), protegidas por RLS — não precisam de RPC.

## Integridade no banco

Reforçar em SQL o que `banco-de-dados.md` já pede:
- `numeric(12,2)` para todo valor monetário — nunca `float`/`double`.
- `check (amount > 0)` em movimentações e parcelas.
- `foreign key` com `on delete restrict` em relacionamentos financeiros (não deixar apagar categoria/conta com histórico).
- Enums via `check` ou tabela de domínio para `type`, `status`.
- Índices em `transaction_date`, `status`, `category_id`, `financial_account_id`, `transaction_id`, `due_date`, conforme `banco-de-dados.md`.

## Dashboard e relatórios

Métricas de `dashboard-e-metricas.md` e `relatorios.md` devem ser **views ou funções SQL** (ex.: `view resumo_financeiro_periodo`), não cálculo feito no Angular a partir de dados brutos baixados. Isso garante que card e gráfico usem a mesma fonte de verdade (regra fundamental de `dashboard-e-metricas.md`) e evita reprocessar lógica de reconhecimento de receita/despesa em TypeScript.

## Migrations

- Toda alteração de schema é uma migration versionada (`supabase/migrations/*.sql`), nunca uma alteração manual direto no dashboard do Supabase em produção.
- Aplicar localmente primeiro (Supabase CLI / branch de desenvolvimento) antes de subir para o projeto de produção.

## Segredos e chaves

- `anon key` (pública) é a única usada no bundle do Angular — protegida pelas policies de RLS, não é segredo.
- `service_role key` **nunca** vai para o frontend nem para o repositório. Só é usada dentro de Edge Functions/ambiente de servidor quando estritamente necessário, e mesmo assim preferir `security definer` functions a distribuir a service key.
- Variáveis de ambiente do Angular (URL do projeto, anon key) ficam em arquivos de environment do Angular e nas env vars do Vercel — nunca hardcoded em múltiplos lugares.

## Auditoria

- `created_by` preenchido a partir de `auth.uid()` via `default auth.uid()` ou dentro da função RPC — nunca aceitar `created_by` vindo do payload do cliente.
- Para operações financeiras críticas (edição/cancelamento de movimentação já paga/recebida), manter uma tabela de histórico (`financial_transactions_audit` ou equivalente) alimentada por trigger `AFTER UPDATE`, conforme exigido por `regras-financeiras.md` (14/15) e `autenticacao-e-permissoes.md`.
