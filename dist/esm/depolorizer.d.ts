import { Schema } from './schema.js';
import { Raw } from './raw.js';
import { ReadBuffer } from './readbuffer.js';
import { Document } from './document.js';
import { DecodeOptions } from './options.js';
/**
 * Returns the zero value of a schema. A struct from a document gets the
 * zero value for a field that has no key in the document.
 *
 * @param {Schema} schema - The schema.
 * @returns {unknown} The zero value: `null` for an optional schema,
 * false, 0, 0 or "" for a bool, integer, float or string, an object of zero
 * values for a struct, and `null` for all other kinds.
 */
export declare const zeroValue: (schema: Schema) => unknown;
/**
 * Depolorizer is a decoding buffer that can sequentially depolorize objects from it.
 * It can check whether there are elements left in the buffer with `isDone()`,
 * and peek the WireType of the next element with `read()`.
 *
 * The decoder accepts only the canonical encoding of each value. Thus
 * encode(decode(wire)) gives the same bytes as the wire.
 *
 * @class
 */
export declare class Depolorizer {
    private done;
    private packed;
    private data;
    private load;
    private config;
    private depth;
    /**
     * Creates a Depolorizer for a wire.
     *
     * @param {Uint8Array} data - The wire. It must have at least one byte.
     * @param {DecodeOptions} options - Optional. The decode options. The
     * depolorizers for compound values use the same options.
     * @throws {Error} If the wire is empty or its tag is not valid.
     */
    constructor(data: Uint8Array, options?: DecodeOptions);
    /**
     * Creates a Depolorizer in packed mode for the elements of a load.
     *
     * @private
     * @param {LoadReader} load - The elements.
     * @param {DecodeConfig} config - The decode options.
     * @param {number} depth - The nesting depth of the load.
     * @returns {Depolorizer} The Depolorizer.
     */
    private static packed;
    /**
     * Creates a Depolorizer for a wire that is nested in another wire, for
     * example the value of a document key.
     *
     * @private
     * @param {Uint8Array} data - The wire.
     * @param {DecodeConfig} config - The decode options.
     * @param {number} depth - The nesting depth of the wire.
     * @returns {Depolorizer} The Depolorizer.
     */
    private static nested;
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
     * A Null decodes to `null` if the schema accepts a Null: an optional
     * schema, or the kind `null`, `array`, `map`, `bytes`, `raw` or
     * `document`. For all other schemas, the decoder rejects a Null. The
     * decoder never changes a Null to an empty value or a zero value.
     *
     * @public
     * @param {Schema} schema - The schema representing the type of the value to decode.
     * @returns {unknown} The decoded value.
     * @throws {Error} If the schema kind is unsupported or a decode error occurs.
     */
    depolorize(schema: Schema): unknown;
    /**
     * Decodes one element into the type of a schema.
     *
     * @private
     * @param {ReadBuffer} data - The element.
     * @param {Schema} schema - The schema of the target type.
     * @returns {unknown} The decoded value.
     */
    private decode;
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
     *
     * @public
     * @returns {string} The decoded string value.
     * @throws {Error} If there are no elements left or if the element is not
     * of type WireWord.
     */
    depolorizeString(): string;
    /**
     * Decodes a `Raw` value from the Depolorizer, consuming one wire element.
     * Returns the decoded `Raw` value, or `null` for a Null.
     *
     * @public
     * @returns {Raw | null} The decoded `Raw` value.
     * @throws {Error} If there are no elements left or if the element is not
     * of type WireRaw or WireNull.
     */
    depolorizeRaw(): Raw | null;
    /**
     * Decodes a `Uint8Array` (bytes) value from the Depolorizer,
     * consuming one wire element.
     * Returns the decoded `Uint8Array` (bytes) value, or `null` for a Null.
     *
     * @public
     * @returns {Uint8Array | null} The decoded `Uint8Array` (bytes) value.
     * @throws {Error} If there are no elements left or if the element is not
     * of type WireWord or WireNull.
     */
    depolorizeBytes(): Uint8Array | null;
    /**
     * Depolorizes an array value from the Depolorizer.
     *
     * @param {ReadBuffer} data - The element.
     * @param {Schema} schema - The schema definition for the array.
     * @returns {Array<unknown>} The depolorized array.
     * @throws {Error} If the the schema is invalid.
     */
    private decodeArray;
    /**
     * Depolorizes a Document from the Depolorizer.
     *
     * @throws {Error} If there are no elements left or if the element is not WireDoc.
     * @returns {Document | null} The depolorized Document, or `null` for a Null.
     */
    depolorizeDocument(): Document | null;
    /**
     * DepolorizePacked Decodes another Depolorizer from the Depolorizer,
     * consuming one wire element.
     *
     * @returns {Depolorizer} The depolorized packed Depolorizer.
     * @throws {Error} If there are no elements left, if the element is not
     * WirePack or WireDoc, or if it is a WireNull.
     */
    depolorizePacked(): Depolorizer;
    /**
     * Decodes another Depolorizer from the Depolorizer, consuming one wire element.
     *
     * Unlike DepolorizePacked, which expects a compound element and converts it
     * into a packed Depolorizer.
     * DepolorizeInner returns the atomic element as an atomic Depolorizer.
     * It does not examine the data of the element (refer to "Raw and
     * Undecoded Elements" in the POLO Wire Specification).
     *
     * @returns {Depolorizer} The depolorized inner Depolorizer.
     * @throws {Error} If there are no elements left or if the element is not
     * a valid wire element.
     */
    depolorizeInner(): Depolorizer;
    /**
     * Decodes a map from an element. The element must be a pack. The pack
     * holds a key and a value for each entry. The keys must be in strictly
     * ascending order (rule C7). Thus the decoder rejects duplicate keys.
     *
     * A JavaScript Map stores the key -0 as +0. Then the map encodes to
     * different bytes. Thus the decoder rejects the float key -0.
     *
     * @param {ReadBuffer} data - The element.
     * @param {Schema} schema - The schema representing the map structure.
     * @returns {Map<unknown, unknown>} The depolorized map.
     * @throws {Error} If the schema or wire element is invalid.
     */
    private decodeMap;
    /**
     * Decodes a struct from an element. A pack must have exactly one
     * element for each field of the schema (rule C6). With the option
     * docStructs, the decoder also accepts a document.
     *
     * @param {ReadBuffer} data - The element.
     * @param {Schema} schema - The schema representing the object structure.
     * @returns {object} The depolorized object.
     * @throws {Error} If the wire type is incompatible or the schema is invalid.
     */
    private decodeStruct;
}
