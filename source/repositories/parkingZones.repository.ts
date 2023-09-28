import dataSource from '../config/db';
import { ParkingZone } from '../models/parkingZones.model';

export const ParkingZoneRepository = dataSource.getRepository(ParkingZone).extend({
    // Custom methods go here
    async findByIdExact(id: number): Promise<ParkingZone> {
        const parkingZone = await this.findOneBy({ id });
        if(!parkingZone) {
            throw new Error(`Parking zone with id ${id} can not be found`)
        }
        return parkingZone;
    }
});
