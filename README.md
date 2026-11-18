# Gerenciador de Cursos Online

Uma aplicação full-stack para gerenciamento de cursos online, desenvolvida com Node.js, Express, React e PostgreSQL.

## Funcionalidades

- CRUD (criação, consulta, edição e exclusão) de usuários, cursos, módulos e conteúdos das aulas.
- Chaves primárias UUID e chaves estrangeiras para relacionamentos entre as tabelas.
- Identificação do usuário responsável pela criação dos cursos e módulos por meio do campo `user_id`.
- Migrations e Seeders utilizando Knex.js.
- Acompanhamento do progresso de visualização das aulas (`content_progress`).
- Cinco relatórios SQL disponibilizados pela API e pelo painel React.
- Documentação da API com Swagger e coleção de requisições do Postman.
- Ambiente Docker Compose para PostgreSQL e API.

## Requisitos

- Docker Desktop com integração WSL2 (Windows) ou Docker Engine e Docker Compose.
- Node.js 20 ou superior e npm (necessários apenas para executar o frontend React localmente).

## Executando com Docker

1. Copie o arquivo `.env.example` para `.env` na pasta principal do projeto.
2. Inicie o banco de dados e a API:

   ```bash
   docker compose up --build
   ```

3. A API estará disponível em `http://localhost:3001` e a documentação Swagger em `http://localhost:3001/api-docs`.
4. Acesse o frontend em `http://localhost:5173`. O Docker Compose inicia o servidor de desenvolvimento React junto com o banco de dados e a API.

O container da API executa as migrations e os seeders ao iniciar. O frontend é disponibilizado por seu próprio container.

O comando de seed reinicia e recria os registros de exemplo. Portanto, evite executá-lo novamente caso queira preservar dados inseridos manualmente. Durante o desenvolvimento, execute esse comando somente quando desejar restaurar os dados de exemplo.

## Executando localmente sem Docker (API)

1. Crie um banco de dados PostgreSQL e configure a variável `DATABASE_URL` no arquivo `backend/.env`.
2. Instale as dependências e execute as migrations e os seeders:

   ```bash
   cd backend
   npm install
   npm run migrate
   npm run seed
   npm run dev
   ```

3. Em outro terminal, inicie o frontend conforme as instruções anteriores.

## Variáveis de ambiente

| Variável | Descrição | Valor padrão |
|---|---|---|
| `DATABASE_URL` | String de
## Deployment

The project includes a Dockerfile and can be deployed to a container platform. Heroku deployment requires a Heroku account, a provisioned PostgreSQL add-on, configured environment variables and a deployment pipeline. No live deployment is included because it requires access to the owner's hosting account.
