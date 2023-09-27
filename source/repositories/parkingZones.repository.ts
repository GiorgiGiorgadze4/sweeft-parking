import dataSource from '../config/db';
import { ParkingZone } from '../models/parkingZones.model';

export const ParkingZoneRepository = dataSource.getRepository(ParkingZone).extend({
    // Custom methods go here
});
