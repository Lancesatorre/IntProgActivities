# TypeScript CRUD API - Complete Documentation

## 📌 Project Overview
This is a **fully typed Express.js + Sequelize + MySQL** CRUD API for managing users. Built with **TypeScript** to ensure type safety, compile-time error catching, and improved developer experience.

**Key Features:**
- ✅ Full type coverage (models, services, controllers, middleware)
- ✅ Express.js backend with RESTful API
- ✅ MySQL database with Sequelize ORM
- ✅ Request validation with Joi schemas
- ✅ Error handling middleware
- ✅ Password hashing with bcryptjs
- ✅ Role-based user types (Admin/User)

---

## 🛠️ Prerequisites
- **Node.js** 18+ 
- **MySQL** 8+ (running locally or accessible)
- **npm** package manager

---

## ⚙️ Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Database
Edit `config.json` with your MySQL credentials:
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
✨ **Note:** The database is **automatically created** if it doesn't exist.

### 3. Start Development Server
```bash
npm run start:dev
```
Server runs on `http://localhost:4000`

**Output should show:**
```
🚀 Server running on http://localhost:4000
🧪 Test with: POST /users with { email, password, ... }
Database initialized and models synced
```

### 4. Production Build
```bash
npm run build    # Compiles TypeScript to dist/
npm start        # Runs compiled JavaScript
```

---

## 📁 Project Structure

```
src/
├── server.ts                 # Express app setup & DB initialization
├── _helpers/
│   ├── db.ts                # Sequelize initialization & database connection
│   └── role.ts              # User role enum (Admin/User)
├── _middleware/
│   ├── errorHandler.ts      # Global error handling middleware
│   └── validateRequest.ts   # Joi schema validation middleware
└── users/
    ├── user.model.ts        # Sequelize User model with TypeScript interfaces
    ├── user.service.ts      # Business logic (CRUD operations)
    └── users.controller.ts  # Route handlers & validation schemas

tests/
└── users.test.ts            # Test file placeholder

tsconfig.json                # TypeScript compiler configuration
package.json                 # Dependencies & scripts
config.json                  # Database & secrets configuration
```

---

## 🔗 API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/users` | Create a new user |
| GET | `/users` | Fetch all users |
| GET | `/users/:id` | Fetch user by ID |
| PUT | `/users/:id` | Update user details |
| DELETE | `/users/:id` | Delete a user |

---

## 📸 API Testing & Screenshots Guide

### **SCREENSHOT #1: Successful User Creation (POST /users)**

Run this cURL command in your terminal:
```bash
curl -X POST http://localhost:4000/users \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Mr",
    "firstName": "Ada",
    "lastName": "Lovelace",
    "email": "ada@example.com",
    "password": "secret123",
    "confirmPassword": "secret123",
    "role": "User"
  }'
```

**Expected Response (200 OK):**
```json
{
  "message": "User created successfully"
}
```

✅ **Screenshot this:** Terminal showing the POST request and 200 success response.

---

### **SCREENSHOT #2: Get All Users (GET /users)**

Run this cURL command:
```bash
curl http://localhost:4000/users
```

**Expected Response (200 OK):**
```json
[
  {
    "id": 1,
    "email": "ada@example.com",
    "title": "Mr",
    "firstName": "Ada",
    "lastName": "Lovelace",
    "role": "User",
    "createdAt": "2025-03-30T10:30:00.000Z",
    "updatedAt": "2025-03-30T10:30:00.000Z"
  }
]
```

✅ **Screenshot this:** Terminal showing the GET response with properly typed user data (notice fields like `id`, `email`, `firstName`, etc. are all correctly typed).

---

### **SCREENSHOT #3: Validation Error (400 Bad Request)**

Run this incomplete cURL command (missing required `email` field):
```bash
curl -X POST http://localhost:4000/users \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "NoEmail"
  }'
```

**Expected Response (400 Bad Request):**
```json
{
  "message": "Validation error: \"title\" is required, \"firstName\" is required, \"lastName\" is required, \"email\" is required, \"password\" is required, \"confirmPassword\" is required"
}
```

✅ **Screenshot this:** Terminal showing the 400 error with validation message for missing fields.

---

### **SCREENSHOT #4: Delete User (DELETE /users/:id)**

