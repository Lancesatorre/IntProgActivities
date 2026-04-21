# Node MySQL API - Project Documentation

## 1. Project Overview
This project is a **Node.js + TypeScript REST API** using **Express** and **MySQL (Sequelize ORM)**.  
It provides account management with:

1. Registration and email verification
2. JWT authentication
3. Refresh-token flow with secure cookies
4. Forgot/reset password
5. Role-based authorization (Admin/User)

Main entry point: `server.ts`  
Base URL (local): `http://localhost:4000`

---

## 2. Tech Stack
| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Language | TypeScript |
| Web framework | Express |
| Database | MySQL |
| ORM | Sequelize |
| Auth | JWT + Refresh Token |
| Validation | Joi |
| API Docs | Swagger UI (`/swagger`) |
| Email | Nodemailer |

---

## 3. Project Structure
```text
node-mysql-api/
|-- server.ts
|-- config.json
|-- swagger.yaml
`-- src/
    |-- accounts/
    |   |-- accounts.controller.ts
    |   |-- account.service.ts
    |   |-- account-model.ts
    |   `-- refresh-token.model.ts
    |-- _helpers/
    |   |-- db.ts
    |   |-- role.ts
    |   |-- send-email.ts
    |   `-- swagger.ts
    `-- _middlerware/
        |-- authorize.ts
        |-- error-handler.ts
        `-- validate-request.ts
```

---

## 4. How to Run
### Prerequisites
1. Node.js and npm
2. MySQL server running locally
3. A MySQL database user with permissions to create/use the configured database

### Steps
1. Install dependencies:
   ```bash
   npm install
   ```
2. Update database and email settings in `config.json`.
3. Start the API:
   ```bash
   npm run start
   ```
4. Open Swagger docs:
   `http://localhost:4000/swagger`

---

## 5. API Routes (Accounts)
All routes are under `/accounts`.

| Method | Route | Description |
|---|---|---|
| POST | `/authenticate` | Login and get JWT + refresh token |
| POST | `/refresh-token` | Refresh access token |
| POST | `/revoke-token` | Revoke refresh token |
| POST | `/register` | Register account |
| POST | `/verify-email` | Verify email with token |
| POST | `/forgot-password` | Request password reset |
| POST | `/validate-reset-token` | Validate reset token |
| POST | `/reset-password` | Set new password |
| GET | `/` | Get all accounts (Admin only) |
| GET | `/:id` | Get account by ID (owner/Admin) |
| POST | `/` | Create account (Admin only) |
| PUT | `/:id` | Update account (owner/Admin) |
| DELETE | `/:id` | Delete account (owner/Admin) |

---

## 6. Authentication Flow (High Level)
1. User calls `POST /accounts/authenticate` with email/password.
2. API returns:
   - `jwtToken` in JSON response
   - `refreshToken` in HTTP-only cookie
3. Client uses JWT for protected routes.
4. When JWT expires, client calls `POST /accounts/refresh-token`.
5. Logout/revoke via `POST /accounts/revoke-token`.

---

## 7. Data Layer Notes
`src/_helpers/db.ts` initializes Sequelize and ensures database creation.  
Main model: `Account`  
Related model: `RefreshToken` (one account has many refresh tokens).

---

## 8. Suggested Screenshots for Submission
Take screenshots of these exact parts:

1. **Swagger Home**  
   URL: `http://localhost:4000/swagger`  
   Capture the API title and visible route list.

2. **Register Endpoint (Expanded)**  
   In Swagger, expand `POST /accounts/register` and capture request body fields.

3. **Authenticate Success Response**  
   In Swagger, run `POST /accounts/authenticate` and capture the returned `jwtToken` and response body.

4. **Project Structure in VS Code Explorer**  
   Capture `server.ts`, `config.json`, `swagger.yaml`, and the `src/accounts` folder.

5. **Server Running in Terminal**  
   Capture the terminal showing:
   - command used (`npm run start`)
   - message: `Server listening on http://localhost:4000/`

---

## 9. Notes
- Keep sensitive values (database password, JWT secret, SMTP credentials) out of public screenshots.
- For production, move secrets from `config.json` to environment variables.
