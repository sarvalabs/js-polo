import { Buffer } from 'buffer';
import { compareUTF8 } from './utf8.js';
import { toBigInt } from './writebuffer.js';
/**
 * The kinds that can be map keys. The POLO Wire Specification permits
 * booleans, integers, floats, strings and fixed-size arrays of these types.
 * js-polo has no fixed-size arrays. It permits `bytes`, because MOI uses
 * fixed-size byte arrays (for example identifiers) as `bytes`. The order of
 * bytes keys is the order of fixed-size byte arrays: byte by byte.
 */
export const KEY_KINDS = ['bool', 'integer', 'float', 'string', 'bytes'];
/**
 * Throws an error if a schema kind cannot be a map key.
 *
 * @param {Schema} schema - The schema of the keys.
 * @throws {Error} If the kind is not a key kind.
 */
export const checkKeySchema = (schema) => {
    if (!KEY_KINDS.includes(schema.kind)) {
        throw new Error(`invalid map key: a ${schema.kind} cannot be a map key; ` +
            `the key kinds are ${KEY_KINDS.join(', ')}`);
    }
};
/**
 * Returns the sort form of a map key. It also examines the key:
 * a key cannot be null, and a float key cannot be NaN.
 *
 * @param {string} kind - The kind of the key.
 * @param {unknown} key - The key.
 * @returns {SortKey} The sort form of the key.
 * @throws {Error} If the key has no order.
 */
export const sortKey = (kind, key) => {
    if (key === null || key === undefined) {
        throw new Error('invalid map key: a map key cannot be null');
    }
    switch (kind) {
        case 'bool':
            if (typeof key !== 'boolean') {
                throw new Error(`invalid map key: expected a boolean, received ${typeof key}`);
            }
            return key ? 1 : 0;
        case 'integer':
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return toBigInt(key);
        case 'float':
            if (typeof key !== 'number') {
                throw new Error(`invalid map key: expected a number, received ${typeof key}`);
            }
            if (Number.isNaN(key)) {
                throw new Error('invalid map key: a NaN has no order, so it cannot be a map key');
            }
            return key;
        case 'string':
            if (typeof key !== 'string') {
                throw new Error(`invalid map key: expected a string, received ${typeof key}`);
            }
            return key;
        case 'bytes':
            if (!(key instanceof Uint8Array)) {
                throw new Error(`invalid map key: expected a Uint8Array, received ${typeof key}`);
            }
            return key;
        default:
            throw new Error(`invalid map key: a ${kind} cannot be a map key`);
    }
};
/**
 * Compares two map keys in the POLO key order:
 * - bool: false before true.
 * - integer and float: by numeric value. -0 and +0 are equal.
 * - string: byte by byte on the UTF-8 data. A prefix is before a longer string.
 * - bytes: byte by byte. A prefix is before a longer value.
 *
 * @param {SortKey} a - The sort form of the first key.
 * @param {SortKey} b - The sort form of the second key.
 * @returns {number} A negative number if a is before b, 0 if a and b are
 * equal, and a positive number if a is after b.
 */
export const compareKeys = (a, b) => {
    if (typeof a === 'string' && typeof b === 'string') {
        return compareUTF8(a, b);
    }
    if (a instanceof Uint8Array && b instanceof Uint8Array) {
        return Buffer.compare(a, b);
    }
    if (a < b) {
        return -1;
    }
    return a > b ? 1 : 0;
};
