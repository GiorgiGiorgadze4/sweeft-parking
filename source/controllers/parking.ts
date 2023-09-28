import { NextFunction, Request, Response } from 'express';

import { ParkingZoneRepository } from '../repositories/parkingZones.repository';
import { UserRepository } from '../repositories/user.repository';
import { ParkingHistoryRepository } from '../repositories/parkingHistory.repository';
import { CarRepository } from '../repositories/car.repository';
import { ParkingZone } from '../models/parkingZones.model';
import { ParkingHistory } from '../models/parkingHistory.model';
const getParkingZones = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const parkingZones = await ParkingZoneRepository.find();
        return res.status(200).json(parkingZones);
    } catch (error) {
        return res.status(500).json({ message: 'Error retrieving parking zones' });
    }
};

const reserveParkingZone = async (req: Request, res: Response, next: NextFunction) => {
    const userId = Number(res.locals.jwt.userId);

    const { carId, parkingZoneId } = req.body;
    
    try {
        const user = await UserRepository.findOne({ where: { id: userId } });

        const parkingZone = await ParkingZoneRepository.findOne({ where: { id: parkingZoneId } });
        const car = await CarRepository.findOne({ where: { id: carId } });

        if (!user || !parkingZone || !car) {
            return res.status(404).json({ message: 'User, car, or parking zone not found' });
        }

        // You can add logic here to check if the parking zone is already reserved

        // Create a new parking history record to store the reservation information
        const parkingHistory = new ParkingHistory();
        parkingHistory.carId = carId;
        parkingHistory.userId = userId;
        parkingHistory.parkingZoneId = parkingZoneId;
        parkingHistory.startTime = new Date(); // Set the current time as the start time of the reservation

        await ParkingHistoryRepository.save(parkingHistory); // Save the reservation information in the database
        return res.status(200).json({ message: 'Parking zone reserved successfully', reservationId: parkingHistory.id });
    } catch (error) {
        return res.status(500).json({ message: 'Error reserving parking zone', error });
    }
};

const getParkingHistory = async (req: Request, res: Response, next: NextFunction) => {
    const parkingZoneId = Number(req.params.parkingZoneId);
    try {
        const history = await ParkingHistoryRepository.find({ where: { parkingZoneId: parkingZoneId }, relations: ['parkingZone', 'car', 'user'] });
        return res.status(200).json(history);
    } catch (error) {
        return res.status(500).json({ message: 'Error fetching parking history' });
    }
};

const getParkingHistoryForUser = async (req: Request, res: Response, next: NextFunction) => {
    const userId = res.locals.jwt.userId;
    try {
        const history = await ParkingHistoryRepository.find({
            where: { userId: userId },
            relations: ['parkingZone', 'car']
        });
        return res.status(200).json(history);
    } catch (error) {
        return res.status(500).json({ message: 'Error fetching parking history' });
    }
};

const addParkingZone = async (req: Request, res: Response, next: NextFunction) => {
    const { name, location, hourlyRate } = req.body;

    const parkingZone = new ParkingZone();
    parkingZone.name = name;
    parkingZone.location = location;
    parkingZone.hourlyRate = hourlyRate;

    try {
        const newParkingZone = await ParkingZoneRepository.save(parkingZone);
        return res.status(201).json({ message: 'Parking zone added successfully', parkingZone: newParkingZone });
    } catch (error) {
        return res.status(500).json({ message: 'Database error', error });
    }
};

const editParkingZone = async (req: Request, res: Response, next: NextFunction) => {
    const parkingZoneId = Number(req.params.parkingZoneId);
    const { name, location, hourlyRate } = req.body;

    try {
        const parkingZone = await ParkingZoneRepository.findOne({ where: { id: parkingZoneId } });
        if (!parkingZone) {
            return res.status(404).json({ message: 'Parking zone not found' });
        }

        parkingZone.name = name || parkingZone.name;
        parkingZone.location = location || parkingZone.location;
        parkingZone.hourlyRate = hourlyRate || parkingZone.hourlyRate;

        const updatedParkingZone = await ParkingZoneRepository.save(parkingZone);
        return res.status(200).json({ message: 'Parking zone updated successfully', parkingZone: updatedParkingZone });
    } catch (error) {
        return res.status(500).json({ message: 'Error updating parking zone', error });
    }
};

const deleteParkingZone = async (req: Request, res: Response, next: NextFunction) => {
    const parkingZoneId = Number(req.params.parkingZoneId);

    try {
        const parkingZone = await ParkingZoneRepository.findOne({ where: { id: parkingZoneId } });

        if (!parkingZone) {
            return res.status(404).json({ message: 'Parking zone not found' });
        }

        await ParkingZoneRepository.delete(parkingZoneId);
        return res.status(200).json({ message: 'Parking zone deleted successfully' });
    } catch (error) {
        return res.status(500).json({ message: 'Error deleting parking zone', error });
    }
};

// TODO: const getMyParkingHistory

export default { getParkingZones, reserveParkingZone, getParkingHistory, getParkingHistoryForUser, editParkingZone, deleteParkingZone, addParkingZone };
