import { NextFunction, Request, Response } from 'express';

import { Car } from '../models/car.model';
import { CarRepository } from '../repositories/car.repository';
const addCar = async (req: Request, res: Response, next: NextFunction) => {
    const { name, state_number, type } = req.body;
    const isAdmin = res.locals.jwt.administrator;
    const userId = res.locals.jwt.userId;
    const userIdToAddCar = Number(req.params.userId);

    if (isNaN(userIdToAddCar) || (!isAdmin && userId !== userIdToAddCar)) {
        return res.status(403).json({ message: 'Forbidden' });
    }

    if (!name || !state_number || !type) {
        return res.status(400).json({ message: 'Incomplete car details.' });
    }

    const car = new Car();
    car.name = name;
    car.stateNumber = state_number;
    car.type = type;
    car.userId = userIdToAddCar;

    try {
        const newCar = await CarRepository.save(car);
        return res.status(201).json({ message: 'Car added successfully', carId: newCar.id });
    } catch (error) {
        return res.status(500).json({ message: 'Database error' });
    }
};
const getUserCars = async (req: Request, res: Response, next: NextFunction) => {
    const userId = Number(req.params.userId);

    try {
        const cars = await CarRepository.find({ where: { userId: userId } });
        return res.status(200).json({ cars });
    } catch (error) {
        return res.status(500).json({ message: 'Error fetching cars' });
    }
};

const editCar = async (req: Request, res: Response, next: NextFunction) => {
    const carId = Number(req.params.carId);
    const { name, state_number, type } = req.body;

    try {
        await CarRepository.update(carId, { name, stateNumber: state_number, type });
        return res.status(200).json({ message: 'Car updated successfully' });
    } catch (error) {
        return res.status(500).json({ message: 'Error updating car' });
    }
};

const deleteCar = async (req: Request, res: Response, next: NextFunction) => {
    const carId = Number(req.params.carId);

    try {
        await CarRepository.delete(carId);
        return res.status(200).json({ message: 'Car deleted successfully' });
    } catch (error) {
        return res.status(500).json({ message: 'Error deleting car' });
    }
};

export default { addCar, getUserCars, editCar, deleteCar };
// import { NextFunction, Request, Response } from 'express';
// import bcryptjs from 'bcryptjs';
// import logging from '../config/logging';
// import signJWT from '../functions/signJWT';
// import { Connect, Query } from '../config/db';
// import { User } from '../models/user.model';
// import IMySQLResult from '../interfaces/result';
// import { use } from '../routes/users';
// import { Car } from '../models/car.model';
// const NAMESPACE = 'User';

// const addCar = (req: Request, res: Response, next: NextFunction) => {
//     const { name, state_number, type } = req.body;

//     const isAdmin = res.locals.jwt.administrator;
//     const userId = res.locals.jwt.userId;

//     // Convert userId to a number, and ensure it's valid
//     const userIdToAddCar = Number(req.params.userId);
//     if (isNaN(userIdToAddCar)) {
//         return res.status(400).json({ message: 'Invalid user ID.' });
//     }

//     if (!isAdmin && userId !== userIdToAddCar) {
//         return res.status(403).json({
//             message: 'Forbidden'
//         });
//     }

//     // Input validation (you can expand on this)
//     if (!name || !state_number || !type) {
//         return res.status(400).json({ message: 'Incomplete car details.' });
//     }

//     const query = `INSERT INTO cars (user_id, name, state_number, type) VALUES (${userIdToAddCar},"${name}","${state_number}", "${type}")`;

//     Connect()
//         .then((connection) => {
//             Query<IMySQLResult>(connection, query)
//                 .then((result) => {
//                     return res.status(201).json({
//                         message: 'Car added successfully',
//                         carId: result.insertId
//                     });
//                 })
//                 .catch((error) => {
//                     logging.error(NAMESPACE, error.message, error);
//                     return res.status(500).json({
//                         message: 'Database error',
//                         error: error.message // Sending detailed database error messages might be a security risk
//                     });
//                 })
//                 .finally(() => {
//                     connection.end(); // Ensure you close the connection
//                 });
//         })
//         .catch((error) => {
//             logging.error(NAMESPACE, error.message, error);
//             return res.status(500).json({
//                 message: 'Database connection error',
//                 error: error.message // Similarly, avoid sending detailed error messages to the client
//             });
//         });
// };

// const getUserCars = (req: Request, res: Response, next: NextFunction) => {
//     let userId = req.params.userId;

//     let query = `SELECT * FROM cars WHERE user_id = ${userId}`;

//     Connect()
//         .then((connection) => {
//             Query<Car[]>(connection, query)
//                 .then((cars) => {
//                     return res.status(200).json({
//                         cars
//                     });
//                 })
//                 .catch((error) => {
//                     logging.error(NAMESPACE, error.message, error);
//                     return res.status(500).json({
//                         message: error.message,
//                         error
//                     });
//                 });
//         })
//         .catch((error) => {
//             logging.error(NAMESPACE, error.message, error);
//             return res.status(500).json({
//                 message: error.message,
//                 error
//             });
//         });
// };
// // Edit Car
// const editCar = (req: Request, res: Response, next: NextFunction) => {
//     const carId = Number(req.params.carId); // Assuming carId is passed in params
//     const { name, state_number, type } = req.body;

//     const query = `UPDATE cars SET name="${name}", state_number="${state_number}", type="${type}" WHERE id=${carId}`;

//     Connect().then((connection) => {
//         Query(connection, query)
//             .then((result) => {
//                 res.status(200).json({ message: 'Car updated successfully' });
//             })
//             .catch((error) => {
//                 logging.error(NAMESPACE, error.message, error);
//                 res.status(500).json({ error: error.message });
//             });
//     });
// };

// // Delete Car
// const deleteCar = (req: Request, res: Response, next: NextFunction) => {
//     const carId = Number(req.params.carId);

//     const query = `DELETE FROM cars WHERE id=${carId} `;

//     Connect().then((connection) => {
//         Query(connection, query)
//             .then((result) => {
//                 res.status(200).json({ message: 'Car deleted successfully' });
//             })
//             .catch((error) => {
//                 logging.error(NAMESPACE, error.message, error);
//                 res.status(500).json({ error: error.message });
//             });
//     });
// };

// export default { addCar, getUserCars, editCar, deleteCar };
