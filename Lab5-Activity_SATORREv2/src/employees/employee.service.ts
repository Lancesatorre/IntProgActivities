import { db } from '../_helpers/db';
import { Employee, EmployeeCreationAttributes } from './employee.model';

type EmployeePayload = EmployeeCreationAttributes & { role?: string; departmentName?: string };

export const employeeService = {
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

async function getAll(): Promise<Array<Record<string, unknown>>> {
    const employees = await db.Employee.findAll({
        include: [{ model: db.Department, as: 'department', attributes: ['id', 'name', 'description'] }],
        order: [['createdAt', 'DESC']],
    });

    return employees.map((employee: Employee & { department?: { name?: string } }) => ({
        id: employee.id,
        employeeCode: employee.employeeCode,
        email: employee.email,
        position: employee.position,
        hireDate: employee.hireDate,
        departmentId: employee.departmentId,
        departmentName: employee.department?.name || '',
    }));
}

async function create(params: EmployeePayload): Promise<Employee> {
    assertAdmin(params.role);

    const department = await getDepartment(params.departmentId, params.departmentName);
    const existing = await db.Employee.findOne({ where: { employeeCode: params.employeeCode } });
    if (existing) {
        throw new Error('Employee ID already exists');
    }

    return db.Employee.create({
        employeeCode: params.employeeCode,
        email: params.email,
        position: params.position,
        hireDate: params.hireDate,
        departmentId: department.id,
    });
}

async function update(id: number, params: Partial<EmployeePayload>): Promise<void> {
    assertAdmin(params.role);

    const employee = await getEmployee(id);

    let departmentId = employee.departmentId;
    if (params.departmentId || params.departmentName) {
        const department = await getDepartment(params.departmentId, params.departmentName);
        departmentId = department.id;
    }

    if (params.employeeCode && params.employeeCode !== employee.employeeCode) {
        const duplicate = await db.Employee.findOne({ where: { employeeCode: params.employeeCode } });
        if (duplicate) {
            throw new Error('Employee ID already exists');
        }
    }

    await employee.update({
        employeeCode: params.employeeCode ?? employee.employeeCode,
        email: params.email ?? employee.email,
        position: params.position ?? employee.position,
        hireDate: params.hireDate ?? employee.hireDate,
        departmentId,
    });
}

async function _delete(id: number, role?: string): Promise<void> {
    assertAdmin(role);

    const employee = await getEmployee(id);
    await employee.destroy();
}

async function getEmployee(id: number): Promise<Employee> {
    const employee = await db.Employee.findByPk(id);
    if (!employee) {
        throw new Error('Employee not found');
    }
    return employee;
}

async function getDepartment(departmentId?: number, departmentName?: string): Promise<{ id: number; name: string }> {
    if (departmentId) {
        const byId = await db.Department.findByPk(departmentId);
        if (byId) {
            return byId;
        }
    }

    if (departmentName) {
        const byName = await db.Department.findOne({ where: { name: departmentName } });
        if (byName) {
            return byName;
        }
    }

    throw new Error('Department not found');
}
