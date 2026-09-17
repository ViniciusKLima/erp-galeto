
Quero que você faça um **redesign completo da interface do sistema ERP da galeteria que estamos desenvolvendo**.

O sistema atualmente está visualmente muito genérico. Quero que você mude a experiência visual e de UX para algo que realmente pareça um **ERP profissional, moderno, refinado e pronto para ser utilizado por uma empresa real**.

IMPORTANTE: não quero apenas trocar cores ou arredondar cards. Quero que você **repense a estrutura visual, hierarquia, navegação, componentes, espaçamentos, filtros, tabelas, modais, dashboard e experiência de uso**.

A aplicação deve transmitir:

**organização + confiança + modernidade + clareza + controle.**

---

# 1. IDENTIDADE VISUAL

A identidade principal do sistema será:

### Cor primária

`#59B1DE`

Essa será a cor principal da identidade visual.

Pode ser utilizada em:

* sidebar;
* item ativo da navegação;
* botões principais;
* elementos de destaque;
* links;
* indicadores selecionados;
* pequenos detalhes de gráficos;
* estados interativos.

Não quero que tudo fique azul. A cor deve ser utilizada com equilíbrio.

### Background principal

`#FFF7EA`

Essa será a cor de fundo geral da aplicação.

Quero que exista uma diferença visual clara entre:

* background geral: `#FFF7EA`
* superfícies/cards/modais/tabelas: `#FFFFFF`
* identidade/destaques: `#59B1DE`

Isso deve criar uma identidade visual própria e mais acolhedora do que o padrão branco/cinza de ERPs genéricos.

### Cores semânticas

Utilize cores auxiliares de maneira consistente:

* verde → receitas, recebimentos, resultados positivos;
* vermelho → despesas, pagamentos, valores negativos, atrasos;
* amarelo/âmbar → pendências e alertas;
* cinza → informações neutras.

As cores devem possuir significado funcional.

---

# 2. NÃO QUERO UM ADMIN TEMPLATE GENÉRICO

Evite completamente uma aparência do tipo:

```text
Sidebar
Navbar
Título da página
Cards genéricos
Tabela genérica
Botão azul
```

repetida em todas as páginas.

Quero que o sistema pareça um produto desenvolvido especificamente para gestão de uma empresa.

Pode utilizar boas práticas e padrões conhecidos de ERPs modernos e aplicações SaaS B2B, mas sem simplesmente copiar um template.

---

# 3. ESTRUTURA GLOBAL

Quero uma sidebar lateral fixa no desktop.

Estrutura:

```text
┌─────────────────────────────────────────┐
│ LOGO                                    │
│                                         │
│ Dashboard                               │
│ Movimentações                            │
│ Estoque e Insumos                        │
│ Dívidas                                  │
│ Relatórios                               │
│ Configurações                            │
│                                         │
│                                         │
│                                         │
│                                         │
│─────────────────────────────────────────│
│ usuário@email.com                        │
│ Sair                                    │
└─────────────────────────────────────────┘
```

A logo deve ficar no topo da sidebar.

O email do usuário e o botão "Sair" devem ficar na parte inferior.

---

# 4. NÃO REPETIR CABEÇALHO DA EMPRESA

Isso é importante.

NÃO quero um cabeçalho repetido em cada página contendo:

```text
Nome da empresa                 Sair
```

ou algo parecido.

A logo já estará na sidebar.

O logout também já estará na parte inferior da sidebar.

Cada página deve utilizar o espaço principal para seu próprio conteúdo.

Pode existir:

```text
Dashboard
Visão geral da operação financeira
```

ou:

```text
Movimentações
Registre e acompanhe as movimentações financeiras.
```

Mas não repetir o nome da empresa e o botão de sair em todas as telas.

---

# 5. SIDEBAR

Quero uma sidebar realmente refinada.

Ela deve ter:

* logo;
* navegação;
* ícones;
* estado ativo muito claro;
* hover;
* boa hierarquia;
* espaçamento consistente;
* área inferior para usuário/logout.

O item ativo deve ser visualmente destacado, podendo utilizar:

* background;
* indicador;
* ícone;
* tipografia.

Não quero apenas mudar a cor do texto.

A sidebar deve ser responsiva.

