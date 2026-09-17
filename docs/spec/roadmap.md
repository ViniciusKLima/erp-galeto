# Roadmap — o que falta construir

Ordem sugerida, seguindo o princípio de `prompt-mestre-claude.md` ("construir por módulos, mantendo o sistema funcional"). O banco de dados já suporta todos os itens abaixo — o que falta é majoritariamente tela Angular.

## 1. Fechar o módulo de Movimentações
Ver lacunas detalhadas em `modulo-movimentacoes.md`: liquidação por parcela individual, cancelamento pela UI, filtros, edição.

## 2. Configurações (hoje é um placeholder)
Tela de admin para CRUD de:
- Categorias e subcategorias (ativar/desativar, não apagar fisicamente — `categorias-contas-configuracoes.md`).
- Contas financeiras (criar, editar, ativar/desativar, ver saldo via `v_saldo_contas`).
- Formas de pagamento.
- Usuários (`profiles`): ativar/desativar, promover a admin — hoje só dá pra fazer via SQL direto no Supabase.
- **Ciclos**: criar um novo ciclo (label, data início/fim), avançar status (`aberto` → `em_andamento` → `fechamento` → `fechado`). Sem isso, `cycle_id` nas movimentações fica sempre vazio na prática.

## 3. Contas a Pagar / Contas a Receber (telas dedicadas)
As views `v_contas_a_pagar` e `v_contas_a_receber` já existem e já agregam simples + parcelas com saldo pendente. Falta uma tela que liste isso por vencimento, com o botão de liquidar direto (reaproveita `liquidacao-form.dialog.ts`).

## 4. Estoque e Insumos
CRUD de `inventory_items` (primeira versão informacional, conforme `estoque.md` e `contexto-negocio-galeteria-claude.md` §16). Sem vínculo automático com movimentações ainda — isso é evolução futura documentada no próprio schema.

## 5. Dívidas e Credores
CRUD de `debts` + `debt_installments`, seguindo `dividas-e-credores.md`. Cuidado documentado em `banco-de-dados.md`: não duplicar uma obrigação que já está representada como `financial_transactions` parcelada — usar `debts` só para dívidas que não nasceram de uma movimentação normal do sistema.

## 6. Relatórios
`relatorios.md` pede seleção de período/filtros, agrupamento, apresentação, exportação futura. As views de dashboard já dão a base; falta a camada de agrupamento por ciclo/categoria/forma de pagamento na tela e, mais adiante, exportação (CSV é o caminho mais simples e gratuito).

## 7. Dashboard — próximas métricas
Hoje o dashboard mostra receita/despesa/resultado do mês, saldo por conta e totais a pagar/receber. `dashboard-e-metricas.md` e `contexto-negocio-galeteria-claude.md` §18 sugerem, em ordem de valor prático: faturamento por ciclo, despesas por ciclo, resultado por ciclo, evolução mensal, despesas/receitas por categoria. Todas dão para construir em cima de `v_resultado_periodo`/`v_fluxo_caixa` agrupando por `cycle_id` ou `category_id` — não precisa de nova tabela.

## Fora de escopo por enquanto (documentado, não esquecido)
- Custo/margem por produto (depende de estoque real, não só informacional) — `regras-financeiras.md` §20 e §19 do contexto de negócio.
- Multi-empresa/múltiplas unidades — nada no schema hoje impede evoluir para isso, mas não foi modelado.
- App mobile nativo — `ux-ui.md` já pede responsividade na web, que o Angular Material cobre; não há necessidade identificada de app nativo.
