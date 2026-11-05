"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Depolorizer = exports.zeroValue = void 0;
const readbuffer_js_1 = require("./readbuffer.js");
const wiretype_js_1 = require("./wiretype.js");
const document_js_1 = require("./document.js");
const polorizer_js_1 = require("./polorizer.js");
const keyorder_js_1 = require("./keyorder.js");
const options_js_1 = require("./options.js");
/**
 * Returns the zero value of a schema. A struct from a document gets the
 * zero value for a field that has no key in the document.
 *
 * @param {Schema} schema - The schema.
 * @returns {unknown} The zero value: `null` for an optional schema,
 * false, 0, 0 or "" for a bool, integer, float or string, an object of zero
 * values for a struct, and `null` for all other kinds.
 */
const zeroValue = (schema) => {
    if (schema.optional) {
        return null;
    }
    switch (schema.kind) {
        case 'bool':
            return false;
        case 'integer':
        case 'float':
            return 0;
        case 'string':
            return '';
        case 'struct': {
            const obj = {};
            Object.entries(schema.fields ?? {}).forEach(([name, field]) => {
                obj[name] = (0, exports.zeroValue)(field);
            });
            return obj;
        }
        default:
            return null;
    }
};
exports.zeroValue = zeroValue;
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
class Depolorizer {
    done;
    packed;
    data;
    load;
    config;
    depth;
    /**
     * Creates a Depolorizer for a wire.
     *
     * @param {Uint8Array} data - The wire. It must have at least one byte.
     * @param {DecodeOptions} options - Optional. The decode options. The
     * depolorizers for compound values use the same options.
     * @throws {Error} If the wire is empty or its tag is not valid.
     */
    constructor(data, options) {
        this.data = new readbuffer_js_1.ReadBuffer(data);
        this.packed = false;
        this.done = false;
        this.config = (0, options_js_1.decodeConfig)(options);
        this.depth = 0;
    }
    /**
     * Creates a Depolorizer in packed mode for the elements of a load.
     *
     * @private
     * @param {LoadReader} load - The elements.
     * @param {DecodeConfig} config - The decode options.
     * @param {number} depth - The nesting depth of the load.
     * @returns {Depolorizer} The Depolorizer.
     */
    static packed(load, config, depth) {
        const depolorizer = Object.create(Depolorizer.prototype);
        depolorizer.load = load;
        depolorizer.packed = true;
        depolorizer.done = false;
        depolorizer.config = config;
        depolorizer.depth = depth;
        return depolorizer;
    }
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
    static nested(data, config, depth) {
        const depolorizer = new Depolorizer(data, config);
        depolorizer.depth = depth;
        return depolorizer;
    }
    /**
     * Checks if all elements in the Depolorizer have been read.
     *
     * @public
     * @returns {boolean} True if all elements have been read, false otherwise.
     */
    isDone() {
        // Check if loadreader is done if in packed mode
        if (this.packed) {
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
    read() {
        // Check if there is another element to read
        if (this.isDone()) {
            throw new Error('insufficient data in wire for decode');
        }
        // Read from the loadreader if in packed mode
        if (this.packed) {
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
    newLoadDepolorizer(data) {
        // Each compound element adds one level of nesting
        (0, options_js_1.checkDepth)(this.config, this.depth + 1);
        // Convert the element into a loadreader
        const load = data.load();
        // Create a new Depolorizer in packed mode
        return Depolorizer.packed(load, this.config, this.depth + 1);
    }
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
    depolorize(schema) {
        return this.decode(this.read(), schema);
    }
    /**
     * Decodes one element into the type of a schema.
     *
     * @private
     * @param {ReadBuffer} data - The element.
     * @param {Schema} schema - The schema of the target type.
     * @returns {unknown} The decoded value.
     */
    decode(data, schema) {
        // Read a Null before the element type (refer to "Null Values").
        if (data.wire === wiretype_js_1.WireType.WIRE_NULL) {
            data.readNull();
            if (!(0, polorizer_js_1.acceptsNull)(schema)) {
                throw new Error(`incompatible wire: a ${schema.kind} does not accept a Null; ` +
                    'set "optional: true" in the schema for a value that can be absent');
            }
            return null;
        }
        switch (schema.kind) {
            case 'null':
                return data.readNull();
            case 'bool':
                return data.readBool();
            case 'integer':
                return data.readInteger();
            case 'float':
                return data.readFloat();
            case 'string':
                return data.readString();
            case 'raw':
                return data.readRaw();
            case 'bytes':
                return data.readBytes();
            case 'array':
                return this.decodeArray(data, schema);
            case 'map':
                return this.decodeMap(data, schema);
            case 'struct':
                return this.decodeStruct(data, schema);
            case 'document':
                return (0, document_js_1.documentDecode)(data, this.config, this.depth + 1);
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
    depolorizeNull() {
        return this.read().readNull();
    }
    /**
     * Decodes a boolean value from the Depolorizer, consuming one wire element.
     * Returns the decoded boolean value.
     *
     * @public
     * @returns {boolean} The decoded boolean value.
     * @throws {Error} If there are no elements left or if the element is not
     * of type WireTrue or WireFalse.
     */
    depolorizeBool() {
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
    depolorizeInteger() {
        return this.read().readInteger();
    }
    /**
     * Decodes a float value from the Depolorizer, consuming one wire element.
     * Returns the decoded float value as a number.
     *
     * @public
     * @returns {number} The decoded float value.
     * @throws {Error} If there are no elements left or if the element is not
     * of type WireFloat.
     */
    depolorizeFloat() {
        return this.read().readFloat();
    }
    /**
     * Decodes a string value from the Depolorizer, consuming one wire element.
     * Returns the decoded string value.
     *
     * @public
     * @returns {string} The decoded string value.
     * @throws {Error} If there are no elements left or if the element is not
     * of type WireWord.
     */
    depolorizeString() {
        return this.read().readString();
    }
    /**
     * Decodes a `Raw` value from the Depolorizer, consuming one wire element.
     * Returns the decoded `Raw` value, or `null` for a Null.
     *
     * @public
     * @returns {Raw | null} The decoded `Raw` value.
     * @throws {Error} If there are no elements left or if the element is not
     * of type WireRaw or WireNull.
     */
    depolorizeRaw() {
        return this.decode(this.read(), { kind: 'raw' });
    }
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
    depolorizeBytes() {
        return this.decode(this.read(), { kind: 'bytes' });
    }
    /**
     * Depolorizes an array value from the Depolorizer.
     *
     * @param {ReadBuffer} data - The element.
     * @param {Schema} schema - The schema definition for the array.
     * @returns {Array<unknown>} The depolorized array.
     * @throws {Error} If the the schema is invalid.
     */
    decodeArray(data, schema) {
        const values = schema.fields?.values;
        if (!values?.kind) {
            throw new Error('invalid schema: an array schema must have fields.values');
        }
        if (data.wire !== wiretype_js_1.WireType.WIRE_PACK) {
            throw (0, readbuffer_js_1.incompatibleWire)(data.wire, 'array');
        }
        // Get the next element as a pack
        // depolorizer with the slice elements
        const pack = this.newLoadDepolorizer(data);
        const arr = [];
        // Iterate until loadreader is done
        while (!pack.isDone()) {
            arr.push(pack.depolorize(values));
        }
        return arr;
    }
    /**
     * Depolorizes a Document from the Depolorizer.
     *
     * @throws {Error} If there are no elements left or if the element is not WireDoc.
     * @returns {Document | null} The depolorized Document, or `null` for a Null.
     */
    depolorizeDocument() {
        return this.decode(this.read(), { kind: 'document' });
    }
    /**
     * DepolorizePacked Decodes another Depolorizer from the Depolorizer,
     * consuming one wire element.
     *
     * @returns {Depolorizer} The depolorized packed Depolorizer.
     * @throws {Error} If there are no elements left, if the element is not
     * WirePack or WireDoc, or if it is a WireNull.
     */
    depolorizePacked() {
        // Read the next element
        const data = this.read();
        switch (data.wire) {
            case wiretype_js_1.WireType.WIRE_PACK:
            case wiretype_js_1.WireType.WIRE_DOC:
                return this.newLoadDepolorizer(data);
            case wiretype_js_1.WireType.WIRE_NULL:
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
     * It does not examine the data of the element (refer to "Raw and
     * Undecoded Elements" in the POLO Wire Specification).
     *
     * @returns {Depolorizer} The depolorized inner Depolorizer.
     * @throws {Error} If there are no elements left or if the element is not
     * a valid wire element.
     */
    depolorizeInner() {
        // Read the next element
        const data = this.read();
        // The decoder does not examine the data of the element, but a Null,
        // a False and a True must have no data (rule C4).
        if (data.wire === wiretype_js_1.WireType.WIRE_NULL || data.wire === wiretype_js_1.WireType.WIRE_FALSE ||
            data.wire === wiretype_js_1.WireType.WIRE_TRUE) {
            if (data.data.length > 0) {
                throw new Error(`malformed wire: a ${wiretype_js_1.Wire.nameOf(data.wire)} element has data`);
            }
        }
        return Depolorizer.nested(data.bytes(), this.config, this.depth);
    }
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
    decodeMap(data, schema) {
        const keys = schema.fields?.keys;
        const values = schema.fields?.values;
        if (!keys?.kind || !values?.kind) {
            throw new Error('invalid schema: a map schema must have fields.keys and fields.values');
        }
        (0, keyorder_js_1.checkKeySchema)(keys);
        if (data.wire !== wiretype_js_1.WireType.WIRE_PACK) {
            throw (0, readbuffer_js_1.incompatibleWire)(data.wire, 'map');
        }
        const pack = this.newLoadDepolorizer(data);
        if (pack.load.remaining() % 2 !== 0) {
            throw new Error('malformed map: a key has no value');
        }
        const map = new Map();
        let previous;
        while (!pack.isDone()) {
            const element = pack.read();
            if (element.wire === wiretype_js_1.WireType.WIRE_NULL) {
                throw new Error('incompatible wire: a map key cannot be a Null');
            }
            const key = pack.decode(element, keys);
            if (keys.kind === 'float' && Object.is(key, -0)) {
                throw new Error('unsupported map key: a JavaScript Map cannot hold the float key -0');
            }
            const sort = (0, keyorder_js_1.sortKey)(keys.kind, key);
            if (previous !== undefined && (0, keyorder_js_1.compareKeys)(previous, sort) >= 0) {
                throw new Error('malformed map: the keys are not in strictly ascending order');
            }
            previous = sort;
            map.set(key, pack.depolorize(values));
        }
        return map;
    }
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
    decodeStruct(data, schema) {
        const fields = Object.entries(schema.fields ?? {});
        switch (data.wire) {
            case wiretype_js_1.WireType.WIRE_PACK: {
                const pack = this.newLoadDepolorizer(data);
                const count = pack.load.remaining();
                if (count !== fields.length) {
                    throw new Error(`incompatible wire: the struct has ${fields.length} fields, ` +
                        `but the pack has ${count} elements`);
                }
                const obj = {};
                for (const [name, field] of fields) {
                    try {
                        obj[name] = pack.depolorize(field);
                    }
                    catch (err) {
                        throw (0, polorizer_js_1.fieldError)(name, err);
                    }
                }
                return obj;
            }
            case wiretype_js_1.WireType.WIRE_DOC: {
                // A document is a struct only with the agreement docStructs
                if (!this.config.docStructs) {
                    throw new Error('incompatible wire: a struct does not accept a Document element; ' +
                        'set the option docStructs to decode a struct from a document');
                }
                const doc = (0, document_js_1.documentDecode)(data, this.config, this.depth + 1);
                const obj = {};
                // The decoder ignores unknown keys. A field with no key gets its zero value.
                for (const [name, field] of fields) {
                    const raw = doc.getRaw(name);
                    try {
                        obj[name] = raw === null
                            ? (0, exports.zeroValue)(field)
                            : Depolorizer.nested(raw, this.config, this.depth + 1).depolorize(field);
                    }
                    catch (err) {
                        throw (0, polorizer_js_1.fieldError)(name, err);
                    }
                }
                return obj;
            }
            default:
                throw (0, readbuffer_js_1.incompatibleWire)(data.wire, 'struct');
        }
    }
}
exports.Depolorizer = Depolorizer;
