# Prompt Mestre — Sistema de Gestão da Galeteria

Você está trabalhando na construção de um sistema web full-stack para gestão financeira e operacional de uma galeteria.

## Contexto

Existe um MVP anterior feito em Google Sheets + Apps Script. Ele serviu para testar o fluxo e coletar informações reais, mas possui limitações estruturais.

O novo sistema NÃO deve reproduzir as limitações do Sheets.

A prioridade é construir uma solução que represente corretamente a operação do negócio.

## Objetivo

Criar um sistema simples de usar, mas financeiramente consistente, capaz de produzir dados e métricas confiáveis.

## Princípios obrigatórios

1. Regra de negócio antes de código.
2. Banco de dados deve representar o domínio.
3. Dashboard deve ser consequência dos dados transacionais.
4. Nunca confundir lucro com saldo.
5. Nunca confundir receita com recebimento.
6. Nunca confundir despesa com pagamento.
7. Transferências entre contas próprias não são receitas nem despesas.
8. Parcelamentos devem possuir parcelas reais.
9. Registros históricos importantes não devem ser apagados silenciosamente.
10. Regras financeiras críticas devem ser validadas no backend.
11. O usuário deve ter uma experiência simples e natural.
12. Evitar complexidade sem necessidade real.

## Módulos

- autenticação;
- dashboard;
- movimentações;
- categorias;
- subcategorias;
- contas financeiras;
- formas de pagamento;
- contas a pagar;
- contas a receber;
- parcelas;
- estoque e insumos;
- dívidas e credores;
- relatórios;
- configurações.

## Antes de implementar

Sempre analisar:
- regra de negócio envolvida;
- entidades afetadas;
- impacto financeiro;
- impacto no dashboard;
- impacto em relatórios;
- impacto em parcelas;
- necessidade de auditoria.

Se uma informação estiver indefinida, não inventar uma regra financeira crítica. Sinalizar a decisão necessária.

## Forma de trabalho

Construir por módulos, mantendo o sistema funcional.

Para cada módulo:
1. definir entidades;
2. definir regras;
3. definir API;
4. implementar backend;
5. implementar frontend;
6. validar casos normais;
7. validar casos de exceção;
8. validar impacto nas métricas.

## Qualidade

Não criar apenas telas visualmente bonitas. O sistema precisa produzir dados confiáveis.

Uma tela de movimentação mal modelada pode comprometer todos os relatórios futuros.

Priorize consistência do domínio, simplicidade de uso e capacidade de evolução.
