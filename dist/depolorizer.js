"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Depolorizer = void 0;
const readbuffer_1 = require("./readbuffer");
const wiretype_1 = require("./wiretype");
const document_1 = require("./document");
class Depolorizer {
    done;
    packed;
    data;
    load;
    constructor(data, load) {
        if (!load) {
            this.data = new readbuffer_1.ReadBuffer(data);
            this.packed = false;
        }
        else {
            this.load = load;
            this.packed = true;
        }
        this.done = false;
    }
    isDone() {
        // Check if loadreader is done if in packed mode
        if (this.packed) {
            return this.load.done();
        }
        // Return flag for non-pack data
        return this.done;
    }
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
    newLoadDepolorizer(data) {
        // Convert the element into a loadreader
        const load = data.load();
        // Create a new Depolorizer in packed mode
        return new Depolorizer(null, load);
    }
    depolorize(schema) {
        switch (schema.kind) {
            case 'null':
                return this.depolorizeNull();
            case 'bool':
                return this.depolorizeBool();
            case 'integer':
                return this.depolorizeInteger();
            case 'float':
                return this.depolorizeFloat();
            case 'string':
                return this.depolorizeString();
            case 'raw':
                return this.depolorizeRaw();
            case 'bytes':
                return this.depolorizeBytes();
            case 'array':
                return this.depolorizeArray(schema);
            case 'map':
                return this.depolorizeMap(schema);
            case 'struct':
                return this.depolorizeStruct(schema);
            default:
                throw Error(schema.kind + ' is unsupported.');
        }
    }
    depolorizeNull() {
        return this.read().readNull();
    }
    depolorizeBool() {
        return this.read().readBool();
    }
    depolorizeInteger() {
        return this.read().readInteger();
    }
    depolorizeFloat() {
        return this.read().readFloat();
    }
    depolorizeString() {
        return this.read().readString();
    }
    depolorizeRaw() {
        return this.read().readRaw();
    }
    depolorizeBytes() {
        return this.read().readBytes();
    }
    depolorizeArray(schema) {
        // Peek the wire type of the next element
        const data = this.read();
        if (schema.fields && schema.fields.values && schema.fields.values.kind) {
            const arr = [];
            // Get the next element as a pack
            // depolorizer with the slice elements
            const pack = this.newLoadDepolorizer(data);
            // Iterate until loadreader is done
            while (!pack.isDone()) {
                // Depolorize the element into the element type
                const element = pack.depolorize(schema.fields.values);
                if (element) {
                    // const ele = pack.unpack(schema.fields.values, element);
                    arr.push(element);
                }
            }
            return arr;
        }
        throw new Error('Invalid kind');
    }
    depolorizeDocument() {
        // Read the next element
        const data = this.read();
        return (0, document_1.documentDecode)(data);
    }
    depolorizePacked() {
        // Read the next element
        const data = this.read();
        switch (data.wire) {
            case wiretype_1.WireType.WIRE_PACK:
            case wiretype_1.WireType.WIRE_DOC:
                return this.newLoadDepolorizer(data);
            case wiretype_1.WireType.WIRE_NULL:
                throw new Error('null pack element');
            default:
                throw new Error('incompatible wire type');
        }
    }
    depolorizeInner() {
        // Read the next element
        const data = this.read();
        return new Depolorizer(data.bytes());
    }
    depolorizeMap(schema) {
        // Peek the wire type of the next element
        const data = this.read();
        if (schema.fields && schema.fields.keys && schema.fields.values &&
            schema.fields.keys.kind && schema.fields.values.kind) {
            // Get the next element as a pack
            // depolorizer with the slice elements
            const pack = this.newLoadDepolorizer(data);
            switch (data.wire) {
                case wiretype_1.WireType.WIRE_PACK: {
                    const map = new Map();
                    // Iterate until loadreader is done
                    while (!pack.isDone()) {
                        // Get the next element from the load (key)
                        const key = pack.depolorize(schema.fields.keys);
                        const value = pack.depolorize(schema.fields.values);
                        map.set(key, value);
                    }
                    return map;
                }
                default:
                    throw new Error('Incompatible wire type');
            }
        }
        throw new Error('Invalid kind');
    }
    depolorizeStruct(schema) {
        // Peek the wire type of the next element
        const data = this.read();
        // Get the next element as a pack
        // depolorizer with the slice elements
        const pack = this.newLoadDepolorizer(data);
        switch (data.wire) {
            case wiretype_1.WireType.WIRE_PACK: {
                const obj = {};
                const entries = Object.entries(schema.fields);
                let index = 0;
                // Iterate until loadreader is done
                while (!pack.isDone()) {
                    // Get the next element from the load (key)
                    const value = pack.depolorize(entries[index][1]);
                    obj[entries[index][0]] = value;
                    index++;
                }
                return obj;
            }
            case wiretype_1.WireType.WIRE_DOC: {
                const doc = (0, document_1.documentDecode)(data);
                const obj = {};
                Object.entries(schema.fields).forEach(([key, value]) => {
                    const data = doc.getRaw(key);
                    const depolorizer = new Depolorizer(new Uint8Array(data.bytes));
                    obj[key] = depolorizer.depolorize(value);
                });
                return obj;
            }
            default:
                throw new Error('Incompatible wire type');
        }
    }
}
exports.Depolorizer = Depolorizer;
