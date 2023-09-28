/**
 * Helper functions to reduce boilerplate code during validation
 */

import { body } from "express-validator";
import { capitalize } from "../utils/string.utils";

export function isNotEmpty(field: string) {
    return body(field, `${capitalize(field)} should not be empty`).notEmpty();
}

export function isString(field: string) {
    return body(field, `${capitalize(field)} should be a string`).isString();
}

export function isNumber(field: string) {
    return body(field, `${capitalize(field)} should be a number`).isNumeric();
}