import BN from 'bn.js';
import { WriteBuffer } from './writebuffer.js';
import { ReadBuffer, incompatibleWire } from './readbuffer.js';
import { Raw } from './raw.js';
import { Polorizer } from './polorizer.js';
import { Schema } from './schema.js';
import { Depolorizer, zeroValue } from './depolorizer.js';
import { Wire, WireType } from './wiretype.js';
import { compareUTF8, decodeUTF8 } from './utf8.js';
import { DecodeConfig, DecodeOptions, EncodeOptions, checkDepth, decodeConfig } from './options.js';

/**
 * Encodes one value into its POLO wire.
 *
 * @param {unknown} value - The value.
 * @param {Schema} schema - The schema of the value.
 * @param {EncodeOptions} options - The encode options.
 * @returns {Raw} The wire of the value.
 */
const encodeValue = (value: unknown, schema: Schema, options?: EncodeOptions): Raw => {
	const polorizer = new Polorizer(options);
	polorizer.polorize(value, schema);
	return new Raw(polorizer.bytes());
};

/**
 * Document is a representation for a string indexed collection of encoded object data.
 * It represents an intermediary access format with objects settable/gettable with string keys.
 *
 * Each value is the POLO wire of a value. A get method decodes the wire of
 * its key. For a key that is not in the document, a get method gives the
 * zero value of its type: false, 0, "" or null.
 *
 * @class
 */
export class Document {
	private data: Map<string, Raw>;

	/**
	 * Creates a Document.
	 *
	 * @param {Uint8Array} data - Optional. The wire of a document. The
	 * constructor decodes it.
	 * @throws {Error} If the wire is not a valid document.
	 */
	constructor(data?: Uint8Array) {
		this.data = new Map();

		if(data) {
			// documentDecode and Document refer to each other. The call occurs
			// after the module is loaded, so the order of definition is safe.
			// eslint-disable-next-line @typescript-eslint/no-use-before-define
			const doc = documentDecode(new ReadBuffer(data));

			if(doc === null) {
				throw new Error('incompatible wire: the wire is a Null, not a document');
			}

			this.data = doc.data;
		}
	}

	/**
	 * Returns the number of key-value pairs in the Document.
	 * @returns {number} The number of key-value pairs in the Document.
	 */
	public size(): number {
		return this.data.size;
	}

	/**
	 * Returns the keys of the Document in the order of their UTF-8 bytes.
	 * This is the order of the keys on the wire.
	 * @returns {string[]} The keys.
	 */
	public keys(): string[] {
		return [...this.data.keys()].sort(compareUTF8);
	}

	/**
	 * Returns the encoded data of the Document as a Uint8Array.
	 * @returns {Uint8Array} The encoded data of the Document.
	 */
	public bytes(): Uint8Array {
		const polorizer = new Polorizer();
		polorizer.polorizeDocument(this);
		return polorizer.bytes();
	}

	/**
	 * Retrieves the entire data object stored in the Document.
	 * The object has no prototype. Thus a key such as `__proto__` is an
	 * ordinary key of the object.
	 * @returns {Record<string, Raw>} The data object stored in the Document.
	 */
	public getData(): Record<string, Raw> {
		const data: Record<string, Raw> = Object.create(null);

		this.data.forEach((value, key) => {
			data[key] = value;
		});

		return data;
	}

	/**
	 * Retrieves the encoded data associated with the specified key from the Document.
	 * @param key - The key of the data to retrieve.
	 * @returns {Raw | undefined} The encoded data associated with the specified key,
	 * or undefined if the key does not exist.
	 */
	private get(key: string): Raw | undefined {
		return this.data.get(key);
	}

	/**
	 * Decodes the value of a key.
	 * @param key - The key.
	 * @param schema - The schema of the value.
	 * @param options - The decode options.
	 * @returns {unknown} The value, or the zero value of the schema if the
	 * key does not exist.
	 */
	private decode(key: string, schema: Schema, options?: DecodeOptions): unknown {
		const data = this.get(key);

		if(data === undefined) {
			return zeroValue(schema);
		}

		try {
			return new Depolorizer(data, options).depolorize(schema);
		} catch(err) {
			throw new Error(`document key "${key}": ${err instanceof Error ? err.message : err}`);
		}
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

		this.setRaw(key, new Raw(wb.bytes()));
	}

	/**
	 * Sets the encoded data associated with the specified key to
	 * represent a boolean value.
	 *
	 * @param key - The key to set.
	 * @param data - The boolean value to set.
	 */
	public setBool(key: string, data: boolean): void {
		this.setRaw(key, encodeValue(data, { kind: 'bool' }));
	}

	/**
	 * Sets the encoded data associated with the specified key to
	 * represent an integer value.
	 *
	 * @param key - The key to set.
	 * @param data - The integer value to set.
	 */
	public setInteger(key: string, data: number | bigint | BN | string): void {
		this.setRaw(key, encodeValue(data, { kind: 'integer' }));
	}

	/**
	 * Sets the encoded data associated with the specified key to
	 * represent a float value.
	 *
	 * @param key - The key to set.
	 * @param data - The float value to set.
	 */
	public setFloat(key: string, data: number): void {
		this.setRaw(key, encodeValue(data, { kind: 'float' }));
	}

