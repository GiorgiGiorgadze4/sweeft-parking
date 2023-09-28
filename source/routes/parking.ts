import express from 'express';
import controller from '../controllers/parking';
import { validate } from '../middleware/validate';
import { reserveParkingZoneValidator } from '../validators/parking.valdaitors';

const router = express.Router();

// Route to get all parking zones
router.get('/', controller.getParkingZones);

// Route to reserve a parking zone, :parkingZoneId is a placeholder for the ID of the parking zone
router.post('/reserve', validate(reserveParkingZoneValidator), controller.reserveParkingZone);

// Route to get your parking history
router.get('/history', controller.getParkingHistoryForUser);

export = router;
