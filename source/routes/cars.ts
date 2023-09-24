import express from 'express';

import controller from '../controllers/cars';
const router = express.Router();

router.post('/user/:userId', controller.addCar);
router.get('/user/:userId', controller.getUserCars);

router.patch('/:carId', controller.editCar);
router.delete('/:carId', controller.deleteCar);

export = router;
