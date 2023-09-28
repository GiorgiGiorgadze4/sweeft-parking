import express from 'express';

import controller from '../controllers/cars';
import { validate } from '../middleware/validate';
import { addCarValidator } from '../validators/car.validators';
const router = express.Router();

router.get('/', controller.getMyCars);
router.post('/', validate(addCarValidator), controller.addCar);
router.patch('/:carId', controller.editCar);
router.delete('/:carId', controller.deleteCar);

export = router;
