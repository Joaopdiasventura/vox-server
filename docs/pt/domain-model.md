# Modelo de Domínio

[Índice](README.md) | [English](../en/domain-model.md)

## Entidades

`User` é persistido em `users` e identificado por UUID gerado pelo Hibernate em versão 7. Possui `email` único e não nulo, `name` não nulo, `password` não nulo, `createdAt` não nulo e `isValidated` não nulo. `@PrePersist` define `createdAt = Instant.now()` e `isValidated = false`.

`Election` é persistido em `elections` e identificado por UUID v7. Possui `name` não nulo, `createdAt` não nulo e associação lazy `@ManyToOne` com `User` por `fk_user_id`. `@PrePersist` define `createdAt`. A tabela declara o índice `idx__election_user_id` em `fk_user_id`.

`Candidate` é persistido em `candidates` e identificado por UUID v7. Possui `name` não nulo, `createdAt` não nulo e associação eager `@ManyToOne` com `Election` por `fk_election_id`. A tabela declara o índice `idx_candidate_election_id` em `fk_election_id`.

`Ballot` é persistido em `ballots` e identificado por UUID v7. Possui um conjunto eager `@ManyToMany` de eleições pela join table `ballot_election`, `isOpen` não nulo, `startAt` não nulo e `endAt` não nulo. `@PrePersist` define `isOpen = false`. A join table declara o índice `idx_ballot_election_election_ballot` em `fk_election_id, fk_ballot_id`.

`Vote` é persistido em `votes` e identificado por UUID v7. Possui associações eager e não nulas `@ManyToOne` com `Candidate` e `Ballot` por `fk_candidate_id` e `fk_ballot_id`, além de `createdAt` não nulo. `@PrePersist` define `createdAt`. A tabela declara o índice `idx_vote_candidate_ballot_id` em `fk_candidate_id, fk_ballot_id`.

## Modelo de Relacionamentos

```mermaid
erDiagram
    USERS ||--o{ ELECTIONS : owns
    ELECTIONS ||--o{ CANDIDATES : has
    BALLOTS }o--o{ ELECTIONS : contains
    BALLOTS ||--o{ VOTES : receives
    CANDIDATES ||--o{ VOTES : receives

    USERS {
        uuid id PK
        string email UK
        string name
        string password
        instant created_at
        boolean is_validated
    }
    ELECTIONS {
        uuid id PK
        string name
        uuid fk_user_id FK
        instant created_at
    }
    CANDIDATES {
        uuid id PK
        string name
        uuid fk_election_id FK
        instant created_at
    }
    BALLOTS {
        uuid id PK
        boolean is_open
        instant start_at
        instant end_at
    }
    VOTES {
        uuid id PK
        uuid fk_candidate_id FK
        uuid fk_ballot_id FK
        instant created_at
    }
```

O código não define operações de cascade nesses relacionamentos. Também não define campos de versão otimista nem constraints de unicidade para votos por urna.
