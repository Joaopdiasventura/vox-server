# HTTP API

[Documentation Index](README.md) | [Português](../pt/http-api.md)

All endpoints except public user endpoints, `/actuator/health` GET, `/error`, and `/ws/**` require authentication by `SecurityConfig`. `JwtAuthFilter` accepts a JWT from the `Authorization` cookie or an `Authorization: Bearer ...` header.

Errors thrown as `ResponseStatusException` are returned by `ApiExceptionHandler` as `{ "message": "..." }`. Bean Validation errors are not handled by this custom handler.

## User

| Method | Path | Controller | Request | Response | Notes |
| --- | --- | --- | --- | --- | --- |
| POST | `/user` | `UserController.create` | `CreateUserDto` with `@Valid` | String | Public. Hashes password, saves user, emails validation link. |
| POST | `/user/login` | `UserController.login` | `LoginUserDto` with `@Valid` | `UserResponseDto`, sets cookie | Public. Rejects invalid credentials or unvalidated account. |
| POST | `/user/logout` | `UserController.logout` | none | void, clears cookie | Public. |
| GET | `/user` | `UserController.decodeToken` | authenticated principal | `UserResponseDto`, refreshes cookie | Rejects missing auth or unvalidated account. |
| PATCH | `/user` | `UserController.update` | `UpdateUserDto` with `@Valid` | void | Changes email/name/password; changed email resets validation and sends email. |
| PATCH | `/user/validate-account?token=...` | `UserController.validateAccount` | query `token` | `UserResponseDto`, sets cookie | Public. Rejects already validated account. |
| PATCH | `/user/reset-password?email=...` | `UserController.resetPassword` | query `email` | void | Public. Generates temporary password and emails it. |
| DELETE | `/user` | `UserController.delete` | authenticated principal | void | Deletes current user. |

## Elections

| Method | Path | Request | Response | Behavior |
| --- | --- | --- | --- | --- |
| POST | `/election` | `CreateElectionDto(name)` | `ElectionResponseDto` | Uses authenticated user id. Controller does not apply `@Valid`. |
| GET | `/election` | pageable query params | `Page<ElectionResponseDto>` | Lists elections owned by authenticated user. |
| GET | `/election/{id}` | path UUID | `ElectionResponseDto` | Direct id lookup. |
| PATCH | `/election/{id}` | `UpdateElectionDto(name)` | void | Updates non-null name. |
| DELETE | `/election/{id}` | path UUID | void | Deletes found election. |

## Candidates

| Method | Path | Request | Response | Behavior |
| --- | --- | --- | --- | --- |
| POST | `/candidate` | `CreateCandidateDto(name,electionId)` | `CandidateResponseDto` | Resolves election then saves candidate. Controller does not apply `@Valid`. |
| GET | `/candidate/election/{electionId}` | path UUID, pageable | `Page<CandidateResponseDto>` | Verifies election exists then lists candidates. |
| GET | `/candidate/{id}` | path UUID | `CandidateResponseDto` | Direct id lookup. |
| PATCH | `/candidate/{id}` | `UpdateCandidateDto(name)` | void | Updates non-null name. |
| DELETE | `/candidate/{id}` | path UUID | void | Deletes found candidate. |

## Ballots

| Method | Path | Request | Response | Behavior |
| --- | --- | --- | --- | --- |
| POST | `/ballot` | `CreateBallotDto(electionsId,startAt,endAt)` | `BallotResponseDto` | Rejects `startAt >= endAt`, resolves elections, saves closed ballot. |
| GET | `/ballot` | pageable query params | `Page<BallotResponseDto>` | Lists ballots whose elections belong to authenticated user. |
| GET | `/ballot/{id}` | path UUID | `BallotResponseDto` | Direct id lookup. |
| DELETE | `/ballot/{id}` | path UUID | void | Rejects deletion when current time is `>= startAt`. |

## Votes

| Method | Path | Request | Response | Behavior |
| --- | --- | --- | --- | --- |
| POST | `/vote` | `CreateVoteDto(candidateId,ballotId)` | String | Registers vote, closes ballot, publishes close event. |
| GET | `/vote/election/{electionId}/ballot/{ballotId}` | path UUIDs | `List<VoteResultDto>` | Aggregates vote counts grouped by candidate for the ballot/election pair. |
