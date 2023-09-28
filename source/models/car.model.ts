import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from './user.model';
import { ParkingHistory } from './parkingHistory.model';

@Entity('cars')
export class Car {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    stateNumber: string;

    @Column()
    type: string;

    @Column()
    userId: number;
    @ManyToOne(() => User, (user) => user.cars, { onDelete: "CASCADE" })
    @JoinColumn()
    user?: User;

    @OneToMany(() => ParkingHistory, (phs) => phs.car)
    parkingHistory?: ParkingHistory[];
}
