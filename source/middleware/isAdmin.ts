import { Request, Response, NextFunction } from 'express';

const isAdmin = (req: Request, res: Response, next: NextFunction) => {
    const isAdmin = res.locals.jwt.administrator;

    // If not an admin, return an unauthorized error
    if (!isAdmin) {
        return res.status(403).json({
            message: 'Only admins have access to this resource.'
        });
    }

    next();
};

export default isAdmin;
