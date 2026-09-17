# Contexto do Projeto

## 1. Visão geral

O projeto é um sistema web full-stack para gestão de uma galeteria. O primeiro protótipo foi desenvolvido em Google Sheets + Apps Script para validar a forma de uso, coletar dados reais e entender a operação.

O Google Sheets é considerado um MVP temporário. O sistema web não deve copiar suas limitações.

## 2. Objetivos

- Registrar receitas e despesas.
- Controlar contas financeiras.
- Controlar pagamentos e recebimentos.
- Acompanhar despesas parceladas e dívidas.
- Organizar categorias e subcategorias.
- Registrar informações de estoque e insumos.
- Gerar indicadores financeiros confiáveis.
- Permitir análise por período, categoria, forma de pagamento e conta.
- Criar uma base que possa evoluir para controle de custos e margens.

## 3. Escopo inicial

### Financeiro
- Movimentações
- Receitas
- Despesas
- Status
- Formas de pagamento
- Contas financeiras
- Categorias e subcategorias
- Parcelamentos
- Contas a pagar
- Contas a receber

### Operacional
- Estoque e insumos
- Fornecedores
- Dívidas e credores

### Gestão
- Dashboard
- Relatórios
- Filtros por período

## 4. Contexto atual do MVP

A planilha possui uma aba `Movimentações`, uma área de `Configurações`, `Dashboard`, `Estoque` e `Dívidas e Credores`.

A tabela de movimentações utiliza atualmente:
- Data
- Ciclo
- Tipo
- Categoria
- Subcategoria
- Entidade
- Valor
- Forma de pagamento
- Status
- Conta financeira
- Observação

No sistema web, esses campos podem e devem ser remodelados se uma estrutura melhor representar o negócio.

## 5. Categorias iniciais

- Vendas
- Outros Recebimentos
- Estoque
- Insumos
- Despesas Fixas
- Manutenção
- Outros

## 6. Subcategorias iniciais

- Água
- Carvão
- Compras Diversas
- Descartáveis
- Embalagens
- Energia
- Encomendas
- Equipamentos
- Estrutura
- Feira
- Galeteria
- Gás
- Impostos
- Internet
- Materiais de Limpeza
- Natto
- Outros
- Quentinhas
- Reembolso
- Taxas
- Temperos
- Veículos

Essas listas são um ponto inicial e devem poder evoluir.

## 7. Contas financeiras iniciais

- Nubank
- Itaú
- Caixa

`Conta Financeira` é preferível a `Conta Bancária` porque também representa dinheiro em espécie.

## 8. Unidades de estoque iniciais

- un
- kg
- g
- L
- mL
- pct
- cx
- fd

## 9. Filosofia do produto

A interface deve ser simples para quem trabalha na operação. O sistema deve esconder a complexidade técnica e financeira sempre que possível.

Exemplo:

O usuário registra uma venda, informa o valor, como recebeu e onde o dinheiro entrou. O sistema é responsável por produzir os efeitos financeiros necessários.

## 10. Evolução esperada

O sistema deve futuramente conseguir relacionar:

Compra de insumos
→ estoque
→ consumo
→ produto vendido
→ custo estimado
→ margem
→ resultado.

Isso não precisa estar totalmente implementado na primeira versão, mas o modelo não deve impedir essa evolução.
