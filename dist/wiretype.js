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
/**
 * Utility class for working with wire types.
 */
class Wire {
    /**
     * Checks if a given wire type is null.
     * A wire type is null if it is WireNull, has a value greater than 15, or is between 8 and 12 (reserved).
     * @param wt The wire type to check.
     * @returns True if the wire type is null, false otherwise.
     */
    static isNull(wt) {
        return wt > 15 || wt === WireType.WIRE_NULL || (wt >= 8 && wt <= 12);
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