First, create a user (use screenshot #1), note the user ID (usually `1`).

Run this cURL command:
```bash
curl -X DELETE http://localhost:4000/users/1
```

**Expected Response (200 OK):**
```json
{
  "message": "User deleted successfully"
}
```

✅ **Screenshot this:** Terminal showing the DELETE request and 200 success response.

---

## 🧪 Running Tests

### Manual Testing (Recommended for deliverables)
Use the cURL commands above to test each endpoint manually and capture screenshots.

### Automated Testing (Optional)
Currently `tests/users.test.ts` is a placeholder. To extend with automated tests:
```bash
npm test
```

---

## 📦 Key TypeScript Features Used

| Feature | Example | Benefit |
|---------|---------|---------|
| **Interfaces** | `UserAttributes`, `UserCreationAttributes` | Type-safe data contracts |
| **Enums** | `Role.Admin`, `Role.User` | Prevents invalid role values |
| **Type Annotations** | `async function getAll(): Promise<User[]>` | Compile-time type checking |
| **Generic Types** | `Model<UserAttributes, UserCreationAttributes>` | Type-safe ORM models |
| **Middleware Types** | `(req: Request, res: Response, next: NextFunction)` | Express handler safety |

---

## 💾 Important Code Files Overview

### [user.model.ts](src/users/user.model.ts)
Defines the `User` model with:
- `UserAttributes` interface for data structure
- `UserCreationAttributes` for optional fields during creation
- Sequelize model configuration with timestamps & password exclusion

### [user.service.ts](src/users/user.service.ts)
Business logic layer with typed methods:
- `getAll()` - retrieves all users
- `getById(id)` - fetch specific user
- `create(params)` - creates new user with password hashing
- `update(id, params)` - updates user fields
- `delete(id)` - removes user

### [users.controller.ts](src/users/users.controller.ts)
Route handlers with Joi validation schemas:
- `createSchema` - validates required fields for POST
- `updateSchema` - validates optional fields for PUT
- Route definitions for all 5 endpoints

---

## 🚀 Development Tips

1. **Type Safety:** Hover over variables in VS Code to see inferred types
2. **Hot Reload:** `npm run start:dev` uses nodemon for auto-restart on file changes
3. **Compilation Errors:** `npm run build` will show compile issues before runtime
4. **Request Validation:** Missing fields throw 400 errors (caught at compile time in TypeScript)

---

---

# 📋 DELIVERABLES (Submit These)

## 1. ✅ Code
All files are present in the `typescript-crud-api` folder:

- **Backend Code:**
  - `/src` - All source files (models, services, controllers, middleware)
  - `/tsconfig.json` - TypeScript configuration with strict mode enabled
  - `/package.json` - Dependencies and scripts

- **Type Safety:**
  - `src/users/user.model.ts` - Interfaces: `UserAttributes`, `UserCreationAttributes`
  - `src/_helpers/role.ts` - Enum: `Role` (Admin/User)
  - All function signatures typed with return types

- **Documentation:**
  - `README.md` (this file) - Complete setup + testing instructions

---

## 2. 📸 API Test Evidence

**Capture these 4 screenshots:**

| # | Endpoint | Success Criteria | 
|---|----------|------------------|
| 1 | `POST /users` | 200 response, "User created successfully" |  
| 2 | `GET /users` | 200 response, JSON array with typed fields |
| 3 | `POST /users` (invalid) | 400 error, validation message shown | 
| 4 | `DELETE /users/:id` | 200 response, "User deleted successfully" | 

**How to capture:**
1. Run the cURL commands in PowerShell or terminal
2. Take screenshot of the terminal showing request + response
3. Save as PNG/JPG and attach to deliverables document

---

## 3. 📝 Personal Reflection (3–5 sentences)

**Prompt:** How did TypeScript change your development experience? Did you catch any errors at compile time that would have been runtime bugs in JavaScript?

**Example Reflection (Fill in your own):**

> "TypeScript significantly improved my development experience by catching type-related errors before runtime. For example, the strongly-typed User model interfaces (`UserAttributes`, `UserCreationAttributes`) prevented accidental property access on undefined fields. The `Role` enum ensured only valid role values ('Admin', 'User') could be assigned, eliminating invalid string bugs that would have occurred in plain JavaScript. The strict function signatures (return types like `Promise<User[]>`) made it clear what each service method returns, reducing debugging time. Overall, TypeScript transformed potential runtime headaches into compile-time catches, making the codebase more maintainable and reliable."

---

