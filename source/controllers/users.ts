import { NextFunction, Request, Response } from 'express';
import bcryptjs from 'bcryptjs';
import logging from '../config/logging';
import signJWT from '../functions/signJWT';
import { Connect, Query } from '../config/db';
import IMySQLResult from '../interfaces/result';
import { use } from '../routes/users';
import { Car } from '../models/car.model';
import { UserRepository } from '../repositories/user.repository';
import { User } from '../models/user.model';

const NAMESPACE = 'User';

const validateToken = (req: Request, res: Response, next: NextFunction) => {
    logging.info(NAMESPACE, 'Token validated, user authorized.');

    return res.status(200).json({
        message: 'Token(s) validated'
    });
};

const register = (req: Request, res: Response, next: NextFunction) => {
    let { username, password } = req.body;
    console.log(username, password);
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

    console.log('logging in the user...');
    console.log('username: ', username);
    console.log('password: ', password);
    console.log('\n\n');

    const userPassword = (await UserRepository.findOne({ where: { username }, select: ['password'] }))?.password;

    if (!userPassword) {
        return res.status(400).json({
            message: `Unable to find the user ${username}`
        });
    }

    console.log('userPassword: ', userPassword);

    bcryptjs.compare(password, userPassword, async (error, result) => {
        console.log('done comparing raw password with the hashed password!');
        console.log('error: ', error);
        console.log('result: ', result);

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
    // Extract admin status from the JWT payload
    const isAdmin = res.locals.jwt.administrator;

    // If not an admin, return an unauthorized error
    // TODO: Move this
    if (isAdmin != 1) {
        return res.status(403).json({
            message: 'Only admins have access to all the users data'
        });
    }

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
    const userId = Number(req.params.userId);
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
    // catch (error) {
    //     logging.error(NAMESPACE, error.message, error);
    //     return res.status(500).json({ message: 'Error updating balance.', error: error.message });
    // }
};

const getBalance = async (req: Request, res: Response, next: NextFunction) => {
    const userId = Number(req.params.userId);

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

export default { validateToken, register, login, getAllUsers, addBalance, getBalance };
