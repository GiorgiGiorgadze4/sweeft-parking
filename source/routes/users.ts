import express from 'express';
import controller from '../controllers/users';
import userAuth from '../middleware/userAuth';
import { validate } from '../middleware/validate';
import { addBalanceValidator, loginValidator, registerValidator } from '../validators/user.validators';

const router = express.Router();

router.post('/register', validate(registerValidator), controller.register);
router.post('/login', validate(loginValidator), controller.login);

router.put('/resetpassword', userAuth, controller.getAllUsers); // TODO: resetpassword

router.post('/balance', userAuth, validate(addBalanceValidator), controller.addBalance);
router.get('/balance', userAuth, controller.getBalance);

export = router;
