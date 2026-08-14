# Configuração e Deployment

[Índice](README.md) | [English](../en/configuration-deployment.md)

## Build

`pom.xml` usa Spring Boot parent `4.0.6`, Java `26` e Spring Cloud `2025.1.1`. As dependências principais incluem actuator, web, security, data JPA, mail, WebSocket, Spring Security Messaging, Spring Cloud Stream, Rabbit binder, driver runtime PostgreSQL, Lombok, Bouncy Castle e dependências de teste para JPA, Security, Web MVC, WebSocket, H2 e Spring Cloud Stream test binder.

## Application Properties

`application.properties` define:

- `server.port=${PORT:8080}`
- defaults de datasource PostgreSQL: `jdbc:postgresql://localhost:5432/vox`, `postgres`, `postgres`
- `spring.jpa.hibernate.ddl-auto=${JPA_DDL_AUTO:update}`
- flags de log SQL via `JPA_SHOW_SQL` e `JPA_FORMAT_SQL`
- endereço RabbitMQ e propriedades de retry de listener
- propriedade de URL Redis
- host, porta, usuário, senha e flags TLS/auth de SMTP
- `app.mail.from`
- `app.instance-id`
- `app.clients.url` separado por ponto e vírgula
- secret e expiração de JWT
- `secure` e `same-site` do cookie

Nenhum Spring profile é definido no código versionado.

## Docker

`Dockerfile` é multi-stage, usando `eclipse-temurin:26-jdk-jammy` nos stages de dependências/package/extract e `eclipse-temurin:26-jre-jammy` na imagem final. Ele roda como usuário não-root `appuser`, expõe `8080` e inicia `org.springframework.boot.loader.launch.JarLauncher`.

`compose.yaml` define:

- `server`, buildado a partir do Dockerfile local e publicado em `8080:8080`.
- `db`, `postgres:17-alpine`, banco `vox`, publicado em `5432:5432`.
- `message-br`, `rabbitmq:4-management`, publicado em `5672` e `15672`.
- `cache`, `redis:8-alpine`, publicado em `6379`.

O server depende de PostgreSQL, RabbitMQ e Redis saudáveis.

## Comandos

Local:

```bash
./mvnw spring-boot:run
```

Testes:

```bash
./mvnw test
```

Docker:

```bash
docker compose up --build
```
