# Skill — Dívidas e Credores

## Objetivo

Controlar obrigações financeiras do negócio.

## Dados

- credor;
- descrição;
- valor total;
- quantidade de parcelas;
- parcelas pagas;
- parcelas restantes;
- valor da parcela;
- próximo vencimento;
- status;
- observações.

## Evolução

Uma dívida deve poder gerar parcelas reais e pagamentos registrados.

## Regra

Não manter uma dívida apenas como número estático se ela já possui pagamentos.

O saldo restante deve ser calculável a partir das parcelas e pagamentos.

## Status

Exemplos:
- Pendente
- Em andamento
- Quitada
- Vencida
- Cancelada

A lista final deve ser definida de acordo com o fluxo real.