No mobile, pode virar:

* drawer;
* menu lateral;
* ou outra solução moderna.

---

# 6. DESIGN SYSTEM

Antes de sair criando cada tela individualmente, estabeleça uma linguagem visual consistente.

Criar/reutilizar componentes para:

* Button;
* Input;
* Select;
* DatePicker;
* Modal;
* Drawer;
* Card;
* Badge;
* Toast;
* Table;
* Pagination;
* Filters;
* Empty State;
* Skeleton;
* Tabs;
* Dropdown;
* Tooltip;
* gráficos.

Quero que o sistema pareça uma única aplicação.

Não quero que cada tela tenha um estilo diferente.

---

# 7. REGRA GLOBAL PARA BOTÕES DE ADICIONAR

Essa regra deve valer para o sistema inteiro.

Sempre que existir:

* Novo;
* Adicionar;
* Cadastrar;
* Criar;
* Nova movimentação;
* Novo item;
* Novo credor;
* Nova dívida;
* etc.

O comportamento padrão deve ser abrir uma **janela flutuante/modal**.

Não quero obrigatoriamente navegar para outra página para fazer um cadastro simples.

O usuário deve conseguir cadastrar algo sem perder o contexto da tela atual.

---

# 8. MODAIS DE CADASTRO

Os modais precisam ser muito bem desenhados.

Exemplo:

```text
┌─────────────────────────────────────────────┐
│ Nova movimentação                        X  │
│ Preencha os dados abaixo                    │
│                                             │
│ Data                  Ciclo                 │
│ [____________]        [____________]        │
│                                             │
│ Tipo                  Categoria             │
│ [____________]        [____________]        │
│                                             │
│ ...                                         │
│                                             │
│─────────────────────────────────────────────│
│ Cancelar     Salvar e continuar     Salvar │
└─────────────────────────────────────────────┘
```

Para cadastros importantes, quero três ações:

### Cancelar

Fecha sem salvar.

### Salvar e continuar

Salva o registro e mantém o modal aberto para que o usuário possa cadastrar outro imediatamente.

Ideal para movimentações.

### Salvar

Salva e fecha.

Depois de salvar:

* mostrar toast de sucesso;
* atualizar os dados da tela automaticamente;
* não exigir refresh manual.

---

# 9. MODAIS NÃO DEVEM SER BAGUNÇADOS

Se um cadastro tiver muitos campos:

* organize em duas colunas no desktop quando fizer sentido;
* agrupe campos logicamente;
* utilize títulos de seção;
* mantenha espaçamento;
* não deixe campos espremidos.

No mobile:

* uma coluna;
* boa área de toque;
* botões acessíveis.

---

# 10. PRIORIDADE ABSOLUTA: DASHBOARD

Quero que você trate o Dashboard como a **principal tela do sistema**.

Não quero simplesmente:

```text
Receita
Despesa
Lucro
3 gráficos
```

Quero um dashboard de gestão empresarial.

O objetivo é responder:

### "Como está a empresa?"

e:

### "O que os números estão mostrando?"

O dashboard será utilizado para analisar o negócio e tomar decisões para fazê-lo crescer.

Portanto, os indicadores precisam ser **reais, úteis e financeiramente corretos**.

Não crie métricas apenas para preencher espaço.

---

# 11. DASHBOARD — ESTRUTURA

Quero algo próximo desta lógica:

```text
Dashboard

[ Período ▼ ] [ Ciclo ▼ ] [ Conta ▼ ] [ Categoria ▼ ] [ Filtros ]

┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐
│ Receita    │ │ Despesas   │ │ Resultado  │ │ Saldo      │
│ R$         │ │ R$         │ │ R$         │ │ R$         │
└────────────┘ └────────────┘ └────────────┘ └────────────┘

┌──────────────────────────────────────────────────────────┐
│ Receita x Despesas                                       │
│ gráfico                                                  │
└──────────────────────────────────────────────────────────┘

┌─────────────────────────────┐ ┌─────────────────────────┐
│ Resultado por período       │ │ Despesas por categoria  │
└─────────────────────────────┘ └─────────────────────────┘

┌─────────────────────────────┐ ┌─────────────────────────┐
│ Receitas por categoria      │ │ Fluxo de caixa          │
└─────────────────────────────┘ └─────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│ Evolução por ciclo                                       │
└──────────────────────────────────────────────────────────┘

┌─────────────────────────────┐ ┌─────────────────────────┐
│ A receber                   │ │ A pagar                 │
└─────────────────────────────┘ └─────────────────────────┘

Movimentações recentes
```

