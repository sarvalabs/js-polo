"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WriteBuffer = void 0;
const bn_js_1 = __importDefault(require("bn.js"));
const buffer_1 = require("buffer");
const varint_1 = __importDefault(require("./varint"));
const wiretype_1 = require("./wiretype");
const datarange_1 = require("./datarange");
/**
 * WriteBuffer is a write-only byte buffer that appends to a head and body.
 * It provides methods to write various wire types like INT, RAW, BOOL etc.
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
     * Checks if the given value is a safe integer.
     *
     * @param {number} value - The value to be checked.
     * @private
     * @returns {boolean} - Returns true if the value is a safe integer,
     * false otherwise.
     */
    isInt(value) {
        return Number.isInteger(value) && Number.isSafeInteger(value);
    }
    /**
     * Checks if the given value is a floating point number.
     *
     * @private
     * @param {number} value - The value to be checked.
     * @returns {boolean} - Returns true if the value is a
     * floating point number, false otherwise.
     */
    isFloat(value) {
        return !Number.isInteger(value);
    }
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
    intSize(value) {
        // check if the input value is a number
        if (this.isInt(value)) {
            // calculate and return the size
            return Math.ceil(Math.log2(value + 1) / 8);
        }
        // if the input value is not a number, return 8 bytes
        return 8;
    }
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
    sign(value) {
        // check if the input value is a number or big integer within the 
        // range of 53-bit integers
        if (this.isInt(value) && (datarange_1.DataRange.inUInt53(value) ||
            datarange_1.DataRange.inInt53(value))) {
            return Math.sign(value);
        }
        // if the input value is out of the range of 53-bit integers or 
        // is not an integer, handle it as big integer
        return value > 0n ? 1 : value < 0n ? -1 : 0;
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
        this.head = varint_1.default.append(this.head, (this.offset << 4) | w);
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
        const key = this.head.length << 4 | wiretype_1.WireType.WIRE_LOAD;
        let buf = varint_1.default.append(new Uint8Array(), key);
        buf = new Uint8Array([...buf, ...this.head, ...this.body]);
        return buf;
    }
    /**
     * Writes the null value to the buffer using the WIRE_NULL tag.
     *
     * @public
     */
    writeNull() {
        this.write(wiretype_1.WireType.WIRE_NULL, null);
    }
    /**
     * Writes the raw bytes to the buffer with WIRE_RAW tag.
     *
     * @public
     * @param {Raw} value - The raw bytes to be written to the buffer.
     */
    writeRaw(value) {
        this.write(wiretype_1.WireType.WIRE_RAW, value);
    }
    /**
     * Writes the given boolean value to the write buffer with the
     * WIRE_TRUE or WIRE_FALSE tag.
     *
     * @param {boolean} value - the boolean value that needs to be
     * written to the buffer.
     */
    writeBool(value) {
        if (value) {
            this.write(wiretype_1.WireType.WIRE_TRUE, null);
            return;
        }
        this.write(wiretype_1.WireType.WIRE_FALSE, null);
    }
    /**
     * Writes the given integer value to the write buffer with the
     * WIRE_POSINT or WIRE_NEGINT tag.
     *
     * @param {number | BN} value - the integer value (either number or
     * big integer) that needs to be written to the buffer.
     * @throws {Error} - throws an error if the input value is not an integer.
     */
    writeInt(value) {
        let wiretype, buffer;
        switch (this.sign(value)) {
            case 0:
                wiretype = wiretype_1.WireType.WIRE_POSINT;
                buffer = null;
                break;
            case 1:
                wiretype = wiretype_1.WireType.WIRE_POSINT;
                buffer = buffer_1.Buffer.from(new bn_js_1.default(value).toArray('be', 8));
                buffer = buffer_1.Buffer.from(buffer.subarray((8 - this.intSize(value))));
                break;
            default:
                wiretype = wiretype_1.WireType.WIRE_NEGINT;
                buffer = buffer_1.Buffer.from(new bn_js_1.default(-value).toArray('be', 8));
                buffer = buffer_1.Buffer.from(buffer.subarray((8 - this.intSize(-value))));
                break;
        }
        this.write(wiretype, buffer);
    }
    /**
     * Writes the given float value to the write buffer with the WIRE_FLOAT tag.
     *
     * @param {number} value - the float value that needs to be written to the buffer
     * @throws {Error} An error if the input value is an integer
     */
    writeFloat(value) {
        if (this.isFloat(value)) {
            const buffer = buffer_1.Buffer.alloc(8);
            buffer.writeDoubleBE(value, 0);
            this.write(wiretype_1.WireType.WIRE_FLOAT, buffer);
            return;
        }
        throw new Error('Expected float value but received an integer');
    }
    /**
     * Writes the given string value to the write buffer with
     * the WIRE_WORD tag.
     *
     * @param {string} value - the string that needs to be written
     * to the buffer.
     */
    writeString(value) {
        this.write(wiretype_1.WireType.WIRE_WORD, buffer_1.Buffer.from(value, 'utf8'));
    }
    /**
     * Writes the bytes from the given value to the write buffer with
     * the WIRE_WORD tag.
     *
     * @param {Uint8Array} value - the byte array that needs to
     * be written to the buffer.
     */
    writeBytes(value) {
        this.write(wiretype_1.WireType.WIRE_WORD, value);
    }
}
exports.WriteBuffer = WriteBuffer;
