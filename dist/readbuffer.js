import BN from 'bn.js';
import ByteReader from './bytereader';
import Varint from './varint';
import LoadReader from './loadreader';
import { Wire, WireType } from './wiretype';
import { Raw } from './raw';
// const MaxInt64 = 1 << 63 - 1;
/**
 * Class representing a ReadBuffer. ReadBuffer is a is a read-only buffer
 * that is obtained from a single tag and its body.
 *
 * @class
 * @param {Buffer} data - An buffer that needs to be read.
 * @param {WireType} wire - The wire type of the data in buffer.
 */
export class ReadBuffer {
    wire;
    data;
    constructor(data, wiretype) {
        if (wiretype) {
            this.wire = wiretype;
            this.data = Buffer.from(data);
        }
        else {
            const byteReader = new ByteReader(Buffer.from(data));
            // Attempt to consume a varint from the buffer
            const [tag, consumed] = Varint.consume(byteReader);
            this.wire = tag & 15;
            this.data = Buffer.from(data).subarray(consumed);
        }
    }
    /**
     * Creates and returns a loadreader from the readbuffer.
     *
     * @public
     * @returns {LoadReader} It returns a loadreader from a readbuffer or
     * throws an error if the wiretype of the readbuffer is not compound (pack).
     */
    load() {
        // Check that readbuffer has a compound wiretype
        if (!Wire.isCompound(this.wire)) {
            throw 'load convert fail: not a compound wire';
        }
        const byteReader = new ByteReader(this.data);
        // Attempt to consume a varint from the buffer
        const [tag] = Varint.consume(byteReader);
        // Check that the tag has a type of WireLoad
        if ((tag & 15) != WireType.WIRE_LOAD) {
            throw 'load convert fail: missing load tag';
        }
        // Read the number of bytes specified by the load for the header
        const head = this.read(byteReader, tag >> 4);
        const body = this.read(byteReader, byteReader.len());
        return new LoadReader(head, body);
    }
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
    read(br, n) {
        // If n == 0, return an empty buffer
        if (n == 0) {
            return Buffer.alloc(0);
        }
        const buffer = Buffer.alloc(n);
        const rn = br.read(buffer);
        if (rn != n) {
            throw 'insufficient data in reader';
        }
        return buffer;
    }
    /**
     * Returns the read buffer as bytes.
     *
     * @public
     * @returns {Uint8Array} read buffer as bytes by concatenating
     * the data members wire and buffer of the read buffer.
     */
    bytes() {
        return new Uint8Array([
            this.wire, ...this.data
        ]);
    }
    readNull() {
        return null;
    }
    // Reads the data in the read buffer into raw bytes
    readRaw() {
        return new Raw(this.data);
    }
    // Reads the data in the read buffer into a boolean
    readBool() {
        switch (this.wire) {
            case WireType.WIRE_TRUE:
                return true;
            case WireType.WIRE_FALSE:
                return false;
            default:
                throw new Error('Invalid wire type');
        }
    }
    // Reads the data in the read buffer into an string
    readString() {
        return this.data.toString();
    }
    readUInt(data) {
        if (data.length > 8) {
            throw new Error('excess data for 64-bit integer');
        }
        return Number(new BN(data, 'be'));
    }
    // Reads the data in the read buffer into an integer
    readInteger() {
        switch (this.wire) {
            case WireType.WIRE_POSINT:
            case WireType.WIRE_NEGINT: {
                const value = this.readUInt(this.data);
                // if(value > MaxInt64) {
                // 	throw 'overflow for signed integer';
                // }
                if (this.wire == WireType.WIRE_NEGINT) {
                    return -value;
                }
                return value;
            }
            default:
                throw 'invalid wire type';
        }
    }
    // Reads the data in the read buffer into an float
    readFloat() {
        return this.data.readDoubleBE();
    }
    // Reads the data in the read buffer into bytes
    readBytes() {
        return Uint8Array.from(this.data.subarray(0));
    }
}
