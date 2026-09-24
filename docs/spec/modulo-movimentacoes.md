# Módulo — Movimentações (implementado, referência de padrão)

Módulo mais completo do sistema, reconstruído na etapa 2 do redesign visual (`.claude/reestrutura-visual.md`). Serve de padrão de código para os próximos módulos (mesma estrutura de pastas — `pages/` para telas roteadas, `components/` para dialogs e componentes internos, service na raiz da feature —, mesmo estilo de service/dialog, mesmos componentes compartilhados).

## Onde está o código

```
src/app/features/movimentacoes/
  movimentacoes.service.ts                  — toda comunicação com Supabase (tabelas + RPCs), incluindo transferências
  pages/
    movimentacoes-list/                     — tela principal: busca, filtros, tabela, menu de ações por linha, mini-lista de transferências
  components/
    movimentacao-form/                      — modal de criação/edição — três tipos num único formulário: receita, despesa ou transferência
    movimentacao-detail/                    — drawer de detalhes (dialog docado à direita) ao clicar numa linha
    liquidacao-form/                        — registrar pagamento/recebimento (total ou parcial)
    parcelas/                               — liquidar parcela individual de uma movimentação parcelada
    cancelar-movimentacao/                  — cancelar com motivo, preservando histórico
```

Cada pasta contém o componente em três arquivos com o mesmo nome base (ex.: `movimentacoes-list.page.ts`/`.html`/`.scss`, `movimentacao-form.dialog.ts`/`.html`/`.scss`).

## O que funciona

- Login (Supabase Auth) → guard de rota → shell com sidebar (identidade "Galeto do Fofão").
- Listar movimentações com busca por descrição e filtros completos: tipo, categoria, status, ciclo, forma de pagamento, período (via `app-period-filter` compartilhado).
- Criar movimentação simples (receita ou despesa) ou parcelada (`criar_movimentacao_parcelada` cria a movimentação e todas as parcelas de uma vez) — categoria filtrada por tipo, subcategoria filtrada por categoria, forma de pagamento, contraparte e ciclo opcionais.
- Criar transferência entre contas próprias no mesmo modal (`criarTransferencia`) — aparece numa mini-lista separada abaixo da tabela principal, não na tabela de receita/despesa (ver `decisoes-abertas.md` item 8, é uma simplificação consciente pendente de confirmação).
- Editar movimentação simples pendente.
- Liquidar total ou parcial (inclusive parcela por parcela) — aceita valor menor que o pendente (venda fiada), não aceita valor maior.
- Cancelar com motivo, preservando histórico; regras de quem pode cancelar em `decisoes-abertas.md` item 4.
- Drawer de detalhes ao clicar numa linha, com todas as informações e ações da movimentação.

## O que ainda falta (menor prioridade, ver `roadmap.md`)

- Paginação/ordenação da tabela — hoje carrega tudo de uma vez, aceitável para o volume atual de uma galeteria, mas vai precisar antes de crescer muito.
- Transferências misturadas na mesma tabela cronológica das movimentações (hoje é uma mini-lista à parte) — mudança de estrutura de dados, não só visual.