	/**
	 * Sets the encoded data associated with the specified key to
	 * represent a string value.
	 *
	 * @param key - The key to set.
	 * @param data - The string value to set.
	 */
	public setString(key: string, data: string): void {
		this.setRaw(key, encodeValue(data, { kind: 'string' }));
	}

	/**
	 * Sets the encoded data associated with the specified key to represent
	 * a raw value. The data is the POLO wire of the value.
	 *
	 * @param key - The key to set.
	 * @param data - The raw value to set.
	 * @throws {Error} If the key is not a string or the data is not a
	 * Uint8Array.
	 */
	public setRaw(key: string, data: Raw | Uint8Array): void {
		if(typeof key !== 'string') {
			throw new Error(`invalid document key: expected a string, received ${typeof key}`);
		}

		if(!(data instanceof Uint8Array)) {
			throw new Error(`invalid document value for key "${key}": expected a Raw or a Uint8Array, ` +
				`received ${typeof data}`);
		}

		this.data.set(key, data instanceof Raw ? data : new Raw(data));
	}

	/**
	 * Sets the encoded data associated with the specified key to represent
	 * a byte array value.
	 *
	 * @param key - The key to set.
	 * @param data - The byte array value to set.
	 */
	public setBytes(key: string, data: Uint8Array): void {
		this.setRaw(key, encodeValue(data, { kind: 'bytes' }));
	}

	/**
	 * Sets the encoded data associated with the specified key to represent
	 * a array value. The value is one pack, also for 0 or 1 items.
	 *
	 * @param key - The key to set.
	 * @param array - The array value to set.
	 * @param schema - The schema of the array.
	 * @param options - The encode options.
	 */
	public setArray(key: string, array: Array<unknown>, schema: Schema, options?: EncodeOptions): void {
		this.setRaw(key, encodeValue(array, schema, options));
	}

	/**
	 * Sets the encoded data associated with the specified key to represent
	 * a map value. The value is one pack with the keys in POLO order.
	 *
	 * @param key - The key to set.
	 * @param map - The map value to set.
	 * @param schema - The schema of the map.
	 * @param options - The encode options.
	 */
	public setMap(key: string, map: Map<unknown, unknown>, schema: Schema, options?: EncodeOptions): void {
		this.setRaw(key, encodeValue(map, schema, options));
	}

	/**
	 * Sets the encoded data associated with the specified key to represent
	 * a struct value. The value is one pack with the fields in the order of
	 * the schema, or one document with the option docStructs.
	 *
	 * @param key - The key to set.
	 * @param struct - The struct value to set.
	 * @param schema - The schema of the struct.
	 * @param options - The encode options.
	 */
	public setStruct(key: string, struct: object, schema: Schema, options?: EncodeOptions): void {
		this.setRaw(key, encodeValue(struct, schema, options));
	}

	/**
	 * Retrieves a null value associated with the specified key from the Document.
	 *
	 * @param key - The key of the null value to retrieve.
	 * @returns {null} The null value associated with the specified key, or null
	 * if the key does not exist.
	 */
	public getNull(key: string): null {
		return this.decode(key, { kind: 'null' }) as null;
	}

	/**
	 * Retrieves a boolean value associated with the specified key from the Document.
	 *
	 * @param key - The key of the boolean value to retrieve.
	 * @returns {boolean} The boolean value associated with the specified key, or false
	 * if the key does not exist.
	 */
	public getBool(key: string): boolean {
		return this.decode(key, { kind: 'bool' }) as boolean;
	}

	/**
	 * Retrieves an integer value associated with the specified key from the Document.
	 *
	 * @param key - The key of the integer value to retrieve.
	 * @returns {number | bigint} The integer value associated with the specified
	 * key, or 0 if the key does not exist.
	 */
	public getInteger(key: string): number | bigint {
		return this.decode(key, { kind: 'integer' }) as number | bigint;
	}

	/**
	 * Retrieves a float value associated with the specified key from the Document.
	 *
	 * @param key - The key of the float value to retrieve.
	 * @returns {number} The float value associated with the specified key,
	 * or 0 if the key does not exist.
	 */
	public getFloat(key: string): number {
		return this.decode(key, { kind: 'float' }) as number;
	}

	/**
	 * Retrieves a string value associated with the specified key from the Document.
	 *
	 * @param key - The key of the string value to retrieve.
	 * @returns {string} The string value associated with the specified key,
	 * or an empty string if the key does not exist.
	 */
	public getString(key: string): string {
		return this.decode(key, { kind: 'string' }) as string;
	}

	/**
	 * Retrieves a raw value associated with the specified key from the Document.
	 *
	 * @param key - The key of the raw value to retrieve.
	 * @returns {Raw | null} The raw value associated with the specified key, or
	 * null if the key does not exist.
	 */
	public getRaw(key: string): Raw | null {
		return this.get(key) ?? null;
	}

