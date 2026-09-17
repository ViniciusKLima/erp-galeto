# Spec e status do sistema — ERP Galeto

Este diretório documenta o que já foi implementado e o que falta, complementando as skills de negócio e técnicas em `.claude/`. É o material de revisão para o dono do negócio: o que existe, como funciona, e quais decisões ainda precisam da palavra dele.

## Como ler

1. `schema.md` — o modelo de dados real no Supabase (tabelas, views, funções), com o "porquê" de cada escolha.
2. `modulo-movimentacoes.md` — o único módulo com fluxo completo (criar, listar, liquidar) implementado no Angular. Serve de referência de padrão para os próximos módulos.
3. `roadmap.md` — o que ainda não foi construído, módulo por módulo, na ordem recomendada.
4. `decisoes-abertas.md` — pontos em que uma regra de negócio real precisa ser confirmada por quem conhece a operação da galeteria antes de eu (ou qualquer implementação futura) travar o comportamento no código. Nenhum desses pontos foi decidido "no escuro" — cada um tem a leitura mais razoável já aplicada como padrão, mas está sinalizado para revisão, conforme o princípio de `prompt-mestre-claude.md`: "não inventar uma regra financeira crítica".

## Estado atual em uma frase

Banco de dados completo para todo o escopo de `contexto-projeto.md` (financeiro, ciclo semanal, estoque informacional, dívidas) já está no ar no Supabase, com RLS e regras críticas aplicadas; o Angular tem autenticação, dashboard e o módulo de Movimentações funcionando ponta a ponta; os demais módulos (Configurações, Estoque, Dívidas, Relatórios, Contas a Pagar/Receber como telas dedicadas) ainda são só placeholders ou não têm tela.
