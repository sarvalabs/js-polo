import { WriteBuffer } from './writebuffer';
import { WireType } from './wiretype';
import Schema from './schema.d';
import BN from 'bn.js';
import { Raw } from './raw';
import { ReadBuffer } from './readbuffer';

/**
 * Polorizer is an encoding buffer that can sequentially polorize objects 
 * into it. It can be collapsed into its bytes with Bytes() or Packed().
 * 
 * @class
 */
export class Polorizer {
	private writeBuffer: WriteBuffer;

	constructor() {
		this.writeBuffer = new WriteBuffer();
	}

	/**
	 * Returns the contents of the Polorizer as bytes.
	 * 
	 * If no objects were polarized, it returns a WIRE_NULL wire.
	 * If only one object was polarized, it returns the contents directly.
	 * If more than one object was polarized, it returns the contents in a packed wire.
	 *
	 * @public
	 * @returns {Uint8Array} The contents of the Polorizer as bytes.
	 */
	public bytes(): Uint8Array {
		switch(this.writeBuffer.counter){
		case 0:
			return new Uint8Array([0]);
		case 1:
			return this.writeBuffer.bytes();
		default:
			return this.packed();
		}
	}

	/**
	 * Returns the contents of the Polorizer as bytes after packing it and 
	 * tagging with WIRE_PACK.
	 *
	 * @public
	 * @returns {Uint8Array} The packed contents of the Polorizer as bytes.
	 */
	public packed(): Uint8Array {
		const wb: WriteBuffer = new WriteBuffer();
		wb.write(WireType.WIRE_PACK, this.writeBuffer.load());
		return wb.bytes();
	}

	/**
	 * Encodes a value into the Polorizer based on the given schema.
	 *
	 * @param {(null|boolean|number|BN|string|Uint8Array|Array<unknown>|Map<unknown, unknown>|object)} value 
	 *        - The value to be encoded into the Polorizer.
	 * @param {Schema} schema - The schema that describes the value and its encoding.
	 * @returns {void}
	 * @throws {Error} If the kind of the schema is not one of the supported kinds.
	 * @description Depending on the kind of the schema, the appropriate 
	 * encoding method is called to encode the value. The supported kinds are 
	 * null, bool, integer, float, string, raw, bytes, array, map, and struct.
	 */
	public polorize(
		value: null | boolean | number | BN | string | Uint8Array | 
		Array<unknown> | Map<unknown, unknown> | object, 
		schema: Schema
	): void {
		switch(schema.kind) {
		case 'null':
			this.polorizeNull(); 
			break;
		case 'bool':
			this.polorizeBool(value);
			break;
		case 'integer':
			this.polorizeInt(value);
			break;
		case 'float':
			this.polorizeFloat(value);
			break;
		case 'string':
			this.polorizeString(value);
			break;
		case 'raw':
			this.polorizeRaw(value);
			break;
		case 'bytes':
			this.polorizeBytes(value);
			break;
		// Array Value (Pack Encoded)
		case 'array':
			this.polorizeArray(value, schema);
			break;
		// Map Value (Pack Encoded. Key-Value. Sorted Keys)
		case 'map':
			this.polorizeMap(value, schema);
			break;
		// Struct Value (Field Ordered Pack Encoded)
		case 'struct':
			this.polorizeStruct(value, schema);
			break;
		default:
			throw Error(schema.kind + ' is unsupported.');
		}
	}

	/**
	 * Encodes a null value into the Polorizer.
	 * 
	 * @public
	 * @returns {void}
	 * @description Encodes a WIRE_NULL into the head, consuming a 
	 * position on the wire.
	 */
	public polorizeNull(): void {
		this.writeBuffer.writeNull();
	}

	/**
	 * Encodes a boolean value into the Polorizer.
	 *
	 * @param {boolean} value - The boolean value to encode.
	 * @public
	 * @returns {void}
	 * @description  Encodes the boolean as either WIRE_TRUE or WIRE_FALSE, 
	 * depending on its value.
	 */
	public polorizeBool(value: boolean): void {
		this.writeBuffer.writeBool(value);
	}

	/**
	 * Encodes a signed/unsigned integer or BN value into the Polorizer.
	 *
	 * @public
	 * @param {number | BN} value - The integer or BN value to encode.
	 * @returns {void}
	 * @description Encodes the integer as the binary form of its absolute value 
	 * with the wire type being WIRE_POSINT or WIRE_NEGINT based on polarity, 
	 * with zero considered as positive.
	 */
	public polorizeInt(value: number | BN): void {
		this.writeBuffer.writeInt(value);
	}

	/**
	 * Encodes a single-precision float value into the Polorizer as WIRE_FLOAT.
	 *
	 * @public
	 * @param {number} value - The float value to encode.
	 * @returns {void}
	 * @description Encodes the float as its IEEE754 binary form (big-endian) 
	 * with the wire type being WIRE_FLOAT.
	 */
	public polorizeFloat(value: number): void {
		this.writeBuffer.writeFloat(value);
	}