Isso é uma referência de estrutura, não precisa copiar literalmente.

Quero que você use seu conhecimento de UX/UI para melhorar essa composição.

---

# 12. FILTROS DO DASHBOARD

Filtros são obrigatórios.

O principal é:

## Período

Possibilidades:

* Hoje;
* Esta semana;
* Este mês;
* Últimos 30 dias;
* Últimos 90 dias;
* Este ano;
* Personalizado.

No personalizado:

```text
Data inicial
Data final
```

Também quero poder filtrar por:

* Ciclo;
* Conta financeira;
* Categoria;
* Subcategoria;
* Tipo;
* Status;
* Forma de pagamento.

Mas não quero deixar tudo poluindo a tela.

Use:

```text
[Período] [Ciclo] [Conta] [Filtros avançados]
```

e coloque os filtros menos utilizados dentro de "Filtros avançados".

Quando houver filtros ativos, mostre isso claramente.

Deve existir:

**Limpar filtros**

---

# 13. CARDS PRINCIPAIS

Os principais cards devem ser:

### Receita

Receita reconhecida no período.

### Despesas

Despesas reconhecidas no período.

### Resultado

Receita reconhecida - despesas reconhecidas.

### Saldo disponível

Saldo efetivamente disponível nas contas financeiras.

IMPORTANTE:

**Resultado NÃO é saldo.**

Não apresentar os dois como se fossem a mesma coisa.

---

# 14. OUTROS INDICADORES ÚTEIS

Quero que você analise quais desses realmente fazem sentido e implemente os que forem úteis:

* Entradas;
* Saídas;
* A receber;
* A pagar;
* Receita por ciclo;
* Resultado por ciclo;
* evolução da receita;
* evolução das despesas;
* comparação com período anterior;
* maior categoria de despesa;
* participação das categorias;
* ticket médio, quando houver dados suficientes;
* quantidade de movimentações;
* pendências;
* vencimentos próximos.

Não quero 30 cards.

Quero uma seleção inteligente.

Cada indicador deve responder uma pergunta real do negócio.

---

# 15. GRÁFICO PRINCIPAL

Quero um gráfico principal de:

**Receita x Despesas**

Preferencialmente com evolução temporal.

Pode utilizar:

* linha;
* barras;
* ou combinação adequada.

O usuário deve conseguir analisar:

* dia;
* semana;
* ciclo;
* mês.

Dependendo do período selecionado.

---

# 16. RESULTADO POR CICLO

O negócio trabalha com ciclos semanais.

O ciclo é uma dimensão importante da operação.

Quero uma análise visual que permita comparar:

```text
Ciclo       Receita     Despesa     Resultado
Ciclo 01    R$ 4.200    R$ 2.800    R$ 1.400
Ciclo 02    R$ 4.650    R$ 3.000    R$ 1.650
Ciclo 03    R$ 4.480    R$ 2.950    R$ 1.530
```

A representação final pode ser diferente.

Não criar páginas separadas para cada semana.

O ciclo deve ser tratado como dimensão dos dados.

---

# 17. DESPESAS POR CATEGORIA

Criar visualização para mostrar onde o dinheiro está sendo gasto.

Categorias atuais:

* Vendas;
* Outros Recebimentos;
* Estoque;
* Insumos;
* Despesas Fixas;
* Manutenção;
* Outros.

Não inventar categorias sem necessidade.

Para muitas categorias, prefira barras horizontais.

---

# 18. RECEITAS POR CATEGORIA

Mostrar composição das receitas.

O gráfico deve utilizar os dados reais do sistema.

Não criar visualizações artificiais.

---

# 19. FLUXO DE CAIXA

Quero deixar claro no Dashboard:

* Entradas efetivas;
* Saídas efetivas;
* evolução do saldo.

Não confundir com resultado.

---

# 20. A RECEBER E A PAGAR

No Dashboard, quero indicadores para:

### A receber

