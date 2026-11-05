import BN from 'bn.js';
// The maximum length of a LEB128 integer that fits in 64 bits.
const MaxVarintLen64 = 10;
/**
 * Class for encoding and decoding variable-length integers (varints).
 * POLO uses unsigned LEB128 for tags.
 *
 * @class
 */
class Varint {
    /**
     * Encodes a non-negative integer as a LEB128 integer.
     *
     * This method does not use the 32-bit bitwise operators. Thus it gives
     * the correct bytes for all safe integers.
     *
     * @param {number} num - The integer to encode.
     * @returns {Uint8Array} The LEB128 bytes.
     */
    static encode(num) {
        const result = [];
        while (num >= 0x80) {
            result.push((num % 0x80) | 0x80);
            num = Math.floor(num / 0x80);
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
        if (typeof v === 'number') {
            return new Uint8Array([...b, ...Varint.encode(v)]);
        }
        let num = new BN(v.toString());
        const result = [];
        if (num.isZero()) {
            return new Uint8Array([...b, 0]);
        }
        while (num.gtn(0)) {
            let byte = num.and(new BN(0x7f));
            num = num.ushrn(7);
            if (!num.isZero()) {
                byte = byte.or(new BN(0x80));
            }
            result.push(byte.toNumber());
        }
        return new Uint8Array([...b, ...result]);
    }
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
    static consume(br) {
        let value = 0;
        let multiplier = 1;
        for (let i = 0; i < MaxVarintLen64; i++) {
            const b = br.readByte();
            if (b === null) {
                throw new Error('varint is not complete');
            }
            if (i == MaxVarintLen64 - 1 && b > 1) {
                throw new Error('varint overflows 64-bit integer');
            }
            value += (b & 0x7f) * multiplier;
            if (b < 0x80) {
                if (b === 0 && i > 0) {
                    throw new Error('varint is not minimal');
                }
                return [value, i + 1];
            }
            multiplier *= 0x80;
        }
        throw new Error('varint overflows 64-bit integer');
    }
}
export default Varint;
