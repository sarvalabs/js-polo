import { Schema } from './schema.js';
import BN from 'bn.js';
import { Raw } from './raw.js';
import { EncodeOptions } from './options.js';
import { Document } from './document.js';
/**
 * The value of a document entry: the POLO wire of the value. null is a
 * value with no data. The encoder writes it as a Raw that holds a Null.
 */
export type DocumentValue = Raw | Uint8Array | null;
/**
 * The kinds that accept a Null without `optional`. For these kinds, "no
 * value" is a valid value, and it is not the same as an empty value.
 */
export declare const NULLABLE_KINDS: readonly string[];
/**
 * Returns true if a Null is a valid value for a schema.
 *
 * @param {Schema} schema - The schema.
 * @returns {boolean} True if the schema accepts a Null.
 */
export declare const acceptsNull: (schema: Schema) => boolean;
/**
 * Adds the name of a struct field to an error.
 *
 * @param {string} field - The name of the field.
 * @param {unknown} err - The error.
 * @returns {Error} An error with the name of the field.
 */
export declare const fieldError: (field: string, err: unknown) => Error;
/**
 * Polorizer is an encoding buffer that can sequentially polorize objects
 * into it. It can be collapsed into its bytes with Bytes() or Packed().
 *
 * @class
 */
export declare class Polorizer {
    private writeBuffer;
    private options;
    /**
     * Creates a Polorizer.
     *
     * @param {EncodeOptions} options - Optional. The encode options. The
     * polorizers for compound values use the same options.
     */
    constructor(options?: EncodeOptions);
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
    bytes(): Uint8Array;
    /**
     * Returns the contents of the Polorizer as bytes after packing it and
     * tagging with WIRE_PACK.
     *
     * @public
     * @returns {Uint8Array} The packed contents of the Polorizer as bytes.
     */
    packed(): Uint8Array;
    /**
     * Encodes a value into the Polorizer based on the given schema.
     *
     * `null` and `undefined` mean "no value". The encoder writes a Null for
     * them if the schema accepts a Null: an optional schema, or the kind
     * `null`, `array`, `map`, `bytes`, `raw` or `document`. For all other
     * schemas, the encoder throws an error.
     *
     * @param {unknown} value - The value to be encoded into the Polorizer.
     * @param {Schema} schema - The schema that describes the value and its encoding.
     * @throws {Error} If the kind of the schema is not one of the supported
     * kinds, or if the value does not agree with the schema.
     * @description Depending on the kind of the schema, the appropriate
     * encoding method is called to encode the value. The supported kinds are
     * null, bool, integer, float, string, raw, bytes, array, map, struct and
     * document.
     */
    polorize(value: any, schema: Schema): void;
    /**
     * Encodes a null value into the Polorizer.
     *
     * @public
     * @description Encodes a WIRE_NULL into the head, consuming a
     * position on the wire.
     */
    polorizeNull(): void;
    /**
     * Encodes a boolean value into the Polorizer.
     *
     * @param {boolean} value - The boolean value to encode.
     * @public
     * @description  Encodes the boolean as either WIRE_TRUE or WIRE_FALSE,
     * depending on its value.
     */
    polorizeBool(value: boolean): void;
    /**
     * Encodes a signed/unsigned integer or BN value into the Polorizer.
     *
     * @public
     * @param {number | bigint | BN | string} value - The integer to encode.
     * A number must be a safe integer. A string must hold a decimal integer.
     * @description Encodes the integer as the binary form of its absolute value
     * with the wire type being WIRE_POSINT or WIRE_NEGINT based on polarity,
     * with zero considered as positive. The integer has no size limit.
     */
    polorizeInteger(value: number | bigint | BN | string): void;
    /**
     * Encodes a float value into the Polorizer as WIRE_FLOAT.
     *
     * @public
     * @param {number} value - The float value to encode.
     * @description Encodes the float as its IEEE754 binary64 form
     * (big-endian) with the wire type being WIRE_FLOAT. All numbers are
     * valid floats, also integers, -0 and NaN.
     */
    polorizeFloat(value: number): void;
    /**
     * Encodes a string value into the Polorizer.
     *
     * @public
     * @param {string} value - The string value to encode.
     * @description Encodes the string as its UTF-8 encoded bytes with the
     * wire type being WIRE_WORD. The string must be well-formed: a lone
     * surrogate has no UTF-8 form.
     */
    polorizeString(value: string): void;
    /**
     * Encodes a Raw value into the Polorizer.
     *
     * @public
     * @param {Raw} value - The raw value to encode.
     * @description Encodes the Raw directly with the wire type being WIRE_RAW.
     * A null Raw is encoded as a Raw that holds a Null (05 00), as go-polo
     * does. Polorize with the kind `raw` encodes a null Raw as a Null (00).
     */
    polorizeRaw(value: Raw | Uint8Array | null): void;
    /**
     * Encodes a bytes value into the Polorizer.
     *
     * @public
     * @param {Uint8Array} value - The bytes value to encode.
     * @description Encodes the bytes as is with the wire type being
     * WireWord. A null value is encoded as a Null. A Null and empty bytes
     * are different values.
     */
    polorizeBytes(value: Uint8Array | null): void;
    /**
     * Encodes the contents of another Polorizer as pack-encoded data.
     *
     * @public
     * @param {Polorizer} pack - The Polorizer instance to encode.
     * @description The contents are packed into a WIRE_LOAD message and
     * tagged with the WIRE_PACK wire type. If the given Polorizer is nil,
     * a WIRE_NULL is encoded instead.
     */
    polorizePacked(pack: Polorizer): void;
    /**
     * Encodes another Polorizer directly into the Polorizer.
     *
     * @public
     * @param {Polorizer} inner - The Polorizer instance to encode.
     * @description Unlike PolorizePacked which will always write it as a
     * packed wire while polorizeInner will write an atomic as is.
     * If the given Polorizer is nil, a WireNull is encoded.
     */
    polorizeInner(inner: Polorizer): void;
    /**
     * Encodes a Array into the Polorizer.
     *
     * @public
     * @param {Array<unknown>} array - The array to encode.
     * @param {Schema} schema - The schema that describes the value and
     * its encoding.
     * @description It is encoded as element pack encoded data.
     */
    private polorizeArray;
    /**
     * Encodes a Map into the Polorizer.
     *
     * @public
     * @param {Map<unknown, unknown>} map - The map to encode.
     * @param {Schema} schema - The schema that describes the key, value and
     * its encoding.
     * @description It is encoded as key-value pack encoded data. The keys
     * are in the POLO key order of their kind (rule C7). The encoder rejects
     * a NaN key and two keys with the same value, for example 5 and 5n.
     */
    private polorizeMap;
    /**
     * Encodes a object into the Polorizer.
     *
     * @public
     * @param {object} struct - The object to encode.
     * @param {Schema} schema - The schema that describes the fields and
     * its encoding.
     * @description It is encoded as field ordered pack encoded data. The
     * pack has exactly one element for each field of the schema, in the
     * order of the schema. With the option docStructs, it is encoded as a
     * document with one key for each field of the schema.
     */
    private polorizeStruct;
    /**
     * Encodes a Document into the Polorizer.
     *
     * @public
     * @param {Document | Map | object} document - The document to encode:
     * a Document, a Map, or an object. Each value is the POLO wire of a
     * value (a Raw or a Uint8Array), or null.
     * @description Encodes the Document keys and raw values as POLO
     * doc-encoded data with the wire type being WIRE_DOC. The keys are in
     * the order of their UTF-8 bytes (rule C7). A null value is a Raw that
     * holds a Null (the data 00). If the Document is nil, it is encoded as a
     * WIRE_NULL.
     * @throws {Error} If a key is not a well-formed string, or if a value is
     * not a Raw, a Uint8Array or null. A plain value, for example 5n, must
     * first be encoded. Use documentEncode, or the option docStructs.
     */
    polorizeDocument(document: Document | Map<string, DocumentValue> | Record<string, DocumentValue> | null): void;
}
