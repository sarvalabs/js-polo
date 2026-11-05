import { Schema } from './schema.js';
/**
 * The kinds that can be map keys. The POLO Wire Specification permits
 * booleans, integers, floats, strings and fixed-size arrays of these types.
 * js-polo has no fixed-size arrays. It permits `bytes`, because MOI uses
 * fixed-size byte arrays (for example identifiers) as `bytes`. The order of
 * bytes keys is the order of fixed-size byte arrays: byte by byte.
 */
export declare const KEY_KINDS: readonly string[];
/**
 * Throws an error if a schema kind cannot be a map key.
 *
 * @param {Schema} schema - The schema of the keys.
 * @throws {Error} If the kind is not a key kind.
 */
export declare const checkKeySchema: (schema: Schema) => void;
/**
 * A map key in a form that the comparison can use.
 */
export type SortKey = number | bigint | string | Uint8Array;
/**
 * Returns the sort form of a map key. It also examines the key:
 * a key cannot be null, and a float key cannot be NaN.
 *
 * @param {string} kind - The kind of the key.
 * @param {unknown} key - The key.
 * @returns {SortKey} The sort form of the key.
 * @throws {Error} If the key has no order.
 */
export declare const sortKey: (kind: string, key: unknown) => SortKey;
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
export declare const compareKeys: (a: SortKey, b: SortKey) => number;
