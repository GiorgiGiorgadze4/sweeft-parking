import dataSource from '../config/db';
import { ParkingHistory } from '../models/parkingHistory.model';

export const ParkingHistoryRepository = dataSource.getRepository(ParkingHistory).extend({
    // Custom methods go here
});
