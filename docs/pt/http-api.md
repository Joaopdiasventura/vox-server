# API HTTP

[Índice](README.md) | [English](../en/http-api.md)

Todos os endpoints, exceto endpoints públicos de usuário, `GET /actuator/health`, `/error` e `/ws/**`, exigem autenticação por `SecurityConfig`. `JwtAuthFilter` aceita JWT pelo cookie `Authorization` ou por header `Authorization: Bearer ...`.

Erros lançados como `ResponseStatusException` são retornados por `ApiExceptionHandler` como `{ "message": "..." }`. Erros de Bean Validation não são tratados por esse handler customizado.

## User

| Método | Path | Controller | Request | Response | Observações |
| --- | --- | --- | --- | --- | --- |
| POST | `/user` | `UserController.create` | `CreateUserDto` com `@Valid` | String | Público. Faz hash da senha, salva usuário e envia link de validação. |
| POST | `/user/login` | `UserController.login` | `LoginUserDto` com `@Valid` | `UserResponseDto`, define cookie | Público. Rejeita credenciais inválidas ou conta não validada. |
| POST | `/user/logout` | `UserController.logout` | nenhum | void, limpa cookie | Público. |
| GET | `/user` | `UserController.decodeToken` | principal autenticado | `UserResponseDto`, renova cookie | Rejeita ausência de auth ou conta não validada. |
| PATCH | `/user` | `UserController.update` | `UpdateUserDto` com `@Valid` | void | Altera email/nome/senha; email alterado reseta validação e envia email. |
| PATCH | `/user/validate-account?token=...` | `UserController.validateAccount` | query `token` | `UserResponseDto`, define cookie | Público. Rejeita conta já validada. |
| PATCH | `/user/reset-password?email=...` | `UserController.resetPassword` | query `email` | void | Público. Gera senha temporária e envia por email. |
| DELETE | `/user` | `UserController.delete` | principal autenticado | void | Exclui usuário atual. |

## Elections

| Método | Path | Request | Response | Comportamento |
| --- | --- | --- | --- | --- |
| POST | `/election` | `CreateElectionDto(name)` | `ElectionResponseDto` | Usa o id do usuário autenticado. Controller não aplica `@Valid`. |
| GET | `/election` | query params de pageable | `Page<ElectionResponseDto>` | Lista eleições do usuário autenticado. |
| GET | `/election/{id}` | UUID no path | `ElectionResponseDto` | Busca direta por id. |
| PATCH | `/election/{id}` | `UpdateElectionDto(name)` | void | Atualiza nome não nulo. |
| DELETE | `/election/{id}` | UUID no path | void | Exclui eleição encontrada. |

## Candidates

| Método | Path | Request | Response | Comportamento |
| --- | --- | --- | --- | --- |
| POST | `/candidate` | `CreateCandidateDto(name,electionId)` | `CandidateResponseDto` | Resolve eleição e salva candidato. Controller não aplica `@Valid`. |
| GET | `/candidate/election/{electionId}` | UUID no path, pageable | `Page<CandidateResponseDto>` | Verifica eleição e lista candidatos. |
| GET | `/candidate/{id}` | UUID no path | `CandidateResponseDto` | Busca direta por id. |
| PATCH | `/candidate/{id}` | `UpdateCandidateDto(name)` | void | Atualiza nome não nulo. |
| DELETE | `/candidate/{id}` | UUID no path | void | Exclui candidato encontrado. |

## Ballots

| Método | Path | Request | Response | Comportamento |
| --- | --- | --- | --- | --- |
| POST | `/ballot` | `CreateBallotDto(electionsId,startAt,endAt)` | `BallotResponseDto` | Rejeita `startAt >= endAt`, resolve eleições e salva urna fechada. |
| GET | `/ballot` | query params de pageable | `Page<BallotResponseDto>` | Lista urnas cujas eleições pertencem ao usuário autenticado. |
| GET | `/ballot/{id}` | UUID no path | `BallotResponseDto` | Busca direta por id. |
| DELETE | `/ballot/{id}` | UUID no path | void | Rejeita exclusão quando horário atual é `>= startAt`. |

## Votes

| Método | Path | Request | Response | Comportamento |
| --- | --- | --- | --- | --- |
| POST | `/vote` | `CreateVoteDto(candidateId,ballotId)` | String | Registra voto, fecha urna e publica evento de fechamento. |
| GET | `/vote/election/{electionId}/ballot/{ballotId}` | UUIDs no path | `List<VoteResultDto>` | Agrega contagem de votos agrupada por candidato para o par urna/eleição. |
