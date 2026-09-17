# Contexto de Negócio — Galeteria

## Objetivo deste documento

Este documento complementa as skills técnicas e financeiras do projeto. Ele descreve como a galeteria realmente funciona para que o Claude não trate o sistema como um controle financeiro genérico.

A regra principal é: **o sistema deve representar a operação real do negócio e transformar essa operação em dados confiáveis para análise.**

---

## 1. Operação do negócio

A galeteria opera principalmente em **sexta, sábado e domingo**, podendo também funcionar em feriados.

A dinâmica operacional é concentrada no fim de semana:

```text
Compras e preparação
        ↓
Operação / vendas
        ↓
Recebimentos
        ↓
Pagamentos e conferência
        ↓
Análise do resultado
```

Por isso existe o conceito de **CICLO SEMANAL**.

---

## 2. Regra de negócio: ciclo semanal

O negócio trabalha com um ciclo semanal que representa uma unidade de operação e análise.

O ciclo deve reunir o contexto de:

- compras feitas para a operação;
- insumos utilizados;
- vendas realizadas;
- recebimentos;
- despesas relacionadas;
- pagamentos;
- valores pendentes;
- resultado da operação.

O ciclo é uma **dimensão operacional/analítica**, e não uma conta financeira.

Ele não substitui a data da movimentação.

O sistema deve permitir analisar tanto:

- por data/período;
- por ciclo semanal;
- por mês.

Não criar uma aba, tabela ou estrutura independente para cada semana ou mês. As movimentações devem permanecer centralizadas e o ciclo deve ser usado para filtrar, agrupar e comparar os dados.

### Importante

A implementação deve permitir definir explicitamente os detalhes do calendário do ciclo, como dia de início/fim e regras de fechamento. Não inventar esses detalhes silenciosamente caso ainda não estejam definidos pelo negócio.

---

## 3. Compras

Existe uma compra recorrente de insumos para a operação semanal.

Entre os itens comprados estão:

- carnes;
- galeto;
- arroz;
- feijão;
- verduras;
- farinha;
- embalagens;
- gás;
- outros insumos e materiais.

As compras podem ocorrer antes da operação de sexta/sábado/domingo e devem poder ser relacionadas ao ciclo correspondente.

---

## 4. Compras de carnes a crédito

Um caso importante é a compra de carnes com fornecedor a crédito.

Fluxo:

```text
Compra realizada
      ↓
Obrigação financeira
      ↓
Boleto / vencimento
      ↓
Pagamento
```

O pagamento do boleto semanal é relevante para a operação, pois pode ser necessário para liberar uma nova compra.

O sistema precisa diferenciar:

**compra realizada**

de

**pagamento da compra**.

Uma compra a prazo pode gerar uma obrigação antes de o dinheiro sair da conta.

---

## 5. Vendas

As vendas ocorrem principalmente durante a operação do fim de semana.

Podem envolver:

- galeto;
- carnes;
- quentinhas/marmitas;
- combinações e outros produtos vendidos pela galeteria.

Não criar uma estrutura excessivamente específica para cada produto na primeira versão. A coleta inicial deve ser simples, mas o modelo deve permitir futuramente analisar vendas por produto.

---

## 6. Vendas fiadas

Existem vendas que podem não ser recebidas imediatamente.

Exemplo:

```text
Venda: R$ 500
Recebido hoje: R$ 0
A receber: R$ 500
```

Algumas vendas fiadas podem ser pagas no final do mês.

Portanto:

**data da venda ≠ necessariamente data do recebimento.**

O sistema deve separar:

- receita reconhecida;
- valor recebido;
- valor a receber;
- data do recebimento.

Isso é essencial para não confundir faturamento com fluxo de caixa.

---

## 7. Despesas

As despesas possuem periodicidades diferentes.

### Relacionadas à operação/ciclo

Exemplos:

- carnes;
- alimentos;
- embalagens;
- gás;
- outros insumos.

### Mensais

Exemplos:

- energia;
- água;
- internet;
- impostos;
- outras despesas fixas.

Uma despesa mensal não deve ser artificialmente dividida entre quatro ciclos apenas para encaixá-la no sistema.

A despesa deve continuar representando o evento financeiro real.

---

## 8. Receita, recebimento, despesa e pagamento

Esses conceitos devem permanecer separados.

### Receita

Valor gerado pela venda/operação.

### Recebimento

Dinheiro efetivamente recebido.

### Despesa

