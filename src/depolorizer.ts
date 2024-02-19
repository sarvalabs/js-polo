import LoadReader from './loadreader';
import { Schema } from '../types/schema';
import { Raw } from './raw';
import { ReadBuffer } from './readbuffer';
import { WireType } from './wiretype';
import { Document, documentDecode } from './document';

/**
 * Depolorizer is a decoding buffer that can sequentially depolorize objects from it.
 * It can check whether there are elements left in the buffer with `isDone()`,
 * and peek the WireType of the next element with `read()`.
 * 
 * @class
 */
export class Depolorizer {
	private done: boolean;
	private packed: boolean;
	private data: ReadBuffer;
	private load: LoadReader;

	constructor(data: Uint8Array, load?: LoadReader) {
		if(!load) {
			this.data = new ReadBuffer(data);
			this.packed = false;
		} else {
			this.load = load;
			this.packed = true;
		}

		this.done = false;
	}

	/**
	 * Checks if all elements in the Depolorizer have been read.
	 *
	 * @public
	 * @returns {boolean} True if all elements have been read, false otherwise.
	 */
	public isDone(): boolean {
		// Check if loadreader is done if in packed mode
		if(this.packed) {
			return this.load.done();
		}

		// Return flag for non-pack data
		return this.done;
	}

	/**
	 * Reads the next element in the Depolorizer as a ReadBuffer.
	 * If the Depolorizer is in packed mode, it reads from the pack buffer.
	 * Otherwise, it returns the data from the read buffer and sets the done flag.
	 *
	 * @public
	 * @returns {ReadBuffer} The next element in the Depolorizer as a ReadBuffer.
	 * @throws {Error} If there is insufficient data in the wire for decoding.
	 */
	public read(): ReadBuffer {
		// Check if there is another element to read
		if(this.isDone()) {
			throw new Error('insufficient data in wire for decode');
		}

		// Read from the loadreader if in packed mode
		if(this.packed) {
			return this.load.next();
		}

		// Set the atomic read flag to done
		this.done = true;

		// Return the data from the atomic buffer
		return this.data;
	}

	/**
	 * Creates a new Depolorizer in packed mode from a given ReadBuffer.
	 * The ReadBuffer is converted into a LoadReader, and the returned 
	 * Depolorizer is created in packed mode.
	 *
	 * @private
	 * @param {ReadBuffer} data - The ReadBuffer to convert into a LoadReader.
	 * @returns {Depolorizer} A new Depolorizer created in packed mode.
	 */
	private newLoadDepolorizer(data: ReadBuffer): Depolorizer {
		// Convert the element into a loadreader
		const load = data.load();

		// Create a new Depolorizer in packed mode
		return new Depolorizer(null, load);
	}

	/**
	 * Decodes a value from the Depolorizer based on the provided schema.
	 *
	 * @public
	 * @param {Schema} schema - The schema representing the type of the value to decode.
	 * @returns {unknown} The decoded value.
	 * @throws {Error} If the schema kind is unsupported or a decode error occurs.
	 */
	public depolorize(schema: Schema): unknown {
		switch(schema.kind) {
		case 'null':
			return this.depolorizeNull();
		case 'bool':
			return this.depolorizeBool();
		case 'integer':
			return this.depolorizeInteger();
		case 'float':
			return this.depolorizeFloat();
		case 'string':
			return this.depolorizeString();
		case 'raw':
			return this.depolorizeRaw();
		case 'bytes':
			return this.depolorizeBytes();
		case 'array':
			return this.depolorizeArray(schema);
		case 'map':
			return this.depolorizeMap(schema);
		case 'struct':
			return this.depolorizeStruct(schema);
		default:
			throw Error(schema.kind + ' is unsupported.');
		}
	}

	/**
	 * Decodes a null value from the Depolorizer, consuming one 
	 * wire element. Returns `null` if a null value is successfully decoded.
	 *
	 * @public
	 * @returns {null} The decoded null value.
	 * @throws {Error} If there are no elements left or if the element is 
	 * not of type WireNull.
	 */
	public depolorizeNull(): null {
		return this.read().readNull();
	}

