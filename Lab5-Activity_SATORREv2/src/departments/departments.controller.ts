import type { NextFunction, Request, Response } from 'express';
import { Router } from 'express';
import Joi from 'joi';
import { validateRequest } from '../_middleware/validateRequest';
import { departmentService } from './department.service';

const router = Router();

router.get('/', getAll);
router.post('/', createSchema, create);
router.put('/:id', updateSchema, update);
router.delete('/:id', deleteDepartment);

export default router;

function getAll(req: Request, res: Response, next: NextFunction): void {
    departmentService
        .getAll()
        .then((departments) => res.json({ departments }))
        .catch(next);
}

function create(req: Request, res: Response, next: NextFunction): void {
    departmentService
        .create(req.body)
        .then((department) => res.json({ message: 'Department created successfully', department }))
        .catch(next);
}

function update(req: Request, res: Response, next: NextFunction): void {
    departmentService
        .update(Number(req.params.id), req.body)
        .then(() => res.json({ message: 'Department updated successfully' }))
        .catch(next);
}

function deleteDepartment(req: Request, res: Response, next: NextFunction): void {
    const role = String(req.query.role || req.body.role || '');

    departmentService
        .delete(Number(req.params.id), role)
        .then(() => res.json({ message: 'Department deleted successfully' }))
        .catch(next);
}

function createSchema(req: Request, res: Response, next: NextFunction): void {
    const schema = Joi.object({
        name: Joi.string().trim().required(),
        description: Joi.string().trim().required(),
        role: Joi.string().required(),
    });

    validateRequest(req, next, schema);
}

function updateSchema(req: Request, res: Response, next: NextFunction): void {
    const schema = Joi.object({
        name: Joi.string().trim().empty(''),
        description: Joi.string().trim().empty(''),
        role: Joi.string().required(),
    });

    validateRequest(req, next, schema);
}
