# Vox Server

Backend do Vox, uma aplicação de votação online construída com [NestJS](https://nestjs.com/), MongoDB, Redis, WebSockets e pagamentos via Mercado Pago.

Este repositório contém a API REST, os gateways WebSocket e toda a lógica de domínio para eleições, candidatos, votos, pedidos e pagamentos.

> Outros idiomas: [English](./README.md)

## Índice

- [Stack e Arquitetura](#stack-e-arquitetura)
- [Módulos Principais](#módulos-principais)
  - [User](#user)
  - [Auth & Session](#auth--session)
  - [Election](#election)
  - [Candidate](#candidate)
  - [Ballot Box](#ballot-box)
  - [Vote](#vote)
  - [Order & Payment](#order--payment)
  - [Email](#email)
- [Configuração & Ambiente](#configuração--ambiente)
- [Como Rodar o Projeto](#como-rodar-o-projeto)
- [Testes & Qualidade](#testes--qualidade)
- [CI/CD & Deploy](#cicd--deploy)
- [Estrutura de Pastas](#estrutura-de-pastas)

## Stack e Arquitetura

- **Node.js / TypeScript**
- **NestJS 11** como framework principal
- **MongoDB (Mongoose)** para persistência
- **Redis** para cache (sessões, WebSocket etc.) e filas
- **BullMQ** para jobs em background
- **Socket.IO** para comunicação em tempo real
- **SDK do Mercado Pago** para integração de pagamentos (`mercadopago`)
- **Nodemailer** para envio de e-mails

A arquitetura é limpa e modular e organizada em torno dos casos de uso de votação: cada domínio (eleição, candidato, voto, pagamento etc.) possui seu próprio módulo, com controllers, services, entities, DTOs e testes unitários.

## Módulos Principais

### User

Local: `src/core/user`

- **Entidade**: usuário do sistema (eleitor).
- **UserController**: endpoints REST para CRUD e operações de conta.
- **UserGateway** (`user.gateway.ts`):
  - Gerencia conexões WebSocket de usuários.
  - Armazena e remove IDs de socket no cache (Redis) por e-mail.
  - Notifica clientes quando a conta é validada (`email-validated`).

### Auth

Local: `src/shared/modules/auth`

- **AuthModule / AuthService**:
  - Autenticação com JWT (`@nestjs/jwt`).
  - Guarda HTTP (`AuthGuard`) em `src/shared/modules/auth/guards/auth`.

### Election

Local: `src/core/election`

- Gerencia **eleições** (criação, listagem, atualização).
- Entidades, DTOs e repositórios para abstrair o acesso a dados.

### Session

Local: `src/core/session`

- **SessionModule / SessionService**:
  - Lógica de sessão para as votações.

### Candidate

Local: `src/core/candidate`

- CRUD de **candidatos** associados às eleições.
- Repositório específico para MongoDB (`candidate.mongo.repository.ts`).

### Ballot Box

Local: `src/core/ballot-box`

- Representa uma **urna** em uma eleição.
- `BallotBoxGateway` expõe eventos em tempo real para acompanhar o status da votação.

### Vote

Local: `src/core/vote`

- Registra **votos**.
- `VoteController` e `VoteService` para criação e consulta de votos.
- `VoteGateway` para atualizações em tempo real (resultados, contagem etc.).

### Order & Payment

Local: `src/core/order` e `src/core/payment`

- **OrderModule**: gerencia pedidos de compra de votos/créditos.
- **PaymentModule**:
  - Interface `IPaymentProvider` em `src/core/payment/providers/index.ts`.
  - Implementação concreta `MercadopagoService` em `src/core/payment/providers/mercadopago`.
  - `PaymentController` e `PaymentService` orquestram o fluxo de pagamento (PIX/cartão, callbacks de status etc.).

### Email

Local: `src/shared/modules/email`

- Serviço de e-mail (`EmailService`) usando `nodemailer`.
- DTO `SendEmailDto` em `src/shared/modules/email/dto`.

## Configuração & Ambiente

A configuração é carregada usando:

- `src/config/app.config.ts` – configuração geral da aplicação.
- `src/config/db.config.ts` – URIs de MongoDB e Redis.

As configurações de ambiente são usadas para:

- URL pública da API e do cliente (frontend).
- Porta de execução.
- Segredos e parâmetros de segurança (JWT, salts).
- Integração com Mercado Pago.
- Configurações de e-mail.
- Conexões com MongoDB e Redis.

No pipeline de deploy (`.github/workflows/main.yaml`), as variáveis são carregadas de um arquivo `.env` criado a partir do segredo `DOTENV` e exportadas para o ambiente do workflow.

### Variáveis de ambiente (.env)

As variáveis são lidas de `src/config/app.config.ts` e `src/config/db.config.ts`. Principais variáveis:

- `APP_URL` (padrão: `http://localhost:3000`) – URL pública da API.
- `NODE_ENV` (padrão: `development`) – ambiente de execução.
- `PORT` (padrão: `3000`) – porta em que a aplicação NestJS escuta.
- `SALTS` (padrão: `5`) – quantidade de rounds de salt para hash de senha.
- `CHUNK_SIZE_SECONDS` (padrão: `10`) – tamanho de “chunk” de tempo usado em alguns fluxos.
- `CLIENT_URL` (padrão: `http://localhost:4200`) – URL do frontend.
- `JWT_SECRET` (padrão: `vox`) – segredo usado para assinar tokens JWT.
- `MERCADOPAGO_ACCESS_TOKEN` (**obrigatório**) – token de acesso da API do Mercado Pago.
- `VOTES_PRICE` (padrão: `10`) – preço por voto/crédito.
- `EMAIL_ADDRESS` (**obrigatório**) – conta de e-mail usada para envio.
- `EMAIL_PASSWORD` (**obrigatório**) – senha (ou app password) da conta de e-mail.
- `MONGO_URI` (padrão: `mongodb://localhost:27017/vox`) – string de conexão com MongoDB.
- `REDIS_URI` (padrão: `redis://127.0.0.1:6379/0`) – string de conexão com Redis.

Exemplo de `.env` para desenvolvimento local:

```env
EMAIL_ADDRESS=voce@exemplo.com
EMAIL_PASSWORD=sua-senha-de-email

MERCADOPAGO_ACCESS_TOKEN=seu-token-mercadopago-aqui
```

## Como Rodar o Projeto

Pré-requisitos:

- Node.js (versão compatível com `package.json`)
- Yarn
- MongoDB e Redis em execução

Instalar dependências:

```bash
yarn install
```

Desenvolvimento:

```bash
# modo desenvolvimento (watch)
yarn start:dev

# modo normal
yarn start

# build de produção
yarn build

# rodar build de produção
yarn start:prod
```

Os mesmos scripts existem em npm (`npm run start:dev` etc.), mas o projeto e o CI assumem Yarn.

## Testes & Qualidade

Este projeto usa **Jest** para testes e **ESLint + Prettier** para lint/formatting.

Rodar testes:

```bash
yarn test        # testes unitários
yarn test:watch  # modo watch
yarn test:cov    # cobertura
```

Rodar lint:

```bash
yarn lint        # eslint com --fix
```

Os testes ficam próximos aos módulos, em pastas `__test__` (por exemplo, `src/core/user/__test__/user.controller.spec.ts`).

## CI/CD & Deploy

Arquivos principais:

- Workflow do GitHub Actions: `.github/workflows/main.yaml`
- Configuração do Traefik (reverse proxy): `traefik.yml`

### Pipeline de CI

Em todos os branches (push/PR):

1. Instala dependências (`yarn install --frozen-lockfile`).
2. Roda lint (`yarn lint`).
3. Roda testes (`yarn test`).
4. Faz o build da aplicação (`yarn build`).

### Imagem Docker

Quando um commit é enviado para a branch `main`:

- Job `docker_push`:
  - Faz o build da imagem Docker com `docker/build-push-action`.
  - Publica no Docker Hub como `jpplay/vox-server` com tags `latest` e `sha`.

### Reverse Proxy (Traefik)

O arquivo `traefik.yml` define o reverse proxy Traefik que fica na frente dos containers do servidor:

- Habilita API e dashboard (`api.insecure`, `api.dashboard`).
- Configura providers:
  - `docker`: lê labels dos containers (definidas no job `deploy`).
  - `file`: lê configurações adicionais de `/etc/traefik/config`.
- Define entrypoints:
  - `web` (porta 80), redirecionando para `websecure`.
  - `websecure` (porta 443).
- Define `certificatesResolvers.myresolver` com ACME (Let’s Encrypt) e `tlsChallenge`, usado nas labels de TLS durante o deploy.

### Deploy

- Job `deploy` roda em um runner **self-hosted**.
- Passos principais:
  - Recupera o `.env` do segredo `DOTENV` e exporta as variáveis.
  - Faz login no Docker Hub.
  - Garante a existência da rede Docker `traefik-net`.
  - Faz pull da imagem `jpplay/vox-server:latest`.
  - Sobe containers `server-1` e `server-2` com labels do Traefik para:
    - Roteamento pelo `DOMAIN` (secret do GitHub) no entrypoint `websecure`.
    - TLS usando `certresolver=myresolver` configurado em `traefik.yml`.
    - Sticky sessions via cookie `vox_session`.

## Estrutura de Pastas

Visão geral de alto nível:

- `src/main.ts` – bootstrap da aplicação NestJS.
- `src/app.module.ts` – módulo raiz; registra config, Mongo, Redis, BullMQ e `CoreModule`.
- `src/config` – configuração da aplicação e banco:
  - `app.config.ts`
  - `db.config.ts`
- `src/core` – módulos de domínio:
  - `ballot-box` – urnas e gateway da urna.
  - `candidate` – candidatos.
  - `election` – eleições.
  - `order` – pedidos.
  - `payment` – pagamentos e providers (Mercado Pago).
  - `session` – sessão de usuário.
  - `user` – usuários e WebSocket gateway.
  - `vote` – votos, gateway e resultados.
- `src/shared` – módulos e utilitários compartilhados:
  - `modules/auth` – autenticação e guards.
  - `modules/email` – serviço de e-mail.
  - `adapters` – abstrações (por exemplo, `web-socket.adapter.ts`).
  - `enums`, `interfaces`, `types` – contratos e tipos comuns.

---

Se você precisar de documentação mais detalhada de algum fluxo específico (por exemplo, criação de eleição, fluxo completo de pagamento ou eventos WebSocket), é possível estender este README ou criar documentos adicionais em um diretório `docs/`.
