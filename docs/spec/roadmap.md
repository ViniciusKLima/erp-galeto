# Roadmap — status dos módulos

Todos os módulos do escopo inicial (`contexto-projeto.md`) têm uma versão funcional implementada. O que resta agora é refino, não construção do zero.

## ✅ Autenticação
Login/logout via Supabase Auth, guard de rota, guard de admin.

## ✅ Dashboard
Cards do mês (receita, despesa, resultado, a pagar, a receber), saldo por conta, e cards do **ciclo semanal atual** (vendas, despesas, resultado do ciclo aberto/em andamento mais recente).

## ✅ Movimentações
Criar (simples ou parcelada), listar com filtros (tipo, status, período), editar (simples e pendente), cancelar (com motivo, preserva histórico), liquidar total ou parcial — inclusive parcela por parcela numa movimentação parcelada.

Pendências menores, não bloqueantes:
- Paginação da tabela — hoje carrega tudo de uma vez; ok para o volume atual de uma galeteria, mas vai precisar de paginação/lazy loading se o histórico crescer muito (muitos meses de operação).

## ✅ Contas a Pagar / Contas a Receber
Telas dedicadas, listam simples + parcelas com saldo pendente, ação de liquidar direto na linha.

## ✅ Configurações
Categorias, subcategorias, contas financeiras, formas de pagamento e ciclos — criar, editar e ativar/desativar (inclusive saldo inicial de conta editável depois de criada).

Pendência menor:
- Gestão de usuários (ativar/desativar, promover a admin) continua só via SQL direto no Supabase — é a única parte do sistema que ainda não tem tela.

## ✅ Estoque e Insumos
Cadastro informacional (compra, consumo, rendimento, fornecedor, valor de venda), ativar/desativar item.

## ✅ Dívidas e Credores
Registro de dívida parcelada (função atômica no banco, mesmo padrão de movimentações), pagamento por parcela, dívida marcada como quitada automaticamente quando todas as parcelas são pagas.

## ✅ Relatórios
Período configurável, agrupamento por categoria, forma de pagamento e ciclo — base de competência (`transaction_date`, exclui cancelado), consistente com `v_resultado_periodo`.

## Fora de escopo por enquanto (documentado, não esquecido)
- Custo/margem por produto (depende de estoque real com baixa automática, não só informacional) — `regras-financeiras.md` §20.
- Multi-empresa/múltiplas unidades — nada no schema impede evoluir para isso, mas não foi modelado.
- Exportação de relatórios (CSV/PDF) — próximo passo natural do módulo de Relatórios quando fizer sentido.
- Onboarding de novos usuários pela própria aplicação (hoje é 100% manual via Supabase Dashboard).
