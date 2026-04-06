// src/server.ts
import express, { Application } from 'express';
import cors from 'cors';
import path from 'path';
import { errorHandler } from './_middleware/errorHandler';
import { initialize } from './_helpers/db';
import usersController from './users/users.controller';
import departmentsController from './departments/departments.controller';
import employeesController from './employees/employees.controller';
import requestsController from './requests/requests.controller';

const app: Application = express();


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(express.static(path.join(__dirname, '../public')));


app.use('/users', usersController);
app.use('/departments', departmentsController);
app.use('/employees', employeesController);
app.use('/requests', requestsController);

// Lab4-compatible aliases
app.use('/api/users', usersController);
app.use('/api/departments', departmentsController);
app.use('/api/employees', employeesController);
app.use('/api/requests', requestsController);

app.get('/', (_, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});


app.use(errorHandler);


const PORT = process.env.PORT || 4000;

initialize()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`🧪 Test with: POST /users with { email, password, ... }`);
    });
  })
  .catch((err) => {
    console.error('❌ Failed to initialize database:', err);
    process.exit(1);
  });