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
     * Only WIRE_NULL is null. A reserved wire type is not null: the decoder
     * rejects an element with a reserved wire type.
     * @param wt The wire type to check.
     * @returns True if the wire type is null, false otherwise.
     */
    static isNull(wt: WireType): boolean;
    /**
     * Checks if a given wire type is reserved. The wire types 8 to 12 are
     * reserved. The decoder rejects an element with a reserved wire type.
     * @param wt The wire type to check.
     * @returns True if the wire type is reserved, false otherwise.
     */
    static isReserved(wt: WireType): boolean;
    /**
     * Returns the name of a wire type, as the POLO Wire Specification
     * gives it. For example, the name of WIRE_POSINT is "PosInt".
     * @param wt The wire type.
     * @returns The name of the wire type.
     */
    static nameOf(wt: WireType): string;
    /**
     * Checks if a given wire type is a compound type.
     * A compound type contains a load inside it.
     * @param wt The wire type to check.
     * @returns True if the wire type is a compound type, false otherwise.
     */
    static isCompound(wt: WireType): boolean;
}
