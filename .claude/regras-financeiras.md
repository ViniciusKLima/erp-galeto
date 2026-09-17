# Regras Financeiras

Esta é a skill central do projeto. Todas as telas, APIs, consultas e métricas financeiras devem respeitar estas regras.

## 1. Princípio central

Uma movimentação representa um fato financeiro ocorrido ou um compromisso financeiro reconhecido pelo negócio.

O sistema precisa diferenciar:
- valor da operação;
- valor efetivamente recebido/pago;
- valor pendente;
- data da operação;
- data do vencimento;
- data efetiva do pagamento/recebimento.

## 2. Receita

Receita representa valor gerado pela atividade ou outro recebimento reconhecido pelo negócio.

Exemplos:
- venda de galeto;
- quentinha;
- encomenda;
- venda de outros produtos;
- outros recebimentos legítimos.

Receita não deve ser confundida automaticamente com dinheiro disponível.

Uma venda parcelada ou ainda não recebida pode gerar receita e, simultaneamente, valor a receber.

## 3. Despesa

Despesa representa um custo ou gasto assumido pelo negócio.

Exemplos:
- compras de estoque;
- insumos;
- energia;
- água;
- internet;
- impostos;
- manutenção;
- materiais de limpeza;
- embalagens.

Uma despesa parcelada pode existir antes de todo o dinheiro sair do caixa.

## 4. Resultado

Para um período:

Resultado = Receitas reconhecidas - Despesas reconhecidas

O sistema deve deixar explícita a metodologia usada para reconhecer receitas e despesas.

Não chamar simplesmente o saldo bancário de lucro.

## 5. Fluxo de caixa

Fluxo de caixa considera entradas e saídas efetivas de dinheiro.

Saldo final = Saldo inicial + Entradas efetivas - Saídas efetivas

Entradas e saídas devem estar associadas a uma conta financeira quando houver impacto em dinheiro disponível.

## 6. Saldo

Saldo de uma conta financeira representa:

Entradas efetivamente recebidas
- Saídas efetivamente pagas
+ saldo inicial
- transferências de saída
+ transferências de entrada

Transferências entre contas próprias não são receita nem despesa.

## 7. Status

O sistema deve diferenciar pelo menos:
- Pendente
- Pago
- Recebido
- Cancelado

Se o modelo utilizar status específicos para receita e despesa, isso deve ser consistente em toda a aplicação.

`Cancelado` não deve continuar impactando indicadores financeiros.

## 8. Contas financeiras

Uma conta financeira representa onde o dinheiro está ou de onde ele sai.

Exemplos:
- Nubank
- Itaú
- Caixa

Uma conta financeira não é necessariamente uma conta bancária.

## 9. Transferências

Transferência entre Nubank e Caixa:
- reduz saldo do Nubank;
- aumenta saldo do Caixa;
- não altera receita;
- não altera despesa;
- não altera lucro.

Transferências devem ter entidade própria ou tratamento equivalente para evitar dupla contagem.

## 10. Formas de pagamento

Forma de pagamento informa como a operação foi realizada.

Exemplos:
- Pix
- Dinheiro
- Cartão de débito
- Cartão de crédito
- Transferência
- Outros

Forma de pagamento e conta financeira são conceitos diferentes.

Exemplo:
Pix pode entrar no Nubank.
Dinheiro entra no Caixa.

## 11. Parcelamento

Não armazenar apenas texto como `3/10`.

Uma operação parcelada deve permitir representar:
- operação original;
- quantidade total de parcelas;
- valor de cada parcela;
- vencimento de cada parcela;
- status de cada parcela;
- data efetiva de pagamento/recebimento;
- valor pago/recebido;
- saldo restante.

## 12. Contas a pagar

Representam compromissos de saída ainda não pagos.

O sistema deve permitir identificar:
- credor;
- origem;
- valor;
- vencimento;
- parcelas;
- valor pago;
- saldo restante;
- situação.

## 13. Contas a receber

Representam valores devidos à empresa.

Devem permitir identificar:
- cliente/origem quando necessário;
- operação de origem;
- valor;
- vencimento;
- valor recebido;
- saldo restante;
- situação.

## 14. Estornos e cancelamentos

Uma operação cancelada não deve simplesmente desaparecer do histórico.

O sistema deve preservar rastreabilidade.

Quando necessário, usar estorno/reversão em vez de apagar silenciosamente um fato financeiro já registrado.

## 15. Edição e exclusão

Alterações devem recalcular os indicadores automaticamente.

Excluir uma operação paga/recebida deve exigir cuidado porque ela pode ter impacto histórico.

Para registros financeiros relevantes, preferir:
- cancelamento;
- estorno;
- auditoria.

## 16. Datas

O sistema deve diferenciar, quando necessário:
- data da operação;
- data de vencimento;
- data do pagamento/recebimento.

Não assumir que todas são iguais.

## 17. Métricas

Toda métrica deve possuir uma definição explícita.

Exemplo:
- Faturamento: soma das receitas segundo a regra de reconhecimento definida.
- Entradas: soma dos recebimentos efetivos.
- Despesas: soma das despesas segundo a regra de reconhecimento definida.
- Saídas: soma dos pagamentos efetivos.
- Resultado: receitas reconhecidas - despesas reconhecidas.
- A pagar: compromissos ainda não pagos.
- A receber: valores ainda não recebidos.

## 18. Integridade

Nenhuma métrica deve depender de valores digitados manualmente no dashboard.

O dashboard deve consultar dados transacionais.

## 19. Estoque e financeiro

Uma compra de R$ 300 em insumos pode gerar:
- despesa/compromisso financeiro;
- entrada de estoque;
- vínculo com fornecedor.

Não duplicar o valor financeiro por registrar os dois eventos.

## 20. Custo e margem

Em evolução futura:

Receita da venda
- custo dos insumos consumidos
= margem bruta estimada

A margem deve deixar claro quais custos estão sendo considerados.

Não apresentar margem como lucro líquido se despesas operacionais ainda não estiverem incluídas.

## 21. Regra de ouro

Nunca calcular uma métrica financeira com base em uma interpretação implícita.

Se uma métrica for criada, documentar:
- fórmula;
- período;
- registros considerados;
- status considerados;
- tratamento de cancelamentos;
- tratamento de parcelamentos.
