# Sistema de Gestão Financeira — Galeteria

Este pacote contém o contexto e as skills de negócio e desenvolvimento para orientar a construção do sistema web full-stack.

## Objetivo

Construir um sistema simples, confiável e extensível para gestão financeira e operacional de uma galeteria, substituindo gradualmente o MVP feito em Google Sheets.

A prioridade é que os dados registrados representem corretamente a operação real do negócio e permitam gerar métricas confiáveis para tomada de decisão.

## Princípios

1. A regra de negócio vem antes da implementação.
2. O sistema deve se adaptar ao negócio, e não reproduzir limitações do Google Sheets.
3. O usuário não deve precisar conhecer contabilidade para registrar uma operação.
4. Dashboard é consequência dos dados; não deve haver números calculados manualmente.
5. Receita, despesa, fluxo de caixa, saldo, contas a pagar e contas a receber são conceitos diferentes.
6. Toda alteração financeira deve preservar a consistência dos indicadores.
7. O sistema deve começar simples, mas ter arquitetura preparada para evolução.

## Ordem recomendada

1. `contexto-projeto.md`
2. `regras-financeiras.md`
3. `fluxos-do-sistema.md`
4. `banco-de-dados.md`
5. `autenticacao-e-permissoes.md`
6. Skills específicas de cada módulo
7. `dashboard-e-metricas.md`
8. `ux-ui.md`
9. `padroes-de-desenvolvimento.md`
10. `stack-tecnologico.md`
11. `supabase-e-seguranca.md`
12. `angular-padroes.md`
13. `deploy-e-hospedagem.md`

## Stack técnica

A stack (Angular + TypeScript no frontend, Supabase como backend, Vercel para hospedagem) está decidida e documentada em `stack-tecnologico.md`, `supabase-e-seguranca.md`, `angular-padroes.md` e `deploy-e-hospedagem.md`. Essas skills implementam, na prática, os princípios de `arquitetura.md` e `padroes-de-desenvolvimento.md` — não os substituem.

## Regra para o agente de desenvolvimento

Não implementar uma regra financeira por suposição. Quando houver conflito entre uma tela e as regras de negócio, preservar a regra de negócio e sinalizar a inconsistência.
