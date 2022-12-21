const datarange = {
	MIN_UINT: 0,
	MAX_UINT8: 255,
	MAX_UINT16: 65535,
	MAX_UINT32: 4294967295,
	MAX_UINT64: Number.MAX_SAFE_INTEGER,
	MIN_INT8: -128,
	MAX_INT8: 127,
	MIN_INT16: -32768,
	MAX_INT16: 32767,
	MIN_INT32: -2147483648,
	MAX_INT32: 2147483647,
	MIN_INT64: -Number.MAX_SAFE_INTEGER,
	MAX_INT64: Number.MAX_SAFE_INTEGER,
	MIN_BIGINT: -9223372036854775808,
	MAX_BIGINT: 9223372036854775807n
};

export class DataRange {
	public inUInt8(num: number): boolean {
		return num >= datarange.MIN_UINT && num <= datarange.MAX_UINT8;
	}

	public inUInt16(num: number): boolean {
		return num >= datarange.MIN_UINT && num <= datarange.MAX_UINT16;
	}

	public inUInt32(num: number): boolean {
		return num >= datarange.MIN_UINT && num <= datarange.MAX_UINT32;
	}

	public inUInt64(num: number): boolean {
		return num >= datarange.MIN_UINT && num <= datarange.MAX_UINT64;
	}

	public inInt8(num: number): boolean {
		return num >= datarange.MIN_INT8 && num <= datarange.MAX_INT8;
	}

	public inInt16(num: number): boolean {
		return num >= datarange.MIN_INT16 && num <= datarange.MAX_INT16;
	}

	public inInt32(num: number): boolean {
		return num >= datarange.MIN_INT32 && num <= datarange.MAX_INT32;
	}

	public inInt64(num: number): boolean {
		return num >= datarange.MIN_INT64 && num <= datarange.MAX_INT64;
	}

	public inBigInt(num: bigint): boolean {
		return num >= datarange.MIN_BIGINT && num <= datarange.MAX_BIGINT;
	}
}