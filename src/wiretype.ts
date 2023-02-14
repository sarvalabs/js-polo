export enum WireType {
	// WIRENULL represents a null wire. Used for consuming field orders without data.
	WIRE_NULL = 0,
	// WIREFALSE represents a Boolean False
	WIRE_FALSE = 1,
	// WIRETRUE represents a Boolean True
	WIRE_TRUE = 2,
	// WIREPOSINT represents a Binary encoded +ve Integer in BigEndian Order.
	WIRE_POSINT = 3,
	// WIRENEGINT represents a Binary encoded -ve Integer in BigEndian Order.
	// The number is encoded as its absolute value and must be multiplied with -1 to get its actual value.
	WIRE_NEGINT = 4,
	// WIRERAW represents a polo encoded bytes
	WIRE_RAW = 5,
	// WIREWORD represents UTF-8 encoded string/bytes
	WIRE_WORD = 6,
	// WIREFLOAT represents some floating point data encoded in the IEEE754 standard. (floats)
	WIRE_FLOAT = 7,
	// WireDoc represents some doc encoded data (string keyed maps, tagged structs and Document objects)
	WIRE_DOC = 13,
	// WIREPACK represents some pack encoded data (slices, arrays, maps, structs)
	WIRE_PACK = 14,
	// WIRELOAD represents a load tag for compound wire type
	WIRE_LOAD = 15
}

export class Wire {
	// isNull method returns whether a given wiretype is null.
	// A wiretype is null if it is WireNull, has a value greater than 15 or is between 8 and 12 (reserved)
	public static isNull(wt: WireType): boolean {
		return (wt > 15) || (wt == WireType.WIRE_NULL) || (wt >= 8 && wt <= 12);
	}

	// isCompound method returns whether a given wiretype is a compound type. (contains a load inside it)
	public static isCompound(wt: WireType): boolean {
		return wt == WireType.WIRE_PACK || wt == WireType.WIRE_DOC;
	}
}
