# Validações e Invariantes

[Índice](README.md) | [English](../en/validation-invariants.md)

## Preconditions de Voto

Preconditions para `VoteService.create`:

- O id do candidato deve resolver por `CandidateService.findById`; caso contrário, `404`.
- O id da urna deve resolver por `BallotService.findByIdLocked`; caso contrário, `404`.
- O id da eleição do candidato deve estar em `ballot.getElections()`; caso contrário, `400`.
- `ballot.isOpen` deve ser `true`; caso contrário, `400`.
- O horário atual deve ser maior ou igual a `startAt`; caso contrário, `400`.
- O horário atual deve ser menor ou igual a `endAt`; caso contrário, `400`.

Operação: criar e salvar um `Vote`, depois fechar a urna por `BallotService.changeState(ballotId, false)`.

Postconditions no caminho bem-sucedido do service: uma entity `Vote` é salva para o par candidato/urna, a urna recebe `isOpen=false`, e um `BallotEvent` `CLOSED` é enviado para `/topic/ballot/{id}`.

## Preconditions de Urna

`BallotService.create` exige `startAt < endAt`. O service resolve todos os ids de eleição antes de salvar a urna. `Ballot.prePersist` cria novas urnas fechadas.

`BallotService.delete` exige que o horário atual seja anterior a `startAt`.

`BallotService.changeState` exige apenas que a urna exista. Ele não valida janela temporal antes de abrir ou fechar.

## Preconditions de Usuário

`UserController` aplica Bean Validation aos DTOs de create, login e update. O pattern de senha em create e login exige ao menos uma letra minúscula, uma maiúscula, um dígito e um caractere especial da classe configurada.

`UserService.create` e updates com alteração de email chamam `validateEmail`, que rejeita email já retornado por `UserRepository.findByEmail`. A coluna `users.email` também é única.

Login e refresh de token rejeitam usuários com `isValidated=false`. `validateAccount` rejeita usuário já validado.

## Constraints Não Implementadas como Invariantes

O código não aplica checagens de ownership em `GET /election/{id}`, `PATCH /election/{id}`, `DELETE /election/{id}`, mutações de candidatos, busca direta de urna, criação de voto ou busca de resultado além da autenticação global.

O código não impõe um voto por urna com constraint única no banco. A prevenção implementada para repetição de voto na mesma urna é o fluxo de service que bloqueia e fecha a urna.

O código não valida campos de `CreateBallotDto` com Bean Validation, e o controller não usa `@Valid` na criação de urna.
