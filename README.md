
FORMAT: 1A
HOST: http://localhost:4200

# API VOX

API de um sistema de urna eletrônica, responsável por gerenciar criações de usuários, grupos, votações e resultados utilizando web view.

# GROUP User

## User [/user]

### Create [POST]

+ Request (application/json)
    + Body

            {
              "name": String,
              "email": String,
              "password": String,
              "isValidEmail": Boolean
            }

+ Response 201 (application/json)
    + Body

            {
                "message": "Conta criada com sucesso",
                "user": userObject,
                "token",
            }

+ Response 400 (application/json)
    + Attributes (Error)  

## Login [/user/login]

### Login [POST]

+ Request (application/json)
    + Body

            {
              "email": String,
              "password": String
            }

+ Response 200 (application/json)
    + Body

            {
                "message": "Login realizado com sucesso",
                "user": userObject,
                "token",
            }

+ Response 400 (application/json)
    + Attributes (Error)  

## DecodeToken [/user/decodeToken/{token}]

### DecodeToken [GET]

+ Parameters
    + token: `jwt.token.aqui` (string) - Token JWT válido

+ Response 200 (application/json)
    + Body

            {
              "id": String,
              "name": String,
              "email": String,
              "isEmailValid": Boolean
            }

+ Response 400 (application/json)
    + Attributes (Error)  

## ValidateEmail [/user/validateEmail/{token}]

### ValidateEmail [PATCH]

+ Parameters
    + token: `verificacao-token` (string) - Validação enviada para o email do usuário

+ Response 200 (application/json)
    + Body

            {
              "mensagem": "Email validado com sucesso"
            }

+ Response 400 (application/json)
    + Attributes (Error)  

## Update [/user/{id}]

### Update [PATCH]

+ Parameters
    + id: `60af7a8f5b5f5b001f1a5d3e` (string) - ID do usuário (Mongo ObjectId)

+ Request (application/json)
    + Headers

            Authorization: Bearer {token}

    + Body

            {
              "name": String,
              "password": String
            }

+ Response 200 (application/json)
    + Body

            {
              "mensagem": "Dados da conta atualizados com sucesso"
            }

+ Response 400 (application/json)
    + Attributes (Error)

### Delete [DELETE]

+ Parameters
    + id: `60af7a8f5b5f5b001f1a5d3e` (string) - ID do usuário (Mongo ObjectId)

+ Request
    + Headers

            Authorization: Bearer {token}

+ Response 200 (application/json)
    + Body

            {
              "mensagem": "Conta removida com sucesso"
            }

# Group Vote

## Create [/vote]

### create [POST]

Registra um novo voto na votação.

+ Request (application/json)
    + Body

            {
              "participant": String,
              "candidate": String,
              "group": String
            }

+ Response 201 (application/json)
    + Body

            {
              "message": "Voto registrado com sucesso"
            }

+ Response 400 (application/json)
    + Body

            {
              "statusCode": 400,
              "message": "Participante não encontrado",
              "error": "Bad Request"
            }

# Group Participant

## Create [/participant]

### create [POST]

Registra um novo participante vinculado a um grupo. Autenticação necessária.

+ Request (application/json)
    + Headers

            Authorization: Bearer {token}

    + Body

            {
              "name": String,
              "group": String
            }

+ Response 201 (application/json)
    + Body

            {
              "message": "Participante registrado com sucesso"
            }

+ Response 400 (application/json)
    + Body

            {
              "statusCode": 400,
              "message": "Grupo não encontrado",
              "error": "Bad Request"
            }


## findAllByGroup [/participant/findAllByGroup/{group}]

### findAllByGroup [GET]

Retorna todos os participantes vinculados a um grupo. Autenticação necessária.

+ Parameters
    + group: `665d4b5ca343f210c8a88589` (string) - ID do grupo

+ Request
    + Headers

            Authorization: Bearer {token}

+ Response 200 (application/json)
    + Body

            [
              {
                "id": Int,
                "name": String,
                "group": String
              }
            ]


## findManyByGroup [/participant/findManyByGroup/{group}/{page}]

### findManyByGroup [GET]

Retorna uma página de participantes de um grupo. Autenticação necessária.

+ Parameters
    + group: `665d4b5ca343f210c8a88589` (string)
    + page: `0` (number)

+ Request
    + Headers

            Authorization: Bearer {token}

+ Response 200 (application/json)
    + Body

            [
              {
                "id": String,
                "name": String,
                "group": String
              }
            ]

## ParticipantById [/participant/{id}]

### update [PATCH]

Atualiza os dados de um participante. Não é permitido alterar o grupo. Autenticação necessária.

+ Parameters
    + id: `60af7a8f5b5f5b001f1a5d3e` (string)

