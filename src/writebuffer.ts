import BN from 'bn.js';
import { Buffer } from 'buffer';
import Varint from './varint';
import { WireType } from './wiretype';
import { DataRange } from './datarange';
import { Raw } from './raw';

/**
 * WriteBuffer is a write-only byte buffer that appends to a head and body.
 * It provides methods to write various wire types like INT, RAW, BOOL etc.
 *
 * @class
 */
export class WriteBuffer {
	head: Uint8Array;
	body: Uint8Array;
	offset: number;
	counter: number;

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
	private isInt(value: number): boolean {
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
	private isFloat(value: number): boolean {
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
	private intSize(value: number | BN): number {
		// check if the input value is a number
		if(this.isInt(value)) {
			// if the input value is smaller than 2 return 1, 
			// otherwise calculate and return the size
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
	private sign(value: number | BN): number {
		// check if the input value is a number or big integer within the 
		// range of 53-bit integers
		if(this.isInt(value) && (DataRange.inUInt53(value) || 
		DataRange.inInt53(value))) {
			return Math.sign(value);
		}
		// if the input value is out of the range of 53-bit integers or 
		// is not an integer, handle it as big integer
		return value > 0n ? 1: value < 0n ? -1 : 0;
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
	public write(w: WireType, v: Uint8Array): void {
		this.head = Varint.append(this.head, (this.offset<<4)|w);
		if(v) {
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
	public bytes(): Uint8Array {
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
	public load(): Uint8Array {
		const key: number = this.head.length << 4 | WireType.WIRE_LOAD;
		let buf = Varint.append(new Uint8Array(), key);
		buf = new Uint8Array([...buf, ...this.head, ...this.body]);

		return buf;
	}

	/**
	 * Writes the null value to the buffer using the WIRE_NULL tag.
	 *
	 * @public
	 */ 
	public writeNull(): void {
		this.write(WireType.WIRE_NULL, null);
	}

	/**
	 * Writes the raw bytes to the buffer with WIRE_RAW tag.
	 *
	 * @public
	 * @param {Raw} value - The raw bytes to be written to the buffer.
	 */ 
	public writeRaw(value: Raw): void {
		this.write(WireType.WIRE_RAW, value);
	}

	/**
	 * Writes the given boolean value to the write buffer with the 
	 * WIRE_TRUE or WIRE_FALSE tag.
	 *
	 * @param {boolean} value - the boolean value that needs to be 
	 * written to the buffer.
	 */ 
	public writeBool(value: boolean): void {
		if(value) {
			this.write(WireType.WIRE_TRUE, null);
			return;
		}

		this.write(WireType.WIRE_FALSE, null);
	}

	/**
	 * Writes the given integer value to the write buffer with the 
	 * WIRE_POSINT or WIRE_NEGINT tag.
	 *
	 * @param {number | BN} value - the integer value (either number or 
	 * big integer) that needs to be written to the buffer.
	 * @throws {Error} - throws an error if the input value is not an integer.
	 */
	public writeInt(value: number | BN): void {
		let wiretype: WireType, buffer: Buffer;

		switch(this.sign(value)) {
		case 0:
			wiretype = WireType.WIRE_POSINT;
			buffer = null;
			break;
		case 1:
			wiretype = WireType.WIRE_POSINT;
			buffer = Buffer.from(new BN(value).toArray('be', 8));
			buffer = Buffer.from(buffer.subarray((8 - this.intSize(value)),));		
			break;
		default:
			wiretype = WireType.WIRE_NEGINT;
			buffer = Buffer.from(new BN(-value).toArray('be', 8));
			buffer = Buffer.from(buffer.subarray((8 - this.intSize(-value)),));
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
	public writeFloat(value: number): void {
		if (this.isFloat(value)) {
			const buffer: Buffer = Buffer.alloc(8);
			buffer.writeDoubleBE(value, 0);
			
			this.write(WireType.WIRE_FLOAT, buffer);

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
	public writeString(value: string): void {
		this.write(WireType.WIRE_WORD, Buffer.from(value, 'utf8'));
	}

	/**
	 * Writes the bytes from the given value to the write buffer with 
	 * the WIRE_WORD tag.
	 *
	 * @param {Uint8Array} value - the byte array that needs to 
	 * be written to the buffer.
	 */
	public writeBytes(value: Uint8Array): void {
		this.write(WireType.WIRE_WORD, value);
	}
}
