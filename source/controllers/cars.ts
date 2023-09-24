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

const addCar = (req: Request, res: Response, next: NextFunction) => {
    const { name, state_number, type } = req.body;

    const isAdmin = res.locals.jwt.administrator;
    const userId = res.locals.jwt.userId;

    // Convert userId to a number, and ensure it's valid
    const userIdToAddCar = Number(req.params.userId);
    if (isNaN(userIdToAddCar)) {
        return res.status(400).json({ message: 'Invalid user ID.' });
    }

    if (!isAdmin && userId !== userIdToAddCar) {
        return res.status(403).json({
            message: 'Forbidden'
        });
    }

    // Input validation (you can expand on this)
    if (!name || !state_number || !type) {
        return res.status(400).json({ message: 'Incomplete car details.' });
    }

    const query = `INSERT INTO cars (user_id, name, state_number, type) VALUES (${userIdToAddCar},"${name}","${state_number}", "${type}")`;

    Connect()
        .then((connection) => {
            Query<IMySQLResult>(connection, query)
                .then((result) => {
                    return res.status(201).json({
                        message: 'Car added successfully',
                        carId: result.insertId
                    });
                })
                .catch((error) => {
                    logging.error(NAMESPACE, error.message, error);
                    return res.status(500).json({
                        message: 'Database error',
                        error: error.message // Sending detailed database error messages might be a security risk
                    });
                })
                .finally(() => {
                    connection.end(); // Ensure you close the connection
                });
        })
        .catch((error) => {
            logging.error(NAMESPACE, error.message, error);
            return res.status(500).json({
                message: 'Database connection error',
                error: error.message // Similarly, avoid sending detailed error messages to the client
            });
        });
};

const getUserCars = (req: Request, res: Response, next: NextFunction) => {
    let userId = req.params.userId;

    let query = `SELECT * FROM cars WHERE user_id = ${userId}`;

    Connect()
        .then((connection) => {
            Query<ICar[]>(connection, query)
                .then((cars) => {
                    return res.status(200).json({
                        cars
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
// Edit Car
const editCar = (req: Request, res: Response, next: NextFunction) => {
    const carId = Number(req.params.carId); // Assuming carId is passed in params
    const { name, state_number, type } = req.body;

    const query = `UPDATE cars SET name="${name}", state_number="${state_number}", type="${type}" WHERE id=${carId}`;

    Connect().then((connection) => {
        Query(connection, query)
            .then((result) => {
                res.status(200).json({ message: 'Car updated successfully' });
            })
            .catch((error) => {
                logging.error(NAMESPACE, error.message, error);
                res.status(500).json({ error: error.message });
            });
    });
};

// Delete Car
const deleteCar = (req: Request, res: Response, next: NextFunction) => {
    const carId = Number(req.params.carId);

    const query = `DELETE FROM cars WHERE id=${carId} `;

    Connect().then((connection) => {
        Query(connection, query)
            .then((result) => {
                res.status(200).json({ message: 'Car deleted successfully' });
            })
            .catch((error) => {
                logging.error(NAMESPACE, error.message, error);
                res.status(500).json({ error: error.message });
            });
    });
};

export default { addCar, getUserCars, editCar, deleteCar };
