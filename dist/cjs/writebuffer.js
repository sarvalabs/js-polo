"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WriteBuffer = exports.toBigInt = void 0;
const bn_js_1 = __importDefault(require("bn.js"));
const buffer_1 = require("buffer");
const varint_js_1 = __importDefault(require("./varint.js"));
const wiretype_js_1 = require("./wiretype.js");
const utf8_js_1 = require("./utf8.js");
/**
 * Converts an integer value to a bigint.
 *
 * @param {number | bigint | BN | string} value - The integer. A number
 * must be a safe integer. A string must hold a decimal integer.
 * @returns {bigint} The value as a bigint.
 * @throws {Error} If the value is not an integer, or is a number that is
 * not a safe integer.
 */
const toBigInt = (value) => {
    switch (typeof value) {
        case 'bigint':
            return value;
        case 'number':
            if (!Number.isSafeInteger(value)) {
                throw new Error(`invalid integer: ${value} is not a safe integer; use a bigint for values above 2^53 - 1`);
            }
            return BigInt(value);
        case 'string':
            if (!/^-?[0-9]+$/.test(value)) {
                throw new Error(`invalid integer: the string "${value}" is not a decimal integer`);
            }
            return BigInt(value);
        default:
            if (bn_js_1.default.isBN(value)) {
                return BigInt(value.toString(10));
            }
            throw new Error(`invalid integer: expected a number, a bigint or a BN, received ${typeof value}`);
    }
};
exports.toBigInt = toBigInt;
/**
 * WriteBuffer is a write-only byte buffer that appends to a head and body.
 * It provides methods to write various wire types like INT, RAW, BOOL etc.
 *
 * Each write method writes the canonical form of a value. It throws an
 * error for a value that has no canonical form.
 *
 * @class
 */
class WriteBuffer {
    head;
    body;
    offset;
    counter;
    constructor() {
        this.head = new Uint8Array();
        this.body = new Uint8Array();
        this.offset = 0;
        this.counter = 0;
    }
    /**
     * Appends v to the body of the writebuffer and a varint tag describing
     * its offset and the given WireType. The write buffer's offset value is
     * incremented by the length of v after both buffers have been updated.
     *
     * @public
     * @param {WireType} w - Wire type of the data.
     * @param {Uint8Array} v - Array of bytes.
     */
    write(w, v) {
        this.head = varint_js_1.default.append(this.head, this.offset * 16 + w);
        if (v) {
            this.body = new Uint8Array([...this.body, ...v]);
            this.offset += v.length;
        }
        this.counter++;
    }
    /**
     * Returns the write buffer contents as bytes.
     *
     * @public
     * @returns {Uint8Array} The concatenated array of bytes formed by
     * concatenating the head and body of the write buffer.
     */
    bytes() {
        return new Uint8Array([...this.head, ...this.body]);
    }
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
    load() {
        const key = this.head.length * 16 + wiretype_js_1.WireType.WIRE_LOAD;
        let buf = varint_js_1.default.append(new Uint8Array(), key);
        buf = new Uint8Array([...buf, ...this.head, ...this.body]);
        return buf;
    }
    /**
     * Writes the null value to the buffer using the WIRE_NULL tag.
     *
     * @public
     */
    writeNull() {
        this.write(wiretype_js_1.WireType.WIRE_NULL, null);
    }
    /**
     * Writes the raw bytes to the buffer with WIRE_RAW tag.
     *
     * @public
     * @param {Raw} value - The raw bytes to be written to the buffer.
     * @throws {Error} If the value is not a Uint8Array.
     */
    writeRaw(value) {
        if (!(value instanceof Uint8Array)) {
            throw new Error(`invalid raw: expected a Raw or a Uint8Array, received ${typeof value}`);
        }
        this.write(wiretype_js_1.WireType.WIRE_RAW, value);
    }
    /**
     * Writes the given boolean value to the write buffer with the
     * WIRE_TRUE or WIRE_FALSE tag.
     *
     * @param {boolean} value - the boolean value that needs to be
     * written to the buffer.
     * @throws {Error} If the value is not a boolean.
     */
    writeBool(value) {
        if (typeof value !== 'boolean') {
            throw new Error(`invalid bool: expected a boolean, received ${typeof value}`);
        }
        this.write(value ? wiretype_js_1.WireType.WIRE_TRUE : wiretype_js_1.WireType.WIRE_FALSE, null);
    }
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
    writeInt(value) {
        const integer = (0, exports.toBigInt)(value);
        if (integer === 0n) {
            this.write(wiretype_js_1.WireType.WIRE_POSINT, null);
            return;
        }
        const negative = integer < 0n;
        const magnitude = negative ? -integer : integer;
        const wiretype = negative ? wiretype_js_1.WireType.WIRE_NEGINT : wiretype_js_1.WireType.WIRE_POSINT;
        let hex = magnitude.toString(16);
        if (hex.length % 2 === 1) {
            hex = '0' + hex;
        }
        this.write(wiretype, buffer_1.Buffer.from(hex, 'hex'));
    }
    /**
     * Writes the given float value to the write buffer with the WIRE_FLOAT tag.
     * The data is the IEEE 754 binary64 form in big-endian order. The
     * encoder accepts all numbers: integers, -0, the infinities and NaN.
     *
     * @param {number} value - the float value that needs to be written to the buffer
     * @throws {Error} If the value is not a number.
     */
    writeFloat(value) {
        if (typeof value !== 'number') {
            throw new Error(`invalid float: expected a number, received ${typeof value}`);
        }
        const buffer = buffer_1.Buffer.alloc(8);
        buffer.writeDoubleBE(value, 0);
        this.write(wiretype_js_1.WireType.WIRE_FLOAT, buffer);
    }
    /**
     * Writes the given string value to the write buffer with
     * the WIRE_WORD tag. The data is the UTF-8 encoding of the string.
     *
     * @param {string} value - the string that needs to be written
     * to the buffer.
     * @throws {Error} If the value is not a well-formed string.
     */
    writeString(value) {
        this.write(wiretype_js_1.WireType.WIRE_WORD, (0, utf8_js_1.encodeUTF8)(value));
    }
    /**
     * Writes the bytes from the given value to the write buffer with
     * the WIRE_WORD tag.
     *
     * @param {Uint8Array} value - the byte array that needs to
     * be written to the buffer.
     * @throws {Error} If the value is not a Uint8Array.
     */
    writeBytes(value) {
        if (!(value instanceof Uint8Array)) {
            throw new Error(`invalid bytes: expected a Uint8Array, received ${typeof value}`);
        }
        this.write(wiretype_js_1.WireType.WIRE_WORD, value);
    }
}
exports.WriteBuffer = WriteBuffer;
