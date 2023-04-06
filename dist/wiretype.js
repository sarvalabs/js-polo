export var WireType;
(function (WireType) {
    // WIRENULL represents a null wire. Used for consuming field orders without data.
    WireType[WireType["WIRE_NULL"] = 0] = "WIRE_NULL";
    // WIREFALSE represents a Boolean False
    WireType[WireType["WIRE_FALSE"] = 1] = "WIRE_FALSE";
    // WIRETRUE represents a Boolean True
    WireType[WireType["WIRE_TRUE"] = 2] = "WIRE_TRUE";
    // WIREPOSINT represents a Binary encoded +ve Integer in BigEndian Order.
    WireType[WireType["WIRE_POSINT"] = 3] = "WIRE_POSINT";
    // WIRENEGINT represents a Binary encoded -ve Integer in BigEndian Order.
    // The number is encoded as its absolute value and must be multiplied with -1 to get its actual value.
    WireType[WireType["WIRE_NEGINT"] = 4] = "WIRE_NEGINT";
    // WIRERAW represents a polo encoded bytes
    WireType[WireType["WIRE_RAW"] = 5] = "WIRE_RAW";
    // WIREWORD represents UTF-8 encoded string/bytes
    WireType[WireType["WIRE_WORD"] = 6] = "WIRE_WORD";
    // WIREFLOAT represents some floating point data encoded in the IEEE754 standard. (floats)
    WireType[WireType["WIRE_FLOAT"] = 7] = "WIRE_FLOAT";
    // WireDoc represents some doc encoded data (string keyed maps, tagged structs and Document objects)
    WireType[WireType["WIRE_DOC"] = 13] = "WIRE_DOC";
    // WIREPACK represents some pack encoded data (slices, arrays, maps, structs)
    WireType[WireType["WIRE_PACK"] = 14] = "WIRE_PACK";
    // WIRELOAD represents a load tag for compound wire type
    WireType[WireType["WIRE_LOAD"] = 15] = "WIRE_LOAD";
})(WireType || (WireType = {}));
export class Wire {
    // isNull method returns whether a given wiretype is null.
    // A wiretype is null if it is WireNull, has a value greater than 15 or is between 8 and 12 (reserved)
    static isNull(wt) {
        return (wt > 15) || (wt == WireType.WIRE_NULL) || (wt >= 8 && wt <= 12);
    }
    // isCompound method returns whether a given wiretype is a compound type. (contains a load inside it)
    static isCompound(wt) {
        return wt == WireType.WIRE_PACK || wt == WireType.WIRE_DOC;
    }
}
