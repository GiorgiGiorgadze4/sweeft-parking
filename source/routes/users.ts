import express from 'express';
import controller from '../controllers/users';

const router = express.Router();

router.get('/validate', controller.validateToken);
router.post('/register', controller.register);
router.post('/login', controller.login);
router.get('/all', controller.getAllUsers);
router.put('/resetpassword', controller.getAllUsers);

router.post('/:userId/balance', controller.addBalance);
router.get('/:userId/balance', controller.getBalance);

export = router;
