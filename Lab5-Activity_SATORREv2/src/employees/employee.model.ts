import { DataTypes, Model, Optional, Sequelize } from 'sequelize';

export interface EmployeeAttributes {
    id: number;
    employeeCode: string;
    email: string;
    position: string;
    hireDate: string;
    departmentId: number;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface EmployeeCreationAttributes extends Optional<EmployeeAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

export class Employee extends Model<EmployeeAttributes, EmployeeCreationAttributes> implements EmployeeAttributes {
    public id!: number;
    public employeeCode!: string;
    public email!: string;
    public position!: string;
    public hireDate!: string;
    public departmentId!: number;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

export default function employeeModel(sequelize: Sequelize): typeof Employee {
    Employee.init(
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            employeeCode: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true,
            },
            email: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            position: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            hireDate: {
                type: DataTypes.DATEONLY,
                allowNull: false,
            },
            departmentId: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
        },
        {
            sequelize,
            modelName: 'Employee',
            tableName: 'employees',
            timestamps: true,
        }
    );

    return Employee;
}
