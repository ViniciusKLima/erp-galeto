# Skill — Padrões de Desenvolvimento

## Arquitetura

Separar responsabilidades:

Frontend
→ API
→ regras de domínio
→ persistência.

Evitar colocar regras financeiras críticas somente no frontend.

## Backend

O backend deve validar:
- autenticação;
- autorização;
- valores;
- relacionamentos;
- regras financeiras;
- transações.

## Banco

Alterações que envolvam múltiplos registros relacionados devem utilizar transações de banco quando necessário.

## Frontend

Componentes devem ser reutilizáveis.

Separar:
- apresentação;
- serviços;
- modelos;
- estado;
- validação de interface.

## API

Utilizar respostas consistentes.

Erros devem ser claros para o frontend.

## Código

- nomes claros;
- funções pequenas;
- evitar duplicação;
- tipagem;
- tratamento de erros;
- logs apropriados;
- documentação das decisões não óbvias.

## Git

Commits pequenos e objetivos.

Exemplos:
- feat: adiciona cadastro de movimentações
- fix: corrige cálculo do saldo
- refactor: separa serviço financeiro

## Regra de implementação

Antes de criar uma solução complexa, verificar se existe uma regra de negócio mais simples que resolve o problema.

Antes de alterar uma regra existente, verificar impactos em:
- dashboard;
- relatórios;
- parcelas;
- saldo;
- contas a pagar/receber.
