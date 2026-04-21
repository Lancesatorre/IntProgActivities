import { expressjwt as jwt } from 'express-jwt';
import config from '../../config.json';
import db from '../_helpers/db';

// 📸 SCREENSHOT LABEL (CODE FILE): Authorization middleware starts below.

const appConfig: any = config;
const { secret } = appConfig;

export default function authorize(roles: any = []) {
    if (typeof roles === 'string') {
        roles = [roles];
    }

    return [
        jwt({ secret, algorithms: ['HS256'] }),
        async (req: any, res: any, next: any) => {
            // express-jwt v8 stores JWT payload on req.auth by default.
            const tokenUser = req.auth || req.user;
            const accountId = tokenUser?.sub || tokenUser?.id;
            const account = await db.Account.findByPk(accountId);

            if (!account || (roles.length && !roles.includes(account.role))) {
                return res.status(401).json({ message: 'Unauthorized' });
            }

            req.user = req.user || {};
            req.user.id = account.id;
            req.user.role = account.role;
            const refreshTokens = await account.getRefreshTokens();
            req.user.ownsToken = (token: any) => !!refreshTokens.find((x: any) => x.token === token);
            next();
        }
    ];
}