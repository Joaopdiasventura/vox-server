VOX API

API do sistema de urna eletrônica VOX. Gerencia usuários, grupos e subgrupos, candidatos, votações (pools), votos e fluxo de pedidos/pagamentos. Expõe REST + WebSockets (Socket.IO) e utiliza MongoDB via Mongoose.

Sumário
- Visão Geral e Stack
- Estrutura de Pastas
- Configuração (.env)
- Como Rodar (Local e Docker)
- Testes, Lint e Build
- Autenticação e Segurança
- WebSockets (eventos)
- API de Rotas (com cURL)

Visão Geral e Stack
- Node.js 22, NestJS 11, TypeScript
- MongoDB 8 + Mongoose
- Socket.IO (gateways para voto, pagamento e usuário)
- JWT (autenticação) + bcrypt (hash de senha)
- class-validator/class-transformer (validação)
- Mercado Pago SDK (provedor de pagamento)
- Jest (unit/e2e), ESLint e Prettier

Estrutura de Pastas (resumo)

```
src/
  app.module.ts               # Config raiz + Mongoose
  config/
    app.config.ts             # PORT, CORS/CLIENT_URL, JWT_SECRET, VOTE_PRICE
    db.config.ts              # MONGO_URI
  core/
    user/ { controller, service, gateway, dto, entities, repositories }
    group/ { controller, service, dto, entities, repositories }
    candidate/ { controller, service, dto, entities, repositories }
    pool/ { controller, service, dto, entities, repositories }
    vote/ { controller, service, gateway, dto, entities, repositories }
    order/ { controller, service, dto, entities, repositories }
    payment/ { controller, service, gateway, providers/, entities, repositories }
  shared/
    modules/auth/ { auth.service, guards/auth.guard }
    modules/email/ { email.service }
    interfaces/
```

