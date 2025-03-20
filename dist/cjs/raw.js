"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Raw = void 0;
const wiretype_1 = require("./wiretype");
/**
 * Represents the raw POLO encoded data. Extends Uint8Array to provide
 * additional functionality.
 *
 * @class
 */
class Raw extends Uint8Array {
    /**
     * Checks whether the raw POLO data is of a certain wire type.
     *
     * @param kind - The wire type to check.
     * @returns A boolean indicating whether the raw data matches the
     * specified wire type.
     */
    is(kind) {
        if (this.length === 0) {
            return kind === wiretype_1.WireType.WIRE_NULL;
        }
        return this[0] == kind;
    }
}
exports.Raw = Raw;
