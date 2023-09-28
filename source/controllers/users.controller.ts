import { NextFunction, Request, Response } from 'express';
import bcryptjs from 'bcryptjs';
import signJWT from '../functions/signJWT';
import { UserRepository } from '../repositories/user.repository';
import { User } from '../models/user.model';

const register = (req: Request, res: Response, next: NextFunction) => {
    let { username, password, administrator } = req.body;
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

        // For simplicity I let you decide during registratior if this account is admin or not
        user.administrator = administrator;

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

const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
    // Ability to reset your password when you are already logged in
    // And you know your old password.
    // (If we wanted password restore functionality, we would have to
    // implement third party services such as Nodemailer or Twilio)

    const userId = res.locals.jwt.userId;
    const { oldPassword, newPassword } = req.body;

    const user = await UserRepository.findOne({ where: { id: userId }, select: ['password'] });

    if (!user) {
        return res.status(400).json({
            message: `Unable to find the user.`
        });
    }

    bcryptjs.compare(oldPassword, user.password, async (error, result) => {
        // If error has occured or the result of comparing is false return error
        if (error || result === false) {
            return res.status(401).json({
                message: 'Password mismatch, could not reset your password'
            });
        }

        // If oldPassword is accurate, hash the newPassword and update the user
        bcryptjs.hash(newPassword, 10, async (hashError, hashedPassword) => {
            if (hashError) {
                return res.status(401).json({
                    message: hashError.message,
                    error: hashError
                });
            }

            try {
                await UserRepository.update(userId, { password: hashedPassword });
                return res.status(200).json({ message: 'Password updated successfully' });
            } catch (error) {
                return res.status(500).json({ message: 'Error updating your password' });
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

export default { register, login, resetPassword, getAllUsers, addBalance, getBalance };