Custo/gasto reconhecido ou compromisso assumido.

### Pagamento

Dinheiro efetivamente pago.

Exemplo:

```text
Venda de R$ 1.000
Recebido agora: R$ 500
A receber: R$ 500
```

Resultado da operação e caixa não são automaticamente iguais.

---

## 9. Lucro/resultado não é saldo

O sistema deve separar:

### Resultado

```text
Receitas reconhecidas
-
Despesas reconhecidas
=
Resultado
```

### Fluxo de caixa

```text
Entradas efetivas
-
Saídas efetivas
=
Variação do caixa
```

### Saldo

Quanto existe disponível nas contas financeiras.

Nunca chamar simplesmente o saldo bancário de lucro.

---

## 10. Contas financeiras

As contas representam onde o dinheiro está.

Exemplos atuais:

- Nubank;
- Itaú;
- Caixa.

`Conta Financeira` é o conceito correto porque inclui dinheiro em espécie.

Forma de pagamento e conta financeira são conceitos diferentes.

Exemplo:

```text
Forma de pagamento: Pix
Conta financeira: Nubank
```

ou:

```text
Forma de pagamento: Dinheiro
Conta financeira: Caixa
```

---

## 11. Transferências

Transferência entre contas próprias não é receita nem despesa.

Exemplo:

```text
Nubank → Caixa
R$ 500
```

Resultado:

- Nubank diminui R$ 500;
- Caixa aumenta R$ 500;
- receita não muda;
- despesa não muda;
- lucro/resultado não muda.

---

## 12. Parcelamentos

Não representar parcelamento apenas como texto do tipo `3/10`.

O sistema deve saber:

- operação original;
- quantidade de parcelas;
- valor de cada parcela;
- vencimento;
- status;
- pagamento/recebimento;
- saldo restante.

---

## 13. Contas a pagar

Compras a prazo e outras obrigações devem poder aparecer como valores a pagar.

Exemplo:

```text
Compra: R$ 3.000
Pago: R$ 1.000
A pagar: R$ 2.000
```

O sistema deve permitir acompanhar vencimentos e pagamentos.

---

## 14. Contas a receber

Vendas fiadas e outros valores pendentes devem poder aparecer como contas a receber.

Exemplo:

```text
Venda: R$ 1.500
Recebido: R$ 1.000
A receber: R$ 500
```

O recebimento posterior deve atualizar o valor pendente e o caixa.

---

## 15. Fechamento do ciclo

O conceito de fechamento semanal deve existir na arquitetura.

Um ciclo pode futuramente passar por:

```text
Aberto
  ↓
Em andamento
  ↓
Fechamento
  ↓
Fechado
```

O fechamento deve permitir conferir:

- vendas;
- compras;
- despesas;
- recebimentos;
- pagamentos;
- contas a receber;
- contas a pagar;
- resultado;
- fluxo de caixa.

Fechar um ciclo não significa apagar ou ignorar valores que ainda serão recebidos ou pagos posteriormente.

---

## 16. Estoque e insumos

A primeira versão do estoque tem objetivo principalmente informacional: entender o comportamento real do negócio.

Dados importantes:

- item;
- unidade;
- quantidade comprada;
- custo da compra;
- consumo por venda;
- unidade do consumo;
- rendimento;
- valor de venda;
- fornecedor;
- observações.

Exemplo:

```text
Arroz
Compra: 5 kg
Consumo: 200 g por quentinha
```

A intenção futura é chegar a:

```text
Compra
 ↓
Estoque
 ↓
Consumo
 ↓
Custo do produto
 ↓
Margem
```

---

## 17. Custos e margem

A arquitetura deve permitir futuramente calcular:

```text
Preço de venda
-
Custo dos insumos consumidos
=
Margem bruta
```

E posteriormente:

```text
Receita
-
Custos dos produtos
-
Despesas operacionais
=
Resultado
```

Não chamar uma margem parcial de lucro líquido.

---

## 18. Dashboard

O dashboard deve ser consequência dos dados registrados.

Indicadores possíveis:

- receita;
- despesas;
- resultado;
- entradas;
- saídas;
- saldo;
- contas a receber;
- contas a pagar;
- faturamento por ciclo;
- despesas por ciclo;
- resultado por ciclo;
- evolução mensal;
- despesas por categoria;
- receitas por categoria;
- formas de pagamento;
- custos de insumos.

Cada métrica deve possuir uma definição clara de quais registros considera.

---

