# Skill — Arquitetura

## Objetivo

Construir uma aplicação full-stack tradicional, com liberdade para modelar corretamente o domínio.

## Direção arquitetural

Frontend:
- aplicação web moderna;
- componentes reutilizáveis;
- comunicação via API.

Backend:
- API;
- autenticação;
- regras de negócio;
- validação;
- acesso ao banco.

Banco:
- relacional;
- integridade referencial;
- consultas para relatórios.

## Princípio

O domínio financeiro deve ficar no backend.

O frontend apresenta e coleta informações, mas não é a autoridade sobre:
- saldo;
- resultado;
- parcelas;
- permissões;
- regras financeiras.

## Evolução

Arquitetura inicial deve ser simples, mas permitir:
- múltiplos usuários;
- relatórios;
- estoque real;
- custos;
- integrações;
- notificações.
