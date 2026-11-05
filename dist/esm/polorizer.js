import { WriteBuffer } from './writebuffer.js';
import { WireType } from './wiretype.js';
import { Raw } from './raw.js';
import { ReadBuffer } from './readbuffer.js';
import { checkKeySchema, compareKeys, sortKey } from './keyorder.js';
import { compareUTF8 } from './utf8.js';
import { Document } from './document.js';
/**
 * The kinds that accept a Null without `optional`. For these kinds, "no
 * value" is a valid value, and it is not the same as an empty value.
 */
export const NULLABLE_KINDS = ['null', 'array', 'map', 'bytes', 'raw', 'document'];
/**
 * Returns true if a Null is a valid value for a schema.
 *
 * @param {Schema} schema - The schema.
 * @returns {boolean} True if the schema accepts a Null.
 */
export const acceptsNull = (schema) => {
    return schema.optional === true || NULLABLE_KINDS.includes(schema.kind);
};
/**
 * Adds the name of a struct field to an error.
 *
 * @param {string} field - The name of the field.
 * @param {unknown} err - The error.
 * @returns {Error} An error with the name of the field.
 */
export const fieldError = (field, err) => {
    const message = err instanceof Error ? err.message : String(err);
    return new Error(`field "${field}": ${message}`);
};
/**
 * Polorizer is an encoding buffer that can sequentially polorize objects
 * into it. It can be collapsed into its bytes with Bytes() or Packed().
 *
 * @class
 */
