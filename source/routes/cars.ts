import express from 'express';

import controller from '../controllers/cars';
const router = express.Router();

router.get('/', controller.getMyCars);
router.post('/', controller.addCar);
router.patch('/:carId', controller.editCar);
router.delete('/:carId', controller.deleteCar);

export = router;
