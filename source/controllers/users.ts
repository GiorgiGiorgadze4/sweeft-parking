import { NextFunction, Request, Response } from 'express';
import bcryptjs from 'bcryptjs';
import signJWT from '../functions/signJWT';
import { UserRepository } from '../repositories/user.repository';
import { User } from '../models/user.model';

const register = (req: Request, res: Response, next: NextFunction) => {
    let { username, password } = req.body;
    bcryptjs.hash(password, 10, (hashError, hashedPassword) => {
        if (hashError) {
            return res.status(401).json({
                message: hashError.message,
                error: hashError
            });
        }

        const user = new User();
        user.username = username;
        user.password = hashedPassword;

        UserRepository.save(user)
            .then(async () => {
                const userToReturn = await UserRepository.findOneBy({ id: user.id });
                return res.status(201).json({ user: userToReturn });
            })
            .catch((error) => {
                return res.status(500).json({
                    message: error.message
                });
            });
    });
};

const login = async (req: Request, res: Response, next: NextFunction) => {
    let { username, password } = req.body;

    const userPassword = (await UserRepository.findOne({ where: { username }, select: ['password'] }))?.password;

    if (!userPassword) {
        return res.status(400).json({
            message: `Unable to find the user ${username}`
        });
    }

    bcryptjs.compare(password, userPassword, async (error, result) => {
        // If error has occured or the result of comparing is false return error
        if (error || result === false) {
            return res.status(401).json({
                message: 'Password Mismatch'
            });
        }

        const user = (await UserRepository.findOneBy({ username })) as User;

        // Logged in succesfully
        signJWT(user, (_error, token) => {
            if (_error) {
                return res.status(401).json({
                    message: 'Unable to Sign JWT',
                    error: _error
                });
            } else if (token) {
                return res.status(200).json({
                    message: 'Auth Successful',
                    token,
                    user: user
                });
            }
        });
    });
};

const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const users = await UserRepository.find({ relations: ['cars', 'parkingHistory'] });
        return res.status(200).json({
            users,
            count: users.length
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to fetch users.'
        });
    }
};

const addBalance = async (req: Request, res: Response, next: NextFunction) => {
    const userId = res.locals.jwt.userId;
    const { amount } = req.body; // amount to be added

    try {
        const user = await UserRepository.findOne({
            where: { id: userId }
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        user.balance += amount;
        await UserRepository.save(user);

        res.status(200).json({ message: 'Balance updated successfully', balance: user.balance });
    } catch (error) {
        return res.status(500).json({
            message: 'Error updating balance.'
        });
    }
};

const getBalance = async (req: Request, res: Response, next: NextFunction) => {
    const userId = res.locals.jwt.userId;

    try {
        const user = await UserRepository.findOne({ where: { id: userId } });

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        res.status(200).json({ balance: user.balance });
    } catch (error) {
        return res.status(500).json({
            message: 'Error fetching balance.'
        });
    }
};

export default { register, login, getAllUsers, addBalance, getBalance };
