"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.documentDecode = exports.documentEncode = exports.Document = void 0;
const writebuffer_1 = require("./writebuffer");
const readbuffer_1 = require("./readbuffer");
const raw_1 = require("./raw");
const polorizer_1 = require("./polorizer");
const depolorizer_1 = require("./depolorizer");
const wiretype_1 = require("./wiretype");
/**
 * Document is a representation for a string indexed collection of encoded object data.
 * It represents an intermediary access format with objects settable/gettable with string keys.
 *
 * @class
 */
class Document {
    document;
    constructor(data, schema) {
        if (data && schema) {
            const depolorizer = new depolorizer_1.Depolorizer(data);
            const obj = depolorizer.depolorize(schema);
            this.document = obj;
            return;
        }
        this.document = {};
    }
    /**
     * Returns the number of key-value pairs in the Document.
     * @returns The number of key-value pairs in the Document.
     */
    size() {
        return Object.keys(this.document).length;
    }
    /**
     * Returns the encoded data of the Document as a Uint8Array.
     * @returns The encoded data of the Document.
     */
    bytes() {
        const polorizer = new polorizer_1.Polorizer();
        polorizer.polorizeDocument(this.document);
        return polorizer.bytes();
    }
    /**
     * Retrieves the encoded data associated with the specified key from the Document.
     * @param key - The key of the data to retrieve.
     * @returns The encoded data associated with the specified key, or undefined
     * if the key does not exist.
     */
    get(key) {
        return this.document[key];
    }
    /**
     * Sets the encoded data associated with the specified key in the Document.
     * @param key - The key to set.
     * @param val - The encoded data to set.
     */
    set(key, val) {
        this.setRaw(key, new raw_1.Raw(val));
    }
    /**
     * Checks if the encoded data associated with the specified key in the
     * Document has the specified WireType.
     * @param key - The key to check.
     * @param kind - The WireType to compare against.
     * @returns True if the encoded data has the specified WireType, false otherwise.
     */
    is(key, kind) {
        const data = this.get(key);
        if (!data || data.length === 0) {
            return kind === wiretype_1.WireType.WIRE_NULL;
        }
        return data[0] === kind;
    }
    /**
     * Sets the encoded data associated with the specified key to
     * represent a null value.
     *
     * @param key - The key to set.
     */
    setNull(key) {
        const wb = new writebuffer_1.WriteBuffer();
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
    setBool(key, data) {
        const wb = new writebuffer_1.WriteBuffer();
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
    setInteger(key, data) {
        const wb = new writebuffer_1.WriteBuffer();
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
    setFloat(key, data) {
        const wb = new writebuffer_1.WriteBuffer();
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
    setString(key, data) {
        const wb = new writebuffer_1.WriteBuffer();
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
    setRaw(key, data) {
        this.document[key] = data;
    }
    /**
     * Sets the encoded data associated with the specified key to represent
     * a byte array value.
     *
     * @param key - The key to set.
     * @param data - The byte array value to set.
     */
    setBytes(key, data) {
        const wb = new writebuffer_1.WriteBuffer();
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
    setArray(key, array, schema) {
        const polorizer = new polorizer_1.Polorizer();
        if (schema.fields && schema.fields.values && schema.fields.values.kind) {
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
    setMap(key, map, schema) {
        const polorizer = new polorizer_1.Polorizer();
        if (schema.fields && schema.fields.keys && schema.fields.values &&
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
    setStruct(key, struct, schema) {
        const polorizer = new polorizer_1.Polorizer();
        Object.entries(struct).forEach(([key, value]) => {
            polorizer.polorize(value, schema.fields[key]);
        });
        this.set(key, polorizer.bytes());
    }
    /**
     * Retrieves a null value associated with the specified key from the Document.
     *
     * @param key - The key of the null value to retrieve.
     * @returns The null value associated with the specified key, or null
     * if the key does not exist.
     */
    getNull(key) {
        if (this.document[key]) {
            const rb = new readbuffer_1.ReadBuffer(this.get(key));
            return rb.readNull();
        }
        return null;
    }
    /**
     * Retrieves a boolean value associated with the specified key from the Document.
     *
     * @param key - The key of the boolean value to retrieve.
     * @returns The boolean value associated with the specified key, or false
     * if the key does not exist.
     */
    getBool(key) {
        if (this.document[key]) {
            const rb = new readbuffer_1.ReadBuffer(this.get(key));
            return rb.readBool();
        }
        return false;
    }
    /**
     * Retrieves an integer value associated with the specified key from the Document.
     *
     * @param key - The key of the integer value to retrieve.
     * @returns The integer value associated with the specified key, or 0 if
     * the key does not exist.
     */
    getInteger(key) {
        if (this.document[key]) {
            const rb = new readbuffer_1.ReadBuffer(this.get(key));
            return rb.readInteger();
        }
        return 0;
    }
    /**
     * Retrieves a float value associated with the specified key from the Document.
     *
     * @param key - The key of the float value to retrieve.
     * @returns The float value associated with the specified key, or 0 if
     * the key does not exist.
     */
    getFloat(key) {
        if (this.document[key]) {
            const rb = new readbuffer_1.ReadBuffer(this.get(key));
            return rb.readFloat();
        }
        return 0;
    }
    /**
     * Retrieves a string value associated with the specified key from the Document.
     *
     * @param key - The key of the string value to retrieve.
     * @returns The string value associated with the specified key, or an empty
     * string if the key does not exist.
     */
    getString(key) {
        if (this.document[key]) {
            const rb = new readbuffer_1.ReadBuffer(this.get(key));
            return rb.readString();
        }
        return '';
    }
    /**
     * Retrieves a raw value associated with the specified key from the Document.
     *
     * @param key - The key of the raw value to retrieve.
     * @returns The raw value associated with the specified key, or null if
     * the key does not exist.
     */
    getRaw(key) {
        if (this.document[key]) {
            return this.document[key];
        }
        return new raw_1.Raw();
    }
    /**
     * Retrieves a byte array value associated with the specified key
     * from the Document.
     *
     * @param key - The key of the byte array value to retrieve.
     * @returns The byte array value associated with the specified key, or an
     * empty Uint8Array if the key does not exist.
     */
    getBytes(key) {
        if (this.document[key]) {
            const rb = new readbuffer_1.ReadBuffer(this.get(key));
            return rb.readBytes();
        }
        return new Uint8Array();
    }
    /**
     * Retrieves an array value associated with the specified key from the Document.
     *
     * @param key - The key of the array value to retrieve.
     * @param schema - The schema used to decode the array elements.
     * @returns The array value associated with the specified key, or an
     * empty array if the key does not exist.
     */
    getArray(key, schema) {
        if (this.document[key]) {
            const depolorizer = new depolorizer_1.Depolorizer(this.get(key));
            return depolorizer.depolorize(schema);
        }
        return [];
    }
    /**
     * Retrieves a map value associated with the specified key from the Document.
     *
     * @param key - The key of the map value to retrieve.
     * @param schema - The schema used to decode the map keys and values.
     * @returns The map value associated with the specified key, or an empty
     * map if the key does not exist.
     */
    getMap(key, schema) {
        if (this.document[key]) {
            const depolorizer = new depolorizer_1.Depolorizer(this.get(key));
            return depolorizer.depolorize(schema);
        }
        return new Map();
    }
    /**
     * Retrieves a struct value associated with the specified key from the Document.
     *
     * @param key - The key of the struct value to retrieve.
     * @param schema - The schema used to decode the struct fields.
     * @returns The struct value associated with the specified key, or an empty
     * object if the key does not exist.
     */
    getStruct(key, schema) {
        const obj = {};
        if (this.document[key]) {
            const depolorizer = new depolorizer_1.Depolorizer(this.get(key));
            Object.keys(schema.fields).forEach((key) => {
                obj[key] = depolorizer.depolorize(schema.fields[key]);
            });
        }
        return obj;
    }
}
exports.Document = Document;
/**
 * Encodes an object or map into a Document using the provided schema.
 *
 * @param obj - The object or map to encode.
 * @param schema - The schema used for encoding.
 * @returns The encoded Document.
 * @throws {Error} If the provided schema kind is unsupported.
 */
const documentEncode = (obj, schema) => {
    const doc = new Document();
    switch (schema.kind) {
        case 'map': {
            const data = obj;
            [...data.keys()].forEach(key => {
                const polorizer = new polorizer_1.Polorizer();
                polorizer.polorize(data.get(key), schema.fields.values);
                doc.setRaw(key, new raw_1.Raw(polorizer.bytes()));
            });
            break;
        }
        case 'struct':
            Object.entries(obj).forEach(([key, value]) => {
                const polorizer = new polorizer_1.Polorizer();
                polorizer.polorize(value, schema.fields[key]);
                doc.setRaw(key, new raw_1.Raw(polorizer.bytes()));
            });
            break;
        default:
            throw new Error('unsupported kind');
    }
    return doc;
};
exports.documentEncode = documentEncode;
/**
 * Decodes a Document from the provided ReadBuffer.
 *
 * @param data - The ReadBuffer containing the encoded Document data.
 * @returns The decoded Document.
 * @throws {Error} If the provided wire type is unsupported.
 */
const documentDecode = (data) => {
    const doc = new Document();
    switch (data.wire) {
        case wiretype_1.WireType.WIRE_DOC: {
            // Convert the element into a loadreader
            const load = data.load();
            const pack = new depolorizer_1.Depolorizer(null, load);
            while (!pack.isDone()) {
                const docKey = pack.depolorizeString();
                const val = pack.read();
                doc.setRaw(docKey, new raw_1.Raw(val.data));
            }
            return doc;
        }
        default:
            throw new Error('unsupported kind');
    }
};
exports.documentDecode = documentDecode;