## 19. Perguntas que o sistema deve conseguir responder

### Por ciclo

- Quanto vendemos?
- Quanto gastamos?
- Quanto recebemos?
- Quanto pagamos?
- Quanto ficou para receber?
- Quanto ficou para pagar?
- Qual foi o resultado?

### Por mês

- Qual foi o faturamento?
- Qual foi o total de despesas?
- Qual foi o resultado?
- Quanto entrou?
- Quanto saiu?

### Operacional

- Quanto compramos de carnes?
- Quanto gastamos com insumos?
- Quanto gastamos com embalagens?
- Quanto gastamos com gás?
- Quanto devemos aos fornecedores?
- Quanto temos a receber de vendas fiadas?

### Caixa

- Quanto há no Nubank?
- Quanto há no Itaú?
- Quanto há no Caixa?
- Quanto entra nos próximos dias?
- Quanto precisa ser pago?

---

## 20. Fonte de verdade

O sistema deve ser construído para produzir dados reais.

Não criar dezenas de métricas que dependam de informações que o negócio não consegue registrar corretamente.

É preferível:

```text
10 indicadores confiáveis
```

a:

```text
40 indicadores bonitos com dados incompletos.
```

O objetivo do MVP em Google Sheets foi justamente testar a operação e descobrir os dados necessários. O sistema web deve aproveitar esse aprendizado.

---

## 21. Regra de UX

O usuário não deve precisar entender contabilidade.

Para uma operação comum, o sistema deve perguntar coisas naturais:

```text
O que aconteceu?
→ Venda

Quanto?
→ R$ 250

Como recebeu?
→ Pix

Onde entrou?
→ Nubank

Já recebeu?
→ Sim
```

O sistema transforma essas respostas em dados estruturados.

---

## 22. Fluxo geral do negócio

```text
              CICLO SEMANAL
                    │
          ┌─────────┴─────────┐
          ↓                   ↓
       COMPRAS              VENDAS
          │                   │
          ↓                   ↓
       ESTOQUE             RECEITA
          │             ┌─────┴─────┐
          ↓             ↓           ↓
       CONSUMO       RECEBIDO    A RECEBER
          │
          ↓
       CUSTOS
          │
          └──────────┬─────────────┐
                     ↓             ↓
                PAGAMENTOS      PENDÊNCIAS
                     │
                     └──────┬──────┘
                            ↓
                    RESULTADO / CAIXA
```

---

## 23. O que o Claude deve preservar

1. O negócio trabalha com **ciclo semanal**.
2. O ciclo é uma unidade de análise operacional.
3. A operação é concentrada principalmente em sexta, sábado e domingo, com possibilidade de feriados.
4. Compras e preparação fazem parte da dinâmica do ciclo.
5. Carnes podem ser compradas a crédito.
6. Existe pagamento semanal de boleto ao fornecedor de carnes, importante para continuidade das compras.
7. Existem vendas fiadas.
8. Vendas fiadas podem ser recebidas posteriormente, inclusive no final do mês.
9. Existem despesas semanais e despesas mensais.
10. Energia e outras contas podem ser mensais.
11. Ciclo não é conta financeira.
12. Ciclo não substitui a data.
13. Não criar uma tabela/aba independente para cada semana ou mês.
14. Manter as movimentações centralizadas.
15. Permitir análise por ciclo, período e mês.
16. Separar receita de recebimento.
17. Separar despesa de pagamento.
18. Separar resultado de fluxo de caixa.
19. Transferências próprias não são receita nem despesa.
20. Parcelamentos devem ser representados por parcelas reais.
21. Compras a prazo devem poder gerar contas a pagar.
22. Vendas fiadas devem poder gerar contas a receber.
23. O dashboard deve usar dados transacionais reais.
24. O sistema deve evoluir para custos, rendimento e margem.
25. Não adicionar complexidade que o negócio não consiga alimentar corretamente.

---

## 24. Diretriz final para desenvolvimento

Antes de implementar uma funcionalidade, avaliar:

> **Isso representa como a galeteria realmente trabalha?**

O objetivo não é apenas registrar dinheiro.

O objetivo é construir uma fonte confiável de dados da operação:

```text
Operação real
     ↓
Registro simples
     ↓
Dados estruturados
     ↓
Regras de negócio
     ↓
Indicadores
     ↓
Análise
```

O sistema deve permitir entender o negócio semana a semana, mês a mês e ao longo do tempo, sem sacrificar a simplicidade de uso.
