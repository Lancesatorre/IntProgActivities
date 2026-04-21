import { Request, Response, NextFunction } from 'express';

export default function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
    console.error('Error:', err);
    
    switch (true) {
        case typeof err === 'string':
            // custom application error
            const is404 = err.toLowerCase().endsWith('not found');
            const statusCode = is404 ? 404 : 400;
            console.log('Sending error response:', statusCode, err);
            return res.status(statusCode).json({ message: err });
        case err.name === 'UnauthorizedError':
            // jwt authentication error
            return res.status(401).json({ message: 'Unauthorized' });
        default:
            console.log('Sending 500 error response:', err.message);
            return res.status(500).json({ message: err.message });
    }
}