+ Request (application/json)
    + Headers

            Authorization: Bearer {token}

    + Body

            {
              "name": String
            }

+ Response 200 (application/json)
    + Body

            {
              "message": "Participante atualizado com sucesso"
            }


### delete [DELETE]

Remove um participante pelo seu ID. Autenticação necessária.

+ Parameters
    + id: `60af7a8f5b5f5b001f1a5d3e` (string)

+ Request
    + Headers

            Authorization: Bearer {token}

+ Response 200 (application/json)
    + Body

            {
              "message": "Participante removido com sucesso"
            }

# Group Group

## Create [/group]

### create [POST]

Cria um novo grupo. Autenticação obrigatória.

+ Request (application/json)
    + Headers

            Authorization: Bearer {token}

    + Body

            {
              "name": String,
              "user": String,
              "group": String // opcional, caso seja subgrupo
            }

+ Response 201 (application/json)
    + Body

            {
              "message": "Grupo criado com sucesso"
            }

+ Response 400 (application/json)
    + Body

            {
              "statusCode": 400,
              "message": "Usuário ou grupo pai não encontrado",
              "error": "Bad Request"
            }

## findManyByUser [/group/findManyByUser/{user}/{page}]

### findManyByUser [GET]

Lista grupos criados por um usuário, paginados. Autenticação obrigatória.

+ Parameters
    + user: `665d4b5ca343f210c8a88570` (string)
    + page: `0` (number)

+ Request
    + Headers

            Authorization: Bearer {token}

+ Response 200 (application/json)
    + Body

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

+ Parameters
    + group: `665d4b5ca343f210c8a88589` (string)
    + page: `0` (number)

+ Request
    + Headers

            Authorization: Bearer {token}

+ Response 200 (application/json)
    + Body

            [
              {
                "id": String,
                "name": String
              }
            ]

## findAllWithoutSubGroups [/group/findAllWithoutSubGroups/{user}]

### findAllWithoutSubGroups [GET]

Retorna todos os grupos do usuário que não têm subgrupos. Autenticação obrigatória.

+ Parameters
    + user: `665d4b5ca343f210c8a88570` (string)

+ Request
    + Headers

            Authorization: Bearer {token}

+ Response 200 (application/json)
    + Body

            [
              {
                "id": String,
                "name": String
              }
            ]

## findAllWithoutParticipants [/group/findAllWithoutParticipants/{user}]

### findAllWithoutParticipants [GET]

Retorna todos os grupos do usuário que não possuem participantes. Autenticação obrigatória.

+ Parameters
    + user: `665d4b5ca343f210c8a88570` (string)

+ Request
    + Headers

            Authorization: Bearer {token}

+ Response 200 (application/json)
    + Body

            [
              {
                "id": String,
                "name": String
              }
            ]

## findAllWithParticipants [/group/findAllWithParticipants/{user}]

### findAllWithParticipants [GET]

Retorna todos os grupos do usuário que possuem participantes. Autenticação obrigatória.

+ Parameters
    + user: `665d4b5ca343f210c8a88570` (string)

+ Request
    + Headers

            Authorization: Bearer {token}

+ Response 200 (application/json)
    + Body

            [
              {
                "id": String,
                "name": String
              }
            ]

## getResult [/group/getResult/{group}]

### getResult [GET]

Retorna o resultado de votos em um grupo. Autenticação obrigatória.

+ Parameters
    + group: `665d4b5ca343f210c8a88589` (string)

+ Request
    + Headers

            Authorization: Bearer {token}

+ Response 200 (application/json)
    + Body

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

+ Parameters
    + id: `665d4b5ca343f210c8a88589` (string)

+ Request (application/json)
    + Headers

            Authorization: Bearer {token}

    + Body

              {
                "name": String,
                "group": String  // novo grupo pai opcional
              }

+ Response 200 (application/json)
    + Body

            {
              "message": "Grupo atualizado com sucesso"
            }

### delete [DELETE]

Remove um grupo pelo seu ID. Autenticação obrigatória.

+ Parameters
    + id: `665d4b5ca343f210c8a88589` (string)

+ Request
    + Headers

            Authorization: Bearer {token}

+ Response 200 (application/json)
    + Body

            {
              "message": "Grupo deletado com sucesso"
            }

### findById [GET]

Retorna os dados de um grupo. Autenticação obrigatória.

+ Parameters
    + id: `665d4b5ca343f210c8a88589` (string)

+ Request
    + Headers

            Authorization: Bearer {token}

+ Response 200 (application/json)
    + Body

            {
              "id": String,
              "name": String,
              "user":  String
            }

# Data Structures

## Error (object)
+ statusCode: 400 (number)
+ message: "Erro de validação" (string)
+ error: "Bad Request" (string)