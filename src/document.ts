import BN from 'bn.js';
import { WriteBuffer } from './writebuffer';
import { ReadBuffer } from './readbuffer';
import { Raw } from './raw';
import { Polorizer } from './polorizer';
import { Schema } from '../types/schema';
import { Depolorizer } from './depolorizer';
import { WireType } from './wiretype';

/**
 * Document is a representation for a string indexed collection of encoded object data.
 * It represents an intermediary access format with objects settable/gettable with string keys.
 * 
 * @class
 */
export class Document {
	public data: object;

	constructor(data?: Uint8Array, schema?: Schema) {
		if(data && schema) {
			const depolorizer = new Depolorizer(data);
			const obj = depolorizer.depolorize(schema);
			this.data = obj as object;
			return;
		}

		this.data = {};
	}

	/**
	 * Returns the number of key-value pairs in the Document.
	 * @returns {number} The number of key-value pairs in the Document.
	 */
	public size(): number {
		return Object.keys(this.data).length;
	}

	/**
	 * Returns the encoded data of the Document as a Uint8Array.
	 * @returns {Uint8Array} The encoded data of the Document.
	 */
	public bytes(): Uint8Array {
		const polorizer = new Polorizer();
		polorizer.polorizeDocument(this.data);
		return polorizer.bytes();
	}


	/**
	 * Retrieves the encoded data associated with the specified key from the Document.
	 * @param key - The key of the data to retrieve.
	 * @returns {Uint8Array} The encoded data associated with the specified key, 
	 * or undefined if the key does not exist.
	 */
	private get(key: string): Uint8Array {
		return this.data[key];
	}

	/**
	 * Sets the encoded data associated with the specified key in the Document.
	 * @param key - The key to set.
	 * @param val - The encoded data to set.
	 */
	private set(key: string, val: Uint8Array): void {
		this.setRaw(key, new Raw(val));
	}

	/**
	 * Checks if the encoded data associated with the specified key in the 
	 * Document has the specified WireType.
	 * @param key - The key to check.
	 * @param kind - The WireType to compare against.
	 * @returns {boolean} True if the encoded data has the specified WireType, 
	 * false otherwise.
	 */
	public is(key: string, kind: WireType): boolean {
		const data = this.get(key);

		if(!data || data.length === 0) {
			return kind === WireType.WIRE_NULL;
		}

		return data[0] === kind;
	}

	/**
	 * Sets the encoded data associated with the specified key to 
	 * represent a null value.
	 * 
	 * @param key - The key to set.
	 */
	public setNull(key: string): void {
		const wb: WriteBuffer = new WriteBuffer();
		wb.writeNull();

		this.set(key, wb.bytes());
	}

	/**
	 * Sets the encoded data associated with the specified key to 
	 * represent a boolean value.
	 * 
	 * @param key - The key to set.
	 * @param data - The boolean value to set.
	 */
	public setBool(key: string, data: boolean): void {
		const wb: WriteBuffer = new WriteBuffer();
		wb.writeBool(data);

		this.set(key, wb.bytes());
	}

	/**
	 * Sets the encoded data associated with the specified key to 
	 * represent an integer value.
	 * 
	 * @param key - The key to set.
	 * @param data - The integer value to set.
	 */
	public setInteger(key: string, data: number | BN): void {
		const wb: WriteBuffer = new WriteBuffer();
		wb.writeInt(data);

		this.set(key, wb.bytes());
	}

	/**
	 * Sets the encoded data associated with the specified key to 
	 * represent a float value.
	 * 
	 * @param key - The key to set.
	 * @param data - The float value to set.
	 */
	public setFloat(key: string, data: number): void {
		const wb: WriteBuffer = new WriteBuffer();
		wb.writeFloat(data);

		this.set(key, wb.bytes());
	}
	
	/**
	 * Sets the encoded data associated with the specified key to 
	 * represent a string value.
	 * 
	 * @param key - The key to set.
	 * @param data - The string value to set.
	 */
	public setString(key: string, data: string): void {
		const wb: WriteBuffer = new WriteBuffer();
		wb.writeString(data);

		this.set(key, wb.bytes());
	}

	/**
	 * Sets the encoded data associated with the specified key to represent 
	 * a raw value.
	 * 
	 * @param key - The key to set.
	 * @param data - The raw value to set.
	 */
	public setRaw(key: string, data: Raw): void {
		this.data[key] = data;
	}

