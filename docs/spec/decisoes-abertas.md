# Decisões que tomei sozinho — para você revisar

`prompt-mestre-claude.md` é claro: "não implementar uma regra financeira por suposição" e "sinalizar a decisão necessária". Construí tudo com a leitura mais razoável de cada documento, mas alguns pontos são genuinamente decisões de negócio, não técnicas. Listo aqui em vez de esconder atrás do código.

## 1. Calendário do ciclo semanal — deixei manual de propósito

`contexto-negocio-galeteria-claude.md` pede explicitamente para não inventar regras de calendário (dia de início, feriados, fechamento automático). Implementei `cycles` como uma tabela que alguém preenche manualmente (data de início, data de fim, rótulo) em vez de gerar automaticamente "toda sexta-feira vira um ciclo novo".

**Preciso saber de você**: o ciclo sempre começa sexta e termina domingo? Feriados criam um ciclo à parte ou são absorvidos no ciclo da semana? Isso pode virar uma função automática depois, mas só depois de confirmado.

## 2. Mapeamento categoria → subcategoria do seed inicial

`contexto-projeto.md` lista categorias e subcategorias como duas listas separadas, sem dizer qual subcategoria pertence a qual categoria. Eu decidi um mapeamento razoável (ex.: "Quentinhas", "Encomendas", "Feira" → Vendas; "Água", "Energia", "Internet" → Despesas Fixas; "Carvão", "Natto", "Temperos", "Gás" → Insumos). Está tudo já cadastrado no banco.

**Preciso saber de você**: esse mapeamento bate com a operação real? Fica fácil ajustar depois (é só editar `transaction_subcategories.category_id`), mas prefiro que você confirme antes de a equipe começar a usar.

## 3. Liquidação parcial: exige valor exato, não permite "pagar a mais"

Quando alguém registra um recebimento/pagamento, o valor não pode passar do saldo pendente (`registrar_liquidacao` rejeita). Não modelei troco, desconto na quitação, nem "recebi um pouco a mais por engano". Se isso acontecer na prática, hoje a única saída é lançar como duas operações separadas (a movimentação original + uma "Outros Recebimentos" à parte).

**Preciso saber de você**: isso é raro o suficiente para não valer a complexidade agora, ou já sabe de um caso real que quebra essa regra?

## 4. Cancelamento de algo já parcialmente pago é só admin

Um operador só cancela uma movimentação que ele mesmo criou, que ainda está pendente e sem nenhum centavo recebido/pago. Qualquer cancelamento que precise "dar baixa" num saldo remanescente (ex.: cliente nunca vai pagar o resto de uma venda fiada) exige admin.

**Preciso saber de você**: essa divisão de poder está certa para o dia a dia da galeteria, ou o operador que atende o cliente deveria poder fazer isso sozinho?

## 5. Estoque e Dívidas: operador pode criar e editar, só não apagar

`autenticacao-e-permissoes.md` só define claramente o que admin e operador podem em "movimentações" e "configurações". Estoque e dívidas não são nem uma coisa nem outra — tratei como algo que o operador pode alimentar no dia a dia (parecido com movimentações), mas só admin apaga.

**Preciso saber de você**: faz sentido, ou estoque/dívidas deveriam ser mais restritos (só admin) ou mais abertos?

## 6. Primeiro usuário admin ainda não existe

Todo usuário novo nasce como `operador` (trigger `handle_new_user`). Não criei nenhuma conta ainda porque isso exigiria eu inventar uma senha em seu nome — não é algo que eu deva decidir sozinho.

**Ação necessária de você**: crie sua conta pela tela de login do sistema (ela vai falhar até você existir — use o Supabase Dashboard → Authentication → Users → "Add user" com seu e-mail e uma senha, por enquanto, já que ainda não construí uma tela de "esqueci minha senha"/onboarding). Depois disso, é só rodar uma linha de SQL (`update profiles set role = 'admin' where id = '<seu-user-id>'`) — posso fazer essa parte assim que você tiver a conta criada e me passar o e-mail.

## 7. Pagamento de dívida não mexe no saldo da conta automaticamente

O módulo Dívidas e Credores é uma trilha separada, informacional (como já era no `banco-de-dados.md`: "não duplicar uma obrigação financeira em módulos independentes"). Quando você marca uma parcela de dívida como paga, isso só atualiza o status da dívida — **não** debita a conta financeira nem aparece no fluxo de caixa/saldo do dashboard. Se o pagamento realmente saiu do caixa, é preciso lançar também como uma despesa normal em Movimentações.

**Preciso saber de você**: isso é aceitável (dívida = controle à parte, sem duplicar o lançamento financeiro), ou você esperava que pagar uma dívida já debitasse a conta automaticamente? Se for o segundo caso, dá pra unificar — mas aí some a separação que `banco-de-dados.md` pede entre os dois módulos.

## 8. Redesign visual (`.claude/reestrutura-visual.md`): duas simplificações conscientes

Segui o documento de redesign quase à risca, mas duas peças do seu mock não bateram 1:1 com o modelo de dados real, e tomei uma decisão em cada uma:

**Filtro "Conta" no Dashboard**: no schema atual, uma movimentação (receita/despesa) não pertence a uma conta financeira até ser liquidada — quem carrega `financial_account_id` é o evento de liquidação, não a movimentação. Então o filtro "Conta" no Dashboard só afeta os cartões de **Saldo disponível** e **Fluxo de caixa** (que são baseados em liquidações reais); não filtra Receita/Despesas/Resultado (que são por competência, sem conta associada). Isso é consistente com o modelo, mas pode não ser o que você esperava visualmente ao selecionar uma conta.

**Transferências no modal "Nova movimentação"**: implementei a criação de transferência dentro do modal unificado, como pedido. Mas transferências não aparecem na tabela principal de Movimentações (que é só receita/despesa) — coloquei uma mini-lista "Últimas transferências entre contas" abaixo da tabela. Se você preferir transferências misturadas na mesma tabela cronológica, é uma mudança de estrutura de dados (unificar os dois conceitos), não só visual — avise se quiser isso.

## 9. Configurações: os formulários "Adicionar" ainda são inline, não modais

A regra global do redesign ("todo botão Adicionar/Novo abre modal") foi aplicada em Movimentações, Dívidas e Estoque. Em Configurações, os 5 formulários (categorias, subcategorias, contas, formas de pagamento, ciclos) continuam como painéis expansíveis inline — não converti para modal ainda porque essa era a etapa de menor prioridade no seu próprio documento (etapa 7 de 7) e o tempo da sessão acabou. Funcionalmente está tudo certo, é só uma inconsistência visual menor que fica de próximo passo.

## 10. Deploy — resolvido: GitHub conectado ao Vercel

**Status:** resolvido. O deploy manual de arquivo por arquivo (`deploy_to_vercel`) não era confiável para um projeto deste tamanho — tentei consolidar os ~41 arquivos numa única chamada repetidas vezes e cada tentativa acabava levando só um subconjunto, sem aviso de erro (reportei isso como problema da ferramenta). A solução foi conectar o repositório GitHub (`ViniciusKLima/erp-galeto`) diretamente ao projeto Vercel — agora cada `git push` faz o Vercel buildar do código-fonte completo, sem o problema de upload parcial. Confirmado funcionando: `https://galetodofofao.vercel.app` responde com o app completo, refletindo o último commit.
