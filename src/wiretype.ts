/**
 * Enum representing various wire types used for data encoding.
 */
export enum WireType {
	// WIRE_NULL represents a null wire. Used for consuming field orders without data.
	WIRE_NULL = 0,

	// WIRE_FALSE represents a Boolean False.
	WIRE_FALSE = 1,

	// WIRE_TRUE represents a Boolean True.
	WIRE_TRUE = 2,

	// WIRE_POSINT represents a Binary encoded positive Integer in BigEndian Order.
	WIRE_POSINT = 3,

	// WIRE_NEGINT represents a Binary encoded negative Integer in BigEndian Order.
	// The number is encoded as its absolute value and must be multiplied with -1 to get its actual value.
	WIRE_NEGINT = 4,

	// WIRE_RAW represents a polo encoded bytes.
	WIRE_RAW = 5,

	// WIRE_WORD represents UTF-8 encoded string/bytes.
	WIRE_WORD = 6,

	// WIRE_FLOAT represents some floating point data encoded in the IEEE754 standard (floats).
	WIRE_FLOAT = 7,

	// WireDoc represents some doc encoded data (string keyed maps, tagged structs, and Document objects).
	WIRE_DOC = 13,

	// WIRE_PACK represents some pack encoded data (slices, arrays, maps, structs).
	WIRE_PACK = 14,

	// WIRE_LOAD represents a load tag for compound wire type.
	WIRE_LOAD = 15,
}

const WIRE_NAMES: Record<number, string> = {
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
export class Wire {
	/**
	 * Checks if a given wire type is null.
	 * Only WIRE_NULL is null. A reserved wire type is not null: the decoder
	 * rejects an element with a reserved wire type.
	 * @param wt The wire type to check.
	 * @returns True if the wire type is null, false otherwise.
	 */
	public static isNull(wt: WireType): boolean {
		return wt === WireType.WIRE_NULL;
	}

	/**
	 * Checks if a given wire type is reserved. The wire types 8 to 12 are
	 * reserved. The decoder rejects an element with a reserved wire type.
	 * @param wt The wire type to check.
	 * @returns True if the wire type is reserved, false otherwise.
	 */
	public static isReserved(wt: WireType): boolean {
		return wt >= 8 && wt <= 12;
	}

	/**
	 * Returns the name of a wire type, as the POLO Wire Specification
	 * gives it. For example, the name of WIRE_POSINT is "PosInt".
	 * @param wt The wire type.
	 * @returns The name of the wire type.
	 */
	public static nameOf(wt: WireType): string {
		if(Wire.isReserved(wt)) {
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
	public static isCompound(wt: WireType): boolean {
		return wt === WireType.WIRE_PACK || wt === WireType.WIRE_DOC;
	}
}
