import config from '../../config.json';
import mysql from 'mysql2/promise';
import { Sequelize } from 'sequelize';
import { Department } from '../departments/department.model';
import { Employee } from '../employees/employee.model';
import { RequestModel } from '../requests/request.model';
import { User } from '../users/user.model';

export interface Database {
    User: typeof User;
    Department: typeof Department;
    Employee: typeof Employee;
    Request: typeof RequestModel;
}

export const db: Database = {} as Database;

export async function initialize(): Promise<void> {
    const { host, port, user, password, database } = config.database;

    const connection = await mysql.createConnection({ host, port, user, password });
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\`;`);
    await connection.end();

    const sequelize = new Sequelize(database, user, password, {dialect: 'mysql'});

    const { default: userModel} = await import('../users/user.model');
    const { default: departmentModel } = await import('../departments/department.model');
    const { default: employeeModel } = await import('../employees/employee.model');
    const { default: requestModel } = await import('../requests/request.model');

    db.User = userModel(sequelize);
    db.Department = departmentModel(sequelize);
    db.Employee = employeeModel(sequelize);
    db.Request = requestModel(sequelize);

    db.Department.hasMany(db.Employee, { foreignKey: 'departmentId', as: 'employees' });
    db.Employee.belongsTo(db.Department, { foreignKey: 'departmentId', as: 'department' });

    db.User.hasMany(db.Request, { foreignKey: 'createdByUserId', as: 'requests' });
    db.Request.belongsTo(db.User, { foreignKey: 'createdByUserId', as: 'createdByUser' });

    await sequelize.sync({alter: true});

    console.log("Database initialized and models synced")
}
