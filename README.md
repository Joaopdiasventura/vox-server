FORMAT: 1A
HOST: http://localhost:4200

# API VOX

API de um sistema de urna eletrônica, responsável por gerenciar criações de usuários, grupos, votações e resultados.

# Group User

## User [/user]

### Create [POST]

- Request (application/json)
  - Body

          {
            "name": String,
            "email": String,
            "password": String,
          }

- Response 201 (application/json)
  - Body

          {
              "message": "Conta criada com sucesso",
              "user": User,
              "token",
          }

- Response 400 (application/json)
  - Attributes (Error)

## Login [/user/login]

### Login [POST]

- Request (application/json)
  - Body

          {
            "email": String,
            "password": String
          }

- Response 200 (application/json)
  - Body

          {
              "message": "Login realizado com sucesso",
              "user": User,
              "token": String,
          }

- Response 400 (application/json)
  - Attributes (Error)

## DecodeToken [/user/decodeToken/{token}]

### DecodeToken [GET]

- Parameters
  - token: Token JWT válido

- Response 200 (application/json)
  - Body

          {
            "_id": String,
            "name": String,
            "email": String,
            "isEmailValid": Boolean
          }

- Response 400 (application/json)
  - Attributes (Error)

## ValidateEmail [/user/validateEmail/{token}]

### ValidateEmail [PATCH]

- Parameters
  - token: Token JWT válido

- Response 200 (application/json)
  - Body

          {
            "mensagem": "Email validado com sucesso"
          }

- Response 400 (application/json)
  - Attributes (Error)

## Update [/user/{id}]

### Update [PATCH]

- Parameters
  - id: `60af7a8f5b5f5b001f1a5d3e` (string) - ID do usuário (Mongo ObjectId)

- Request (application/json)
  - Headers

          Authorization: Bearer {token}

  - Body

          {
            "name": String,
            "password": String
          }

- Response 200 (application/json)
  - Body

          {
            "mensagem": "Dados da conta atualizados com sucesso"
          }

- Response 400 (application/json)
  - Attributes (Error)

### Delete [DELETE]

- Parameters
  - id: `60af7a8f5b5f5b001f1a5d3e` (string) - ID do usuário (Mongo ObjectId)

- Request
  - Headers

          Authorization: Bearer {token}

- Response 200 (application/json)
  - Body

          {
            "mensagem": "Conta removida com sucesso"
          }

# Group Pool

## Create [/pool]

### create [POST]

Cria uma nova votação onde todos os votos serão atrelados a grupos de candidatos. 

- Request (application/json)
  - Body

          {
            "group": String,
            "start": Date,
            "end": Date,
          }

- Response 201 (application/json)
  - Body

          {
            "message": "Votação criada com sucesso"
          }

- Response 400 (application/json)
  - Body

          {
            "statusCode": 400,
            "message": "grupo não encontrado",
            "error": "Bad Request"
          }

- 

# Group Vote

## Create [/vote]

### create [POST]

Registra um novo voto na votação.

- Request (application/json)
  - Body

          {
            "pool": String
            "candidate"?: String,
          }

- Response 201 (application/json)
  - Body

          {
            "message": "Voto registrado com sucesso"
          }

- Response 400 (application/json)
  - Body

          {
            "statusCode": 400,
            "message": "candidato não encontrado",
            "error": "Bad Request"
          }

# Group Candidate

## Create [/Candidate]

### create [POST]

Registra um novo candidato vinculado a um grupo. Autenticação necessária.

- Request (application/json)
  - Headers

          Authorization: Bearer {token}

  - Body

          {
            "name": String,
            "group"?: String
          }

- Response 201 (application/json)
  - Body

          {
            "message": "candidato registrado com sucesso"
          }

- Response 400 (application/json)
  - Body

          {
            "statusCode": 400,
            "message": "Grupo não encontrado",
            "error": "Bad Request"
          }

## findAllByGroup [/Candidate/findAllByGroup/{group}]

### findAllByGroup [GET]

Retorna todos os candidatos vinculados a um grupo. Autenticação necessária.

- Parameters
  - group: `665d4b5ca343f210c8a88589` (string) - ID do grupo

- Request
  - Headers

          Authorization: Bearer {token}

- Response 200 (application/json)
  - Body

          [
            {
              "id": Int,
              "name": String,
              "group": String
            }
          ]

## findManyByGroup [/Candidate/findManyByGroup/{group}/{page}]

### findManyByGroup [GET]

Retorna uma página de candidatos de um grupo. Autenticação necessária.

- Parameters
  - group: `665d4b5ca343f210c8a88589` (string)
  - page: `0` (number)

- Request
  - Headers

          Authorization: Bearer {token}

- Response 200 (application/json)
  - Body

          [
            {
              "id": String,
              "name": String,
              "group": String
            }
          ]

## CandidateById [/Candidate/{id}]

### update [PATCH]

Atualiza os dados de um candidato. Não é permitido alterar o grupo. Autenticação necessária.

- Parameters
  - id: `60af7a8f5b5f5b001f1a5d3e` (string)

- Request (application/json)
  - Headers

          Authorization: Bearer {token}

  - Body

          {
            "name": String
          }

