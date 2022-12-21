const MSB = 0x80
	, REST = 0x7F
	, MSBALL = ~REST
	, INT = Math.pow(2, 31);

export class VarInt {
	public encode(num: number): number[] {
		if (num > Number.MAX_SAFE_INTEGER) {
			throw new RangeError('Could not encode varint');
		}

		const output:number[] = [];
		let offset = 0;

		while(num >= INT) {
			output[offset++] = (num & 0xFF) | MSB;
			num /= 128;
		}
		while(num & MSBALL) {
			output[offset++] = (num & 0xFF) | MSB;
			num >>>= 7;
		}
		output[offset] = num | 0;
        
		return output;
	}

	public append(buffer: number[], v: number): number[] {
		switch(true) {
		case v < 1 << 7:
			return [...buffer, v];
		case v < 1 << 14:
			return [
				...buffer, 
				(v>>0)&0x7f|0x80, 
				v>>7
			];
		case v < 1 << 21:
			return [
				...buffer, 
				(v>>0)&0x7f|0x80, 
				(v>>7)&0x7f|0x80, 
				v>>14
			];
		case v < 1 << 28:
			return [
				...buffer, 
				(v>>0)&0x7f|0x80, 
				(v>>7)&0x7f|0x80, 
				(v>>14)&0x7f|0x80, 
				v>>21
			];
		case v < 1 << 35:
			return [
				...buffer, 
				(v>>0)&0x7f|0x80, 
				(v>>7)&0x7f|0x80, 
				(v>>14)&0x7f|0x80, 
				(v>>21)&0x7f|0x80, 
				v>>28
			];
		case v < 1 << 42:
			return [
				...buffer, 
				(v>>0)&0x7f|0x80, 
				(v>>7)&0x7f|0x80, 
				(v>>14)&0x7f|0x80, 
				(v>>21)&0x7f|0x80, 
				(v>>28)&0x7f|0x80,
				v>>35
			];
		case v < 1 << 49:
			return [
				...buffer, 
				(v>>0)&0x7f|0x80, 
				(v>>7)&0x7f|0x80, 
				(v>>14)&0x7f|0x80, 
				(v>>21)&0x7f|0x80, 
				(v>>28)&0x7f|0x80,
				(v>>35)&0x7f|0x80,
				v>>42
			];
		case v < 1 << 56:
			return [
				...buffer, 
				(v>>0)&0x7f|0x80, 
				(v>>7)&0x7f|0x80, 
				(v>>14)&0x7f|0x80, 
				(v>>21)&0x7f|0x80, 
				(v>>28)&0x7f|0x80,
				(v>>35)&0x7f|0x80,
				(v>>42)&0x7f|0x80,
				v>>49
			];
		case v < 1 << 63:
			return [
				...buffer, 
				(v>>0)&0x7f|0x80, 
				(v>>7)&0x7f|0x80, 
				(v>>14)&0x7f|0x80, 
				(v>>21)&0x7f|0x80, 
				(v>>28)&0x7f|0x80,
				(v>>35)&0x7f|0x80,
				(v>>42)&0x7f|0x80,
				(v>>49)&0x7f|0x80,
				v>>56
			];
		default:
			return [
				...buffer, 
				(v>>0)&0x7f|0x80, 
				(v>>7)&0x7f|0x80, 
				(v>>14)&0x7f|0x80, 
				(v>>21)&0x7f|0x80, 
				(v>>28)&0x7f|0x80,
				(v>>35)&0x7f|0x80,
				(v>>42)&0x7f|0x80,
				(v>>49)&0x7f|0x80,
				(v>>56)&0x7f|0x80,
				1
			];
		}
	}
}
