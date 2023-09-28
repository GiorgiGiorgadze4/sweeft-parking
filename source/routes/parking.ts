import express from 'express';
import controller from '../controllers/parking';
import { validate } from '../middleware/validate';
import { releaseParkingZoneValidator, reserveParkingZoneValidator } from '../validators/parking.valdaitors';

const router = express.Router();


router.get('/', controller.getParkingZones);
router.get('/available', controller.getParkingZonesAvailable);



router.post('/reserve', validate(reserveParkingZoneValidator), controller.reserveParkingZone);
router.post('/release', validate(releaseParkingZoneValidator), controller.releaseParkingZone);


router.get('/history', controller.getParkingHistoryForUser);

export = router;
