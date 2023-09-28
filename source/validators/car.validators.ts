import { isNotEmpty, isString } from '.';

export const addCarValidator = [
    isString('name'),
    isNotEmpty('name'),
    
    isString('stateNumber'),
    isNotEmpty('stateNumber'),

    isString('type'),
    isNotEmpty('type'),
];

export const editCarValidator = [
    isString('name'),
    isString('stateNumber'),
    isString('type'),
]