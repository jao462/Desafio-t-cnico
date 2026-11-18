# Online Course Manager

A full-stack course management application built with Node.js, Express, React and PostgreSQL.

## Features

- CRUD for users, courses, modules and lesson contents.
- UUID primary keys and relational foreign keys.
- Course and module creator tracking through `user_id`.
- Knex migrations and seeders.
- Lesson viewing progress (`content_progress`).
- Five SQL reports exposed through the API and React dashboard.
- Swagger documentation and a Postman collection.
- Docker Compose environment for PostgreSQL and the API.

## Requirements

- Docker Desktop with WSL2 integration (Windows) or Docker Engine and Docker Compose.
- Node.js 20+ and npm (only needed for running the React frontend locally).

## Run with Docker

1. Copy `.env.example` to `.env` in the project root.
2. Start the database and API:

   ```bash
   docker compose up --build
   ```

3. The API is available at `http://localhost:3001` and Swagger at `http://localhost:3001/api-docs`.
4. Open the frontend at `http://localhost:5173`. Docker Compose starts the React development server together with the database and API.

The API container runs migrations and seeders when it starts. The frontend is served by its own container. The seed command resets and recreates the sample records, so avoid restarting it if you need to preserve manually entered data. For development, run the seed command only when you want to reset the sample data.

## Run locally without Docker for the API

1. Create a PostgreSQL database and configure `DATABASE_URL` in `backend/.env`.
2. Install dependencies and run migrations and seeders:

   ```bash
   cd backend
   npm install
   npm run migrate
   npm run seed
   npm run dev
   ```

3. In another terminal, start the frontend as described above.

## Environment variables

| Variable | Description | Default |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | `postgres://course_user:course_password@localhost:5432/course_manager` |
| `PORT` | API port | `3001` |
| `POSTGRES_DB` | Docker database name | `course_manager` |
| `POSTGRES_USER` | Docker database user | `course_user` |
| `POSTGRES_PASSWORD` | Docker database password | `course_password` |

## API routes

| Resource | Routes |
|---|---|
| Users | `GET/POST /api/users`, `GET/PUT/DELETE /api/users/:id` |
| Courses | `GET/POST /api/courses`, `GET/PUT/DELETE /api/courses/:id` |
| Modules | `GET/POST /api/modules`, `GET/PUT/DELETE /api/modules/:id` |
| Contents | `GET/POST /api/contents`, `GET/PUT/DELETE /api/contents/:id` |
| Progress | `GET/POST /api/progress`, `DELETE /api/progress/:id` |
| Reports | See `/api/reports/*` routes and Swagger |

## Database design

- One user can create many courses.
- One course contains many modules.
- One user can create many modules.
- One module contains one or more lesson contents (the application supports adding lessons to modules).
- Users and contents have a many-to-many viewing relationship through `content_progress`.

The brief asks for five records in each table and also gives three sample course structures with module/lesson quantities that do not all fit a strict five-row limit. The seeder prioritizes the requested three course structures, keeps five users and five courses, and adds two small courses so that there are at least five records in the main tables. To preserve the rule that each module must have one or more contents, the requested lesson quantities (3, 5 and 4) are interpreted as lessons per module for the first three courses. This creates 12 modules and 40 contents in total.

## Reports

The SQL statements are in `backend/sql/reports.sql`. The application exposes:

- `GET /api/reports/users-courses`
- `GET /api/reports/courses-content-count`
- `GET /api/reports/courses-summary`
- `GET /api/reports/contents-with-course`
- `GET /api/reports/content-2-viewers?contentId=<uuid>`

**UUID note:** PostgreSQL IDs are UUIDs, not sequential integers. Therefore, “content ID = 2” from the brief is implemented as selecting a content UUID in the report screen (or passing its UUID in `contentId`). This avoids using invalid numeric IDs with UUID primary keys.

## Lesson viewing tracking

The `content_progress` table records `user_id`, `content_id` and `watched_at`. A unique constraint prevents duplicate progress rows for the same user and lesson. Use `POST /api/progress` with `{ "user_id": "...", "content_id": "..." }` to mark a lesson as watched.

## Postman

Import `backend/postman/Online-Course-Manager.postman_collection.json` into Postman. Set the collection variables to valid UUIDs from the seeded records before running requests that require IDs.

## Deployment

The project includes a Dockerfile and can be deployed to a container platform. Heroku deployment requires a Heroku account, a provisioned PostgreSQL add-on, configured environment variables and a deployment pipeline. No live deployment is included because it requires access to the owner's hosting account.
