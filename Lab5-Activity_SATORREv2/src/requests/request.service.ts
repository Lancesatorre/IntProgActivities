import { db } from '../_helpers/db';
import { RequestCreationAttributes, RequestModel } from './request.model';

type Viewer = {
    userId: number;
    role: string;
};

export const requestService = {
    getAll,
    create,
    update,
    approve,
    delete: _delete,
};

function isAdmin(role?: string): boolean {
    return String(role || '').toLowerCase() === 'admin';
}

async function getAll(viewer: Viewer): Promise<RequestModel[]> {
    if (isAdmin(viewer.role)) {
        return db.Request.findAll({ order: [['createdAt', 'DESC']] });
    }

    return db.Request.findAll({
        where: { createdByUserId: viewer.userId },
        order: [['createdAt', 'DESC']],
    });
}

async function create(params: RequestCreationAttributes): Promise<RequestModel> {
    const owner = await db.User.findByPk(params.createdByUserId);
    if (!owner) {
        throw new Error('Owner user not found');
    }

    const normalizedItems = normalizeItems(params.items);
    return db.Request.create({
        type: params.type,
        items: normalizedItems,
        itemsCount: normalizedItems.length,
        status: 'Pending',
        createdByUserId: params.createdByUserId,
        createdByEmail: owner.email,
    });
}

async function update(id: number, params: Partial<RequestCreationAttributes> & { updaterUserId: number; updaterRole: string }): Promise<void> {
    const request = await getRequest(id);

    if (!isAdmin(params.updaterRole) && request.createdByUserId !== params.updaterUserId) {
        throw new Error('Not allowed to update this request');
    }

    if (request.status === 'Approved' && !isAdmin(params.updaterRole)) {
        throw new Error('Approved request cannot be edited');
    }

    const items = params.items ? normalizeItems(params.items) : request.items;
    await request.update({
        type: params.type ?? request.type,
        items,
        itemsCount: items.length,
    });
}

async function approve(id: number, approverRole: string): Promise<void> {
    if (!isAdmin(approverRole)) {
        throw new Error('Admin access required');
    }

    const request = await getRequest(id);
    await request.update({ status: 'Approved' });
}

async function _delete(id: number, deleterUserId: number, deleterRole: string): Promise<void> {
    const request = await getRequest(id);

    if (!isAdmin(deleterRole) && request.createdByUserId !== deleterUserId) {
        throw new Error('Not allowed to delete this request');
    }

    await request.destroy();
}

async function getRequest(id: number): Promise<RequestModel> {
    const request = await db.Request.findByPk(id);
    if (!request) {
        throw new Error('Request not found');
    }
    return request;
}

function normalizeItems(items: unknown): string[] {
    if (!Array.isArray(items)) {
        throw new Error('Items must be an array');
    }

    const normalized = items
        .map((item) => String(item || '').trim())
        .filter((item) => item.length > 0);

    if (!normalized.length) {
        throw new Error('At least one request item is required');
    }

    return normalized;
}
