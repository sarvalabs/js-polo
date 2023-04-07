"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bn_js_1 = __importDefault(require("bn.js"));
const MaxVarintLen64 = 10;
/**
 * Class for encoding and decoding variable-length integers (varints).
 *
 * @class
 */
class Varint {
    static encode(num) {
        const result = [];
        while (num >= 0x80) {
            result.push(num & 0x7f | 0x80);
            num = num >>> 7;
        }
        result.push(num);
        return new Uint8Array(result);
    }
    static size(v) {
        v = Number(v);
        let count = 0;
        while (v >= 128) {
            count++;
            v = Math.floor(v / 128);
        }
        return count + 1;
    }
    /**
     * Appends a given number to a given byte array as a varint-encoded value.
     *
     * @param {Uint8Array} bytes - The byte array to which the varint
     * should be appended.
     * @param {number} v - The number value to be appended as a varint.
     * @returns {Uint8Array} A new byte array containing the original array and
     * the varint-encoded value.
     */
    static append(b, v) {
        let num = new bn_js_1.default(v);
        const result = [];
        if (num.isZero()) {
            return new Uint8Array([...b, 0]);
        }
        while (num.gtn(0)) {
            let byte = num.and(new bn_js_1.default(0x7f));
            num = num.ushrn(7);
            if (!num.isZero()) {
                byte = byte.or(new bn_js_1.default(0x80));
            }
            result.push(byte.toNumber());
        }
        return new Uint8Array([...b, ...result]);
    }
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
    static consume(br) {
        try {
            let x = 0;
            let s = 0;
            let b = 0;
            for (let i = 0; i < MaxVarintLen64; i++) {
                b = br.readByte();
                if (b < 0x80) {
                    if (i == MaxVarintLen64 && b > 1) {
                        throw new Error('varint overflows 64-bit integer');
                    }
                    x |= b << s;
                    return [x, i + 1];
                }
                x |= (b & 0x7f) << s;
                s += 7;
            }
            throw new Error('varint overflows 64-bit integer');
        }
        catch (err) {
            throw new Error('varint terminated prematurely');
        }
    }
}
exports.default = Varint;
