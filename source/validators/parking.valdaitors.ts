import { isNotEmpty, isNumber, isString } from '.';

export const reserveParkingZoneValidator = [
    isString('carId'),
    isNotEmpty('carId'),
    
    isString('parkingZoneId'),
    isNotEmpty('parkingZoneId'),
];

export const addParkingZoneValidator = [
    isString('name'),
    isNotEmpty('name'),
    
    isString('location'),
    isNotEmpty('location'),
    
    isNumber('hourlyRate'),
    isNotEmpty('hourlyRate'),
];

export const editParkingZoneValidator = [
    isString('name'),
    isString('location'),
    isNumber('hourlyRate'),
]