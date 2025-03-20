import BN from 'bn.js';
import { WireType } from './wiretype';
import { Raw } from './raw';
/**
 * WriteBuffer is a write-only byte buffer that appends to a head and body.
 * It provides methods to write various wire types like INT, RAW, BOOL etc.
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
     * Checks if the given value is a safe integer.
     *
     * @param {number} value - The value to be checked.
     * @private
     * @returns {boolean} - Returns true if the value is a safe integer,
     * false otherwise.
     */
    private isInt;
    /**
     * Checks if the given value is a floating point number.
     *
     * @private
     * @param {number} value - The value to be checked.
     * @returns {boolean} - Returns true if the value is a
     * floating point number, false otherwise.
     */
    private isFloat;
    /**
     * Returns the size in bytes of the input value.
     *
     * @private
     * @param {number | BN} value - The value (either number or big integer)
     * whose size is to be determined.
     * @returns {number} - The size in bytes of the input value.
     * @throws {Error} - Throws an error if the input value is not a number or
     * big integer.
     */
    private intSize;
    /**
     * Returns the sign of the input value.
     *
     * @private
     * @param {number | BN} value - The value (either number or big integer)
     * whose sign is to be determined.
     * @returns {number} - The sign of the input value (1 if positive, -1 if
     * negative, 0 if zero).
     * @throws {Error} - Throws an error if the input value is not a number or
     * big integer.
     */
    private sign;
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
     */
    writeRaw(value: Raw): void;
    /**
     * Writes the given boolean value to the write buffer with the
     * WIRE_TRUE or WIRE_FALSE tag.
     *
     * @param {boolean} value - the boolean value that needs to be
     * written to the buffer.
     */
    writeBool(value: boolean): void;
    /**
     * Writes the given integer value to the write buffer with the
     * WIRE_POSINT or WIRE_NEGINT tag.
     *
     * @param {number | BN} value - the integer value (either number or
     * big integer) that needs to be written to the buffer.
     * @throws {Error} - throws an error if the input value is not an integer.
     */
    writeInt(value: number | BN): void;
    /**
     * Writes the given float value to the write buffer with the WIRE_FLOAT tag.
     *
     * @param {number} value - the float value that needs to be written to the buffer
     * @throws {Error} An error if the input value is an integer
     */
    writeFloat(value: number): void;
    /**
     * Writes the given string value to the write buffer with
     * the WIRE_WORD tag.
     *
     * @param {string} value - the string that needs to be written
     * to the buffer.
     */
    writeString(value: string): void;
    /**
     * Writes the bytes from the given value to the write buffer with
     * the WIRE_WORD tag.
     *
     * @param {Uint8Array} value - the byte array that needs to
     * be written to the buffer.
     */
    writeBytes(value: Uint8Array): void;
}
