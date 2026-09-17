
# Skill — Movimentações

## Objetivo

Ser o ponto principal de registro das operações financeiras.

## Ações

- listar;
- pesquisar;
- filtrar;
- ordenar;
- criar;
- editar;
- cancelar;
- visualizar detalhes.

## Filtros

- período;
- tipo;
- categoria;
- subcategoria;
- status;
- conta financeira;
- forma de pagamento.

## Cadastro

Campos mínimos devem depender do tipo da operação.

Receita:

- data;
- descrição;
- categoria;
- valor;
- forma de recebimento;
- conta;
- status.

Despesa:

- data;
- descrição;
- categoria;
- valor;
- forma de pagamento;
- conta;
- status.

Campos adicionais aparecem quando necessários.

## UX

Não obrigar o usuário a preencher campos irrelevantes.

Exemplo:
Uma despesa à vista não deve exigir dados de parcelamento.

## Validações

- valor > 0;
- data válida;
- categoria compatível com tipo;
- conta ativa;
- status válido;
- parcela consistente.

## Histórico

Não remover silenciosamente registros relevantes já utilizados em indicadores.
