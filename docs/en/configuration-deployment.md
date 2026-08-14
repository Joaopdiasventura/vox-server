# Configuration and Deployment

[Documentation Index](README.md) | [Português](../pt/configuration-deployment.md)

## Build

`pom.xml` uses Spring Boot parent `4.0.6`, Java `26`, and Spring Cloud `2025.1.1`. Main dependencies include actuator, web, security, data JPA, mail, WebSocket, Spring Security Messaging, Spring Cloud Stream, Rabbit binder, PostgreSQL runtime driver, Lombok, Bouncy Castle, and test dependencies for JPA, Security, Web MVC, WebSocket, H2, and Spring Cloud Stream test binder.

## Application Properties

`application.properties` defines:

- `server.port=${PORT:8080}`
- PostgreSQL datasource defaults: `jdbc:postgresql://localhost:5432/vox`, `postgres`, `postgres`
- `spring.jpa.hibernate.ddl-auto=${JPA_DDL_AUTO:update}`
- SQL logging flags through `JPA_SHOW_SQL` and `JPA_FORMAT_SQL`
- RabbitMQ address and listener retry properties
- Redis URL property
- SMTP host, port, username, password, and TLS/auth flags
- `app.mail.from`
- `app.instance-id`
- semicolon-separated `app.clients.url`
- JWT secret and expiration
- cookie `secure` and `same-site`

No Spring profiles are defined in the checked source.

## Docker

`Dockerfile` is a multi-stage build using `eclipse-temurin:26-jdk-jammy` for dependency/package/extract stages and `eclipse-temurin:26-jre-jammy` for the final image. It runs as non-root `appuser`, exposes `8080`, and starts `org.springframework.boot.loader.launch.JarLauncher`.

`compose.yaml` defines:

- `server`, built from the local Dockerfile and published on `8080:8080`.
- `db`, `postgres:17-alpine`, database `vox`, published on `5432:5432`.
- `message-br`, `rabbitmq:4-management`, published on `5672` and `15672`.
- `cache`, `redis:8-alpine`, published on `6379`.

The server depends on healthy PostgreSQL, RabbitMQ, and Redis services.

## Commands

Local:

```bash
./mvnw spring-boot:run
```

Tests:

```bash
./mvnw test
```

Docker:

```bash
docker compose up --build
```
