"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Wire = exports.WireType = void 0;
/**
 * Enum representing various wire types used for data encoding.
 */
var WireType;
(function (WireType) {
    // WIRE_NULL represents a null wire. Used for consuming field orders without data.
    WireType[WireType["WIRE_NULL"] = 0] = "WIRE_NULL";
    // WIRE_FALSE represents a Boolean False.
    WireType[WireType["WIRE_FALSE"] = 1] = "WIRE_FALSE";
    // WIRE_TRUE represents a Boolean True.
    WireType[WireType["WIRE_TRUE"] = 2] = "WIRE_TRUE";
    // WIRE_POSINT represents a Binary encoded positive Integer in BigEndian Order.
    WireType[WireType["WIRE_POSINT"] = 3] = "WIRE_POSINT";
    // WIRE_NEGINT represents a Binary encoded negative Integer in BigEndian Order.
    // The number is encoded as its absolute value and must be multiplied with -1 to get its actual value.
    WireType[WireType["WIRE_NEGINT"] = 4] = "WIRE_NEGINT";
    // WIRE_RAW represents a polo encoded bytes.
    WireType[WireType["WIRE_RAW"] = 5] = "WIRE_RAW";
    // WIRE_WORD represents UTF-8 encoded string/bytes.
    WireType[WireType["WIRE_WORD"] = 6] = "WIRE_WORD";
    // WIRE_FLOAT represents some floating point data encoded in the IEEE754 standard (floats).
    WireType[WireType["WIRE_FLOAT"] = 7] = "WIRE_FLOAT";
    // WireDoc represents some doc encoded data (string keyed maps, tagged structs, and Document objects).
    WireType[WireType["WIRE_DOC"] = 13] = "WIRE_DOC";
    // WIRE_PACK represents some pack encoded data (slices, arrays, maps, structs).
    WireType[WireType["WIRE_PACK"] = 14] = "WIRE_PACK";
    // WIRE_LOAD represents a load tag for compound wire type.
    WireType[WireType["WIRE_LOAD"] = 15] = "WIRE_LOAD";
})(WireType = exports.WireType || (exports.WireType = {}));
const WIRE_NAMES = {
    [WireType.WIRE_NULL]: 'Null',
    [WireType.WIRE_FALSE]: 'False',
    [WireType.WIRE_TRUE]: 'True',
    [WireType.WIRE_POSINT]: 'PosInt',
    [WireType.WIRE_NEGINT]: 'NegInt',
    [WireType.WIRE_RAW]: 'Raw',
    [WireType.WIRE_WORD]: 'Word',
    [WireType.WIRE_FLOAT]: 'Float',
    [WireType.WIRE_DOC]: 'Document',
    [WireType.WIRE_PACK]: 'Pack',
    [WireType.WIRE_LOAD]: 'Load',
};
/**
 * Utility class for working with wire types.
 */
class Wire {
    /**
     * Checks if a given wire type is null.
     * Only WIRE_NULL is null. A reserved wire type is not null: the decoder
     * rejects an element with a reserved wire type.
     * @param wt The wire type to check.
     * @returns True if the wire type is null, false otherwise.
     */
    static isNull(wt) {
        return wt === WireType.WIRE_NULL;
    }
    /**
     * Checks if a given wire type is reserved. The wire types 8 to 12 are
     * reserved. The decoder rejects an element with a reserved wire type.
     * @param wt The wire type to check.
     * @returns True if the wire type is reserved, false otherwise.
     */
    static isReserved(wt) {
        return wt >= 8 && wt <= 12;
    }
    /**
     * Returns the name of a wire type, as the POLO Wire Specification
     * gives it. For example, the name of WIRE_POSINT is "PosInt".
     * @param wt The wire type.
     * @returns The name of the wire type.
     */
    static nameOf(wt) {
        if (Wire.isReserved(wt)) {
            return `reserved (${wt})`;
        }
        return WIRE_NAMES[wt] ?? `unknown (${wt})`;
    }
    /**
     * Checks if a given wire type is a compound type.
     * A compound type contains a load inside it.
     * @param wt The wire type to check.
     * @returns True if the wire type is a compound type, false otherwise.
     */
    static isCompound(wt) {
        return wt === WireType.WIRE_PACK || wt === WireType.WIRE_DOC;
    }
}
exports.Wire = Wire;
