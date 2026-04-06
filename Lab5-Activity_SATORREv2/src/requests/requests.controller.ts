import type { NextFunction, Request, Response } from 'express';
import { Router } from 'express';
import Joi from 'joi';
import { validateRequest } from '../_middleware/validateRequest';
import { requestService } from './request.service';

const router = Router();

router.get('/', getAll);
router.post('/', createSchema, create);
router.put('/:id', updateSchema, update);
router.patch('/:id/approve', approveSchema, approve);
router.delete('/:id', deleteSchema, deleteRequest);

export default router;

function getAll(req: Request, res: Response, next: NextFunction): void {
    const viewer = {
        userId: Number(req.query.userId || 0),
        role: String(req.query.role || ''),
    };

    requestService
        .getAll(viewer)
        .then((requests) => res.json({ requests }))
        .catch(next);
}

function create(req: Request, res: Response, next: NextFunction): void {
    requestService
        .create(req.body)
        .then((requestRecord) => res.json({ message: 'Request created successfully', request: requestRecord }))
        .catch(next);
}

function update(req: Request, res: Response, next: NextFunction): void {
    requestService
        .update(Number(req.params.id), req.body)
        .then(() => res.json({ message: 'Request updated successfully' }))
        .catch(next);
}

function approve(req: Request, res: Response, next: NextFunction): void {
    requestService
        .approve(Number(req.params.id), req.body.approverRole)
        .then(() => res.json({ message: 'Request approved successfully' }))
        .catch(next);
}

function deleteRequest(req: Request, res: Response, next: NextFunction): void {
    requestService
        .delete(Number(req.params.id), req.body.deleterUserId, req.body.deleterRole)
        .then(() => res.json({ message: 'Request deleted successfully' }))
        .catch(next);
}

function createSchema(req: Request, res: Response, next: NextFunction): void {
    const schema = Joi.object({
        type: Joi.string().trim().required(),
        items: Joi.array().items(Joi.string().trim()).required(),
        createdByUserId: Joi.number().integer().required(),
    });

    validateRequest(req, next, schema);
}

function updateSchema(req: Request, res: Response, next: NextFunction): void {
    const schema = Joi.object({
        type: Joi.string().trim().empty(''),
        items: Joi.array().items(Joi.string().trim()).optional(),
        updaterUserId: Joi.number().integer().required(),
        updaterRole: Joi.string().required(),
    });

    validateRequest(req, next, schema);
}

function approveSchema(req: Request, res: Response, next: NextFunction): void {
    const schema = Joi.object({
        approverRole: Joi.string().required(),
    });

    validateRequest(req, next, schema);
}

function deleteSchema(req: Request, res: Response, next: NextFunction): void {
    const schema = Joi.object({
        deleterUserId: Joi.number().integer().required(),
        deleterRole: Joi.string().required(),
    });

    validateRequest(req, next, schema);
}
