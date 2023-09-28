import { Request, Response, NextFunction } from 'express';
import { UserRepository } from '../repositories/user.repository';

const isAdmin = async (req: Request, res: Response, next: NextFunction) => {
    // Check user administrator access from the db
    // (We could store this in the token, but in case we want to take someones
    // access immediately, this is necessary)
    const user = await UserRepository.findOneBy({ id: res.locals.jwt.userId });

    if (!user) {
        return res.status(401).json({
            message: 'Unauthorized'
        });
    }

    // If not an admin, return an unauthorized error
    if (!user.administrator) {
        return res.status(403).json({
            message: 'Only admins have access to this resource.'
        });
    }

    next();
};

export default isAdmin;