export class Polorizer {
    writeBuffer;
    options;
    /**
     * Creates a Polorizer.
     *
     * @param {EncodeOptions} options - Optional. The encode options. The
     * polorizers for compound values use the same options.
     */
    constructor(options) {
        this.writeBuffer = new WriteBuffer();
        this.options = options ?? {};
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
    bytes() {
        switch (this.writeBuffer.counter) {
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
    packed() {
        const wb = new WriteBuffer();
        wb.write(WireType.WIRE_PACK, this.writeBuffer.load());
        return wb.bytes();
    }
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    polorize(value, schema) {
        if (value === null || value === undefined) {
            if (!acceptsNull(schema)) {
                throw new Error(`invalid value: a ${schema.kind} cannot be null; ` +
                    'set "optional: true" in the schema for a value that can be absent');
            }
            this.polorizeNull();
            return;
        }
        switch (schema.kind) {
            case 'null':
                this.polorizeNull();
                break;
            case 'bool':
                this.polorizeBool(value);
                break;
            case 'integer':
                this.polorizeInteger(value);
                break;
            case 'float':
                this.polorizeFloat(value);
                break;
            case 'string':
                this.polorizeString(value);
                break;
            case 'raw':
                this.writeBuffer.writeRaw(value);
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
            // Document Value (Document Encoded. Sorted Keys)
            case 'document':
                this.polorizeDocument(value);
                break;
            default:
                throw Error(schema.kind + ' is unsupported.');
        }
    }
    /**
     * Encodes a null value into the Polorizer.
     *
     * @public
     * @description Encodes a WIRE_NULL into the head, consuming a
     * position on the wire.
     */
    polorizeNull() {
        this.writeBuffer.writeNull();
    }
    /**
     * Encodes a boolean value into the Polorizer.
     *
     * @param {boolean} value - The boolean value to encode.
     * @public
     * @description  Encodes the boolean as either WIRE_TRUE or WIRE_FALSE,
     * depending on its value.
     */
    polorizeBool(value) {
        this.writeBuffer.writeBool(value);
    }
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
    polorizeInteger(value) {
        this.writeBuffer.writeInt(value);
    }
    /**
     * Encodes a float value into the Polorizer as WIRE_FLOAT.
     *
     * @public
     * @param {number} value - The float value to encode.
     * @description Encodes the float as its IEEE754 binary64 form
     * (big-endian) with the wire type being WIRE_FLOAT. All numbers are
     * valid floats, also integers, -0 and NaN.
     */
    polorizeFloat(value) {
        this.writeBuffer.writeFloat(value);
    }
    /**
     * Encodes a string value into the Polorizer.
     *
     * @public
     * @param {string} value - The string value to encode.
     * @description Encodes the string as its UTF-8 encoded bytes with the
     * wire type being WIRE_WORD. The string must be well-formed: a lone
     * surrogate has no UTF-8 form.
     */
    polorizeString(value) {
        this.writeBuffer.writeString(value);
    }
    /**
     * Encodes a Raw value into the Polorizer.
     *
     * @public
     * @param {Raw} value - The raw value to encode.
     * @description Encodes the Raw directly with the wire type being WIRE_RAW.
     * A null Raw is encoded as a Raw that holds a Null (05 00), as go-polo
     * does. Polorize with the kind `raw` encodes a null Raw as a Null (00).
     */
    polorizeRaw(value) {
        this.writeBuffer.writeRaw(value ?? new Raw([WireType.WIRE_NULL]));
    }
    /**
     * Encodes a bytes value into the Polorizer.
     *
     * @public
     * @param {Uint8Array} value - The bytes value to encode.
     * @description Encodes the bytes as is with the wire type being
     * WireWord. A null value is encoded as a Null. A Null and empty bytes
     * are different values.
     */
    polorizeBytes(value) {
        if (value === null || value === undefined) {
            this.polorizeNull();
            return;
        }
        this.writeBuffer.writeBytes(value);
    }
    /**
     * Encodes the contents of another Polorizer as pack-encoded data.
     *
     * @public
     * @param {Polorizer} pack - The Polorizer instance to encode.
     * @description The contents are packed into a WIRE_LOAD message and
     * tagged with the WIRE_PACK wire type. If the given Polorizer is nil,
     * a WIRE_NULL is encoded instead.
     */
    polorizePacked(pack) {
        if (!pack) {
            this.polorizeNull();
            return;
        }
        this.writeBuffer.write(WireType.WIRE_PACK, pack.writeBuffer.load());
    }
    /**
     * Encodes another Polorizer directly into the Polorizer.
     *
     * @public
     * @param {Polorizer} inner - The Polorizer instance to encode.
     * @description Unlike PolorizePacked which will always write it as a
     * packed wire while polorizeInner will write an atomic as is.
     * If the given Polorizer is nil, a WireNull is encoded.
     */
    polorizeInner(inner) {
        if (!inner) {
            this.polorizeNull();
            return;
        }
        const readBuffer = new ReadBuffer(inner.bytes());
        this.writeBuffer.write(readBuffer.wire, readBuffer.data);
    }
    /**
     * Encodes a Array into the Polorizer.
     *
     * @public
     * @param {Array<unknown>} array - The array to encode.
     * @param {Schema} schema - The schema that describes the value and
     * its encoding.
     * @description It is encoded as element pack encoded data.
     */
    polorizeArray(array, schema) {
        const values = schema.fields?.values;
        if (!values?.kind) {
            throw new Error('invalid schema: an array schema must have fields.values');
        }
        if (!Array.isArray(array)) {
            throw new Error(`invalid array: expected an array, received ${typeof array}`);
        }
        const polorizer = new Polorizer(this.options);
        array.forEach(item => polorizer.polorize(item, values));
        this.polorizePacked(polorizer);
    }
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
    polorizeMap(map, schema) {
        const keys = schema.fields?.keys;
        const values = schema.fields?.values;
        if (!keys?.kind || !values?.kind) {
            throw new Error('invalid schema: a map schema must have fields.keys and fields.values');
        }
        checkKeySchema(keys);
        if (!(map instanceof Map)) {
            throw new Error(`invalid map: expected a Map, received ${typeof map}`);
        }
        const entries = [...map.entries()].map(([key, value]) => ({
            sort: sortKey(keys.kind, key), key, value
        }));
        entries.sort((a, b) => compareKeys(a.sort, b.sort));
        const polorizer = new Polorizer(this.options);
        entries.forEach((entry, index) => {
            if (index > 0 && compareKeys(entries[index - 1].sort, entry.sort) === 0) {
                throw new Error(`invalid map: two keys have the same value (${String(entry.key)})`);
            }
            polorizer.polorize(entry.key, { ...keys, optional: false });
            polorizer.polorize(entry.value, values);
        });
        this.polorizePacked(polorizer);
    }
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
    polorizeStruct(struct, schema) {
        if (typeof struct !== 'object') {
            throw new Error(`invalid struct: expected an object, received ${typeof struct}`);
        }
        const fields = Object.entries(schema.fields ?? {});
        if (this.options.docStructs) {
            const document = new Map();
            fields.forEach(([key, field]) => {
                const polorizer = new Polorizer(this.options);
                try {
                    polorizer.polorize(struct[key], field);
                }
                catch (err) {
                    throw fieldError(key, err);
                }
                document.set(key, new Raw(polorizer.bytes()));
            });
            this.polorizeDocument(document);
            return;
        }
        const polorizer = new Polorizer(this.options);
        fields.forEach(([key, field]) => {
            try {
                polorizer.polorize(struct[key], field);
            }
            catch (err) {
                throw fieldError(key, err);
            }
        });
        this.polorizePacked(polorizer);
    }
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
    polorizeDocument(document) {
        if (document === null || document === undefined) {
            this.polorizeNull();
            return;
        }
        let entries;
        if (document instanceof Document) {
            entries = Object.entries(document.getData());
        }
        else if (document instanceof Map) {
            entries = [...document.entries()];
        }
        else if (typeof document === 'object') {
            entries = Object.entries(document);
        }
        else {
            throw new Error(`invalid document: expected a Document, a Map or an object, received ${typeof document}`);
        }
        entries.sort(([a], [b]) => compareUTF8(a, b));
        const polorizer = new Polorizer(this.options);
        entries.forEach(([key, value]) => {
            if (typeof key !== 'string') {
                throw new Error(`invalid document key: expected a string, received ${typeof key}`);
            }
            if (value !== null && value !== undefined && !(value instanceof Uint8Array)) {
                throw new Error(`invalid document value for key "${key}": expected the POLO wire of the value ` +
                    `(a Raw or a Uint8Array), received ${typeof value}; encode the value first`);
            }
            polorizer.polorizeString(key);
            polorizer.polorizeRaw(value ?? null);
        });
        this.writeBuffer.write(WireType.WIRE_DOC, polorizer.writeBuffer.load());
    }
}
