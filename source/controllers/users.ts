import { NextFunction, Request, Response } from 'express';
import bcryptjs from 'bcryptjs';
import logging from '../config/logging';
import signJWT from '../functions/signJWT';
import { Connect, Query } from '../config/mysql';
import IUser from '../interfaces/user';
import IMySQLResult from '../interfaces/result';
import { use } from '../routes/users';
import ICar from '../interfaces/car';

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
    bcryptjs.hash(password, 10, (hashError, hash) => {
        if (hashError) {
            return res.status(401).json({
                message: hashError.message,
                error: hashError
            });
        }

        let query = `INSERT INTO Users (username, password) VALUES ("${username}", "${hash}")`;

        Connect()
            .then((connection) => {
                Query<IMySQLResult>(connection, query)
                    .then((result) => {
                        logging.info(NAMESPACE, `User with id ${result.insertId} inserted.`);

                        return res.status(201).json(result);
                    })
                    .catch((error) => {
                        logging.error(NAMESPACE, error.message, error);

                        return res.status(500).json({
                            message: error.message,
                            error
                        });
                    });
            })
            .catch((error) => {
                logging.error(NAMESPACE, error.message, error);

                return res.status(500).json({
                    message: error.message,
                    error
                });
            });
    });
};

const login = (req: Request, res: Response, next: NextFunction) => {
    let { username, password } = req.body;

    console.log('logging in the user...');
    console.log('username: ', username);
    console.log('password: ', password);
    console.log('\n\n');

    let query = `SELECT * FROM users WHERE username = '${username}'`;

    Connect()
        .then((connection) => {
            Query<IUser[]>(connection, query)
                .then((users) => {
                    console.log('users: ', users);
                    bcryptjs.compare(password, users[0].password, (error, result) => {
                        console.log('done comparing raw password with the hashed password!');
                        console.log('error: ', error);
                        console.log('result: ', result);

                        if (error || result === false) {
                            return res.status(401).json({
                                message: 'Password Mismatch'
                            });
                        }

                        // Logged in succesfully
                        signJWT(users[0], (_error, token) => {
                            if (_error) {
                                return res.status(401).json({
                                    message: 'Unable to Sign JWT',
                                    error: _error
                                });
                            } else if (token) {
                                return res.status(200).json({
                                    message: 'Auth Successful',
                                    token,
                                    user: users[0]
                                });
                            }
                        });
                    });
                })
                .catch((error) => {
                    logging.error(NAMESPACE, error.message, error);

                    return res.status(500).json({
                        message: error.message,
                        error
                    });
                });
        })
        .catch((error) => {
            logging.error(NAMESPACE, error.message, error);

            return res.status(500).json({
                message: error.message,
                error
            });
        });
};

const getAllUsers = (req: Request, res: Response, next: NextFunction) => {
    // Extract admin status from the JWT payload
    const isAdmin = res.locals.jwt.administrator;

    // If not an admin, return an unauthorized error
    if (isAdmin != 1) {
        return res.status(403).json({
            message: 'Only admins have access to all the users data'
        });
    }

    const query = `SELECT _id, username FROM users`;

    Connect()
        .then((connection) => {
            Query<IUser[]>(connection, query)
                .then((users) => {
                    return res.status(200).json({
                        users,
                        count: users.length
                    });
                })
                .catch((error) => {
                    logging.error(NAMESPACE, error.message, error);
                    return res.status(500).json({
                        message: 'Failed to fetch users.',
                        error: error.message
                    });
                })
                .finally(() => {
                    connection.end();
                });
        })
        .catch((error) => {
            logging.error(NAMESPACE, error.message, error);
            return res.status(500).json({
                message: 'Database connection error.',
                error: error.message
            });
        });
};

// Add Virtual Balance
const addBalance = (req: Request, res: Response, next: NextFunction) => {
    const userId = Number(req.params.userId);
    const { amount } = req.body; // amount to be added

    const query = `UPDATE users SET balance = ${amount} balance + ? WHERE _id =${userId} ?`;

    Connect().then((connection) => {
        Query(connection, query)
            .then((result) => {
                res.status(200).json({ message: 'Balance updated successfully' });
            })
            .catch((error) => {
                logging.error(NAMESPACE, error.message, error);
                res.status(500).json({ error: error.message });
            });
    });
};

// Get Virtual Balance
const getBalance = (req: Request, res: Response, next: NextFunction) => {
    let userId = Number(req.params.userId);

    let query = `SELECT balance FROM users WHERE _id = ${userId}`;

    Connect().then((connection) => {
        Query<IUser>(connection, query)
            .then((result) => {
                const balance = result?.balance ?? 0;

                res.status(200).json({ balance });
            })
            .catch((error) => {
                logging.error(NAMESPACE, error.message, error);
                res.status(500).json({ error: error.message });
            });
    });
};

export default { validateToken, register, login, getAllUsers, addBalance, getBalance };
