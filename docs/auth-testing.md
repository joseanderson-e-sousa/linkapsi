# Autenticação do MVP

## Configuração manual no Supabase

- Authentication: habilitar o provedor Email e permitir novos cadastros.
- Conferir a opção Confirm email. Ligada: o cadastro mostra uma orientação e não presume sessão. Desligada: se o Supabase retornar sessão, o cadastro leva ao dashboard.
- URL Configuration: definir Site URL como `http://localhost:3000` no desenvolvimento e como a origem HTTPS da aplicação em produção.
- Redirect URLs: permitir `http://localhost:3000/auth/callback` e a URL equivalente de produção. Se usar outra porta, cadastrar sua URL também.
- Email Templates / Confirm signup: manter o link padrão `{{ .ConfirmationURL }}`. O fluxo implementado usa PKCE com retorno para `/auth/callback`; não usa uma rota `/auth/confirm` com token_hash.
- Conferir entrega de email/SMTP, destinatários permitidos e limites do serviço. Uma política de senha mais forte no Supabase continua valendo além do mínimo local de 8 caracteres.
- Manter apenas `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` no ambiente. Não há uso de service role.

## Roteiro manual exato

1. Executar `npm run dev` e abrir `http://localhost:3000` (se o terminal indicar outra porta, ajustar também Redirect URLs).
2. Em uma janela anônima, abrir `/dashboard`. Esperado: ir para `/login`, sem ver o painel.
3. Ir para `/cadastro`. Testar campos vazios, email inválido, senha menor que 8 caracteres e confirmação diferente. Todos devem impedir o cadastro.
4. Usar um email real sob seu controle e uma senha nova com pelo menos 8 caracteres. Clicar em Criar conta. Conferir o novo usuário em Authentication / Users no Supabase. Nenhum perfil profissional deve ser criado pela aplicação.
5. Se Confirm email estiver ligado: esperar a mensagem para confirmar o email; `/dashboard` ainda deve levar ao login. Antes de confirmar, tentar entrar e verificar a mensagem de confirmação pendente. Abrir o link do email no mesmo navegador e perfil usados no cadastro. Esperado: `/auth/callback` troca o código pela sessão e redireciona ao dashboard. Se o link for aberto em outro navegador, a troca PKCE pode falhar; após confirmar o email, usar `/login` com email e senha.
6. Se Confirm email estiver desligado: após cadastro com sessão, esperar redirecionamento direto para `/dashboard`.
7. No dashboard, conferir Linkapsi, Seu painel, Você está autenticado, Criar meu perfil desabilitado e Sair. Recarregar a página e abrir `/dashboard` em outra aba do mesmo navegador: deve continuar autenticado.
8. Para verificar renovação real, manter os cookies, aguardar a expiração do access token configurada no projeto e recarregar `/dashboard`. Deve permanecer autenticado pela renovação com refresh token.
9. Clicar em Sair. Esperado: `/login`. Usar Voltar no navegador, recarregar e tentar abrir `/dashboard` diretamente e em outra aba. O painel não deve continuar acessível sem sessão.
10. Em `/login`, tentar uma senha incorreta: esperar erro compreensível. Usar email confirmado e senha correta: esperar `/dashboard`. Repetir Sair e o acesso direto ao dashboard.

## Verificação executada nesta implementação

- `npm run lint`: passou.
- `npm run build`: passou; dashboard e callback renderizados no servidor, proxy reconhecido.
- HTTP contra `next start` na porta 3100: home, cadastro e login retornaram 200.
- Dashboard sem cookies: 307 para `/login`, sem conteúdo protegido.
- Callback sem código: redirecionamento para login com mensagem de confirmação.
- POSTs reais de Server Actions: campos obrigatórios, email inválido, senha curta e senhas diferentes foram rejeitados no servidor, mesmo sem validação do navegador.
- Cadastro real, entrega/confirmação de email, login válido, dashboard autenticado, expiração/renovação e logout de uma sessão real: pendentes do roteiro manual acima. Não foi criada uma conta artificial nem foram alteradas configurações remotas.

## Funcionamento

Server Actions usam o cliente Supabase existente do servidor e gravam a sessão em cookies. O callback troca o código PKCE da confirmação por uma sessão. `src/proxy.ts`, convenção do Next.js 16, chama `getClaims()` para renovar tokens e propaga cookies ao request e à resposta, com cache privado desabilitado. O dashboard verifica `getUser()` no servidor antes de renderizar. Logout encerra a sessão atual, invalida o cache de navegação e redireciona ao login. Não há alteração de schema, RLS ou criação automática de perfil.

Referência: https://supabase.com/docs/guides/auth/server-side/creating-a-client
