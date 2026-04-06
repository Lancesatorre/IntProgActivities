import type { NextFunction, Request, Response } from 'express';
import { Router } from 'express';
import Joi from 'joi';
import { validateRequest } from '../_middleware/validateRequest';
import { employeeService } from './employee.service';

const router = Router();

router.get('/', getAll);
router.post('/', createSchema, create);
router.put('/:id', updateSchema, update);
router.delete('/:id', deleteEmployee);

export default router;

function getAll(req: Request, res: Response, next: NextFunction): void {
    employeeService
        .getAll()
        .then((employees) => res.json({ employees }))
        .catch(next);
}

function create(req: Request, res: Response, next: NextFunction): void {
    employeeService
        .create(req.body)
        .then((employee) => res.json({ message: 'Employee created successfully', employee }))
        .catch(next);
}

function update(req: Request, res: Response, next: NextFunction): void {
    employeeService
        .update(Number(req.params.id), req.body)
        .then(() => res.json({ message: 'Employee updated successfully' }))
        .catch(next);
}

function deleteEmployee(req: Request, res: Response, next: NextFunction): void {
    const role = String(req.query.role || req.body.role || '');

    employeeService
        .delete(Number(req.params.id), role)
        .then(() => res.json({ message: 'Employee deleted successfully' }))
        .catch(next);
}

function createSchema(req: Request, res: Response, next: NextFunction): void {
    const schema = Joi.object({
        employeeCode: Joi.string().trim().required(),
        email: Joi.string().email().required(),
        position: Joi.string().trim().required(),
        hireDate: Joi.string().trim().required(),
        departmentId: Joi.number().integer().optional(),
        departmentName: Joi.string().trim().optional(),
        role: Joi.string().required(),
    }).or('departmentId', 'departmentName');

    validateRequest(req, next, schema);
}

function updateSchema(req: Request, res: Response, next: NextFunction): void {
    const schema = Joi.object({
        employeeCode: Joi.string().trim().empty(''),
        email: Joi.string().email().empty(''),
        position: Joi.string().trim().empty(''),
        hireDate: Joi.string().trim().empty(''),
        departmentId: Joi.number().integer().optional(),
        departmentName: Joi.string().trim().optional(),
        role: Joi.string().required(),
    });

    validateRequest(req, next, schema);
}
