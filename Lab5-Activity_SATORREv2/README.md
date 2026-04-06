# Lab5-Activity_SATORREv2

A full-stack TypeScript app with:
- Express + Sequelize + MySQL backend
- Split multi-page frontend in `public/`
- Role-based flows for `User` and `Admin`
- CRUD modules for `Users`, `Employees`, `Departments`, and `Requests`

## Overview
This project is the v2 merge of your earlier activities:
- Backend/data layer based on Lab 5
- UI and page-based experience aligned to your newer split-page structure

The app uses server-rendered static files from `public/` and API routes from `src/`.

## Tech Stack
- Node.js + TypeScript
- Express
- Sequelize
- MySQL (`mysql2`)
- Joi validation
- bcryptjs for password hashing

## Prerequisites
- Node.js 18+
- MySQL 8+
- npm

## Setup
1. Install dependencies:
```bash
npm install
```

2. Configure database credentials in `config.json`:
```json
{
  "database": {
    "host": "localhost",
    "port": 3306,
    "user": "root",
    "password": "your_password",
    "database": "typescript_crud_api"
  },
  "jwtSecret": "your_jwt_secret_key"
}
```

3. Start the app:
```bash
npm run start
```

Server default URL:
- `http://localhost:4000`

## Scripts
- `npm run start`: run with `ts-node`
- `npm run dev`: run with nodemon + ts-node
- `npm run start:dev`: alias to `npm run dev`
- `npm run build`: type-check only (`tsc --noEmit`)
- `npm run typecheck`: same as build
- `npm run test`: run `tests/users.test.ts`

## App Entry and Page Routing
- Server root `/` serves `public/index.html`
- `index.html` redirects to `home.html#/`
- `FullStack.js` handles hash-route to page-file alignment and auth guards

Primary pages:
- `home.html` (public home)
- `login.html`
- `register.html`
- `verify.html`
- `user-home.html` (user landing after login)
- `admin-home.html` (admin landing after login)
- `profile.html`
- `employees.html` (admin)
- `accounts.html` (admin)
- `departments.html` (admin)
- `requests.html` (user/admin with role-specific behavior)

## Role Behavior
- Login redirects by role:
  - `User` -> `#/user-home` (`user-home.html`)
  - `Admin` -> `#/admin-home` (`admin-home.html`)
- Admin-only pages are protected in frontend route logic (`accounts`, `employees`, `departments`)
- Requests page adapts labels/actions based on role

## Backend API
Base routes:
- `/users`
- `/departments`
- `/employees`
- `/requests`

Alias routes (Lab4-compatible):
- `/api/users`
- `/api/departments`
- `/api/employees`
- `/api/requests`

### Users
- `GET /users`
- `GET /users/:id`
- `POST /users/authenticate`
- `POST /users`
- `PUT /users/:id`
- `DELETE /users/:id`

### Departments
- `GET /departments`
- `POST /departments`
- `PUT /departments/:id`
- `DELETE /departments/:id`

### Employees
- `GET /employees`
- `POST /employees`
- `PUT /employees/:id`
- `DELETE /employees/:id`

### Requests
- `GET /requests`
- `POST /requests`
- `PUT /requests/:id`
- `PATCH /requests/:id/approve`
- `DELETE /requests/:id`

## Data Model Summary
Initialized in `src/_helpers/db.ts`:
- `User`
- `Department`
- `Employee`
- `Request`

Associations:
- `Department hasMany Employee`
- `Employee belongsTo Department`
- `User hasMany Request`
- `Request belongsTo User`

## Project Structure
```text
Lab5-Activity_SATORREv2/
├── config.json
├── package.json
├── tsconfig.json
├── README.md
├── public/
│   ├── index.html
│   ├── FullStack.html
│   ├── FullStack.css
│   ├── FullStack.js
│   ├── home.html
│   ├── login.html
│   ├── register.html
│   ├── verify.html
│   ├── user-home.html
│   ├── admin-home.html
│   ├── profile.html
│   ├── employees.html
│   ├── accounts.html
│   ├── departments.html
│   ├── requests.html
│   ├── auth.js
│   └── api.js
├── src/
│   ├── server.ts
│   ├── _helpers/
│   │   ├── db.ts
│   │   └── role.ts
│   ├── _middleware/
│   │   ├── errorHandler.ts
│   │   └── validateRequest.ts
│   ├── users/
│   ├── departments/
│   ├── employees/
│   └── requests/
└── tests/
    └── users.test.ts
```

## Notes
- Database is created automatically if it does not exist.
- Sequelize sync uses `alter: true` during initialization.
- If you run from parent directory, use:
```bash
npm --prefix "c:\\Users\\Admin\\OneDrive\\Desktop\\IntProgActivities\\Lab5-Activity_SATORREv2" run start
```
