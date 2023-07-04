/**
 * Enum representing various wire types used for data encoding.
 */
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
/**
 * Utility class for working with wire types.
 */
export declare class Wire {
    /**
     * Checks if a given wire type is null.
     * A wire type is null if it is WireNull, has a value greater than 15, or is between 8 and 12 (reserved).
     * @param wt The wire type to check.
     * @returns True if the wire type is null, false otherwise.
     */
    static isNull(wt: WireType): boolean;
    /**
     * Checks if a given wire type is a compound type.
     * A compound type contains a load inside it.
     * @param wt The wire type to check.
     * @returns True if the wire type is a compound type, false otherwise.
     */
    static isCompound(wt: WireType): boolean;
}
