import express from 'express';
import parkingController from '../controllers/parking';

const router = express.Router();

// Route to get all parking zones
router.get('/', parkingController.getParkingZones);

// Route to reserve a parking zone, :parkingZoneId is a placeholder for the ID of the parking zone
router.post('/reserve', parkingController.reserveParkingZone);

// Route to get the parking history for a specific parking zone
router.get('/history/:parkingZoneId', parkingController.getParkingHistory);
router.post('/add', parkingController.addParkingZone); // Added new route here
router.patch('/:parkingZoneId', parkingController.editParkingZone);
router.delete('/:parkingZoneId', parkingController.deleteParkingZone);

router.post;
export = router;
