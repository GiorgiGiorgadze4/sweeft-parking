import { NextFunction, Request, Response } from 'express';
import { ParkingZoneRepository } from '../repositories/parkingZones.repository';
import { ParkingHistoryRepository } from '../repositories/parkingHistory.repository';
import { ParkingZone } from '../models/parkingZones.model';
import { ParkingHistory } from '../models/parkingHistory.model';
import { cancelJob, scheduleJob } from 'node-schedule';
import { UserRepository } from '../repositories/user.repository';
import { IsNull } from 'typeorm';

// const oneHour = 60 * 60 * 1000;
const oneHour = 5 * 1000; // Set to 5 seconds for testing purposes

const getParkingZones = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const parkingZones = await ParkingZoneRepository.find();
        return res.status(200).json(parkingZones);
    } catch (error) {
        return res.status(500).json({ message: 'Error retrieving parking zones' });
    }
};

// Active means not reserved
const getParkingZonesAvailable = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Currently I load all the parking zones and filter them myself,
        // this way of filtering can be improved by writing a correct query
        const allParkingZones = await ParkingZoneRepository.find({ relations: ["parkingHistories"] });
        const availableParkingZones = allParkingZones.filter(zone => {
            // If the parking history is an empty array, then the parking zone is not reserved and should be included as available
            if(!zone.parkingHistories || zone.parkingHistories?.length === 0) return true;

            let parkingZoneReserved = false;
            for(const history of zone?.parkingHistories) {
                if(!history.endTime) parkingZoneReserved = true;
            }

            // Dont include the parking zone if it is resered
            return !parkingZoneReserved;
        })

        return res.status(200).json({ parkingZones: availableParkingZones });
    } catch (error) {
        return res.status(500).json({ message: 'Error retrieving available parking zones', error });
    }
};

async function chargeUser(userId: number, parkingZoneId: number) {
    const user = await UserRepository.findOneBy({ id: userId });
    const parkingZone = await ParkingZoneRepository.findOneBy({ id: parkingZoneId });

    if(!user || !parkingZone) return;

    const newUserBalance = user?.balance - parkingZone.hourlyRate;

    await UserRepository.update(userId, { balance: newUserBalance });

    const parkingZoneHistory = await ParkingHistoryRepository.findOneBy({ userId, parkingZoneId, endTime: IsNull() });

    // If the user still has parking zone reserved, run the job again
    if(parkingZoneHistory && !parkingZoneHistory.endTime) {
        const job = scheduleJob(new Date(Date.now() + oneHour), async function() {
            await chargeUser(userId, parkingZoneId);
        });
        await ParkingHistoryRepository.update(parkingZoneHistory.id, { jobName: job.name })
    }
}

const reserveParkingZone = async (req: Request, res: Response, next: NextFunction) => {
    const userId = Number(res.locals.jwt.userId);

    const { carId, parkingZoneId } = req.body;
    
    try {
        // Check if the parking zone is already reserved
        const parkingZoneHistory = await ParkingHistoryRepository.findOneBy({ userId, parkingZoneId, endTime: IsNull() });
        if(parkingZoneHistory?.endTime) {
            return res.status(400).json({ message: 'Parking Zone already reserved.' });
        }

        // Schedule a job to charge the user after one hour
        const job = scheduleJob(new Date(Date.now() + oneHour), async function() {
            await chargeUser(userId, parkingZoneId);
        });

        // Otherwise, create a new parking history record to store the reservation information
        const parkingHistory = new ParkingHistory();
        parkingHistory.carId = carId;
        parkingHistory.userId = userId;
        parkingHistory.parkingZoneId = parkingZoneId;
        parkingHistory.startTime = new Date(); // Set the current time as the start time of the reservation
        parkingHistory.jobName = job.name;

        await ParkingHistoryRepository.save(parkingHistory);

        return res.status(200).json({ message: 'Parking zone reserved successfully', reservationId: parkingHistory.id });
    } catch (error) {
        return res.status(500).json({ message: 'Error reserving parking zone', error });
    }
};

const releaseParkingZone = async (req: Request, res: Response, next: NextFunction) => {
    const userId = Number(res.locals.jwt.userId);
    const { parkingZoneId } = req.body;

    const parkingZoneHistory = await ParkingHistoryRepository.findOneBy({ userId, parkingZoneId, endTime: IsNull() });
    if(!parkingZoneHistory) {
        return res.status(400).json({ message: "You don't have this parking zone reserved." });
    }

    // Cancel the currently running job
    cancelJob(parkingZoneHistory.jobName || "");

    // Update the parking zone history with the end date to indicate that the parking zone has been released
    await ParkingHistoryRepository.update(
        parkingZoneHistory.id,
        {
            endTime: new Date(),
        }
    )

    return res.status(200).json({ message: 'Parking zone released successfully' });

}

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
        console.log("FULL error: ", error)
        return res.status(500).json({ message: 'Error deleting parking zone', error });
    }
};



export default { getParkingZones, getParkingZonesAvailable, reserveParkingZone, releaseParkingZone, getParkingHistory, getParkingHistoryForUser, editParkingZone, deleteParkingZone, addParkingZone };
