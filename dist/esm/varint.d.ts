import BN from 'bn.js';
import ByteReader from './bytereader';
/**
 * Class for encoding and decoding variable-length integers (varints).
 *
 * @class
 */
declare class Varint {
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
    static append(b: Uint8Array, v: number | BN): Uint8Array;
    /**
     * This method reads a varint-encoded value from a given byte reader and
     * returns the decoded value and number of bytes consumed
     *
     * @param {ByteReader} br - The byte reader object from which the
     * varint should be read.
     * @returns {[number, number]} A tuple containing the decoded varint value
     * and the number of bytes consumed from the reader.
     * @throws {Error} If an invalid varint is encountered in the reader or
     * the varint overflows 64-bit integer or varint terminated prematurely.
     */
    static consume(br: ByteReader): [number, number];
}
export default Varint;