Quanto a empresa ainda tem para receber.

### A pagar

Quanto a empresa ainda precisa pagar.

Se houver dados suficientes, mostrar também:

* vencidos;
* vencendo em breve;
* próximos vencimentos.

---

# 21. MOVIMENTAÇÕES RECENTES NO DASHBOARD

Adicionar uma área com as últimas movimentações.

Algo como:

```text
Movimentações recentes

Data       Tipo       Categoria       Valor       Status
17/09      Receita    Vendas          R$ 450      Recebido
16/09      Despesa    Estoque         R$ 320      Pago
15/09      Despesa    Energia         R$ 180      Pendente
```

Mostrar 5–10 registros.

Adicionar:

**Ver todas**

---

# 22. PRINCÍPIO DO DASHBOARD

Cada gráfico ou indicador deve responder a uma pergunta.

Exemplo:

**Quanto vendemos?**
→ Receita

**Quanto gastamos?**
→ Despesas

**Quanto foi efetivamente recebido?**
→ Entradas

**Quanto efetivamente saiu?**
→ Saídas

**Qual foi o resultado?**
→ Resultado

**Quanto temos disponível?**
→ Saldo

**Quanto ainda temos para receber?**
→ A receber

**Quanto precisamos pagar?**
→ A pagar

**Onde gastamos mais?**
→ Despesas por categoria

**Qual ciclo performou melhor em termos de resultado?**
→ Resultado por ciclo

**Estamos evoluindo?**
→ Evolução temporal

---

# 23. ATENÇÃO ÀS REGRAS FINANCEIRAS

Não quero que o redesign visual quebre as regras do sistema.

Lembre que:

**Receita ≠ dinheiro recebido**

**Despesa ≠ dinheiro pago**

**Resultado ≠ saldo disponível**

**Transferência entre contas próprias ≠ receita/despesa**

Exemplo:

```text
Nubank → Caixa
```

Isso apenas movimenta dinheiro entre contas próprias.

Não pode aumentar receita.

Não pode aumentar despesa.

Não pode alterar resultado.

---

# 24. MOVIMENTAÇÕES — SEGUNDA PRIORIDADE

Depois de deixar o Dashboard impecável, quero que você faça o mesmo na tela de Movimentações.

Essa tela precisa ser extremamente eficiente para uso diário.

O usuário deve conseguir:

* buscar;
* filtrar;
* cadastrar;
* visualizar;
* editar;
* cancelar;
* acompanhar status.

---

# 25. CABEÇALHO DE MOVIMENTAÇÕES

Algo semelhante a:

```text
Movimentações

Registre e acompanhe as movimentações financeiras.

                                      + Nova movimentação
```

Não repetir nome da empresa.

---

# 26. BARRA DE FILTROS

Quero:

```text
[ Buscar movimentação... ]

[ Período ▼ ]
[ Tipo ▼ ]
[ Categoria ▼ ]
[ Status ▼ ]
[ Conta ▼ ]

[ Filtros avançados ]
```

A busca deve ser rápida.

Os filtros devem funcionar de verdade.

---

# 27. TABELA DE MOVIMENTAÇÕES

Estrutura sugerida:

| Data | Tipo | Categoria | Subcategoria | Entidade | Valor | Forma | Conta | Status | Ciclo | Ações |
| ---- | ---- | --------- | ------------ | -------- | ----: | ----- | ----- | ------ | ----- | ------- |

Mas use bom senso para não deixar a tabela visualmente pesada.

Dar destaque para:

* data;
* tipo;
* categoria;
* valor;
* status.

Informações secundárias podem ter menor contraste.

---

# 28. VALORES

Valores financeiros devem ficar alinhados à direita.

Formato:

`R$ 1.250,00`

Receitas podem possuir indicação visual positiva.

Despesas podem possuir indicação visual negativa.

Sem exagerar nas cores.

---

# 29. STATUS

Utilizar badges/chips.

Exemplos:

* Pago;
* Recebido;
* Pendente;
* Cancelado.

A aparência de cada status deve ser consistente no sistema inteiro.

---

# 30. AÇÕES DA TABELA

Não quero uma linha cheia de botões.

Preferência:

```text
[Editar] [⋮]
```

No menu `...`:

