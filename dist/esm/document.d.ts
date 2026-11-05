import BN from 'bn.js';
import { ReadBuffer } from './readbuffer.js';
import { Raw } from './raw.js';
import { Schema } from './schema.js';
import { WireType } from './wiretype.js';
import { DecodeConfig, DecodeOptions, EncodeOptions } from './options.js';
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
export declare class Document {
    private data;
    /**
     * Creates a Document.
     *
     * @param {Uint8Array} data - Optional. The wire of a document. The
     * constructor decodes it.
     * @throws {Error} If the wire is not a valid document.
     */
    constructor(data?: Uint8Array);
    /**
     * Returns the number of key-value pairs in the Document.
     * @returns {number} The number of key-value pairs in the Document.
     */
    size(): number;
    /**
     * Returns the keys of the Document in the order of their UTF-8 bytes.
     * This is the order of the keys on the wire.
     * @returns {string[]} The keys.
     */
    keys(): string[];
    /**
     * Returns the encoded data of the Document as a Uint8Array.
     * @returns {Uint8Array} The encoded data of the Document.
     */
    bytes(): Uint8Array;
    /**
     * Retrieves the entire data object stored in the Document.
     * The object has no prototype. Thus a key such as `__proto__` is an
     * ordinary key of the object.
     * @returns {Record<string, Raw>} The data object stored in the Document.
     */
    getData(): Record<string, Raw>;
    /**
     * Retrieves the encoded data associated with the specified key from the Document.
     * @param key - The key of the data to retrieve.
     * @returns {Raw | undefined} The encoded data associated with the specified key,
     * or undefined if the key does not exist.
     */
    private get;
    /**
     * Decodes the value of a key.
     * @param key - The key.
     * @param schema - The schema of the value.
     * @param options - The decode options.
     * @returns {unknown} The value, or the zero value of the schema if the
     * key does not exist.
     */
    private decode;
    /**
     * Checks if the encoded data associated with the specified key in the
     * Document has the specified WireType.
     * @param key - The key to check.
     * @param kind - The WireType to compare against.
     * @returns {boolean} True if the encoded data has the specified WireType,
     * false otherwise.
     */
    is(key: string, kind: WireType): boolean;
    /**
     * Sets the encoded data associated with the specified key to
     * represent a null value.
     *
     * @param key - The key to set.
     */
    setNull(key: string): void;
    /**
     * Sets the encoded data associated with the specified key to
     * represent a boolean value.
     *
     * @param key - The key to set.
     * @param data - The boolean value to set.
     */
    setBool(key: string, data: boolean): void;
    /**
     * Sets the encoded data associated with the specified key to
     * represent an integer value.
     *
     * @param key - The key to set.
     * @param data - The integer value to set.
     */
    setInteger(key: string, data: number | bigint | BN | string): void;
    /**
     * Sets the encoded data associated with the specified key to
     * represent a float value.
     *
     * @param key - The key to set.
     * @param data - The float value to set.
     */
    setFloat(key: string, data: number): void;
    /**
     * Sets the encoded data associated with the specified key to
     * represent a string value.
     *
     * @param key - The key to set.
     * @param data - The string value to set.
     */
    setString(key: string, data: string): void;
    /**
     * Sets the encoded data associated with the specified key to represent
     * a raw value. The data is the POLO wire of the value.
     *
     * @param key - The key to set.
     * @param data - The raw value to set.
     * @throws {Error} If the key is not a string or the data is not a
     * Uint8Array.
     */
    setRaw(key: string, data: Raw | Uint8Array): void;
    /**
     * Sets the encoded data associated with the specified key to represent
     * a byte array value.
     *
     * @param key - The key to set.
     * @param data - The byte array value to set.
     */
    setBytes(key: string, data: Uint8Array): void;
    /**
     * Sets the encoded data associated with the specified key to represent
     * a array value. The value is one pack, also for 0 or 1 items.
     *
     * @param key - The key to set.
     * @param array - The array value to set.
     * @param schema - The schema of the array.
     * @param options - The encode options.
     */
    setArray(key: string, array: Array<unknown>, schema: Schema, options?: EncodeOptions): void;
    /**
     * Sets the encoded data associated with the specified key to represent
     * a map value. The value is one pack with the keys in POLO order.
     *
     * @param key - The key to set.
     * @param map - The map value to set.
     * @param schema - The schema of the map.
     * @param options - The encode options.
     */
    setMap(key: string, map: Map<unknown, unknown>, schema: Schema, options?: EncodeOptions): void;
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
    setStruct(key: string, struct: object, schema: Schema, options?: EncodeOptions): void;
    /**
     * Retrieves a null value associated with the specified key from the Document.
     *
     * @param key - The key of the null value to retrieve.
     * @returns {null} The null value associated with the specified key, or null
     * if the key does not exist.
     */
    getNull(key: string): null;
    /**
     * Retrieves a boolean value associated with the specified key from the Document.
     *
     * @param key - The key of the boolean value to retrieve.
     * @returns {boolean} The boolean value associated with the specified key, or false
     * if the key does not exist.
     */
    getBool(key: string): boolean;
    /**
     * Retrieves an integer value associated with the specified key from the Document.
     *
     * @param key - The key of the integer value to retrieve.
     * @returns {number | bigint} The integer value associated with the specified
     * key, or 0 if the key does not exist.
     */
    getInteger(key: string): number | bigint;
    /**
     * Retrieves a float value associated with the specified key from the Document.
     *
     * @param key - The key of the float value to retrieve.
     * @returns {number} The float value associated with the specified key,
     * or 0 if the key does not exist.
     */
    getFloat(key: string): number;
    /**
     * Retrieves a string value associated with the specified key from the Document.
     *
     * @param key - The key of the string value to retrieve.
     * @returns {string} The string value associated with the specified key,
     * or an empty string if the key does not exist.
     */
    getString(key: string): string;
    /**
     * Retrieves a raw value associated with the specified key from the Document.
     *
     * @param key - The key of the raw value to retrieve.
     * @returns {Raw | null} The raw value associated with the specified key, or
     * null if the key does not exist.
     */
    getRaw(key: string): Raw | null;
    /**
     * Retrieves a byte array value associated with the specified key
     * from the Document.
     *
     * @param key - The key of the byte array value to retrieve.
     * @returns {Uint8Array | null} The byte array value associated with the
     * specified key, or null if the key does not exist or holds a Null.
     */
    getBytes(key: string): Uint8Array | null;
    /**
     * Retrieves an array value associated with the specified key from the Document.
     *
     * @param key - The key of the array value to retrieve.
     * @param schema - The schema of the array.
     * @param options - The decode options.
     * @returns {Array | null} The array value associated with the specified
     * key, or null if the key does not exist or holds a Null.
     */
    getArray(key: string, schema: Schema, options?: DecodeOptions): Array<unknown> | null;
    /**
     * Retrieves a map value associated with the specified key from the Document.
     *
     * @param key - The key of the map value to retrieve.
     * @param schema - The schema of the map.
     * @param options - The decode options.
     * @returns {Map | null} The map value associated with the specified key,
     * or null if the key does not exist or holds a Null.
     */
    getMap(key: string, schema: Schema, options?: DecodeOptions): Map<unknown, unknown> | null;
    /**
     * Retrieves a struct value associated with the specified key from the Document.
     *
     * @param key - The key of the struct value to retrieve.
     * @param schema - The schema of the struct.
     * @param options - The decode options.
     * @returns {object} The struct value associated with the specified key,
     * or a struct of zero values if the key does not exist.
     */
    getStruct(key: string, schema: Schema, options?: DecodeOptions): object;
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
export declare const documentEncode: (obj: object | Map<string, unknown>, schema: Schema, options?: EncodeOptions) => Document;
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
export declare const documentDecode: (data: ReadBuffer, options?: DecodeOptions | DecodeConfig, depth?: number) => Document | null;
