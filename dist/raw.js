"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Raw = void 0;
class Raw {
    bytes;
    constructor(bytes) {
        this.bytes = bytes;
    }
    is(kind) {
        return this.bytes[0] == kind;
    }
}
exports.Raw = Raw;
