# Schema — Supabase (projeto `ydhgtextuntiiqbhxutv`, região sa-east-1)

Todas as migrações estão versionadas no histórico do projeto Supabase (nomes `001_...` a `010_...`). Este documento explica o resultado, não repete o SQL — o SQL fica no próprio Supabase (Database → Migrations no dashboard).

## Tabelas de catálogo (configuração)

| Tabela | Papel |
|---|---|
| `profiles` | Perfil do usuário (nome, `role`: admin/operador, `active`). 1:1 com `auth.users` do Supabase Auth — criado automaticamente no cadastro. |
| `payment_methods` | Pix, Dinheiro, Cartão de débito/crédito, Transferência, Outros. |
| `financial_accounts` | Nubank, Itaú, Caixa (`type`: bank/cash/other), com `initial_balance`. |
| `transaction_categories` | Categoria + `type` (income/expense). Seed: Vendas, Outros Recebimentos, Estoque, Insumos, Despesas Fixas, Manutenção, Outros. |
| `transaction_subcategories` | Presa a uma categoria. Seed conforme `contexto-projeto.md` §6 — mapeamento categoria↔subcategoria é uma decisão minha, ver `decisoes-abertas.md`. |
| `contacts` | Clientes, fornecedores e credores (`type`). Entidade genérica reaproveitada por `financial_transactions.counterparty_id`, `inventory_items.supplier_id` e `debts.creditor_id`. |
| `cycles` | **Ciclo semanal** (sexta/sábado/domingo). Ver seção própria abaixo. |

## Núcleo financeiro

### `financial_transactions`
Representa o fato/compromisso financeiro (regra 1 de `regras-financeiras.md`). Campos-chave:
- `amount` — valor da operação (o que foi vendido/gasto), nunca muda depois de criado.
- `paid_amount`, `paid_at` — **calculados automaticamente** a partir de `transaction_settlements` (nunca escritos diretamente pelo Angular).
- `status` — `pendente` | `pago` | `recebido` | `cancelado`. Um `check` garante que receita nunca fica `pago` nem despesa `recebido`.
- `is_installment` / `installments_total` — se parcelada, o valor e as datas reais ficam em `installments`, não em texto.
- `cycle_id` — opcional, liga a movimentação a um ciclo semanal (nullable: nem toda despesa é do ciclo, ex.: conta de internet mensal).
- `created_by` — preenchido pelo banco (`default auth.uid()`), nunca aceito do payload do cliente.

Não guarda `financial_account_id` — ver por quê na seção de liquidações.

### `installments`
Uma linha por parcela real (regra 12 de `regras-financeiras.md`): número, valor, vencimento, `paid_amount`/`paid_at` (também calculados), status.

### `transaction_settlements` — o coração do modelo de pagamento parcial
Cada linha é **um evento real de dinheiro**: alguém recebeu ou pagou X reais, numa data, numa conta financeira. Uma movimentação (ou parcela) pode ter **várias** liquidações — é assim que uma venda fiada de R$1.000 pode ser recebida em R$500 hoje e R$500 daqui duas semanas (exemplo literal de `contexto-negocio-galeteria-claude.md` §6), sem precisar virar "parcelamento" formal.

Um trigger (`sync_settlement_totals`) recalcula `paid_amount`/`paid_at`/`status` da movimentação (e da parcela, se houver) toda vez que uma liquidação é inserida, alterada ou removida. Isso é o que garante que dashboard e telas nunca fiquem dessincronizados do que realmente foi pago — é a "fonte única de verdade" que `dashboard-e-metricas.md` exige.

Liquidação nunca pode ultrapassar o saldo pendente do item (validado na função `registrar_liquidacao`), e nunca pode ser lançada contra algo já `cancelado`.

### `transfers`
Entre contas próprias. Nunca aparece como receita/despesa (regra 9/11). `source_account_id <> destination_account_id` é reforçado por constraint.

### `financial_transactions_audit`
Toda alteração de `status`, `amount`, `paid_amount` ou conta vira uma linha de auditoria (trigger `audit_financial_transactions`), com quem alterou e quando — requisito de `autenticacao-e-permissoes.md`.

## Ciclo semanal (`cycles`)

Implementa `contexto-negocio-galeteria-claude.md` §2 e §15: uma dimensão de análise (não é conta financeira, não substitui a data), com `start_date`/`end_date`/`status` (`aberto` → `em_andamento` → `fechamento` → `fechado`).