	/**
	 * Decodes a boolean value from the Depolorizer, consuming one wire element.
	 * Returns the decoded boolean value.
	 * Returns `false` if the element is of type WireNull.
	 *
	 * @public
	 * @returns {boolean} The decoded boolean value.
	 * @throws {Error} If there are no elements left or if the element is not 
	 * of type WireTrue or WireFalse.
	 */
	public depolorizeBool(): boolean {
		return this.read().readBool();
	}

	/**
	 * Decodes an integer value from the Depolorizer, consuming 
	 * one wire element. Returns the decoded integer value as either a number 
	 * or a bigint, depending on the value's size.
	 *
	 * @public
	 * @returns {number | bigint} The decoded integer value.
	 * @throws {Error} If there are no elements left or if the element is not 
	 * of type WirePosInt or WireNegInt.
	 */
	public depolorizeInteger(): number | bigint {
		return this.read().readInteger();
	}

	/**
	 * Decodes a float value from the Depolorizer, consuming one wire element.
	 * Returns the decoded float value as a number.
	 * Returns 0 if the element is a WireNull.
	 *
	 * @public
	 * @returns {number} The decoded float value.
	 * @throws {Error} If there are no elements left or if the element is not 
	 * of type WireFloat.
	 */
	public depolorizeFloat(): number {
		return this.read().readFloat();
	}

	/**
	 * Decodes a string value from the Depolorizer, consuming one wire element.
	 * Returns the decoded string value.
	 * Returns an empty string if the element is a WireNull.
	 *
	 * @public
	 * @returns {string} The decoded string value.
	 * @throws {Error} If there are no elements left or if the element is not 
	 * of type WireWord.
	 */
	public depolorizeString(): string {
		return this.read().readString();
	}

	/**
	 * Decodes a `Raw` value from the Depolorizer, consuming one wire element.
	 * Returns the decoded `Raw` value.
	 *
	 * @public
	 * @returns {Raw} The decoded `Raw` value.
	 * @throws {Error} If there are no elements left or if the element is not 
	 * of type WireRaw.
	 */
	public depolorizeRaw(): Raw {
		return this.read().readRaw();
	}

	/**
	 * Decodes a `Uint8Array` (bytes) value from the Depolorizer, 
	 * consuming one wire element.
	 * Returns the decoded `Uint8Array` (bytes) value.
	 *
	 * @public
	 * @returns {Uint8Array} The decoded `Uint8Array` (bytes) value.
	 * @throws {Error} If there are no elements left or if the element is not 
	 * of type WireWord.
	 */
	public depolorizeBytes(): Uint8Array {
		return this.read().readBytes();
	}

	/**
	 * Depolorizes an array value from the Depolorizer.
	 * 
	 * @param {Schema} schema - The schema definition for the array.
	 * @returns {Array<unknown>} The depolorized array.
	 * @throws {Error} If the the schema is invalid.
	 */
	private depolorizeArray(schema: Schema): Array<unknown> {
		// Peek the wire type of the next element
		const data = this.read();

		if(schema.fields && schema.fields.values && schema.fields.values.kind) {
			switch(data.wire) {
			case WireType.WIRE_PACK: {
				// Get the next element as a pack
				// depolorizer with the slice elements
				const pack = this.newLoadDepolorizer(data);
				const arr: Array<unknown> = [];
				// Iterate until loadreader is done
				while(!pack.isDone()) {
					// Depolorize the element into the element type
					const element = pack.depolorize(schema.fields.values);
					if(element) {
						// const ele = pack.unpack(schema.fields.values, element);
						arr.push(element);
					}
				}

				return arr;
			}
			case WireType.WIRE_NULL:
				return [];
			default:
				throw new Error('Incompatible wire type');
			}
		}
	
		throw new Error('Invalid kind');
	}

	/**
	 * Depolorizes a Document from the Depolorizer.
	 * 
	 * @throws {Error} If there are no elements left or if the element is not WireDoc.
	 * @returns {Document} The depolorized Document.
	 */
	public depolorizeDocument(): Document {
		// Read the next element
		const data = this.read();

		return documentDecode(data);
	}

