# Validation and Invariants

[Documentation Index](README.md) | [Português](../pt/validation-invariants.md)

## Vote Preconditions

Preconditions for `VoteService.create`:

- Candidate id must resolve through `CandidateService.findById`; otherwise `404`.
- Ballot id must resolve through `BallotService.findByIdLocked`; otherwise `404`.
- Candidate's election id must be present in `ballot.getElections()`; otherwise `400`.
- `ballot.isOpen` must be `true`; otherwise `400`.
- Current time must be greater than or equal to `startAt`; otherwise `400`.
- Current time must be less than or equal to `endAt`; otherwise `400`.

Operation: create and save a `Vote`, then set the ballot closed through `BallotService.changeState(ballotId, false)`.

Postconditions on the successful service path: one `Vote` entity is saved for the candidate/ballot pair, the ballot is assigned `isOpen=false`, and a `CLOSED` `BallotEvent` is sent to `/topic/ballot/{id}`.

## Ballot Preconditions

`BallotService.create` requires `startAt < endAt`. The service resolves every election id before saving the ballot. `Ballot.prePersist` makes new ballots closed.

`BallotService.delete` requires current time to be before `startAt`.

`BallotService.changeState` only requires that the ballot exists. It does not validate the time window before opening or closing.

## User Preconditions

`UserController` applies Bean Validation to create, login, and update DTOs. The create and login password pattern requires at least one lowercase letter, one uppercase letter, one digit, and one special character from the configured character class.

`UserService.create` and changed-email updates call `validateEmail`, which rejects an email already returned by `UserRepository.findByEmail`. The `users.email` column is also unique.

Login and token refresh reject users whose `isValidated` is false. `validateAccount` rejects an already validated user.

## Constraints Not Implemented as Invariants

The code does not enforce ownership checks on direct `GET /election/{id}`, `PATCH /election/{id}`, `DELETE /election/{id}`, candidate mutations, ballot direct lookup, vote creation, or result lookup beyond global authentication.

The code does not enforce one vote per ballot with a unique database constraint. The implemented prevention for repeated voting on the same ballot is the service flow that locks and closes the ballot.

The code does not validate `CreateBallotDto` fields with Bean Validation annotations and the controller does not use `@Valid` for ballot creation.
