import { Buffer } from 'buffer';
/**
 * Returns true if a string is well-formed UTF-16. A well-formed string has
 * no lone surrogate. Only a well-formed string has a UTF-8 encoding.
 *
 * @param {string} value - The string to examine.
 * @returns {boolean} True if the string is well-formed.
 */
export declare const isWellFormed: (value: string) => boolean;
/**
 * Encodes a string as UTF-8. POLO does not normalize strings.
 *
 * @param {string} value - The string to encode.
 * @returns {Buffer} The UTF-8 bytes of the string.
 * @throws {Error} If the value is not a string or is not well-formed. The
 * encoder must not change a lone surrogate to U+FFFD.
 */
export declare const encodeUTF8: (value: string) => Buffer;
/**
 * Decodes UTF-8 data into a string. The data must be valid UTF-8 as the
 * Unicode standard defines it. Thus the decoder rejects overlong forms,
 * surrogates and code points above U+10FFFF.
 *
 * @param {Uint8Array} data - The UTF-8 data.
 * @returns {string} The string.
 * @throws {Error} If the data is not valid UTF-8.
 */
export declare const decodeUTF8: (data: Uint8Array) => string;
/**
 * Compares two well-formed strings in the order of their UTF-8 bytes. This
 * order is the same as the order of the code points. It is not the same as
 * the UTF-16 order of JavaScript: for example, U+FFFF is before U+10000.
 *
 * @param {string} a - The first string.
 * @param {string} b - The second string.
 * @returns {number} A negative number if a is before b, 0 if a and b are
 * equal, and a positive number if a is after b.
 */
export declare const compareUTF8: (a: string, b: string) => number;
