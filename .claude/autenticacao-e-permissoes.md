# Autenticação e Permissões

## Objetivo

Garantir que somente usuários autorizados acessem o sistema e que ações sensíveis possam ser controladas.

## MVP

- Login por e-mail e senha.
- Sessão segura.
- Logout.
- Proteção das rotas.
- Usuário ativo/inativo.

## Perfis sugeridos

### Administrador
- acesso total;
- configurações;
- usuários;
- financeiro;
- relatórios.

### Operador
- registrar movimentações;
- consultar informações permitidas;
- sem acesso a configurações críticas.

Os nomes podem mudar conforme a necessidade real.

## Segurança

- Nunca armazenar senha em texto puro.
- Utilizar hash seguro.
- Validar autorização no backend, não apenas no frontend.
- Nunca confiar em IDs enviados pelo cliente sem verificar permissão.
- Validar valores e regras no servidor.

## Auditoria

Ações financeiras relevantes devem poder ser rastreadas até o usuário responsável.