Configuração (.env)
- PORT: porta HTTP (default 3000)
- SALTS: rounds do bcrypt (default 10)
- URL: URL pública da API (default http://localhost:3000)
- CLIENT_URL: origem CORS permitida (default http://localhost:4200)
- JWT_SECRET: segredo JWT (default VOX)
- VOTE_PRICE: preço de 1 voto (inteiro; default 1)
- MONGO_URI: conexão MongoDB (default mongodb://localhost:27017/vox)
- MP_ACCESS_TOKEN: token de acesso do Mercado Pago (obrigatório para pagamentos)

Exemplo (.env)

```
PORT=3000
SALTS=10
URL=http://localhost:3000
CLIENT_URL=http://localhost:4200
JWT_SECRET=VOX
VOTE_PRICE=1
MONGO_URI=mongodb://localhost:27017/vox
MP_ACCESS_TOKEN=seu_token_mercadopago
```

Como Rodar (Local)
1. Requisitos: Node 22+, MongoDB 6+/8+
2. Instale deps: `npm ci` (ou `npm i`)
3. Configure `.env` (ao menos `MONGO_URI`)
4. Dev: `npm run start:dev` (http://localhost:3000)

Docker / Compose
- Dev rápido: `docker compose up --build`
  - Sobe Mongo e API (porta 3000)
  - Persiste dados em volume `vox-data`
- Variáveis: edite `compose.yaml` ou exporte no shell (ex.: `MONGO_URI`)

Testes, Lint e Build
- Unit: `npm test` | Cobertura: `npm run test:cov`
- E2E: `npm run test:e2e`
- Lint: `npm run lint`
- Format: `npm run format`
- Build: `npm run build` | Prod: `npm run start:prod`

Autenticação e Segurança
- JWT: gere token no login e envie em `Authorization: Bearer <token>`
- Senhas: hash via bcrypt (SALTS)
- Validação: `ValidationPipe` global (whitelist + transform)
- CORS: liberado para `CLIENT_URL` com `Authorization` e `Content-Type`

WebSockets (Socket.IO)
- UserGateway
  - Conexão: `?email=<email>`
  - Evento server→client: `email-validated`
- VoteGateway
  - Conexão: gera `new-id` (ID curto para a urna)
  - Eventos: client→server `allow-vote(urnId)`, `exit-poll(poolId)`
  - Broadcast: server→clients `vote-<poolId>` com `{ candidate }`
- PaymentGateway
  - Conexão: `?order=<orderId>`
  - Evento server→client: `order-paid`

API de Rotas

Base URL: http://localhost:3000

Autenticação
- Rotas protegidas exigem Authorization: Bearer <token> (token obtido no login).

Erros (exemplos)
- 400: { "statusCode": 400, "message": string | string[], "error": "Bad Request" }
- 401: { "statusCode": 401, "message": string, "error": "Unauthorized" }
- 404: { "statusCode": 404, "message": string, "error": "Not Found" }

Convenções
- IDs (":id", ":user", ":group", ":pool", ":order") são ObjectId (string).
- Paginação/ordenação: page, limit (números) e orderBy no formato campo:asc|desc.

Usuários
- POST /user — cria
  - Body: { email, name, password }
  - 201: { message, token, user }
- POST /user/login — login
  - Body: { email, password }
  - 200: { message, token, user }
- GET /user/decodeToken/:token — dados do usuário do token
  - 200: { _id, email, name, plan, votes, isValid }
- PATCH /user/:id — atualizar (auth)
  - Body: { email?, name?, password? }
  - 200: { message }
- DELETE /user/:id — remover (auth)
  - 200: { message }

Grupos (auth)
- POST /group — criar
  - Body: { name, user, group? }
  - 201: { message }
- GET /group/findById/:id — buscar por ID
  - 200: { _id, name, user, group? }
- GET /group/findMany/:user — listar
  - Query: page?, limit?, orderBy?, withSubGroups?, withCandidates?
  - 200: [{ _id, name, user, group? }]
- PATCH /group/:id — atualizar
  - Body: { name?, group? }
  - 200: { message }
- DELETE /group/:id — remover
  - 200: { message }

Candidatos (auth)
- POST /candidate — criar
  - Body: { name, group }
  - 201: { message }
- GET /candidate/findById/:id — buscar por ID
  - 200: { _id, name, group }
- GET /candidate/findMany/:group — listar por grupo
  - Query: page?, limit?, orderBy?
  - 200: [{ _id, name, group }]
- PATCH /candidate/:id — atualizar
  - Body: { name }
  - 200: { message }
- DELETE /candidate/:id — remover
  - 200: { message }

Votações (Pool) (auth)
- POST /pool — criar votação
  - Body: { group, start (ISO), end (ISO) }
  - 201: { message }
- GET /pool/findById/:id — buscar por ID
  - 200: { _id, group, votes, start, end, createdAt, updatedAt }
- GET /pool/findMany/:user — listar
  - Query: page?, limit?, orderBy?, group?
  - 200: [{ _id, group, votes, start, end, ... }]
- PATCH /pool/:id — atualizar
  - Body: { start?, end? }
  - 200: { message }
- DELETE /pool/:id — remover
  - 200: { message }

Votos (auth)
- POST /vote — registrar voto
  - Body: { pool, candidate? }
  - 201: { message }
- GET /vote/:pool — resultado
  - 200: [{ candidate: { _id, name, group } | null, quantity }]

Pedidos (Orders) (auth)
- POST /order — criar pedido
  - Body: { plan, votes, user }
  - 201: { message } (id do pedido)
- GET /order/findById/:id — buscar por ID
  - 200: { _id, plan, value, votes, user, payment?, createdAt, updatedAt }
- GET /order/findMany/:user — listar
  - Query: page?, limit?, orderBy?
  - 200: [{ _id, plan, value, votes, user, payment? }]
- PATCH /order/:id — atualizar
  - Body: { payment }
  - 200: { message }
- DELETE /order/:id — remover
  - 200: { message }

Pagamentos (auth)
- POST /payment — webhook de pagamento
  - Body: { data: { id } }
  - 200/201: { message }
- GET /payment/pix/:order — gerar pagamento Pix
  - Query obrigatória: { payment_method_id: "pix", description }
  - Query opcional: { date_of_expiration?, external_reference?, notification_url? }
  - 200: objeto de criação de pagamento do SDK (ex.: QR code, id)
- GET /payment/card/:order — gerar pagamento cartão
  - Query obrigatória: { payment_method_id, token, description }
  - Query opcional: { installments?, issuer_id?, external_reference?, notification_url? }
  - 200: objeto de criação de pagamento do SDK

Exemplos (cURL)

Pré-definições (bash/zsh):

```bash
BASE_URL="http://localhost:3000"
TOKEN="<JWT>"
USER_ID="<USER_ID>"
GROUP_ID="<GROUP_ID>"
CANDIDATE_ID="<CANDIDATE_ID>"
POOL_ID="<POOL_ID>"
ORDER_ID="<ORDER_ID>"
```

Criar usuário

```bash
curl -X POST "$BASE_URL/user" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "name": "John Doe",
    "password": "Str0ng!Pass1"
  }'
```

Login

```bash
curl -X POST "$BASE_URL/user/login" \
  -H "Content-Type: application/json" \
  -d '{ "email": "john@example.com", "password": "Str0ng!Pass1" }'
```

Registrar voto

```bash
curl -X POST "$BASE_URL/vote" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "pool": "'$POOL_ID'", "candidate": "'$CANDIDATE_ID'" }'
```

Notas Importantes
- Mercado Pago: defina `MP_ACCESS_TOKEN`. O provedor é lido via `ConfigService`. Se necessário, crie um config loader que exponha `mp.accessToken` mapeando de `MP_ACCESS_TOKEN`.
- Autorização: garanta que o header `Authorization` contenha apenas o token JWT ou o formato suportado pela sua instância.
- Padrões de paginação: `page` começa em 0; `limit` usa um valor padrão interno quando ausente.