* Ver detalhes;
* Editar;
* Cancelar;
* outras ações relevantes.

---

# 31. DETALHES DA MOVIMENTAÇÃO

Ao clicar em uma movimentação, pode abrir um drawer lateral ou modal.

Exemplo:

```text
Detalhes da movimentação

Receita

R$ 450,00

Data
17/09/2026

Categoria
Vendas

Forma de pagamento
Pix

Conta
Nubank

Status
Recebido

Ciclo
...

Observação
...

[Editar]
```

Para informações mais extensas, prefira drawer lateral.

---

# 32. NOVA MOVIMENTAÇÃO

O botão:

**+ Nova movimentação**

deve abrir modal.

Campos:

* Data;
* Ciclo;
* Tipo;
* Categoria;
* Subcategoria;
* Entidade;
* Valor;
* Forma de pagamento;
* Status;
* Conta financeira;
* Observação.

Organizar de maneira inteligente.

---

# 33. FORMULÁRIO INTELIGENTE

Não mostrar campos irrelevantes.

Exemplo:

Se for Receita, apresentar os campos relevantes.

Se for Despesa, apresentar os campos relevantes.

Se for Transferência, apresentar:

* conta de origem;
* conta de destino;
* valor;
* data;
* observação;

e nunca tratar transferência como receita/despesa.

A UX deve ajudar o usuário, mas as regras devem continuar sendo validadas pelo backend.

---

# 34. DÍVIDAS

Não quero duas opções na sidebar:

```text
Contas a pagar
Contas a receber
```

Quero apenas:

**Dívidas**

Dentro da tela:

```text
Dívidas

[ A pagar ] [ A receber ]

                         + Nova dívida
```

Ou seja, A pagar e A receber são **abas internas**.

Isso deixa a navegação mais limpa.

---

# 35. ESTOQUE E INSUMOS

Manter:

**Estoque e Insumos**

O primeiro estágio é informacional.

A interface deve permitir registrar dados como:

* Item;
* Unidade;
* Quantidade comprada;
* Custo da compra;
* Consumo por venda;
* Unidade do consumo;
* Rendimento;
* Valor de venda;
* Fornecedor;
* Observações.

A evolução futura será:

```text
Compra
↓
Estoque
↓
Consumo
↓
Custo
↓
Margem
```

Não quero transformar isso imediatamente em um módulo excessivamente complexo.

---

# 36. RELATÓRIOS

Manter a mesma linguagem visual.

Possíveis relatórios:

* financeiro;
* por ciclo;
* receitas;
* despesas;
* contas;
* estoque/custos.

Filtros devem ser fáceis de utilizar.

---

# 37. CONFIGURAÇÕES

Área administrativa para:

* categorias;
* subcategorias;
* contas financeiras;
* formas de pagamento;
* ciclos;
* usuários/permissões.

Não colocar configurações no Dashboard.

---

# 38. LOADING

Não quero telas travando com apenas:

```text
Carregando...
```

Utilizar skeletons quando fizer sentido.

O layout deve permanecer estável durante carregamento.

---

# 39. EMPTY STATES

Quando não houver dados:

```text
Nenhuma movimentação encontrada

Ainda não existem movimentações para os filtros selecionados.

[+ Nova movimentação]
```

Se houver filtro ativo:

```text
Nenhuma movimentação encontrada

Tente alterar ou limpar os filtros.

[Limpar filtros]
```

---

# 40. TOASTS E FEEDBACK

Não utilizar `alert()` nativo para tudo.

Criar feedback moderno:

* toast;
* snackbar;
* mensagens próximas aos campos;
* estados de sucesso/erro.

Exemplo:

```text
✓ Movimentação salva com sucesso.
```

---

# 41. RESPONSIVIDADE

O sistema deve funcionar bem em:

* desktop;
* notebook;
* tablet;
* celular.

Desktop deve aproveitar bastante espaço.

Mobile não deve ser simplesmente uma versão esmagada do desktop.

No mobile:

* sidebar vira menu;
* cards empilham;
* filtros podem abrir em painel;
* tabela deve ter estratégia própria;
* modais devem ocupar espaço adequado;
* botões precisam ser fáceis de tocar.

---

# 42. ACESSIBILIDADE

