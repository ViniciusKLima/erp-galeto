# Skill — Padrões Angular/TypeScript

## Objetivo

Complementar `padroes-de-desenvolvimento.md` com convenções específicas do frontend Angular, mantendo o princípio de que o Angular apresenta e coleta dados, mas não é autoridade financeira (`arquitetura.md`).

## Estrutura do projeto

- Angular standalone components (sem `NgModule`), Angular CLI padrão.
- Organização por feature, não por tipo de arquivo:
  ```
  src/app/
    core/            (auth guard, interceptors, cliente Supabase, tipos gerados)
    shared/          (componentes/pipes/diretivas reutilizáveis, ex.: máscara monetária)
    features/
      movimentacoes/
      dashboard/
      contas-a-pagar/
      contas-a-receber/
      estoque/
      dividas-e-credores/
      configuracoes/  (categorias, subcategorias, contas financeiras, formas de pagamento, usuários)
  ```
- Cada feature separa: `pages/` (rotas), `components/` (apresentação), `services/` (acesso a dados/Supabase), `models/` (tipos TS).

## Estado e dados

- Signals (`signal`, `computed`, `effect`) para estado local de componente/feature — evitar RxJS quando um signal resolve.
- Um `service` por feature encapsula toda chamada ao Supabase (`select`, `rpc`, `insert` simples permitido por RLS). Componentes nunca importam o client do Supabase diretamente.
- Tipos TypeScript do banco gerados a partir do schema do Supabase (`supabase gen types typescript`) e versionados em `core/types/database.ts` — nunca modelar manualmente um tipo que já existe no banco, para não divergir do schema real.

## Formulários

- Reactive Forms (`FormGroup`/`FormBuilder`) para todo formulário financeiro — nunca template-driven em telas de movimentação, parcela, pagamento.
- Validação de interface (campo obrigatório, formato, máscara) no Angular; validação de regra de negócio (ex.: parcela não pode exceder valor total) é responsabilidade do banco (RPC), o Angular só reflete o erro retornado.
- Campos condicionais (ex.: exibir parcelas somente se "parcelado" marcado) seguem `ux-ui.md` e `fluxos-do-sistema.md`.

## Valores monetários no frontend

- Nunca somar/subtrair valores monetários usando `number` do JavaScript em lógica que afeta o que é salvo (risco de erro de ponto flutuante). Cálculos que importam (saldo, resultado, parcelas) vêm prontos do banco via view/RPC.
- Para exibição e cálculos puramente de UI (ex.: subtotal enquanto o usuário digita antes de salvar), usar uma biblioteca de decimal (ex.: `decimal.js`) ou trabalhar em centavos inteiros — nunca `parseFloat` seguido de soma direta.
- Formatação usa `Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })` / `CurrencyPipe` do Angular.

## Roteamento e permissões

- `authGuard` (functional guard) bloqueia rotas para usuário não autenticado; guard adicional por `role` para rotas de admin (configurações, usuários), espelhando (não substituindo) o que já é garantido por RLS no banco. O guard é UX, a policy do banco é a autoridade.
- Interceptor HTTP não é necessário para o client do Supabase (ele já gerencia o token de sessão), mas erros de RLS/RPC devem ser tratados de forma consistente (ver seção de erros abaixo).

## Tratamento de erros

- Todo erro do Supabase (`{ data, error }`) é tratado explicitamente no service — nunca ignorado.
- Mensagens de erro vindas de função de banco (`raise exception` em PL/pgSQL) devem ser mapeadas para mensagens claras na UI, não exibidas como stack trace bruto.
- Estados de carregamento e erro seguem `ux-ui.md` (feedback de validação, estados de carregamento).

## Estilo/UI

- Biblioteca de componentes definida: **Angular Material** (tema M3 configurado em `src/styles.scss` via `mat.theme`). Cobre tabela, formulário, diálogo, data picker, snackbar — cumpre `ux-ui.md` (busca/filtro/ordenação/paginação em tabelas, feedback de validação, estados de carregamento) sem depender de bibliotecas soltas adicionais. Não misturar com outra lib de componentes.

## Código

- `strict: true` no `tsconfig.json`.
- Nomes de arquivo/seletor em kebab-case, classes em PascalCase, conforme convenção padrão do Angular CLI.
- Sem `any` em tipos que representam entidades financeiras — usar os tipos gerados do banco.
