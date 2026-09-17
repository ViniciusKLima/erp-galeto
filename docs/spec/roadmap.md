# Roadmap — status dos módulos

Todos os módulos do escopo inicial (`contexto-projeto.md`) têm uma versão funcional implementada, incluindo gestão de usuários pela própria interface. O sistema também passou por um redesign visual completo (identidade "Galeto do Fofão", ver `.claude/reestrutura-visual.md`). O que resta é polimento — nada bloqueante para uso real.

## ✅ Identidade visual
Design system aplicado (cores da marca, tipografia, sidebar redesenhada, componentes compartilhados: page-header, status-badge, empty-state, period-filter, gráficos simples). Dashboard e Movimentações — as duas telas prioritárias do redesign — foram completamente reconstruídas. Dívidas, Estoque e Relatórios receberam a mesma identidade com modais para cadastro. Configurações recebeu o cabeçalho padrão, mas os formulários internos ainda são inline (ver `decisoes-abertas.md` item 9).

## ✅ Autenticação
Login/logout via Supabase Auth, guard de rota, guard de admin. Tela de login com a identidade visual da marca.

## ✅ Dashboard
Filtros (período com presets/personalizado, ciclo, conta, categoria em "filtros avançados"). Cards de Receita, Despesas, Resultado, Saldo disponível, Entradas/Saídas efetivas e A pagar/A receber. Gráfico Receita x Despesa por período, despesas/receitas por categoria, resultado por ciclo (comparativo dos últimos ciclos), movimentações recentes.

## ✅ Movimentações
Criar (receita, despesa ou **transferência** — os três num único modal), listar com busca por descrição + filtros completos (tipo, categoria, status, ciclo, forma de pagamento, período), editar (simples e pendente), cancelar (com motivo, preserva histórico), liquidar total ou parcial (inclusive parcela por parcela), drawer de detalhes, menu de ações por linha.

Pendências menores, não bloqueantes:
- Paginação da tabela — hoje carrega tudo de uma vez; ok para o volume atual de uma galeteria, mas vai precisar de paginação/lazy loading se o histórico crescer muito.
- Transferências não aparecem na tabela principal (só numa mini-lista à parte) — ver `decisoes-abertas.md` item 8.

## ✅ Dívidas (hub único: Contas a Pagar / Contas a Receber / Credores)
As três antigas telas separadas viraram abas de um único item de menu "Dívidas", conforme pedido no redesign. "Nova dívida" (credores) é um modal.

## ✅ Configurações
Categorias, subcategorias, contas financeiras, formas de pagamento e ciclos — criar, editar e ativar/desativar (inclusive saldo inicial de conta editável depois de criada).

Inclui aba **Usuários** (admin): ativar/desativar e promover/rebaixar entre operador e admin — a própria conta logada fica travada nessa tela para evitar autobloqueio acidental.

## ✅ Estoque e Insumos
Cadastro informacional (compra, consumo, rendimento, fornecedor, valor de venda) via modal, ativar/desativar item.

## ✅ Relatórios
Período configurável (mesmo componente do Dashboard), agrupamento por categoria, forma de pagamento e ciclo — base de competência (`transaction_date`, exclui cancelado), consistente com `v_resultado_periodo`.

## Fora de escopo por enquanto (documentado, não esquecido)
- Custo/margem por produto (depende de estoque real com baixa automática, não só informacional) — `regras-financeiras.md` §20.
- Multi-empresa/múltiplas unidades — nada no schema impede evoluir para isso, mas não foi modelado.
- Exportação de relatórios (CSV/PDF) — próximo passo natural do módulo de Relatórios quando fizer sentido.
- Onboarding de novos usuários pela própria aplicação (hoje é 100% manual via Supabase Dashboard).
- Formulários de Configurações em modal (hoje inline) — ver `decisoes-abertas.md` item 9.
