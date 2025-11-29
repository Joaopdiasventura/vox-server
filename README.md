# Vox Server

Backend for Vox, an online voting application built with [NestJS](https://nestjs.com/), MongoDB, Redis, WebSockets and Mercado Pago payments.

This repository contains the REST API, WebSocket gateways and all domain logic for elections, candidates, votes, orders and payments.

> 📚 Other languages: [Português (Brasil)](./README.pt-BR.md)

## Table of Contents

- [Stack & Architecture](#stack--architecture)
- [Core Modules](#core-modules)
  - [User](#user)
  - [Auth & Session](#auth--session)
  - [Election](#election)
  - [Candidate](#candidate)
  - [Ballot Box](#ballot-box)
  - [Vote](#vote)
  - [Order & Payment](#order--payment)
  - [Email](#email)
- [Configuration & Environment](#configuration--environment)
- [Running the Project](#running-the-project)
- [Tests & Quality](#tests--quality)
- [CI/CD & Deploy](#cicd--deploy)
- [Folder Structure](#folder-structure)

## Stack & Architecture

- **Node.js / TypeScript**
- **NestJS 11** as the main framework
- **MongoDB (Mongoose)** for persistence
- **Redis** for cache (sessions, WebSocket, etc.) and queues
- **BullMQ** for background jobs
- **Socket.IO** for real‑time communication
- **Mercado Pago SDK** for payment integration (`mercadopago`)
- **Nodemailer** for email delivery

The architecture is clean and modular around the voting use cases: each domain (election, candidate, vote, payment, etc.) has its own module, with controllers, services, entities, DTOs and unit tests.

## Core Modules

### User

Location: `src/core/user`

- **Entity**: system user (voter).
- **UserController**: REST endpoints for CRUD and account operations.
- **UserGateway** (`user.gateway.ts`):
  - Manages user WebSocket connections.
  - Stores and removes socket IDs in cache (Redis) per email.
  - Notifies clients when the account is validated (`email-validated`).

### Auth

Location: `src/shared/modules/auth`

- **AuthModule / AuthService**:
  - Authentication with JWT (`@nestjs/jwt`).
  - HTTP guard (`AuthGuard`) in `src/shared/modules/auth/guards/auth`.

### Election

Location: `src/core/election`

- Manages **elections** (create, list, update).
- Entities, DTOs and repositories to abstract data access.

### Session

Location: `src/core/session`

- **SessionModule / SessionService**:
  - Session logic tied to the voting flow.

### Candidate

Location: `src/core/candidate`

- CRUD for **candidates** associated with elections.

### Ballot Box

Location: `src/core/ballot-box`

- Represents a **ballot box** in an election.
- `BallotBoxGateway` exposes real‑time events to follow voting status.

### Vote

Location: `src/core/vote`

- Stores **votes**.
- `VoteController` and `VoteService` to create and query votes.
- `VoteGateway` for real‑time updates (results, counts, etc.).

### Order & Payment

Location: `src/core/order` and `src/core/payment`

- **OrderModule**: manages purchase orders for votes/credits.
- **PaymentModule**:
  - Interface `IPaymentProvider` in `src/core/payment/providers/index.ts`.
  - Concrete implementation `MercadopagoService` in `src/core/payment/providers/mercadopago`.
  - `PaymentController` and `PaymentService` orchestrate the payment flow (PIX/card payments, status callbacks, etc.).

### Email

Location: `src/shared/modules/email`

- Email service (`EmailService`) using `nodemailer`.
- DTO `SendEmailDto` in `src/shared/modules/email/dto`.

## Configuration & Environment

Configuration is loaded using:

- `src/config/app.config.ts` – general application configuration.
- `src/config/db.config.ts` – MongoDB and Redis URIs.

Key environment variables:

- `mercadopago.accessToken` – Mercado Pago API access token.
- Email settings (address, password) used by `EmailService`.

In the deploy pipeline (`.github/workflows/main.yaml`), environment variables are loaded from a `.env` file created from the `DOTENV` GitHub secret and exported into the workflow environment.

### Environment variables (.env)

Environment variables are read from `src/config/app.config.ts` and `src/config/db.config.ts`.
They are:

- `APP_URL` (default: `http://localhost:3000`)" public URL of the API.
- `NODE_ENV` (default: `development`)" runtime environment.
- `PORT` (default: `3000`)" port where the Nest app listens.
- `SALTS` (default: `5`)" salt rounds for password hashing.
- `CLIENT_URL` (default: `http://localhost:4200`)" front-end URL.
- `JWT_SECRET` (default: `vox`)" secret used to sign JWT tokens.
- `MERCADOPAGO_ACCESS_TOKEN` (**required**)" Mercado Pago API access token.
- `VOTES_PRICE` (default: `10`)" price per vote.
- `EMAIL_ADDRESS` (**required**)" email account used to send emails.
- `EMAIL_PASSWORD` (**required**)" password or app password for the email account.
- `MONGO_URI` (default: `mongodb://localhost:27017/vox`)" MongoDB connection string.
- `REDIS_URI` (default: `redis://127.0.0.1:6379/0`)" Redis connection string.

Example `.env` for local development:

```env
EMAIL_ADDRESS=you@example.com
EMAIL_PASSWORD=your-email-password

MERCADOPAGO_ACCESS_TOKEN=your-mercadopago-token-here
```

## Running the Project

Requirements:

- Node.js (version compatible with `package.json`)
- Yarn
- MongoDB and Redis running

Install dependencies:

```bash
yarn install
```

Development:

```bash
# development (watch mode)
yarn start:dev

# normal start
yarn start

# production build
yarn build

# run built app
yarn start:prod
```

The same commands exist with npm (`npm run start:dev`, etc.), but CI and examples assume Yarn.

## Tests & Quality

This project uses **Jest** for tests and **ESLint + Prettier** for linting/formatting.

Run tests:

```bash
yarn test        # unit tests
yarn test:watch  # watch mode
yarn test:cov    # coverage
```

Run lint:

```bash
yarn lint        # eslint with --fix
```

Tests live next to the modules under `__test__` folders.

## CI/CD & Deploy

Main files:

- GitHub Actions workflow: `.github/workflows/main.yaml`
- Traefik configuration (reverse proxy): `traefik.yml`

### CI Pipeline

On every branch (push/PR):

1. Install dependencies (`yarn install --frozen-lockfile`).
2. Run lint (`yarn lint`).
3. Run tests (`yarn test`).
4. Build the application (`yarn build`).

### Docker Image

When pushing to the `main` branch:

- Job `docker_push`:
  - Builds a Docker image with `docker/build-push-action`.
  - Pushes to Docker Hub as `jpplay/vox-server` with tags `latest` and `sha`.

### Reverse Proxy (Traefik)

The `traefik.yml` file defines the Traefik reverse proxy that sits in front of the serves containers:

- Enables API (`api.insecure`).
- Configures providers:
  - `docker`: reads labels from the containers (labels are set in the `deploy` job).
  - `file`: reads extra configuration from `/etc/traefik/config`.
- Defines entrypoints:
  - `web` (port 80) redirecting to `websecure`.
  - `websecure` (port 443).
- Defines `certificatesResolvers.myresolver` with ACME (Let’s Encrypt) and `tlsChallenge`, referenced in the TLS labels during deploy.

### Deploy

- Job `deploy` runs on a **self‑hosted** runner.
- Main steps:
  - Load `.env` from the `DOTENV` secret and export variables.
  - Login to Docker Hub.
  - Ensure the `traefik-net` Docker network exists.
  - Pull the `jpplay/vox-server:latest` image.
  - Run five containers with Traefik labels:
    - Routing by `DOMAIN` (GitHub secret) on the `websecure` entrypoint.
    - TLS using `certresolver=myresolver` configured in `traefik.yml`.
    - Sticky sessions via the `vox_session` cookie.

## Folder Structure

High‑level overview:

- `src/main.ts` – NestJS bootstrap.
- `src/app.module.ts` – root module; wires config, Mongo, Redis, BullMQ and `CoreModule`.
- `src/config` – app and database configuration.
- `src/core` – domain modules:
  - `ballot-box` – ballot boxes and gateway.
  - `candidate` – candidates.
  - `election` – elections.
  - `order` – orders.
  - `payment` – payments and providers (Mercado Pago).
  - `session` – user session.
  - `user` – users and WebSocket gateway.
  - `vote` – votes, gateway and results.
- `src/shared` – shared modules and utilities:
  - `modules/auth` – authentication and guards.
  - `modules/email` – email service.
  - `adapters` – abstractions (e.g. `web-socket.adapter.ts`).
  - `enums`, `interfaces`, `types` – shared contracts and types.
