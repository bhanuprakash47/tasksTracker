# Tasks Tracker

This project is a full-stack task manager where users can register, log in, and manage their own tasks.

## Live Demo

[View Live Application](https://tasks-tracker-ruby.vercel.app)


## Features

- User registration and login
- JWT-based protected backend routes
- Task CRUD operations (create, read, update, delete)
- Task fields: title, description, status, priority, due date
- Filter tasks by status and priority
- Sort tasks by due date and priority
- Search tasks by title on the frontend
- Pagination support in backend task listing

## Tech Stack

This project uses:

- Frontend: React, Vite, Axios, React Router, js-cookie
- Backend: Node.js, Express, Mongoose
- Database: MongoDB
- Authentication: bcrypt, JSON Web Token (`jsonwebtoken`)

## Project Structure

```text
TasksTracker/
├── backend/
│   ├── controllers/
│   │   ├── task.controller.js
│   │   └── user.controller.js
│   ├── middlewares/
│   │   └── auth.middleware.js
│   ├── models/
│   │   ├── Task.js
│   │   └── User.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   └── taskRoutes.js
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Login/
│   │   │   ├── Register/
│   │   │   ├── TaskItem/
│   │   │   └── Tasks/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
└── README.md
```

## How It Works

1. User signs up or logs in.
2. Backend validates credentials and returns a JWT.
3. Frontend stores the JWT in a cookie named `token`.
4. Frontend sends `Authorization: Bearer <token>` to protected task APIs.
5. Backend middleware verifies token and sets `req.user`.
6. Task queries are always tied to the logged-in user ID.

## Design Decisions

- JWT + Bearer token: chosen to keep backend auth stateless and simple.
- Password hashing with bcrypt: passwords are never stored in plain text.
- Separate auth and task route files: keeps backend code easier to maintain.
- User-scoped task queries: prevents users from reading or editing others' tasks.
- Priority sorting in MongoDB aggregation: gives consistent HIGH/MEDIUM/LOW ordering.
- Cookie-based token storage in frontend: easy access for route protection and API calls.

## Installation

1. Clone the repository.
2. Install backend dependencies.
3. Install frontend dependencies.

```bash
cd backend
npm install

cd ../frontend
npm install
```

## Environment Variables

Create `.env` files in both `backend` and `frontend`.

Backend `.env.example`:

```env
PORT=5000
MONGO_URL=mongodb+srv://<db_user>:<db_password>@<cluster-host>/<database-name>?retryWrites=true&w=majority
jwt_secret_key=replace_with_a_long_random_secret
```

Frontend `.env.example`:

```env
VITE_API_URL=http://localhost:5000/api
```

Variable notes:

- `PORT`: backend server port
- `MONGO_URL`: MongoDB connection string
- `jwt_secret_key`: secret used to sign and verify JWT
- `VITE_API_URL`: backend API base URL used by frontend

## Running the Project

Start backend:

```bash
cd backend
npm run dev
```

Start frontend in another terminal:

```bash
cd frontend
npm run dev
```

Default local URLs:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`

## API Endpoints

Base URL: `http://localhost:5000/api`

### Auth Routes

| Method | Endpoint | Auth Required | Description |
| --- | --- | --- | --- |
| POST | `/auth/register` | No | Register a user and return JWT |
| POST | `/auth/login` | No | Login and return JWT |

Example body for register:

```json
{
	"name": "John",
	"email": "john@example.com",
	"password": "password123"
}
```

### Task Routes

All task routes require header:

```http
Authorization: Bearer <token>
```

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/tasks` | Get tasks for logged-in user |
| GET | `/tasks/:id` | Get one task by ID (user-owned) |
| POST | `/tasks` | Create task |
| PUT | `/tasks/:id` | Update task |
| DELETE | `/tasks/:id` | Delete task |

Supported query params for `GET /tasks`:

- `status`: `Todo`, `In Progress`, `Done`
- `priority`: `LOW`, `MEDIUM`, `HIGH`
- `sort`: `dueDate`, `-dueDate`, `priority`, `-priority`
- `page`: default `1`
- `limit`: default `10`, max `100`

## Authentication

- During register/login, backend generates a JWT with user ID and email.
- Frontend saves token in a cookie (`token`).
- Protected frontend routes check if token exists.
- Protected backend routes verify the token before allowing task access.


## Future Improvements

- Add refresh tokens and stronger cookie security setup
- Add request validation middleware for cleaner error messages
- Add backend and frontend automated tests
- Add Docker configuration for easier setup across machines
