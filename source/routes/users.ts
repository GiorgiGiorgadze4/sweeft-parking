import express from 'express';
import controller from '../controllers/users';
import userAuth from '../middleware/userAuth';

const router = express.Router();

router.post('/register', controller.register);
router.post('/login', controller.login);
router.put('/resetpassword', userAuth, controller.getAllUsers); // TODO resetpassword

router.post('/balance', userAuth, controller.addBalance);
router.get('/balance', userAuth, controller.getBalance);

export = router;