**Decisão deliberada**: ciclos são criados manualmente (um registro por semana real), não gerados automaticamente por uma regra fixa tipo "toda sexta-feira". O documento de negócio pede explicitamente para não inventar o calendário/regras de fechamento antes de o negócio defini-las. Um `exclude constraint` impede dois ciclos com datas sobrepostas.

Hoje só existe a tabela — não há tela de administração de ciclos no Angular ainda (ver `roadmap.md`).

## Estoque e dívidas

- `inventory_items` — primeira versão informacional (regra 16 do contexto de negócio): item, unidade, quantidade/custo de compra, consumo, rendimento, valor de venda, fornecedor.
- `debts` / `debt_installments` — dívidas com credores, parceladas de verdade (não texto).

Unidade de `inventory_items.unit` é uma lista fechada (`un, kg, g, L, mL, pct, cx, fd`) vinda de `contexto-projeto.md` §8.

## Autorização (RLS)

Todas as tabelas têm RLS ativo. Padrão geral:
- **Leitura**: qualquer usuário autenticado e `active = true`.
- **Escrita em catálogos** (categorias, contas, formas de pagamento, contatos): só `admin`.
- **Movimentações**: qualquer usuário ativo cria (vinculado a si mesmo); só o próprio autor pode editar/cancelar enquanto `pendente` e sem nenhuma liquidação; admin tem controle total, inclusive cancelar algo já parcialmente pago (baixa de saldo remanescente).
- **Liquidações**: não são inseridas por `INSERT` direto do cliente — só pela função `registrar_liquidacao`, que valida regra de negócio antes de gravar. Isso é o "backend" exigido por `arquitetura.md`, vivendo dentro do Postgres.

Detalhe completo em `.claude/supabase-e-seguranca.md`.

## Funções (RPC) chamáveis do Angular

| Função | Uso |
|---|---|
| `criar_movimentacao_parcelada(...)` | Cria a movimentação + todas as parcelas atomicamente, com soma exata (última parcela absorve arredondamento). |
| `registrar_liquidacao(...)` | Registra um pagamento/recebimento (total ou parcial) contra uma movimentação simples ou uma parcela específica. |
| `cancelar_movimentacao(...)` | Cancela preservando o que já foi liquidado; exige motivo; operador só cancela o que criou e ainda não recebeu nada. |
| `is_admin()` / `is_active_user()` | Helpers de autorização, também usáveis pelo front para lógica de UI (não são a autoridade — RLS é). |
| `criar_divida_parcelada(...)` | Mesmo padrão de `criar_movimentacao_parcelada`, mas para `debts` + `debt_installments`. |
| `registrar_pagamento_divida(...)` | Marca uma parcela de dívida como paga; quita a dívida automaticamente quando não sobra nenhuma parcela pendente. Só suporta pagamento integral por parcela (sem liquidação parcial como em `transaction_settlements` — dívidas são uma trilha informacional separada, não afetam `v_saldo_contas`/fluxo de caixa diretamente; um pagamento de dívida que afeta o caixa real deve também ser lançado como uma despesa normal em Movimentações). |

Uma movimentação **simples** (não parcelada) é criada com `INSERT` direto do Angular (permitido por RLS) — não precisa de função, porque é uma operação de uma tabela só. Edição de uma movimentação simples pendente também é `UPDATE` direto (RLS já restringe a quem criou e ainda está pendente, ou admin).

## Views para dashboard e relatórios

Todas com `security_invoker = true` (respeitam RLS de quem consulta, não do dono da view).

| View | Para quê |
|---|---|
| `v_movimentos_caixa` | União de todas as liquidações reais + transferências, com direção (entra/sai) — base de tudo abaixo. |
| `v_saldo_contas` | Saldo atual por conta financeira. |
| `v_resultado_periodo` | Receita/despesa reconhecida por competência (`transaction_date`, exclui cancelado) — inclui `cycle_id` para agrupar "por ciclo" como pedido em `contexto-negocio-galeteria-claude.md` §18/19. |
| `v_fluxo_caixa` | Entradas/saídas efetivas (base caixa), também com `cycle_id`. |
| `v_contas_a_pagar` / `v_contas_a_receber` | Pendências (simples + parcelas), com saldo remanescente já calculado. |

## Auditorias de segurança/performance já corrigidas

Rodei os advisors do Supabase após aplicar o schema: corrigi funções de trigger expostas como RPC pública (revogadas), `auth.uid()` reavaliado por linha nas policies (trocado por `(select auth.uid())`), e índices faltando em todas as foreign keys usadas em joins. Os únicos avisos remanescentes são intencionais (as 3 funções RPC de negócio e `is_admin`/`is_active_user` continuam chamáveis por usuários autenticados — é assim que o Angular as usa).
