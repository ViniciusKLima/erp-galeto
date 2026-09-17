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

## 8. Deploy manual no Vercel não é confiável para este projeto — preciso que você conecte o GitHub

Duas coisas travando o deploy, uma técnica e uma de permissão:

**a) Proteção do Vercel.** O projeto nasceu com "Vercel Authentication" ativada (padrão em projetos novos) — qualquer visita redireciona para login do Vercel antes de chegar no app. A conexão que uso para sua conta Vercel não tem permissão para ler/alterar essa configuração (erro 403 pedindo reautenticação de escopo), não consigo desligar isso sozinho.

**b) O upload manual de arquivos (`deploy_to_vercel`) não é confiável para um projeto deste tamanho.** Tentei consolidar os ~41 arquivos do projeto numa única chamada de deploy repetidas vezes (9 tentativas) e, mesmo tentando deliberadamente incluir tudo, cada chamada acabou levando só um subconjunto dos arquivos — sem nenhum erro ou aviso de que faltava algo. Reportei isso como um problema da ferramenta. Na prática, isso significa que os deploys de produção feitos nesta sessão provavelmente estão com módulos faltando (o app pode não abrir, ou abrir só parcialmente) — **mesmo depois de destravar a proteção do item (a), o site publicado agora não deve ser considerado confiável.**

**Ação necessária de você (única forma robusta de resolver isso):**
1. Criar um repositório vazio no GitHub (github.com → New repository), sem inicializar com README.
2. Me passar a URL do repositório (ou rodar você mesmo: `git remote add origin <url> && git push -u origin main` dentro de `D:\ERP-Galeto`, que já é um repositório git local com todo o histórico de commits).
3. Depois disso eu conecto esse repositório ao projeto Vercel (`create_git_project`) — daí o Vercel builda direto do código-fonte completo a cada push, sem o problema de upload manual.
4. Desativar a proteção do Vercel conforme o item (a) acima.

Até isso acontecer, o código-fonte correto e completo está garantido no histórico do git local (`git log`) — já validei repetidamente com `ng build` local, sempre sem erros.