	/**
	 * Encodes a string value into the Polorizer.
	 *
	 * @public
	 * @param {string} value - The string value to encode.
	 * @returns {void}
	 * @description Encodes the string as its UTF-8 encoded bytes with the 
	 * wire type being WIRE_WORD.
	 */
	public polorizeString(value: string): void {
		this.writeBuffer.writeString(value);
	}

	/**
	 * Encodes a Raw value into the Polorizer.
	 *
	 * @public
	 * @param {RAW} value - The raw value to encode.
	 * @returns {void}
	 * @description Encodes the Raw directly with the wire type being WIRE_RAW. 
	 * A nil Raw is encoded as WIRE_NULL.
	 */
	public polorizeRaw(value: Raw): void {
		this.writeBuffer.writeRaw(value);
	}

	/**
	 * Encodes a bytes value into the Polorizer.
	 *
	 * @public
	 * @param {Uint8Array} value - The bytes value to encode.
	 * @returns {void}
	 * @description Encodes the bytes as is with the wire type being WireWord.
	 */
	public polorizeBytes(value: Uint8Array): void {
		this.writeBuffer.writeBytes(value);
	}

	/**
	 * Encodes the contents of another Polorizer as pack-encoded data.
	 *
	 * @public
	 * @param {Polorizer} pack - The Polorizer instance to encode.
	 * @returns {void}
	 * @description The contents are packed into a WIRE_LOAD message and 
	 * tagged with the WIRE_PACK wire type. If the given Polorizer is nil, 
	 * a WIRE_NULL is encoded instead.
	 */
	public polorizePacked(pack: Polorizer): void {
		this.writeBuffer.write(WireType.WIRE_PACK, pack.writeBuffer.load());
	}

	/**
	 * Encodes another Polorizer directly into the Polorizer.
	 *
	 * @public
	 * @param {Polorizer} inner - The Polorizer instance to encode.
	 * @returns {void}
	 * @description Unlike PolorizePacked which will always write it as a 
	 * packed wire while polorizeInner will write an atomic as is. 
	 * If the given Polorizer is nil, a WireNull is encoded.
	 */
	public polorizeInner(inner: Polorizer): void {
		const readBuffer = new ReadBuffer(inner.bytes())

		this.writeBuffer.write(readBuffer.wire, readBuffer.data)
	}

	/**
	 * Encodes a Array into the Polorizer.
	 *
	 * @public
	 * @param {Array<unknown>} array - The array to encode.
	 * @param {Schema} schema - The schema that describes the value and 
	 * its encoding.
	 * @returns {void}
	 * @description It is encoded as element pack encoded data.
	 */
	private polorizeArray(array: Array<unknown>, schema: Schema): void {
		const polorizer = new Polorizer();

		if(schema.fields && schema.fields.values && schema.fields.values.kind) {
			array.forEach(arr => polorizer.polorize(arr, schema.fields.values));
		}

		this.polorizePacked(polorizer);
	}

	/**
	 * Encodes a Map into the Polorizer.
	 *
	 * @public
	 * @param {Map<unknown, unknown>} map - The map to encode.
	 * @param {Schema} schema - The schema that describes the key, value and 
	 * its encoding.
	 * @returns {void}
	 * @description It is encoded as key-value pack encoded data. Map keys 
	 * are sorted before being sequentially encoded.
	 */
	private polorizeMap(map: Map<unknown, unknown>, schema: Schema): void {
		const polorizer = new Polorizer();

		if(schema.fields && schema.fields.keys && schema.fields.values &&
		schema.fields.keys.kind && schema.fields.values.kind) {
			const keys = [...map.keys()];
			keys.sort();

			keys.forEach(key => {
				polorizer.polorize(key, schema.fields.keys);
				polorizer.polorize(map.get(key), schema.fields.values);
			});
		}

		this.polorizePacked(polorizer);
	}

	/**
	 * Encodes a object into the Polorizer.
	 *
	 * @public
	 * @param {object} struct - The object to encode.
	 * @param {Schema} schema - The schema that describes the fields and 
	 * its encoding.
	 * @returns {void}
	 * @description It is encoded as field ordered pack encoded data.
	 */
	private polorizeStruct(struct: object, schema: Schema): void {
		const polorizer = new Polorizer();

		Object.entries(schema.fields).forEach(([key, value]) => {
			polorizer.polorize(struct[key], value);
		});

		this.polorizePacked(polorizer);
	}

	/**
	 * Encodes a Document into the Polorizer.
	 *
	 * @public
	 * @param {object} document - The document object to encode.
	 * @returns {void}
	 * @description Encodes the Document keys and raw values as POLO 
	 * doc-encoded data with the wire type being WIRE_DOC.
	 * If the Document is nil, it is encoded as a WIRE_NULL.
	 */
	public polorizeDocument(document: object): void {
		const keys = Object.keys(document);
		keys.sort();

		const polorizer = new Polorizer();
		keys.forEach(key => {
			polorizer.polorizeString(key);
			polorizer.polorizeRaw(document[key]);
		});

		this.writeBuffer.write(WireType.WIRE_DOC, polorizer.writeBuffer.load());
	}
} 
