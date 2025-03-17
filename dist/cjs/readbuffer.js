"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReadBuffer = void 0;
const bn_js_1 = __importDefault(require("bn.js"));
const buffer_1 = require("buffer");
const bytereader_1 = __importDefault(require("./bytereader"));
const varint_1 = __importDefault(require("./varint"));
const loadreader_1 = __importDefault(require("./loadreader"));
const wiretype_1 = require("./wiretype");
const raw_1 = require("./raw");
// const MaxInt64 = 1 << 63 - 1;
/**
 * Class representing a ReadBuffer. ReadBuffer is a is a read-only buffer
 * that is obtained from a single tag and its body.
 *
 * @class
 * @param {Buffer} data - An buffer that needs to be read.
 * @param {WireType} wire - The wire type of the data in buffer.
 */
class ReadBuffer {
    wire;
    data;
    constructor(data, wiretype) {
        if (wiretype) {
            this.wire = wiretype;
            this.data = buffer_1.Buffer.from(data);
        }
        else {
            const byteReader = new bytereader_1.default(buffer_1.Buffer.from(data));
            // Attempt to consume a varint from the buffer
            const [tag, consumed] = varint_1.default.consume(byteReader);
            this.wire = tag & 15;
            this.data = buffer_1.Buffer.from(data).subarray(consumed);
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
        if (!wiretype_1.Wire.isCompound(this.wire)) {
            throw new Error('load convert fail: not a compound wire');
        }
        const byteReader = new bytereader_1.default(this.data);
        // Attempt to consume a varint from the buffer
        const [tag] = varint_1.default.consume(byteReader);
        // Check that the tag has a type of WireLoad
        if ((tag & 15) != wiretype_1.WireType.WIRE_LOAD) {
            throw new Error('load convert fail: missing load tag');
        }
        // Read the number of bytes specified by the load for the header
        const head = this.read(byteReader, tag >> 4);
        const body = this.read(byteReader, byteReader.len());
        return new loadreader_1.default(head, body);
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
            return buffer_1.Buffer.alloc(0);
        }
        const buffer = buffer_1.Buffer.alloc(n);
        const rn = br.read(buffer);
        if (rn != n) {
            throw new Error('insufficient data in reader');
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
        return new raw_1.Raw(this.data);
    }
    // Reads the data in the read buffer into a boolean
    readBool() {
        switch (this.wire) {
            case wiretype_1.WireType.WIRE_TRUE:
                return true;
            case wiretype_1.WireType.WIRE_NULL:
            case wiretype_1.WireType.WIRE_FALSE:
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
        return Number(new bn_js_1.default(data, 'be'));
    }
    // Reads the data in the read buffer into an integer
    readInteger() {
        switch (this.wire) {
            case wiretype_1.WireType.WIRE_NULL:
            case wiretype_1.WireType.WIRE_POSINT:
            case wiretype_1.WireType.WIRE_NEGINT: {
                const value = this.readUInt(this.data);
                if (this.wire == wiretype_1.WireType.WIRE_NEGINT) {
                    return -value;
                }
                return value;
            }
            default:
                throw new Error('invalid wire type');
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
exports.ReadBuffer = ReadBuffer;
