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

    @Column({ nullable: true })
    endTime?: Date;

    @Column({ nullable: true })
    jobName?: string; // Cron job name to be able to cancel at any moment

    @Column()
    userId: number;
    @ManyToOne(() => User, (user) => user.parkingHistory, { onDelete: "CASCADE" })
    @JoinColumn()
    user?: User;

    @Column()
    carId: number;
    @ManyToOne(() => Car, { onDelete: "CASCADE" })
    @JoinColumn()
    car?: Car;

    @Column()
    parkingZoneId: number;
    @ManyToOne(() => ParkingZone, (zone) => zone.parkingHistories, { onDelete: "CASCADE" })
    parkingZone?: ParkingZone;
}
