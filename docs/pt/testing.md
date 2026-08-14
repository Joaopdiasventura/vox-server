# Testes

[Índice](README.md) | [English](../en/testing.md)

Os testes ficam em `src/test/java/dev/joaopdias/vox`. A suíte é composta principalmente por testes unitários JUnit 5 com Mockito e AssertJ. H2 está presente como dependência de teste, mas o teste observado de `UserRepository` verifica o contrato da interface por reflection, sem conectar a um banco.

## Áreas Cobertas

Testes de entities cobrem mapeamento para DTO e comportamento de `@PrePersist` para `User`, `Election`, `Candidate`, `Ballot` e `Vote`.

Testes de DTO cobrem preservação de campos de records e constraints de Bean Validation para DTOs de user, election e candidate. `BallotDtoValidationTest` verifica campos do record, mas não Bean Validation, porque `CreateBallotDto` não possui constraints.

Testes de services cobrem ciclo de vida de user, criação/listagem/update/delete de election, criação/listagem/update/delete de candidate, criação/validação de datas/listagem/delete de ballot e validação/persistência/delegação de resultado de vote. `VoteServiceTest` exercita o caminho atual de voto com `BallotService.findByIdLocked(...)` e uma eleição de candidato pertencente ao set de eleições da urna.

Testes de controllers verificam delegação nos controllers de user, election, candidate, ballot e vote. Eles instanciam controllers diretamente em vez de rodar testes HTTP de integração.

Testes de security/config cobrem identificação de endpoints públicos, matchers de health/error, registro do filtro JWT, parsing de CORS origins, comportamento do JWT filter, formato do principal autenticado, `SecurityService`, `MailService` e `ApiExceptionHandler`.

## Lacunas Observáveis

Não há testes dedicados de concorrência para o lock pessimista da urna. Não há testes de integração exercitando comportamento de lock no PostgreSQL, constraints do schema gerado, autorização STOMP ou entrega real de mensagens WebSocket.

Os testes validam principalmente delegação Java e comportamento de services. Eles não funcionam como uma suíte end-to-end de contrato HTTP.

## Comando

```bash
./mvnw test
```

Última execução local:

```text
Tests run: 135, Failures: 0, Errors: 0, Skipped: 0
BUILD SUCCESS
```

O Maven ainda reporta um warning não bloqueante de modelo porque `spring-boot-starter-security-test` está declarado duas vezes em `pom.xml`. A execução também imprime warnings de Mockito/JDK sobre dynamic agent; eles não falharam o build.
