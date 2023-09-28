import dataSource from '../config/db';
import { Car } from '../models/car.model';

export const CarRepository = dataSource.getRepository(Car).extend({

});