- Response 200 (application/json)
  - Body

          {
            "message": "candidato atualizado com sucesso"
          }

### delete [DELETE]

Remove um candidato pelo seu ID. Autenticação necessária.

- Parameters
  - id: `60af7a8f5b5f5b001f1a5d3e` (string)

- Request
  - Headers

          Authorization: Bearer {token}

- Response 200 (application/json)
  - Body

          {
            "message": "candidato removido com sucesso"
          }

# Group Group

## Create [/group]

### create [POST]

Cria um novo grupo. Autenticação obrigatória.

- Request (application/json)
  - Headers

          Authorization: Bearer {token}

  - Body

          {
            "name": String,
            "user": String,
            "group": String // opcional, caso seja subgrupo
          }

- Response 201 (application/json)
  - Body

          {
            "message": "Grupo criado com sucesso"
          }

- Response 400 (application/json)
  - Body

          {
            "statusCode": 400,
            "message": "Usuário ou grupo pai não encontrado",
            "error": "Bad Request"
          }

## findManyByUser [/group/findManyByUser/{user}/{page}]

### findManyByUser [GET]

Lista grupos criados por um usuário, paginados. Autenticação obrigatória.

- Parameters
  - user: `665d4b5ca343f210c8a88570` (string)
  - page: `0` (number)

- Request
  - Headers

          Authorization: Bearer {token}

- Response 200 (application/json)
  - Body

          [
            {
              "id": String,
              "name": String
            },
            {
              "id": String,
              "name": String
            }
          ]

## findManyByGroup [/group/findManyByGroup/{group}/{page}]

### findManyByGroup [GET]

Lista subgrupos de um grupo, paginados. Autenticação obrigatória.

- Parameters
  - group: `665d4b5ca343f210c8a88589` (string)
  - page: `0` (number)

- Request
  - Headers

          Authorization: Bearer {token}

- Response 200 (application/json)
  - Body

          [
            {
              "id": String,
              "name": String
            }
          ]

## findAllWithoutSubGroups [/group/findAllWithoutSubGroups/{user}]

### findAllWithoutSubGroups [GET]

Retorna todos os grupos do usuário que não têm subgrupos. Autenticação obrigatória.

- Parameters
  - user: `665d4b5ca343f210c8a88570` (string)

- Request
  - Headers

          Authorization: Bearer {token}

- Response 200 (application/json)
  - Body

          [
            {
              "id": String,
              "name": String
            }
          ]

## findAllWithoutCandidates [/group/findAllWithoutCandidates/{user}]

### findAllWithoutCandidates [GET]

Retorna todos os grupos do usuário que não possuem candidatos. Autenticação obrigatória.

- Parameters
  - user: `665d4b5ca343f210c8a88570` (string)

- Request
  - Headers

          Authorization: Bearer {token}

- Response 200 (application/json)
  - Body

          [
            {
              "id": String,
              "name": String
            }
          ]

## findAllWithCandidates [/group/findAllWithCandidates/{user}]

### findAllWithCandidates [GET]

Retorna todos os grupos do usuário que possuem candidatos. Autenticação obrigatória.

- Parameters
  - user: `665d4b5ca343f210c8a88570` (string)

- Request
  - Headers

          Authorization: Bearer {token}

- Response 200 (application/json)
  - Body

          [
            {
              "id": String,
              "name": String
            }
          ]

## getResult [/group/getResult/{group}]

### getResult [GET]

Retorna o resultado de votos em um grupo. Autenticação obrigatória.

- Parameters
  - group: `665d4b5ca343f210c8a88589` (string)

- Request
  - Headers

          Authorization: Bearer {token}

- Response 200 (application/json)
  - Body

          {
            "groupId": "665d4b5ca343f210c8a88589",
            "totalVotes": 50,
            "results": [
              { "candidate": "Candidato 1", "votes": 30 },
              { "candidate": "Candidato 2", "votes": 20 }
            ]
          }

## GroupById [/group/{id}]

### update [PATCH]

Atualiza informações do grupo. Autenticação obrigatória.

- Parameters
  - id: `665d4b5ca343f210c8a88589` (string)

- Request (application/json)
  - Headers

          Authorization: Bearer {token}

  - Body

            {
              "name": String,
              "group": String  // novo grupo pai opcional
            }

- Response 200 (application/json)
  - Body

          {
            "message": "Grupo atualizado com sucesso"
          }

### delete [DELETE]

Remove um grupo pelo seu ID. Autenticação obrigatória.

- Parameters
  - id: `665d4b5ca343f210c8a88589` (string)

- Request
  - Headers

          Authorization: Bearer {token}

- Response 200 (application/json)
  - Body

          {
            "message": "Grupo deletado com sucesso"
          }

### findById [GET]

Retorna os dados de um grupo. Autenticação obrigatória.

- Parameters
  - id: `665d4b5ca343f210c8a88589` (string)

- Request
  - Headers

          Authorization: Bearer {token}

- Response 200 (application/json)
  - Body

          {
            "id": String,
            "name": String,
            "user":  String
          }

# Data Structures

## Error (object)

- statusCode: (number)
- message: (string)
- error: (string)
