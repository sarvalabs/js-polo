import LoadReader from './loadreader';
import { Schema } from '../types/schema';
import { Raw } from './raw';
import { ReadBuffer } from './readbuffer';
import { Document } from './document';
/**
 * Depolorizer is a decoding buffer that can sequentially depolorize objects from it.
 * It can check whether there are elements left in the buffer with `isDone()`,
 * and peek the WireType of the next element with `read()`.
 *
 * @class
 */
export declare class Depolorizer {
    private done;
    private packed;
    private data;
    private load;
    constructor(data: Uint8Array, load?: LoadReader);
    /**
     * Checks if all elements in the Depolorizer have been read.
     *
     * @public
     * @returns {boolean} True if all elements have been read, false otherwise.
     */
    isDone(): boolean;
    /**
     * Reads the next element in the Depolorizer as a ReadBuffer.
     * If the Depolorizer is in packed mode, it reads from the pack buffer.
     * Otherwise, it returns the data from the read buffer and sets the done flag.
     *
     * @public
     * @returns {ReadBuffer} The next element in the Depolorizer as a ReadBuffer.
     * @throws {Error} If there is insufficient data in the wire for decoding.
     */
    read(): ReadBuffer;
    /**
     * Creates a new Depolorizer in packed mode from a given ReadBuffer.
     * The ReadBuffer is converted into a LoadReader, and the returned
     * Depolorizer is created in packed mode.
     *
     * @private
     * @param {ReadBuffer} data - The ReadBuffer to convert into a LoadReader.
     * @returns {Depolorizer} A new Depolorizer created in packed mode.
     */
    private newLoadDepolorizer;
    /**
     * Decodes a value from the Depolorizer based on the provided schema.
     *
     * @public
     * @param {Schema} schema - The schema representing the type of the value to decode.
     * @returns {unknown} The decoded value.
     * @throws {Error} If the schema kind is unsupported or a decode error occurs.
     */
    depolorize(schema: Schema): unknown;
    /**
     * Decodes a null value from the Depolorizer, consuming one
     * wire element. Returns `null` if a null value is successfully decoded.
     *
     * @public
     * @returns {null} The decoded null value.
     * @throws {Error} If there are no elements left or if the element is
     * not of type WireNull.
     */
    depolorizeNull(): null;
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
    depolorizeBool(): boolean;
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
    depolorizeInteger(): number | bigint;
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
    depolorizeFloat(): number;
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
    depolorizeString(): string;
    /**
     * Decodes a `Raw` value from the Depolorizer, consuming one wire element.
     * Returns the decoded `Raw` value.
     *
     * @public
     * @returns {Raw} The decoded `Raw` value.
     * @throws {Error} If there are no elements left or if the element is not
     * of type WireRaw.
     */
    depolorizeRaw(): Raw;
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
    depolorizeBytes(): Uint8Array;
    /**
     * Depolorizes an array value from the Depolorizer.
     *
     * @param {Schema} schema - The schema definition for the array.
     * @returns {Array<unknown>} - The depolorized array.
     * @throws {Error} - If the the schema is invalid.
     */
    private depolorizeArray;
    /**
     * Depolorizes a Document from the Depolorizer.
     *
     * @returns {Document} - The depolorized Document.
     * @throws {Error} - If there are no elements left or if the element is not WireDoc.
     * @returns {null} - If the element is a WireNull.
     */
    depolorizeDocument(): Document;
    /**
     * DepolorizePacked Decodes another Depolorizer from the Depolorizer,
     * consuming one wire element.
     *
     * @returns {Depolorizer} - The depolorized packed Depolorizer.
     * @throws {Error} - If there are no elements left, if the element is not
     * WirePack or WireDoc, or if it is a WireNull.
     */
    depolorizePacked(): Depolorizer;
    /**
     * Decodes another Depolorizer from the Depolorizer, consuming one wire element.
     *
     * Unlike DepolorizePacked, which expects a compound element and converts it
     * into a packed Depolorizer.
     * DepolorizeInner returns the atomic element as an atomic Depolorizer.
     *
     * @returns {Depolorizer} - The depolorized inner Depolorizer.
     * @throws {Error} - If there are no elements left or if the element is not
     * a valid wire element.
     */
    depolorizeInner(): Depolorizer;
    /**
     * Decodes a value from the Depolorizer based on the provided schema.
     * The target type must be a map and the next wire element must be WirePack.
     *
     * @param {Schema} schema - The schema representing the map structure.
     * @returns {Map<unknown, unknown>} - The depolorized map.
     * @throws {Error} - If the schema or wire element is invalid.
     */
    private depolorizeMap;
    /**
     * Decodes a value from the Depolorizer based on the provided schema.
     * The target type must be a object and the next wire element must be WirePack or WireDoc.
     *
     * @param {Schema} schema - The schema representing the object structure.
     * @returns {object} - The depolorized object.
     * @throws {Error} - If the wire type is incompatible or the schema is invalid.
     */
    private depolorizeStruct;
}
