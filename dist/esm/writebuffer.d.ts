import BN from 'bn.js';
import { WireType } from './wiretype.js';
import { Raw } from './raw.js';
/**
 * Converts an integer value to a bigint.
 *
 * @param {number | bigint | BN | string} value - The integer. A number
 * must be a safe integer. A string must hold a decimal integer.
 * @returns {bigint} The value as a bigint.
 * @throws {Error} If the value is not an integer, or is a number that is
 * not a safe integer.
 */
export declare const toBigInt: (value: number | bigint | BN | string) => bigint;
/**
 * WriteBuffer is a write-only byte buffer that appends to a head and body.
 * It provides methods to write various wire types like INT, RAW, BOOL etc.
 *
 * Each write method writes the canonical form of a value. It throws an
 * error for a value that has no canonical form.
 *
 * @class
 */
export declare class WriteBuffer {
    head: Uint8Array;
    body: Uint8Array;
    offset: number;
    counter: number;
    constructor();
    /**
     * Appends v to the body of the writebuffer and a varint tag describing
     * its offset and the given WireType. The write buffer's offset value is
     * incremented by the length of v after both buffers have been updated.
     *
     * @public
     * @param {WireType} w - Wire type of the data.
     * @param {Uint8Array} v - Array of bytes.
     */
    write(w: WireType, v: Uint8Array): void;
    /**
     * Returns the write buffer contents as bytes.
     *
     * @public
     * @returns {Uint8Array} The concatenated array of bytes formed by
     * concatenating the head and body of the write buffer.
     */
    bytes(): Uint8Array;
    /**
     * Returns the write buffer wrapped with a WIRE_LOAD tag as bytes.
     * This method takes the current length of the head buffer and
     * wire type 'WIRE_LOAD' and combine them to form a new buffer, and
     * then concatenates the new buffer with the head and
     * body of the write buffer.
     *
     * @public
     * @returns {Uint8Array} The concatenated array of bytes formed by
     * concatenating the key buffer, head and body of the write buffer,
     * with the key buffer wrapped with a WIRE_LOAD tag.
     */
    load(): Uint8Array;
    /**
     * Writes the null value to the buffer using the WIRE_NULL tag.
     *
     * @public
     */
    writeNull(): void;
    /**
     * Writes the raw bytes to the buffer with WIRE_RAW tag.
     *
     * @public
     * @param {Raw} value - The raw bytes to be written to the buffer.
     * @throws {Error} If the value is not a Uint8Array.
     */
    writeRaw(value: Raw | Uint8Array): void;
    /**
     * Writes the given boolean value to the write buffer with the
     * WIRE_TRUE or WIRE_FALSE tag.
     *
     * @param {boolean} value - the boolean value that needs to be
     * written to the buffer.
     * @throws {Error} If the value is not a boolean.
     */
    writeBool(value: boolean): void;
    /**
     * Writes the given integer value to the write buffer with the
     * WIRE_POSINT or WIRE_NEGINT tag.
     *
     * The data is the absolute value in big-endian order, with no leading
     * zero bytes. Zero has no data. This is the only encoding that a
     * canonical POLO decoder accepts.
     *
     * @param {number | bigint | BN | string} value - the integer value. A
     * number must be a safe integer. A string must hold a decimal integer.
     * @throws {Error} - throws an error if the input value is not an integer.
     */
    writeInt(value: number | bigint | BN | string): void;
    /**
     * Writes the given float value to the write buffer with the WIRE_FLOAT tag.
     * The data is the IEEE 754 binary64 form in big-endian order. The
     * encoder accepts all numbers: integers, -0, the infinities and NaN.
     *
     * @param {number} value - the float value that needs to be written to the buffer
     * @throws {Error} If the value is not a number.
     */
    writeFloat(value: number): void;
    /**
     * Writes the given string value to the write buffer with
     * the WIRE_WORD tag. The data is the UTF-8 encoding of the string.
     *
     * @param {string} value - the string that needs to be written
     * to the buffer.
     * @throws {Error} If the value is not a well-formed string.
     */
    writeString(value: string): void;
    /**
     * Writes the bytes from the given value to the write buffer with
     * the WIRE_WORD tag.
     *
     * @param {Uint8Array} value - the byte array that needs to
     * be written to the buffer.
     * @throws {Error} If the value is not a Uint8Array.
     */
    writeBytes(value: Uint8Array): void;
}