	/**
	 * Retrieves a byte array value associated with the specified key
	 * from the Document.
	 *
	 * @param key - The key of the byte array value to retrieve.
	 * @returns {Uint8Array | null} The byte array value associated with the
	 * specified key, or null if the key does not exist or holds a Null.
	 */
	public getBytes(key: string): Uint8Array | null {
		return this.decode(key, { kind: 'bytes' }) as Uint8Array | null;
	}

	/**
	 * Retrieves an array value associated with the specified key from the Document.
	 *
	 * @param key - The key of the array value to retrieve.
	 * @param schema - The schema of the array.
	 * @param options - The decode options.
	 * @returns {Array | null} The array value associated with the specified
	 * key, or null if the key does not exist or holds a Null.
	 */
	public getArray(key: string, schema: Schema, options?: DecodeOptions): Array<unknown> | null {
		return this.decode(key, schema, options) as Array<unknown> | null;
	}

	/**
	 * Retrieves a map value associated with the specified key from the Document.
	 *
	 * @param key - The key of the map value to retrieve.
	 * @param schema - The schema of the map.
	 * @param options - The decode options.
	 * @returns {Map | null} The map value associated with the specified key,
	 * or null if the key does not exist or holds a Null.
	 */
	public getMap(key: string, schema: Schema, options?: DecodeOptions): Map<unknown, unknown> | null {
		return this.decode(key, schema, options) as Map<unknown, unknown> | null;
	}

	/**
	 * Retrieves a struct value associated with the specified key from the Document.
	 *
	 * @param key - The key of the struct value to retrieve.
	 * @param schema - The schema of the struct.
	 * @param options - The decode options.
	 * @returns {object} The struct value associated with the specified key,
	 * or a struct of zero values if the key does not exist.
	 */
	public getStruct(key: string, schema: Schema, options?: DecodeOptions): object {
		return this.decode(key, schema, options) as object;
	}
}

/**
 * Encodes an object or map into a Document using the provided schema.
 *
 * - For a struct schema, the document has one key for each field of the
 *   schema, also for a field with a zero value. A field that is absent from
 *   the object is null: the schema of the field must accept a Null.
 * - For a map schema, the document has one key for each key of the map.
 *   The keys must be strings.
 *
 * @param obj - The object or map to encode.
 * @param schema - The schema used for encoding.
 * @param options - The encode options for the values.
 * @returns {Document} The encoded Document.
 * @throws {Error} If the provided schema kind is unsupported.
 */
export const documentEncode = (
	obj: object | Map<string, unknown>,
	schema: Schema,
	options?: EncodeOptions
): Document => {
	const doc = new Document();

	switch(schema.kind){
	case 'map':{
		const values: Schema = schema.fields?.values;

		if(!values?.kind) {
			throw new Error('invalid schema: a map schema must have fields.values');
		}

		if(!(obj instanceof Map)) {
			throw new Error(`invalid map: expected a Map, received ${typeof obj}`);
		}

		obj.forEach((value, key) => {
			doc.setRaw(key, encodeValue(value, values, options));
		});
		break;
	}
	case 'struct':
		Object.entries(schema.fields ?? {}).forEach(([key, field]) => {
			try {
				doc.setRaw(key, encodeValue(obj[key], field, options));
			} catch(err) {
				throw new Error(`field "${key}": ${err instanceof Error ? err.message : err}`);
			}
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
 * The decoder examines the keys, but not the values (refer to "Document
 * Encoding" in the POLO Wire Specification):
 * - Each key must be a Word with valid UTF-8 data.
 * - Each value must be a Raw element.
 * - The keys must be in strictly ascending order of their UTF-8 bytes.
 *   Thus the decoder rejects duplicate keys (rule C7).
 *
 * @param data - The ReadBuffer containing the encoded Document data.
 * @param options - The decode options.
 * @param depth - The nesting depth of the document.
 * @returns {Document | null} The decoded Document, or null for a Null.
 * @throws {Error} If the provided wire type is unsupported.
 */
export const documentDecode = (
	data: ReadBuffer,
	options?: DecodeOptions | DecodeConfig,
	depth = 1
): Document | null => {
	if(data.wire === WireType.WIRE_NULL) {
		data.readNull();
		return null;
	}

	if(data.wire !== WireType.WIRE_DOC) {
		throw incompatibleWire(data.wire, 'document');
	}

	checkDepth(decodeConfig(options), depth);

	const load = data.load();

	if(load.remaining() % 2 !== 0) {
		throw new Error('malformed document: a key has no value');
	}

	const doc = new Document();
	let previous: string | undefined;

	while(!load.done()) {
		const key = load.next();
		const value = load.next();

		if(key.wire !== WireType.WIRE_WORD) {
			throw new Error(`malformed document: a key must be a Word, not a ${Wire.nameOf(key.wire)}`);
		}

		const name = decodeUTF8(key.data);

		if(previous !== undefined && compareUTF8(previous, name) >= 0) {
			throw new Error('malformed document: the keys are not in strictly ascending order');
		}

		if(value.wire !== WireType.WIRE_RAW) {
			throw new Error(`malformed document: the value of key "${name}" must be a Raw element`);
		}

		doc.setRaw(name, value.readRaw());
		previous = name;
	}

	return doc;
};
