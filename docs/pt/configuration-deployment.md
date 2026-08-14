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

O arquivo atual ainda define `KAFKA_BOOTSTRAP_SERVERS` e `REDIS_URL` no ambiente do `server`, mas as propriedades da aplicação presentes neste repositório não consomem esses valores. O arquivo atual também ainda possui entradas `server.depends_on` para `message-br` e `cache`, enquanto esses serviços não são mais definidos em `compose.yaml`; como está, o Compose fica inconsistente até que essas referências sejam removidas ou os serviços sejam restaurados.

A validação com `docker compose config` atualmente falha com: `service "server" depends on undefined service "message-br": invalid compose project`.

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

O comando Docker acima é o ponto de entrada pretendido, mas o `compose.yaml` atual precisa ficar internamente consistente antes de ser usado com segurança em uma execução local completa em containers.
