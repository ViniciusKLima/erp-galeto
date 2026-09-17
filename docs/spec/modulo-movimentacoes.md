# Módulo — Movimentações (implementado)

Único módulo com fluxo completo hoje. Serve de padrão de código para os próximos (mesma estrutura de pastas, mesmo estilo de service/dialog).

## Onde está o código

```
src/app/features/movimentacoes/
  movimentacoes.service.ts       — toda comunicação com Supabase (tabelas + RPCs)
  movimentacoes-list.page.ts     — tela principal: tabela + ações
  movimentacao-form.dialog.ts    — formulário de criação (simples ou parcelada)
  liquidacao-form.dialog.ts      — formulário de registrar pagamento/recebimento (total ou parcial)
```

## O que funciona

- Login (Supabase Auth) → guard de rota → shell com menu lateral.
- Listar movimentações (mais recentes primeiro), com tipo, valor, pago/recebido e status visíveis na tabela.
- Criar movimentação simples (receita ou despesa): categoria filtrada por tipo, subcategoria filtrada por categoria, forma de pagamento, contraparte e ciclo opcionais.
- Criar movimentação parcelada: mesmo formulário, com quantidade de parcelas e vencimento da 1ª — a função `criar_movimentacao_parcelada` cria a movimentação e todas as parcelas de uma vez.
- Liquidar (botão "Liquidar" em item pendente não parcelado): abre diálogo pedindo valor, data e conta financeira — aceita valor menor que o total pendente (liquidação parcial, ex.: venda fiada).
- Dashboard: cards de receita/despesa/resultado do mês, saldo por conta, total a pagar/receber.

## O que este módulo ainda não faz (ficou fora do primeiro corte)

- Liquidar uma **parcela individual** pela tela (o dialog de liquidação só foi ligado à movimentação simples na lista; a função `registrarLiquidacao` já aceita `installmentId`, falta o botão/tela para abrir a lista de parcelas de uma movimentação parcelada e liquidar uma a uma).
- Cancelar movimentação pela UI (a função `cancelar_movimentacao` existe e está no service, falta o botão + diálogo pedindo o motivo).
- Filtros na listagem (período, tipo, status, categoria, ciclo) — `movimentacoes.service.ts.listar()` já aceita um `MovimentacaoFiltro`, falta a UI de filtro na página.
- Edição de uma movimentação pendente.
- Paginação/ordenação da tabela (`ux-ui.md` pede busca/filtro/ordenação/paginação em tabelas — hoje carrega tudo de uma vez, aceitável para o volume inicial de uma galeteria, mas vai precisar antes de crescer muito).

Essas lacunas são candidatas naturais para a próxima sessão de trabalho neste módulo antes de replicar o padrão para os outros.
