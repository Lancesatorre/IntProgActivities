import bcrypt from 'bcryptjs';
import { db } from '../_helpers/db';
import { Role } from '../_helpers/role';
import { User, UserCreationAttributes } from './user.model';

export const userService = {
    getAll,
    getById,
    authenticate,
    create,
    update,
    delete: _delete,
};

async function getAll(): Promise<User[]> {
    return await db.User.findAll();
}

async function getById(id: number): Promise<User> {
     return await getUser(id);
}

async function authenticate(params: { email: string; password: string }): Promise<User> {
    const user = await db.User.scope('withHash').findOne({ where: { email: params.email } });

    if (!user) {
        throw new Error('Email does not exist');
    }

    const isMatch = await bcrypt.compare(params.password, user.passwordHash);
    if (!isMatch) {
        throw new Error('Password is incorrect');
    }

    return user;
}

async function create(params: UserCreationAttributes & {password: string}): Promise<void> {
    const existingUser = await db.User.findOne({ where: {email : params.email}});
    if(existingUser){
        throw new Error('Email is already exist');
    }

    const passwordHash = await bcrypt.hash(params.password, 10);

    await db.User.create({
        ...params,
        passwordHash,
        role: params.role || Role.User,
    } as UserCreationAttributes);
}

async function update(id: number, params: Partial<UserCreationAttributes> & {password?: string}): Promise<void> {
    const user = await getUser(id);

    if(params.password){
        params.passwordHash = await bcrypt.hash(params.password, 10);
        delete params.password;
    }

    await user.update(params as Partial<UserCreationAttributes>);
}

async function _delete(id: number): Promise<void> {
    const user = await getUser(id);
    await user.destroy();
}

async function getUser(id: number): Promise<User> {
    const user = await db.User.scope('withHash').findByPk(id);
    if(!user){
        throw new Error('User not Found');
    }

    return user;
}