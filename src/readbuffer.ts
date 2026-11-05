import { Buffer } from 'buffer';
import ByteReader from './bytereader.js';
import Varint from './varint.js';
import LoadReader from './loadreader.js';
import { Wire, WireType } from './wiretype.js';
import { Raw } from './raw.js';
import { decodeUTF8 } from './utf8.js';

/**
 * Returns the error for an element with a wire type that the target type
 * does not accept.
 *
 * @param {WireType} wire - The wire type of the element.
 * @param {string} target - The name of the target type.
 * @returns {Error} The error.
 */
export const incompatibleWire = (wire: WireType, target: string): Error => {
	return new Error(`incompatible wire: a ${target} does not accept a ${Wire.nameOf(wire)} element`);
};

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
export class ReadBuffer {
	public wire: WireType;
	public data: Buffer;

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
	constructor(data: Uint8Array, wiretype?: WireType) {
		if(wiretype !== undefined) {
			this.wire = wiretype;
			this.data = Buffer.from(data.buffer, data.byteOffset, data.byteLength);
			return;
		}

		if(!data || data.length === 0) {
			throw new Error('malformed wire: the wire is empty');
		}

		// Copy the wire. Thus a change to the input does not change the result.
		const wire = Buffer.from(data);
		const [tag, consumed] = Varint.consume(new ByteReader(wire));

		if(tag >= 16) {
			throw new Error('malformed wire: the offset of the top-level tag is not 0');
		}

		this.wire = tag;
		this.data = wire.subarray(consumed);
	}

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
	public load(): LoadReader {
		// Check that readbuffer has a compound wiretype
		if(!Wire.isCompound(this.wire)) {
			throw new Error('load convert fail: not a compound wire');
		}

		const [tag, consumed] = Varint.consume(new ByteReader(this.data));

		// Check that the tag has a type of WireLoad
		if(tag % 16 !== WireType.WIRE_LOAD) {
			throw new Error('load convert fail: missing load tag');
		}

		const length = Math.floor(tag / 16);

		if(length > this.data.length - consumed) {
			throw new Error('malformed load: the head is longer than the remaining data');
		}

		const head = this.data.subarray(consumed, consumed + length);
		const body = this.data.subarray(consumed + length);

		return new LoadReader(head, body);
	}

	/**
     * Returns the read buffer as bytes.
     *
     * @public
     * @returns {Uint8Array} read buffer as bytes by concatenating
	 * the data members wire and buffer of the read buffer.
     */
	public bytes(): Uint8Array {
		return new Uint8Array([
			this.wire, ...this.data
		]);
	}

	/**
	 * Throws an error if the wire type of the element is not the given
	 * wire type.
	 *
	 * @private
	 * @param {WireType} wire - The wire type that the element must have.
	 * @param {string} target - The name of the target type.
	 */
	private expect(wire: WireType, target: string): void {
		if(this.wire !== wire) {
			throw incompatibleWire(this.wire, target);
		}
	}

	/**
	 * Throws an error if the element has data. A Null, a False and a True
	 * have no data (rule C4).
	 *
	 * @private
	 */
	private expectNoData(): void {
		if(this.data.length > 0) {
			throw new Error(`malformed wire: a ${Wire.nameOf(this.wire)} element has data`);
		}
	}

	// Reads a Null element. A Null has no data.
	public readNull(): null {
		this.expect(WireType.WIRE_NULL, 'null');
		this.expectNoData();

		return null;
	}

	// Reads the data of a Raw element. The decoder does not examine the
	// data. A Raw target accepts only a Raw element.
	public readRaw(): Raw {
		this.expect(WireType.WIRE_RAW, 'raw');

		return new Raw(this.data);
	}

	// Reads a False or a True element into a boolean. The element has no data.
	public readBool(): boolean {
		switch(this.wire) {
		case WireType.WIRE_TRUE:
			this.expectNoData();
			return true;
		case WireType.WIRE_FALSE:
			this.expectNoData();
			return false;
		default:
			throw incompatibleWire(this.wire, 'bool');
		}
	}

	// Reads a Word element into a string. The data must be valid UTF-8.
	public readString(): string {
		this.expect(WireType.WIRE_WORD, 'string');

		return decodeUTF8(this.data);
	}

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
	public readInteger(): number | bigint {
		if(this.wire !== WireType.WIRE_POSINT && this.wire !== WireType.WIRE_NEGINT) {
			throw incompatibleWire(this.wire, 'integer');
		}

		const negative = this.wire === WireType.WIRE_NEGINT;

		if(this.data.length === 0) {
			if(negative) {
				throw new Error('malformed integer: a NegInt has no data (negative zero)');
			}

			return 0;
		}

		if(this.data[0] === 0) {
			throw new Error('malformed integer: the data starts with a zero byte');
		}

		// Six bytes hold 48 bits. Such a magnitude is always a safe integer.
		if(this.data.length <= 6) {
			const value = this.data.readUIntBE(0, this.data.length);
			return negative ? -value : value;
		}

		const magnitude = BigInt('0x' + this.data.toString('hex'));

		// Values beyond 2^53-1 cannot be represented exactly as a
		// number, so they are returned as a bigint instead.
		if(magnitude <= BigInt(Number.MAX_SAFE_INTEGER)) {
			const value = Number(magnitude);
			return negative ? -value : value;
		}

		return negative ? -magnitude : magnitude;
	}

	// Reads a Float element into a number. A binary64 float has exactly 8
	// bytes (rule C5). The decoder keeps all bits, also the bits of a NaN.
	public readFloat(): number {
		this.expect(WireType.WIRE_FLOAT, 'float');

		if(this.data.length !== 8) {
			throw new Error(`malformed float: a binary64 float has 8 bytes, but the data has ${this.data.length} bytes`);
		}

		return this.data.readDoubleBE(0);
	}

	// Reads a Word element into bytes. The data can be any bytes.
	public readBytes(): Uint8Array {
		this.expect(WireType.WIRE_WORD, 'bytes');

		return Uint8Array.from(this.data);
	}
}
