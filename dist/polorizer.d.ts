import { Schema } from '../types/schema';
import BN from 'bn.js';
import { Raw } from './raw';
/**
 * Polorizer is an encoding buffer that can sequentially polorize objects
 * into it. It can be collapsed into its bytes with Bytes() or Packed().
 *
 * @class
 */
export declare class Polorizer {
    private writeBuffer;
    constructor();
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
     * @param {(null|boolean|number|BN|string|Uint8Array|Array<unknown>|Map<unknown, unknown>|object)} value
     *        - The value to be encoded into the Polorizer.
     * @param {Schema} schema - The schema that describes the value and its encoding.
     * @throws {Error} If the kind of the schema is not one of the supported kinds.
     * @description Depending on the kind of the schema, the appropriate
     * encoding method is called to encode the value. The supported kinds are
     * null, bool, integer, float, string, raw, bytes, array, map, and struct.
     */
    polorize(value: null | boolean | number | BN | string | Uint8Array | Array<unknown> | Map<unknown, unknown> | object, schema: Schema): void;
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
     * @param {number | BN} value - The integer or BN value to encode.
     * @description Encodes the integer as the binary form of its absolute value
     * with the wire type being WIRE_POSINT or WIRE_NEGINT based on polarity,
     * with zero considered as positive.
     */
    polorizeInteger(value: number | BN): void;
    /**
     * Encodes a single-precision float value into the Polorizer as WIRE_FLOAT.
     *
     * @public
     * @param {number} value - The float value to encode.
     * @description Encodes the float as its IEEE754 binary form (big-endian)
     * with the wire type being WIRE_FLOAT.
     */
    polorizeFloat(value: number): void;
    /**
     * Encodes a string value into the Polorizer.
     *
     * @public
     * @param {string} value - The string value to encode.
     * @description Encodes the string as its UTF-8 encoded bytes with the
     * wire type being WIRE_WORD.
     */
    polorizeString(value: string): void;
    /**
     * Encodes a Raw value into the Polorizer.
     *
     * @public
     * @param {RAW} value - The raw value to encode.
     * @description Encodes the Raw directly with the wire type being WIRE_RAW.
     * A nil Raw is encoded as WIRE_NULL.
     */
    polorizeRaw(value: Raw): void;
    /**
     * Encodes a bytes value into the Polorizer.
     *
     * @public
     * @param {Uint8Array} value - The bytes value to encode.
     * @description Encodes the bytes as is with the wire type being WireWord.
     */
    polorizeBytes(value: Uint8Array): void;
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
     * @description It is encoded as key-value pack encoded data. Map keys
     * are sorted before being sequentially encoded.
     */
    private polorizeMap;
    /**
     * Encodes a object into the Polorizer.
     *
     * @public
     * @param {object} struct - The object to encode.
     * @param {Schema} schema - The schema that describes the fields and
     * its encoding.
     * @description It is encoded as field ordered pack encoded data.
     */
    private polorizeStruct;
    /**
     * Encodes a Document into the Polorizer.
     *
     * @public
     * @param {object} document - The document object to encode.
     * @description Encodes the Document keys and raw values as POLO
     * doc-encoded data with the wire type being WIRE_DOC.
     * If the Document is nil, it is encoded as a WIRE_NULL.
     */
    polorizeDocument(document: object): void;
}
