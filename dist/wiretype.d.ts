export declare enum WireType {
    WIRE_NULL = 0,
    WIRE_FALSE = 1,
    WIRE_TRUE = 2,
    WIRE_POSINT = 3,
    WIRE_NEGINT = 4,
    WIRE_RAW = 5,
    WIRE_WORD = 6,
    WIRE_FLOAT = 7,
    WIRE_DOC = 13,
    WIRE_PACK = 14,
    WIRE_LOAD = 15
}
export declare class Wire {
    static isNull(wt: WireType): boolean;
    static isCompound(wt: WireType): boolean;
}