Aplicar boas práticas:

* contraste;
* foco visível;
* labels;
* navegação por teclado;
* aria-label quando necessário;
* áreas de toque adequadas;
* não depender apenas de cores para indicar estados.

---

# 43. MICROINTERAÇÕES

Utilizar microinterações discretas:

* hover;
* transições curtas;
* abertura suave de modal;
* toast;
* atualização de filtros;
* skeleton;
* mudança de estado.

Nada exagerado.

Quero profissionalismo, não uma interface cheia de animações.

---

# 44. COMPONENTIZAÇÃO

Não duplicar HTML/CSS/estilos desnecessariamente.

Criar componentes reutilizáveis.

Se o mesmo modal, botão, tabela, badge ou filtro aparece em vários lugares, ele deve possuir um padrão compartilhado.

---

# 45. NÃO REPRODUZIR O GOOGLE SHEETS

A planilha foi apenas um MVP/teste para entender o negócio.

A aplicação web deve ser superior à planilha.

Não copiar:

* limitações;
* estrutura visual;
* fórmulas;
* comportamento de tabela;
* experiência de preenchimento.

A aplicação deve ser construída pensando em um sistema web profissional.

---

# 46. NÃO INVENTAR MÉTRICAS

O Dashboard precisa ser bonito, mas a precisão é mais importante.

Não invente números.

Não invente indicadores que não possuam dados suficientes.

Não crie métricas ambíguas.

Cada indicador deve ter uma definição clara e origem nos dados reais.

---

# 47. REGRA DE OURO

Antes de criar qualquer componente, pense:

> Qual informação o usuário precisa entender?

Depois:

> Qual ação ele precisa realizar?

E somente depois:

> Qual componente visual representa isso melhor?

---

# 48. ORDEM DE IMPLEMENTAÇÃO

Quero que você trabalhe nesta ordem:

### ETAPA 1

Criar/refatorar o Design System:

* cores;
* tipografia;
* espaçamento;
* sidebar;
* botões;
* inputs;
* selects;
* badges;
* modais;
* toasts;
* tabelas;
* tabs;
* filtros.

### ETAPA 2

Refazer completamente o Dashboard.

Essa é a prioridade máxima.

Quero uma tela realmente profissional.

### ETAPA 3

Refazer completamente Movimentações.

### ETAPA 4

Aplicar a nova identidade em Dívidas.

### ETAPA 5

Aplicar em Estoque e Insumos.

### ETAPA 6

Aplicar em Relatórios.

### ETAPA 7

Aplicar em Configurações.

---

# 49. IMPORTANTE SOBRE O CÓDIGO ATUAL

Antes de alterar tudo, analise o projeto existente.

Não destrua funcionalidades que já estejam funcionando.

Primeiro identifique:

* estrutura atual;
* componentes existentes;
* rotas;
* serviços;
* modelos;
* integração com backend;
* dados utilizados pelo Dashboard;
* dados utilizados por Movimentações.

Depois faça o redesign.

A prioridade é:

**preservar lógica e dados → melhorar arquitetura visual/UX → melhorar componentes → melhorar experiência.**

Se alguma parte da arquitetura atual estiver impedindo uma boa UX, explique antes de fazer uma alteração estrutural grande.

---

# 50. RESULTADO QUE EU ESPERO

Quando terminar, quero olhar para o sistema e sentir que estou usando:

**um ERP profissional de verdade.**

Não quero sensação de:

* projeto acadêmico;
* CRUD básico;
* template administrativo;
* cópia de planilha.

Quero algo que a empresa tenha orgulho de utilizar.

O Dashboard deve ser a tela que mais impressiona visualmente, mas sem perder precisão.

Movimentações deve ser a tela mais eficiente para operação diária.

Todo o restante deve seguir a mesma identidade.

A experiência final precisa transmitir:

**"Aqui eu consigo controlar minha empresa."**

E o Dashboard precisa transmitir:

**"Aqui eu consigo entender minha empresa e tomar decisões melhores."**

Antes de começar a implementar, faça uma breve análise da estrutura atual do projeto e identifique o que precisa ser alterado visualmente. Depois implemente seguindo essas diretrizes.

Não fique apenas descrevendo o que faria: **faça o redesign no projeto.**
