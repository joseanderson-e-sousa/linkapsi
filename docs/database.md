# Banco do MVP

## Tabelas e relacionamentos

- `profiles`: UUID, `user_id` obrigatório e único ligado a `auth.users`, `slug`
  obrigatório e único; nome profissional, CRP, bio, foto, áreas, públicos,
  modalidades, cidade, Instagram, WhatsApp e CTA. Nasce não publicado.
  Slugs aceitam letras minúsculas sem acentos, números e hífens entre segmentos.
  `created_at` e `updated_at` recebem `now()`; um trigger atualiza `updated_at`.
- `links`: UUID, perfil obrigatório, título, URL, tipo, posição (padrão 0),
  ativo (padrão true) e criação. Um perfil possui vários links.
- `events`: UUID, perfil obrigatório, tipo de evento, link opcional e criação.
  Tipos: `page_view`, `primary_cta_click`, `whatsapp_click`, `instagram_click`,
  `link_click`. `link_id` referencia `links`; excluir um link preserva o evento
  com `link_id = null`.

Excluir um usuário remove seu perfil; excluir o perfil remove links e eventos.
As chaves únicas já indexam usuário e slug. Os demais índices atendem links
por perfil/posição, eventos por perfil/data e a foreign key de link.

## Ownership e RLS

O proprietário é `profiles.user_id = auth.uid()`. Autenticados podem ler, criar,
atualizar e excluir o próprio perfil e seus links. INSERT e UPDATE verificam
o proprietário de destino; não é possível transferir dados para outro usuário.

Visitantes e autenticados podem ler perfis publicados e somente links ativos
de perfis publicados. O proprietário também vê seu rascunho e links inativos.
Essa leitura pública abrange todas as colunas das linhas publicadas; não
armazene informações privadas adicionais nessas tabelas.

Eventos só podem ser consultados pelo proprietário do perfil. Não há grants
ou policies de escrita para clientes nem leitura anônima de eventos.
A coleta futura será por endpoint server-side, validando publicação, tipo,
pertencimento do link ao perfil e limites de requisição. Nenhuma chave
privilegiada deve ser enviada ao navegador.

## Executar a migration

1. Crie ou selecione o projeto no painel Supabase.
2. Abra **SQL Editor → New query** e execute uma única vez o conteúdo completo
   de `supabase/migrations/20260929000000_initial_schema.sql`. A migration é
   transacional e destina-se a um banco sem essas tabelas; não apaga tabelas existentes.
3. No **Table Editor**, confirme `profiles`, `links` e `events`; na área de
   policies, confirme RLS habilitada e as 11 policies da migration.
4. Em **Connect**, copie Project URL e Publishable key. Copie `.env.example`
   para `.env.local` e preencha `NEXT_PUBLIC_SUPABASE_URL` e
   `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. Reinicie o servidor Next.js.

Os clientes são criados sob demanda. A home não depende dessas variáveis.
Autenticação e Proxy de renovação de sessão ficam para a etapa de autenticação;
Server Components não conseguem persistir cookies renovados sozinhos.