	/**
	 * Sets the encoded data associated with the specified key to represent 
	 * a byte array value.
	 * 
	 * @param key - The key to set.
	 * @param data - The byte array value to set.
	 */
	public setBytes(key: string, data: Uint8Array): void {
		const wb: WriteBuffer = new WriteBuffer();
		wb.writeBytes(data);

		this.set(key, wb.bytes());
	}

	/**
	 * Sets the encoded data associated with the specified key to represent 
	 * a array value.
	 * 
	 * @param key - The key to set.
	 * @param array - The array value to set.
	 * @param schema - The schema used to encode the array elements.
	 */
	public setArray(key: string, array: Array<unknown>, schema: Schema): void {
		const polorizer = new Polorizer();
		if(schema.fields && schema.fields.values && schema.fields.values.kind) {
			array.forEach(arr => polorizer.polorize(arr, schema.fields.values));
		}

		this.set(key, polorizer.bytes());
	}

	/**
	 * Sets the encoded data associated with the specified key to represent 
	 * a map value.
	 * 
	 * @param key - The key to set.
	 * @param map - The map value to set.
	 * @param schema - The schema used to encode the map keys and values.
	 */
	public setMap(key: string, map: Map<unknown, unknown>, schema: Schema): void {
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

		this.set(key, polorizer.bytes());
	}

	/**
	 * Sets the encoded data associated with the specified key to represent 
	 * a struct value.
	 * 
	 * @param key - The key to set.
	 * @param struct - The struct value to set.
	 * @param schema - The schema used to encode the struct fields.
	 */
	public setStruct(key: string, struct: object, schema: Schema): void {
		const polorizer = new Polorizer();
		Object.entries(struct).forEach(([key, value]) => {
			polorizer.polorize(value, schema.fields[key]);
		});

		this.set(key, polorizer.bytes());
	}

	/**
	 * Retrieves a null value associated with the specified key from the Document.
	 * 
	 * @param key - The key of the null value to retrieve.
	 * @returns {null} The null value associated with the specified key, or null 
	 * if the key does not exist.
	 */
	public getNull(key: string): null {
		if(this.data[key]){
			const rb: ReadBuffer = new ReadBuffer(this.get(key));
			return rb.readNull();
		}

		return null;
	}

	/**
	 * Retrieves a boolean value associated with the specified key from the Document.
	 * 
	 * @param key - The key of the boolean value to retrieve.
	 * @returns {boolean} The boolean value associated with the specified key, or false 
	 * if the key does not exist.
	 */
	public getBool(key: string): boolean {
		if(this.data[key]){
			const rb: ReadBuffer = new ReadBuffer(this.get(key));
			return rb.readBool();
		}

		return false;
	}

	/**
	 * Retrieves an integer value associated with the specified key from the Document.
	 * 
	 * @param key - The key of the integer value to retrieve.
	 * @returns {number | bigint} The integer value associated with the specified 
	 * key, or 0 if the key does not exist.
	 */
	public getInteger(key: string): number | bigint {
		if(this.data[key]) {
			const rb: ReadBuffer = new ReadBuffer(this.get(key));
			return rb.readInteger();
		}

		return 0;
	}

	/**
	 * Retrieves a float value associated with the specified key from the Document.
	 * 
	 * @param key - The key of the float value to retrieve.
	 * @returns {number} The float value associated with the specified key, 
	 * or 0 if the key does not exist.
	 */
	public getFloat(key: string): number {
		if(this.data[key]) {
			const rb: ReadBuffer = new ReadBuffer(this.get(key));
			return rb.readFloat();
		}

		return 0;
	}

	/**
	 * Retrieves a string value associated with the specified key from the Document.
	 * 
	 * @param key - The key of the string value to retrieve.
	 * @returns {string} The string value associated with the specified key, 
	 * or an empty string if the key does not exist.
	 */
	public getString(key: string): string {
		if(this.data[key]) {
			const rb: ReadBuffer = new ReadBuffer(this.get(key));
			return rb.readString();
		}

		return '';
	}

