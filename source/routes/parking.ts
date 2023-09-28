import express from 'express';
import controller from '../controllers/parking';

const router = express.Router();

// Route to get all parking zones
router.get('/', controller.getParkingZones);

// Route to reserve a parking zone, :parkingZoneId is a placeholder for the ID of the parking zone
router.post('/reserve', controller.reserveParkingZone);

// Route to get your parking history
router.get('/history', controller.getParkingHistoryForUser);

export = router;
