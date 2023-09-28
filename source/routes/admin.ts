import express from 'express';
import userController from '../controllers/users';
import carController from '../controllers/cars';
import parkingController from '../controllers/parking';

const router = express.Router();

router.get('/users', userController.getAllUsers);
router.get('/cars/user/:userId', carController.getUserCars);

router.post('/parking/zone/add', parkingController.addParkingZone);
router.patch('/parking/zone/:parkingZoneId', parkingController.editParkingZone);
router.delete('/parking/zone/:parkingZoneId', parkingController.deleteParkingZone);

router.get('/parking/history/:parkingZoneId', parkingController.getParkingHistory);

export default router;
