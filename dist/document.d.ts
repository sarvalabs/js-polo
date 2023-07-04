import BN from 'bn.js';
import { ReadBuffer } from './readbuffer';
import { Raw } from './raw';
import { Schema } from '../types/schema';
import { WireType } from './wiretype';
/**
 * Document is a representation for a string indexed collection of encoded object data.
 * It represents an intermediary access format with objects settable/gettable with string keys.
 *
 * @class
 */
export declare class Document {
    document: object;
    constructor(data?: Uint8Array, schema?: Schema);
    /**
     * Returns the number of key-value pairs in the Document.
     * @returns {number} The number of key-value pairs in the Document.
     */
    size(): number;
    /**
     * Returns the encoded data of the Document as a Uint8Array.
     * @returns {Uint8Array} The encoded data of the Document.
     */
    bytes(): Uint8Array;
    /**
     * Retrieves the encoded data associated with the specified key from the Document.
     * @param key - The key of the data to retrieve.
     * @returns {Uint8Array} The encoded data associated with the specified key,
     * or undefined if the key does not exist.
     */
    private get;
    /**
     * Sets the encoded data associated with the specified key in the Document.
     * @param key - The key to set.
     * @param val - The encoded data to set.
     */
    private set;
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
    setInteger(key: string, data: number | BN): void;
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
     * a raw value.
     *
     * @param key - The key to set.
     * @param data - The raw value to set.
     */
    setRaw(key: string, data: Raw): void;
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
     * a array value.
     *
     * @param key - The key to set.
     * @param array - The array value to set.
     * @param schema - The schema used to encode the array elements.
     */
    setArray(key: string, array: Array<unknown>, schema: Schema): void;
    /**
     * Sets the encoded data associated with the specified key to represent
     * a map value.
     *
     * @param key - The key to set.
     * @param map - The map value to set.
     * @param schema - The schema used to encode the map keys and values.
     */
    setMap(key: string, map: Map<unknown, unknown>, schema: Schema): void;
    /**
     * Sets the encoded data associated with the specified key to represent
     * a struct value.
     *
     * @param key - The key to set.
     * @param struct - The struct value to set.
     * @param schema - The schema used to encode the struct fields.
     */
    setStruct(key: string, struct: object, schema: Schema): void;
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
     * @returns {Raw} The raw value associated with the specified key, or
     * null if the key does not exist.
     */
    getRaw(key: string): Raw;
    /**
     * Retrieves a byte array value associated with the specified key
     * from the Document.
     *
     * @param key - The key of the byte array value to retrieve.
     * @returns {Uint8Array} The byte array value associated with the specified
     * key, or an empty Uint8Array if the key does not exist.
     */
    getBytes(key: string): Uint8Array;
    /**
     * Retrieves an array value associated with the specified key from the Document.
     *
     * @param key - The key of the array value to retrieve.
     * @param schema - The schema used to decode the array elements.
     * @returns {Array} The array value associated with the specified
     * key, or an empty array if the key does not exist.
     */
    getArray(key: string, schema: Schema): Array<unknown>;
    /**
     * Retrieves a map value associated with the specified key from the Document.
     *
     * @param key - The key of the map value to retrieve.
     * @param schema - The schema used to decode the map keys and values.
     * @returns {Map} The map value associated with the
     * specified key, or an empty map if the key does not exist.
     */
    getMap(key: string, schema: Schema): Map<unknown, unknown>;
    /**
     * Retrieves a struct value associated with the specified key from the Document.
     *
     * @param key - The key of the struct value to retrieve.
     * @param schema - The schema used to decode the struct fields.
     * @returns {object} The struct value associated with the specified key,
     * or an empty object if the key does not exist.
     */
    getStruct(key: string, schema: Schema): object;
}
/**
 * Encodes an object or map into a Document using the provided schema.
 *
 * @param obj - The object or map to encode.
 * @param schema - The schema used for encoding.
 * @returns {Document} The encoded Document.
 * @throws {Error} If the provided schema kind is unsupported.
 */
export declare const documentEncode: (obj: object | Map<string, unknown>, schema: Schema) => Document;
/**
 * Decodes a Document from the provided ReadBuffer.
 *
 * @param data - The ReadBuffer containing the encoded Document data.
 * @returns {Document} The decoded Document.
 * @throws {Error} If the provided wire type is unsupported.
 */
export declare const documentDecode: (data: ReadBuffer) => Document;
