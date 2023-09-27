import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToOne, JoinColumn } from 'typeorm';
import { User } from './user.model';
import { Car } from './car.model';
import { ParkingZone } from './parkingZones.model';

@Entity('parking_histories')
export class ParkingHistory {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    startTime: Date;

    @Column()
    endTime: Date;

    @Column()
    userId: number;
    @ManyToOne(() => User, (user) => user.parkingHistory)
    @JoinColumn()
    user?: User;

    @Column()
    carId: number;
    @OneToOne(() => Car)
    @JoinColumn()
    car?: Car;
    // @OneToOne(() => Car, (car) => car.id)
    // @JoinColumn({ name: 'car' })
    // car: Car;

    @Column()
    parkingZoneId: number;
    @ManyToOne(() => ParkingZone, (zone) => zone.parkingHistories)
    parkingZone?: ParkingZone;
}
