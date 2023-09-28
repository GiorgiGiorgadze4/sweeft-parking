import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, OneToOne, Unique, JoinColumn } from 'typeorm';
import { ParkingHistory } from './parkingHistory.model';
import { User } from './user.model';
import { Car } from './car.model';

@Entity('parking_zones')
export class ParkingZone {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    name: string;

    @Column()
    location: string;

    @Column()
    hourlyRate: number;

    @OneToMany(() => ParkingHistory, (history) => history.parkingZone, { onDelete: "CASCADE" })
    parkingHistories?: ParkingHistory[];
}
