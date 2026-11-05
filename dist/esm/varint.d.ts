import BN from 'bn.js';
import ByteReader from './bytereader.js';
/**
 * Class for encoding and decoding variable-length integers (varints).
 * POLO uses unsigned LEB128 for tags.
 *
 * @class
 */
declare class Varint {
    /**
     * Encodes a non-negative integer as a LEB128 integer.
     *
     * This method does not use the 32-bit bitwise operators. Thus it gives
     * the correct bytes for all safe integers.
     *
     * @param {number} num - The integer to encode.
     * @returns {Uint8Array} The LEB128 bytes.
     */
    static encode(num: number): Uint8Array;
    static size(v: number | BN): number;
    /**
     * Appends a given number to a given byte array as a varint-encoded value.
     *
     * @param {Uint8Array} bytes - The byte array to which the varint
     * should be appended.
     * @param {number} v - The number value to be appended as a varint.
     * @returns {Uint8Array} A new byte array containing the original array and
     * the varint-encoded value.
     */
    static append(b: Uint8Array, v: number | bigint | BN): Uint8Array;
    /**
     * Reads one LEB128 integer from a byte reader. It returns the value and
     * the number of bytes that it read.
     *
     * The decoder accepts only the canonical form (rule C1):
     * - The integer must be complete. The data must not stop before a byte
     *   with a most significant bit of 0.
     * - The encoding must be minimal. A last byte of 0 is not permitted
     *   after the first byte. For example, 83 00 is not valid.
     * - The integer must fit in 64 bits. The maximum length is 10 bytes, and
     *   the tenth byte must be 0 or 1.
     *
     * A value above 2^53 - 1 is not exact. A tag with such a value is never
     * valid, because its offset is more than the length of all data.
     *
     * @param {ByteReader} br - The byte reader that holds the varint.
     * @returns {number[]} The value and the number of bytes read.
     * @throws {Error} If the varint is not complete, not minimal, or does
     * not fit in 64 bits.
     */
    static consume(br: ByteReader): [number, number];
}
export default Varint;
