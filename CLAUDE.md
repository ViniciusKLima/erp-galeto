# ERP Galeto

Sistema web de gestão financeira e operacional de uma galeteria. Angular + TypeScript no frontend, Supabase (Postgres + Auth + RLS + funções) como backend único, Vercel para hospedagem — tudo em planos gratuitos.

## Leia primeiro

1. `.claude/README.md` — índice de todas as skills de negócio e técnicas, na ordem recomendada de leitura.
2. `.claude/contexto-negocio-galeteria-claude.md` — como a galeteria realmente opera (ciclo semanal, vendas fiadas, compras a crédito). É a skill mais importante: todo o sistema se baseia nela.
3. `.claude/regras-financeiras.md` — vocabulário e regras financeiras que nenhuma tela ou query pode violar.
4. `docs/spec/README.md` — o que já está implementado, onde, e o que falta (roadmap por módulo).
5. `docs/spec/decisoes-abertas.md` — decisões de negócio que foram tomadas por mim sem confirmação do dono da galeteria; revisar antes de travar comportamento em cima delas.

## Projeto Supabase

Project ref `ydhgtextuntiiqbhxutv`, região `sa-east-1`. Schema documentado em `docs/spec/schema.md`.

## Regra de trabalho

Antes de implementar uma regra financeira nova, ler `.claude/regras-financeiras.md` e `.claude/contexto-negocio-galeteria-claude.md`. Se uma regra de negócio estiver indefinida, não inventar — adicionar a dúvida em `docs/spec/decisoes-abertas.md` em vez de decidir silenciosamente.
