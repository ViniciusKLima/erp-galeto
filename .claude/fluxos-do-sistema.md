# Fluxos do Sistema

## 1. Fluxo de autenticação

Login
→ validação
→ criação de sessão
→ carregamento do usuário
→ permissões
→ dashboard.

Logout deve invalidar a sessão.

## 2. Fluxo de nova receita

Nova movimentação
→ selecionar Receita
→ preencher descrição/categoria
→ valor
→ forma de recebimento
→ conta financeira
→ status
→ salvar
→ atualizar indicadores.

Se for parcelada ou a receber:
→ criar recebíveis/parcelas.

## 3. Fluxo de nova despesa

Nova movimentação
→ selecionar Despesa
→ categoria/subcategoria
→ fornecedor quando aplicável
→ valor
→ forma de pagamento
→ conta financeira
→ status
→ salvar.

Se parcelada:
→ criar parcelas.

## 4. Fluxo de pagamento de parcela

Abrir conta a pagar
→ selecionar parcela
→ registrar pagamento
→ informar data efetiva
→ atualizar status
→ atualizar saldo da conta
→ atualizar valores pendentes
→ atualizar dashboard.

## 5. Fluxo de recebimento

Abrir conta a receber
→ selecionar recebível
→ registrar recebimento
→ informar conta financeira
→ atualizar status
→ atualizar saldo
→ atualizar indicadores.

## 6. Fluxo de transferência

Nova transferência
→ conta origem
→ conta destino
→ valor
→ data
→ confirmar.

Não deve gerar receita ou despesa.

## 7. Fluxo de categorias

Configurações
→ categorias
→ criar/editar/desativar.

Categorias usadas historicamente não devem ser apagadas fisicamente sem avaliar integridade histórica.

## 8. Fluxo de estoque — primeira versão

Estoque e Insumos
→ item
→ unidade
→ quantidade de compra
→ custo da compra
→ consumo por venda
→ rendimento
→ valor de venda
→ fornecedor
→ observações.

A primeira versão é informacional.

## 9. Fluxo futuro de estoque

Compra
→ entrada de estoque
→ custo

Venda/produção
→ consumo
→ redução de estoque
→ custo consumido
→ margem.

## 10. Fluxo de dívida

Nova dívida
→ credor
→ descrição
→ valor total
→ parcelas
→ vencimentos
→ registrar pagamentos
→ saldo restante.

Uma dívida pode gerar contas a pagar.

Evitar duplicar uma mesma obrigação financeira em módulos independentes.

## 11. Fluxo de dashboard

Selecionar período
→ backend calcula métricas
→ cards
→ gráficos
→ tabelas auxiliares.

Filtros devem alterar todos os componentes que dependem do período.

## 12. Fluxo de relatórios

Selecionar período/filtros
→ consultar dados
→ agrupar
→ apresentar
→ permitir exportação futuramente.

## 13. Regra de UX

Registrar uma operação comum deve exigir poucos passos.

Operações avançadas podem abrir campos adicionais progressivamente.