	/**
	 * DepolorizePacked Decodes another Depolorizer from the Depolorizer, 
	 * consuming one wire element.
	 * 
	 * @returns {Depolorizer} The depolorized packed Depolorizer.
	 * @throws {Error} If there are no elements left, if the element is not 
	 * WirePack or WireDoc, or if it is a WireNull.
	 */
	public depolorizePacked(): Depolorizer {
		// Read the next element
		const data = this.read();

		switch(data.wire) {
		case WireType.WIRE_PACK:
		case WireType.WIRE_DOC:
			return this.newLoadDepolorizer(data);
		case WireType.WIRE_NULL:
			throw new Error('null pack element');
		default:
			throw new Error('incompatible wire type');
		}
	}

	/**
	 * Decodes another Depolorizer from the Depolorizer, consuming one wire element.
	 * 
	 * Unlike DepolorizePacked, which expects a compound element and converts it 
	 * into a packed Depolorizer.
	 * DepolorizeInner returns the atomic element as an atomic Depolorizer.
	 * 
	 * @returns {Depolorizer} The depolorized inner Depolorizer.
	 * @throws {Error} If there are no elements left or if the element is not 
	 * a valid wire element.
	 */
	public depolorizeInner(): Depolorizer {
		// Read the next element
		const data = this.read();

		return new Depolorizer(data.bytes());
	}

	/**
	 * Decodes a value from the Depolorizer based on the provided schema.
	 * The target type must be a map and the next wire element must be WirePack.
	 * 
	 * @param {Schema} schema - The schema representing the map structure.
	 * @returns {Map<unknown, unknown>} The depolorized map.
	 * @throws {Error} If the schema or wire element is invalid.
	 */
	private depolorizeMap(schema: Schema): Map<unknown, unknown> {
		// Peek the wire type of the next element
		const data = this.read();

		if(schema.fields && schema.fields.keys && schema.fields.values &&
			schema.fields.keys.kind && schema.fields.values.kind) {
			switch(data.wire){
			case WireType.WIRE_PACK: {
				// Get the next element as a pack
				// depolorizer with the slice elements
				const pack = this.newLoadDepolorizer(data);
				const map: Map<unknown, unknown> = new Map();

				// Iterate until loadreader is done
				while(!pack.isDone()) {
					// Get the next element from the load (key)
					const key = pack.depolorize(schema.fields.keys);
					const value = pack.depolorize(schema.fields.values);
					map.set(key, value);
				}
		
				return map;
			}
			case WireType.WIRE_NULL:
				return new Map();
			default:
				throw new Error('Incompatible wire type');
			}
		}
	
		throw new Error('Invalid kind');
	}

	/**
	 * Decodes a value from the Depolorizer based on the provided schema.
	 * The target type must be a object and the next wire element must be WirePack or WireDoc.
	 * 
	 * @param {Schema} schema - The schema representing the object structure.
	 * @returns {object} The depolorized object.
	 * @throws {Error} If the wire type is incompatible or the schema is invalid.
	 */
	private depolorizeStruct(schema: Schema): object {
		// Peek the wire type of the next element
		const data = this.read();

		switch(data.wire) {
		case WireType.WIRE_PACK:{
			// Get the next element as a pack
			// depolorizer with the slice elements
			const pack = this.newLoadDepolorizer(data);
			const entries = Object.entries(schema.fields);
			const obj = {};

			let index = 0;

			// Iterate until loadreader is done
			while(!pack.isDone()) {
				// Get the next element from the load (key)
				const value = pack.depolorize(entries[index][1]);
				obj[entries[index][0]] = value;
				index++;
			}
		
			return obj;
		}
		case WireType.WIRE_DOC:{
			const doc = documentDecode(data);
			const obj = {};

			Object.entries(schema.fields).forEach(([key, value]) =>{
				const data = doc.getRaw(key);
				const depolorizer = new Depolorizer(data);
				obj[key] = depolorizer.depolorize(value);
			});

			return obj;
		}
		case WireType.WIRE_NULL:
			return {};
		default:
			throw new Error('Incompatible wire type');
		}
	}
}
