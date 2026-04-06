import { DataTypes, Model, Optional, Sequelize } from 'sequelize';

export interface RequestAttributes {
    id: number;
    type: string;
    items: string[];
    itemsCount: number;
    status: 'Pending' | 'Approved';
    createdByUserId: number;
    createdByEmail: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface RequestCreationAttributes extends Optional<RequestAttributes, 'id' | 'status' | 'itemsCount' | 'createdAt' | 'updatedAt'> {}

export class RequestModel extends Model<RequestAttributes, RequestCreationAttributes> implements RequestAttributes {
    public id!: number;
    public type!: string;
    public items!: string[];
    public itemsCount!: number;
    public status!: 'Pending' | 'Approved';
    public createdByUserId!: number;
    public createdByEmail!: string;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

export default function requestModel(sequelize: Sequelize): typeof RequestModel {
    RequestModel.init(
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            type: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            items: {
                type: DataTypes.JSON,
                allowNull: false,
                defaultValue: [],
            },
            itemsCount: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
            },
            status: {
                type: DataTypes.ENUM('Pending', 'Approved'),
                allowNull: false,
                defaultValue: 'Pending',
            },
            createdByUserId: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            createdByEmail: {
                type: DataTypes.STRING,
                allowNull: false,
            },
        },
        {
            sequelize,
            modelName: 'Request',
            tableName: 'requests',
            timestamps: true,
        }
    );

    return RequestModel;
}
