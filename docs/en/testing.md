# Testing

[Documentation Index](README.md) | [Português](../pt/testing.md)

Tests are under `src/test/java/dev/joaopdias/vox`. The suite is mostly JUnit 5 unit tests with Mockito and AssertJ. H2 is present as a test dependency, but the observed repository test for `UserRepository` checks the interface contract by reflection rather than connecting to a database.

## Covered Areas

Entity tests cover DTO mapping and `@PrePersist` behavior for `User`, `Election`, `Candidate`, `Ballot`, and `Vote`.

DTO tests cover record field preservation and Bean Validation constraints for user, election, and candidate DTOs. `BallotDtoValidationTest` verifies record fields but not Bean Validation constraints, because `CreateBallotDto` has none.

Service tests cover user lifecycle behavior, election creation/list/update/delete, candidate creation/list/update/delete, ballot creation/date validation/list/delete, and vote validation/persistence/result delegation. `VoteServiceTest` exercises the current vote path with `BallotService.findByIdLocked(...)` and a candidate election that belongs to the ballot election set.

Controller tests verify delegation for user, election, candidate, ballot, and vote controllers. They instantiate controllers directly rather than running full HTTP integration tests.

Security/config tests cover public endpoint matching, health/error endpoint matchers, JWT filter registration, CORS origin parsing, JWT filter behavior, authenticated principal shape, `SecurityService`, `MailService`, and `ApiExceptionHandler`.

## Observable Gaps

There are no dedicated concurrency tests for the pessimistic ballot lock. There are no integration tests that exercise PostgreSQL locking behavior, generated schema constraints, STOMP authorization, or actual WebSocket message delivery.

The tests mostly validate Java-level delegation and service behavior. They do not serve as an end-to-end HTTP API contract suite.

## Command

```bash
./mvnw test
```

Latest local execution:

```text
Tests run: 135, Failures: 0, Errors: 0, Skipped: 0
BUILD SUCCESS
```

Maven still reports a non-failing model warning because `spring-boot-starter-security-test` is declared twice in `pom.xml`. The test run also prints Mockito/JDK dynamic-agent warnings; they did not fail the build.
