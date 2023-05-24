"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.documentDecode = exports.documentEncode = exports.Document = void 0;
const writebuffer_1 = require("./writebuffer");
const readbuffer_1 = require("./readbuffer");
const raw_1 = require("./raw");
const polorizer_1 = require("./polorizer");
const depolorizer_1 = require("./depolorizer");
const wiretype_1 = require("./wiretype");
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
    size() {
        return Object.keys(this.document).length;
    }
    bytes() {
        const polorizer = new polorizer_1.Polorizer();
        polorizer.polorizeDocument(this.document);
        return polorizer.bytes();
    }
    get(key) {
        return this.document[key];
    }
    set(key, val) {
        this.setRaw(key, new raw_1.Raw(val));
    }
    is(key, kind) {
        const data = this.get(key);
        if (!data || data.length === 0) {
            return kind === wiretype_1.WireType.WIRE_NULL;
        }
        return data[0] === kind;
    }
    setNull(key) {
        const wb = new writebuffer_1.WriteBuffer();
        wb.writeNull();
        this.set(key, wb.bytes());
    }
    setBool(key, data) {
        const wb = new writebuffer_1.WriteBuffer();
        wb.writeBool(data);
        this.set(key, wb.bytes());
    }
    setInteger(key, data) {
        const wb = new writebuffer_1.WriteBuffer();
        wb.writeInt(data);
        this.set(key, wb.bytes());
    }
    setFloat(key, data) {
        const wb = new writebuffer_1.WriteBuffer();
        wb.writeFloat(data);
        this.set(key, wb.bytes());
    }
    setString(key, data) {
        const wb = new writebuffer_1.WriteBuffer();
        wb.writeString(data);
        this.set(key, wb.bytes());
    }
    setRaw(key, data) {
        this.document[key] = data;
    }
    setBytes(key, data) {
        const wb = new writebuffer_1.WriteBuffer();
        wb.writeBytes(data);
        this.set(key, wb.bytes());
    }
    setArray(key, array, schema) {
        const polorizer = new polorizer_1.Polorizer();
        if (schema.fields && schema.fields.values && schema.fields.values.kind) {
            array.forEach(arr => polorizer.polorize(arr, schema.fields.values));
        }
        this.set(key, polorizer.bytes());
    }
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
    setStruct(key, struct, schema) {
        const polorizer = new polorizer_1.Polorizer();
        Object.entries(struct).forEach(([key, value]) => {
            polorizer.polorize(value, schema.fields[key]);
        });
        this.set(key, polorizer.bytes());
    }
    getNull(key) {
        if (this.document[key]) {
            const rb = new readbuffer_1.ReadBuffer(this.get(key));
            return rb.readNull();
        }
        return null;
    }
    getBool(key) {
        if (this.document[key]) {
            const rb = new readbuffer_1.ReadBuffer(this.get(key));
            return rb.readBool();
        }
        return false;
    }
    getInteger(key) {
        if (this.document[key]) {
            const rb = new readbuffer_1.ReadBuffer(this.get(key));
            return rb.readInteger();
        }
        return 0;
    }
    getFloat(key) {
        if (this.document[key]) {
            const rb = new readbuffer_1.ReadBuffer(this.get(key));
            return rb.readFloat();
        }
        return 0;
    }
    getString(key) {
        if (this.document[key]) {
            const rb = new readbuffer_1.ReadBuffer(this.get(key));
            return rb.readString();
        }
        return '';
    }
    getRaw(key) {
        if (this.document[key]) {
            return this.document[key];
        }
        return new raw_1.Raw();
    }
    getBytes(key) {
        if (this.document[key]) {
            const rb = new readbuffer_1.ReadBuffer(this.get(key));
            return rb.readBytes();
        }
        return new Uint8Array();
    }
    getArray(key, schema) {
        if (this.document[key]) {
            const depolorizer = new depolorizer_1.Depolorizer(this.get(key));
            return depolorizer.depolorize(schema);
        }
        return [];
    }
    getMap(key, schema) {
        if (this.document[key]) {
            const depolorizer = new depolorizer_1.Depolorizer(this.get(key));
            return depolorizer.depolorize(schema);
        }
        return new Map();
    }
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
