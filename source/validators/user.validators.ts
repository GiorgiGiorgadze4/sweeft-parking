import { body } from 'express-validator';
import { isNotEmpty, isNumber, isString } from '.';

export const registerValidator = [
    isString('username'),
    isNotEmpty('username'),

    isString('password'),
    isNotEmpty('password'),

    body('password', 'The minimum password length is 6 characters').isLength({ min: 6 })
];

export const loginValidator = [
    isString('username'),
    isNotEmpty('username'),

    isString('password'),
    isNotEmpty('password')
];

export const resetPasswordValidator = [
    isString('oldPassword'),
    isNotEmpty('oldPassword'),

    isString('newPassword'),
    isNotEmpty('newPassword')
];

export const addBalanceValidator = [isNumber('amount'), isNotEmpty('amount')];
