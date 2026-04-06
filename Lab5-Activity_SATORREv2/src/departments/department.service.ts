import { db } from '../_helpers/db';
import { Department, DepartmentCreationAttributes } from './department.model';

export const departmentService = {
    getAll,
    create,
    update,
    delete: _delete,
};

function isAdmin(role?: string): boolean {
    return String(role || '').toLowerCase() === 'admin';
}

function assertAdmin(role?: string): void {
    if (!isAdmin(role)) {
        throw new Error('Admin access required');
    }
}

async function getAll(): Promise<Department[]> {
    return db.Department.findAll({ order: [['name', 'ASC']] });
}

async function create(params: DepartmentCreationAttributes & { role?: string }): Promise<Department> {
    assertAdmin(params.role);

    const existing = await db.Department.findOne({ where: { name: params.name } });
    if (existing) {
        throw new Error('Department name already exists');
    }

    return db.Department.create({
        name: params.name,
        description: params.description,
    });
}

async function update(id: number, params: Partial<DepartmentCreationAttributes> & { role?: string }): Promise<void> {
    assertAdmin(params.role);

    const department = await getDepartment(id);
    if (params.name && params.name !== department.name) {
        const duplicate = await db.Department.findOne({ where: { name: params.name } });
        if (duplicate) {
            throw new Error('Department name already exists');
        }
    }

    await department.update({
        name: params.name ?? department.name,
        description: params.description ?? department.description,
    });
}

async function _delete(id: number, role?: string): Promise<void> {
    assertAdmin(role);

    const department = await getDepartment(id);
    const usedByEmployees = await db.Employee.count({ where: { departmentId: department.id } });
    if (usedByEmployees > 0) {
        throw new Error('Department cannot be deleted because employees are assigned to it');
    }

    await department.destroy();
}

async function getDepartment(id: number): Promise<Department> {
    const department = await db.Department.findByPk(id);
    if (!department) {
        throw new Error('Department not found');
    }
    return department;
}
