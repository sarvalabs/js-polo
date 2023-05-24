"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Raw = void 0;
const wiretype_1 = require("./wiretype");
// Raw is a container for raw POLO encoded data
class Raw extends Uint8Array {
    // Is returns whether the raw POLO data is of a certain wire type
    is(kind) {
        if (this.length === 0) {
            return kind === wiretype_1.WireType.WIRE_NULL;
        }
        return this[0] == kind;
    }
}
exports.Raw = Raw;