	/**
	 * Retrieves a raw value associated with the specified key from the Document.
	 * 
	 * @param key - The key of the raw value to retrieve.
	 * @returns {Raw} The raw value associated with the specified key, or 
	 * null if the key does not exist.
	 */
	public getRaw(key: string): Raw {
		if(this.data[key]) {
			return this.data[key];
		}

		return new Raw();
	}

	/**
	 * Retrieves a byte array value associated with the specified key 
	 * from the Document.
	 * 
	 * @param key - The key of the byte array value to retrieve.
	 * @returns {Uint8Array} The byte array value associated with the specified 
	 * key, or an empty Uint8Array if the key does not exist.
	 */
	public getBytes(key: string): Uint8Array {
		if(this.data[key]) {
			const rb: ReadBuffer = new ReadBuffer(this.get(key));
			return rb.readBytes();
		}

		return new Uint8Array();
	}

	/**
	 * Retrieves an array value associated with the specified key from the Document.
	 * 
	 * @param key - The key of the array value to retrieve.
	 * @param schema - The schema used to decode the array elements.
	 * @returns {Array} The array value associated with the specified 
	 * key, or an empty array if the key does not exist.
	 */
	public getArray(key: string, schema: Schema): Array<unknown> {
		if(this.data[key]) {
			const depolorizer = new Depolorizer(this.get(key));
			return depolorizer.depolorize(schema) as Array<unknown>;
		}

		return [];
	}

	/**
	 * Retrieves a map value associated with the specified key from the Document.
	 * 
	 * @param key - The key of the map value to retrieve.
	 * @param schema - The schema used to decode the map keys and values.
	 * @returns {Map} The map value associated with the 
	 * specified key, or an empty map if the key does not exist.
	 */
	public getMap(key: string, schema: Schema): Map<unknown, unknown> {
		if(this.data[key]) {
			const depolorizer = new Depolorizer(this.get(key));
			return depolorizer.depolorize(schema) as Map<unknown, unknown>;
		}

		return new Map();
	}

	/**
	 * Retrieves a struct value associated with the specified key from the Document.
	 * 
	 * @param key - The key of the struct value to retrieve.
	 * @param schema - The schema used to decode the struct fields.
	 * @returns {object} The struct value associated with the specified key, 
	 * or an empty object if the key does not exist.
	 */
	public getStruct(key: string, schema: Schema): object {
		const obj = {};

		if(this.data[key]) {
			const depolorizer = new Depolorizer(this.get(key));
			Object.keys(schema.fields).forEach((key) => {
				obj[key] = depolorizer.depolorize(schema.fields[key]);
			});
		}

		return obj;
	}
}

/**
 * Encodes an object or map into a Document using the provided schema.
 * 
 * @param obj - The object or map to encode.
 * @param schema - The schema used for encoding.
 * @returns {Document} The encoded Document.
 * @throws {Error} If the provided schema kind is unsupported.
 */
export const documentEncode = (obj: object | Map<string, unknown>, schema: Schema): Document => {
	const doc = new Document();
	switch(schema.kind){
	case 'map':{
		const data: Map<string, unknown> = obj as Map<string, unknown>;
		[...data.keys()].forEach(key => {
			const polorizer = new Polorizer();
			polorizer.polorize(data.get(key), schema.fields.values);
			doc.setRaw(key, new Raw(polorizer.bytes()));
		});
		break;
	}
	case 'struct':
		Object.entries(obj).forEach(([key, value]) => {
			const polorizer = new Polorizer();
			polorizer.polorize(value, schema.fields[key]);
			doc.setRaw(key, new Raw(polorizer.bytes()));
		});
		break;
	default:
		throw new Error('unsupported kind');
	}

	return doc;
};

/**
 * Decodes a Document from the provided ReadBuffer.
 * 
 * @param data - The ReadBuffer containing the encoded Document data.
 * @returns {Document} The decoded Document.
 * @throws {Error} If the provided wire type is unsupported.
 */
export const documentDecode = (data: ReadBuffer): Document => {
	const doc = new Document();
	switch(data.wire){
	case WireType.WIRE_DOC:{
		// Convert the element into a loadreader
		const load = data.load();
		const pack = new Depolorizer(null, load);

		while(!pack.isDone()) {
			const docKey = pack.depolorizeString();
			const val = pack.read();
			doc.setRaw(docKey, new Raw(val.data));
		}

		return doc;
	}
	default:
		throw new Error('unsupported kind');
	}
};
