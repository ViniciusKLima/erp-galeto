# Banco de Dados

## Objetivo

O banco deve representar o negócio de forma normalizada e permitir evolução sem depender da estrutura do Google Sheets.

## Entidades sugeridas

### users
- id
- name
- email
- password_hash
- role
- active
- created_at
- updated_at

### financial_accounts
- id
- name
- type
- initial_balance
- active
- created_at
- updated_at

Tipos possíveis:
- bank
- cash
- other

### transaction_categories
- id
- name
- type
- active
- created_at
- updated_at

Type:
- income
- expense

### transaction_subcategories
- id
- category_id
- name
- active
- created_at
- updated_at

### payment_methods
- id
- name
- active

### contacts / counterparties
Entidade genérica para clientes, fornecedores e credores quando isso fizer sentido.

- id
- name
- type
- document
- phone
- active

### financial_transactions
Representa a operação financeira principal.

Campos conceituais:
- id
- type
- description
- amount
- transaction_date
- category_id
- subcategory_id
- payment_method_id
- financial_account_id
- counterparty_id
- status
- notes
- created_by
- created_at
- updated_at

### installments
- id
- transaction_id
- installment_number
- total_installments
- amount
- due_date
- paid_at
- status
- financial_account_id
- notes

### accounts_receivable
Pode ser uma entidade específica ou uma camada derivada das parcelas, dependendo da arquitetura final.

### accounts_payable
Mesma consideração.

### transfers
- id
- source_account_id
- destination_account_id
- amount
- transfer_date
- notes
- created_by

### inventory_items
- id
- name
- unit
- purchase_quantity
- purchase_cost
- consumption_quantity
- consumption_unit
- yield
- sale_value
- supplier_id
- notes
- active

### debts
- id
- creditor_id
- description
- total_amount
- status
- start_date
- notes

### debt_installments
- id
- debt_id
- number
- amount
- due_date
- paid_at
- status

## Decisão importante

Não criar entidades duplicadas sem necessidade.

Por exemplo, se `financial_transactions` + `installments` já representar uma compra parcelada, `debts` não deve duplicar a mesma obrigação sem uma relação clara.

## Valores monetários

Não utilizar float para valores monetários.

Preferir decimal/numeric ou armazenamento em centavos inteiros, conforme a tecnologia escolhida.

## Auditoria

Operações financeiras importantes devem possuir:
- created_at
- updated_at
- created_by
- eventualmente updated_by
- histórico de alterações para operações críticas.

## Integridade

Usar:
- foreign keys;
- constraints;
- valores não negativos quando aplicável;
- enums ou tabelas controladas;
- transações de banco para operações que alteram múltiplas entidades.

## Índices

Criar índices para:
- datas;
- status;
- categoria;
- conta financeira;
- transaction_id;
- vencimentos.

## Nota de implementação (Supabase)

Com a stack definida em `stack-tecnologico.md`, a entidade `users` acima é implementada como Supabase Auth (`auth.users`, que já cuida de senha/sessão) + uma tabela `public.profiles` (id, name, role, active, created_at, updated_at) referenciando `auth.users.id`. Não recriar `password_hash` manualmente. Detalhes em `supabase-e-seguranca.md`.

## Evolução

O modelo deve permitir futuramente:
- custos por produto;
- receitas por produto;
- estoque real;
- fornecedores;
- clientes;
- relatórios;
- múltiplos usuários;
- auditoria.
