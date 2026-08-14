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

The current file still sets `KAFKA_BOOTSTRAP_SERVERS` and `REDIS_URL` in the `server` environment, but the application properties shown in this repository do not consume those values. The current file also still has `server.depends_on` entries for `message-br` and `cache`, while those services are no longer defined in `compose.yaml`; as written, the Compose file is inconsistent until those references are removed or the services are restored.

Validation with `docker compose config` currently fails with: `service "server" depends on undefined service "message-br": invalid compose project`.

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

The Docker command above is the intended entry point, but the current `compose.yaml` must be made internally consistent before it can be relied on for a full local container run.
