/// <reference types="node" />
import { Buffer } from 'buffer';
import LoadReader from './loadreader';
import { WireType } from './wiretype';
import { Raw } from './raw';
/**
 * Class representing a ReadBuffer. ReadBuffer is a is a read-only buffer
 * that is obtained from a single tag and its body.
 *
 * @class
 * @param {Buffer} data - An buffer that needs to be read.
 * @param {WireType} wire - The wire type of the data in buffer.
 */
export declare class ReadBuffer {
    wire: WireType;
    data: Buffer;
    constructor(data: Uint8Array, wiretype?: WireType);
    /**
     * Creates and returns a loadreader from the readbuffer.
     *
     * @public
     * @returns {LoadReader} It returns a loadreader from a readbuffer or
     * throws an error if the wiretype of the readbuffer is not compound (pack).
     */
    load(): LoadReader;
    /**
     * Returns a buffer by consuming n number of bytes from the bytereader.
     *
     * @private
     * @param {ByteReader} br - bytereader to consume data.
     * @param {number} n - number of bytes that need to be consumed.
     * @returns {Buffer} consumes n number of bytes from the
     * bytereader and returns it as a buffer or throws an error
     * if the bytereader does not have n number of bytes.
     */
    private read;
    /**
     * Returns the read buffer as bytes.
     *
     * @public
     * @returns {Uint8Array} read buffer as bytes by concatenating
     * the data members wire and buffer of the read buffer.
     */
    bytes(): Uint8Array;
    readNull(): null;
    readRaw(): Raw;
    readBool(): boolean;
    readString(): string;
    private readUInt;
    readInteger(): number | bigint;
    readFloat(): number;
    readBytes(): Uint8Array;
}
