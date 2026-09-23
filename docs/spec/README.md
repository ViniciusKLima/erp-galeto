# Spec e status do sistema — ERP Galeto

Este diretório documenta o que já foi implementado e o que falta, complementando as skills de negócio e técnicas em `.claude/`. É o material de revisão para o dono do negócio: o que existe, como funciona, e quais decisões ainda precisam da palavra dele.

## Como ler

1. `schema.md` — o modelo de dados real no Supabase (tabelas, views, funções), com o "porquê" de cada escolha.
2. `modulo-movimentacoes.md` — visão do módulo mais completo (Movimentações), útil como referência de padrão de código para os próximos módulos.
3. `roadmap.md` — status módulo por módulo: o que já está pronto (a maior parte) e o que ainda é polimento pendente.
4. `decisoes-abertas.md` — pontos em que uma regra de negócio real precisa ser confirmada por quem conhece a operação da galeteria antes de eu (ou qualquer implementação futura) travar o comportamento no código. Nenhum desses pontos foi decidido "no escuro" — cada um tem a leitura mais razoável já aplicada como padrão, mas está sinalizado para revisão, conforme o princípio de `prompt-mestre-claude.md`: "não inventar uma regra financeira crítica". Inclui também decisões operacionais fora do código, como o comportamento do plano free do Supabase (item 11).

## Estado atual em uma frase

Banco de dados completo para todo o escopo de `contexto-projeto.md` (financeiro, ciclo semanal, estoque informacional, dívidas) está no ar no Supabase, com RLS e regras críticas aplicadas; o Angular tem todos os módulos do escopo inicial funcionando ponta a ponta e com a identidade visual "Galeto do Fofão" aplicada em tudo (ver `.claude/reestrutura-visual.md`), incluindo autenticação, dashboard, movimentações (com transferências), o hub "Dívidas" (contas a pagar/receber/credores unificados em abas), configurações (com gestão de usuários), estoque e relatórios — publicado em `https://galetodofofao.vercel.app` via deploy automático (push no GitHub → build no Vercel). Ver `roadmap.md` para o detalhe do que é refino pendente em cada módulo.
