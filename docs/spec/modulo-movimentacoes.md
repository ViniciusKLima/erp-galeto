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

## Atualização — lacunas fechadas

Liquidação de parcela individual (`parcelas.dialog.ts`), cancelamento pela UI (`cancelar-movimentacao.dialog.ts`), filtro por tipo/status/período e edição de movimentação simples pendente (`movimentacao-form.dialog.ts` agora aceita um registro existente) já estão implementados.

## O que ainda falta (menor prioridade)

- Filtro por categoria e por ciclo na listagem (o service já aceita via `MovimentacaoFiltro`, falta o campo no formulário).
- Paginação/ordenação da tabela — hoje carrega tudo de uma vez, aceitável para o volume inicial de uma galeteria, mas vai precisar antes de crescer muito.
