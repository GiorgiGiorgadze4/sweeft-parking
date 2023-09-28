import { Request, Response, NextFunction } from 'express';
import { ValidationChain, validationResult } from 'express-validator';

export function validate(validations: ValidationChain[]) {
    return [
        ...validations,
        (req: Request, res: Response, next: NextFunction) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }
            next();
        }
    ];
};
