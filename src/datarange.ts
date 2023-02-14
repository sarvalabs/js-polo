const MIN_UINT = 0;
const MAX_UINT8 = 255;
const MAX_UINT16 = 65535;
const MAX_UINT32 = 4294967295;
const MAX_UINT53 = Number.MAX_SAFE_INTEGER;
const MIN_INT8 = -128;
const MAX_INT8 = 127;
const MIN_INT16 = -32768;
const MAX_INT16 = 32767;
const MIN_INT32 = -2147483648;
const MAX_INT32 = 2147483647;
const MIN_INT53 = Number.MIN_SAFE_INTEGER;
const MAX_INT53 = Number.MAX_SAFE_INTEGER;
const MIN_BIGINT = -9223372036854775808n;
const MAX_BIGINT = 9223372036854775807n;

export class DataRange {
	public static inUInt8(num: number): boolean {
		return num >= MIN_UINT && num <= MAX_UINT8;
	}

	public static inUInt16(num: number): boolean {
		return num >= MIN_UINT && num <= MAX_UINT16;
	}

	public static inUInt32(num: number): boolean {
		return num >= MIN_UINT && num <= MAX_UINT32;
	}

	public static inUInt53(num: number): boolean {
		return num >= MIN_UINT && num <= MAX_UINT53;
	}

	public static inInt8(num: number): boolean {
		return num >= MIN_INT8 && num <= MAX_INT8;
	}

	public static inInt16(num: number): boolean {
		return num >= MIN_INT16 && num <= MAX_INT16;
	}

	public static inInt32(num: number): boolean {
		return num >= MIN_INT32 && num <= MAX_INT32;
	}

	public static inInt53(num: number): boolean {
		return num >= MIN_INT53 && num <= MAX_INT53;
	}

	public static inBigInt(num: bigint): boolean {
		return num >= MIN_BIGINT && num <= MAX_BIGINT;
	}
}
