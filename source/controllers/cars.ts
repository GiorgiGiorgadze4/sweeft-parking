import { NextFunction, Request, Response } from 'express';
import { Car } from '../models/car.model';
import { CarRepository } from '../repositories/car.repository';

const getMyCars = async (req: Request, res: Response, next: NextFunction) => {
    const userId = res.locals.jwt.userId;

    try {
        const cars = await CarRepository.find({ where: { userId: userId } });
        return res.status(200).json({ cars });
    } catch (error) {
        return res.status(500).json({ message: 'Error fetching cars' });
    }
};

const addCar = async (req: Request, res: Response, next: NextFunction) => {
    const userId = res.locals.jwt.userId;
    const { name, stateNumber, type } = req.body;

    const car = new Car();
    car.name = name || car.name;
    car.stateNumber = stateNumber || car.stateNumber;
    car.type = type || car.type;
    car.userId = userId;

    try {
        const newCar = await CarRepository.save(car);
        return res.status(201).json({ message: 'Car added successfully', car: newCar });
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
    const { name, stateNumber, type } = req.body;

    // TODO: Check if the car belongs to the user

    try {
        await CarRepository.update(carId, { name, stateNumber, type });
        const updatedCar = await CarRepository.findOneBy({ id: carId });
        return res.status(200).json({
            message: 'Car updated successfully',
            car: updatedCar,
        });
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

export default { getMyCars, addCar, getUserCars, editCar, deleteCar };
