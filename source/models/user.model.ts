import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Car } from './car.model';
import { ParkingZone } from './parkingZones.model';
import { ParkingHistory } from './parkingHistory.model';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    username: string;

    // Protect the password field
    // You will have to explicitly add ".addSelect('password')" to get this field
    @Column({ select: false })
    password: string;

    @Column()
    administrator: boolean;

    @Column({ default: 0 })
    balance: number = 100;

    @OneToMany(() => Car, (car) => car.user, { onDelete: "CASCADE" })
    cars?: Car[];

    @OneToMany(() => ParkingHistory, (phs) => phs.user, { onDelete: "CASCADE" })
    parkingHistory?: ParkingHistory[];
    // @OneToMany(() => ParkingZone, (parking_zones) => parking_zones.user)
    // zones: ParkingZone[];
}
