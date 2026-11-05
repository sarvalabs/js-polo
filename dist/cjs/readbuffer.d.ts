/// <reference types="node" />
/// <reference types="node" />
import { Buffer } from 'buffer';
import LoadReader from './loadreader.js';
import { WireType } from './wiretype.js';
import { Raw } from './raw.js';
/**
 * Returns the error for an element with a wire type that the target type
 * does not accept.
 *
 * @param {WireType} wire - The wire type of the element.
 * @param {string} target - The name of the target type.
 * @returns {Error} The error.
 */
export declare const incompatibleWire: (wire: WireType, target: string) => Error;
/**
 * Class representing a ReadBuffer. ReadBuffer is a is a read-only buffer
 * that is obtained from a single tag and its body.
 *
 * Each read method examines the wire type and the data of the element. It
 * accepts only the canonical form of a value, and it throws an error for
 * all other forms.
 *
 * @class
 * @param {Buffer} data - An buffer that needs to be read.
 * @param {WireType} wire - The wire type of the data in buffer.
 */
export declare class ReadBuffer {
    wire: WireType;
    data: Buffer;
    /**
     * Creates a ReadBuffer.
     *
     * - With a wire type, the data is the data of one element. A LoadReader
     *   uses this form for the elements of a load.
     * - Without a wire type, the data is a complete wire. The constructor
     *   reads the tag of the top-level element. The wire must have at least
     *   one byte, the tag must be complete and minimal (rule C1), and the
     *   offset of the tag must be 0 (rule C2). The data of the element is
     *   all bytes after the tag.
     *
     * @param {Uint8Array} data - The data of an element, or a complete wire.
     * @param {WireType} wiretype - The wire type of the element, if the data
     * is the data of one element.
     * @throws {Error} If the wire is empty or the top-level tag is not valid.
     */
    constructor(data: Uint8Array, wiretype?: WireType);
    /**
     * Creates and returns a loadreader from the readbuffer.
     *
     * The data of a compound element starts with a load tag. The offset of
     * the load tag is the length of the head. The body is the data after the
     * head. The load tag must be complete and minimal (rule C1), and the
     * head must not be longer than the remaining data (rule C6).
     *
     * @public
     * @returns {LoadReader} It returns a loadreader from a readbuffer or
     * throws an error if the wiretype of the readbuffer is not compound (pack).
     */
    load(): LoadReader;
    /**
     * Returns the read buffer as bytes.
     *
     * @public
     * @returns {Uint8Array} read buffer as bytes by concatenating
     * the data members wire and buffer of the read buffer.
     */
    bytes(): Uint8Array;
    /**
     * Throws an error if the wire type of the element is not the given
     * wire type.
     *
     * @private
     * @param {WireType} wire - The wire type that the element must have.
     * @param {string} target - The name of the target type.
     */
    private expect;
    /**
     * Throws an error if the element has data. A Null, a False and a True
     * have no data (rule C4).
     *
     * @private
     */
    private expectNoData;
    readNull(): null;
    readRaw(): Raw;
    readBool(): boolean;
    readString(): string;
    /**
     * Reads a PosInt or a NegInt element into an integer (rule C3).
     *
     * The data is the magnitude in big-endian order. It must not start with
     * a zero byte. Zero is a PosInt with no data, and a NegInt must have data
     * because negative zero does not exist. The magnitude has no size limit.
     *
     * @returns {number | bigint} A number if the value is a safe integer,
     * else a bigint.
     * @throws {Error} If the element is not an integer or is not minimal.
     */
    readInteger(): number | bigint;
    readFloat(): number;
    readBytes(): Uint8Array;
}
