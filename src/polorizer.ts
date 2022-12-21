import { DataRange } from './datarange';
import { wiretype } from './wiretype';
import { WriteBuffer } from './writebuffer';

const datarange: DataRange = new DataRange();

export class Polorizer {
	private isInt(data: number): boolean {
		return Number.isInteger(data);
	}

	private isUInt(data: number): boolean {
		return this.isInt(data) && [0, 1].includes(Math.sign(data));
	}

	private isFloat(data: number): boolean {
		return !Number.isInteger(data);
	}

	private setIntBuffer(num: number): number[] {
		const buffer: Buffer = Buffer.alloc(8);
		const writeBuffer: WriteBuffer = new WriteBuffer();

		switch (Math.sign(num)) {
		case 0:
			return writeBuffer.write(wiretype.WIRE_POSINT, null);
		case -1:
			buffer.writeBigUInt64BE(BigInt(-num), 0);
			return writeBuffer.write(wiretype.WIRE_NEGINT, buffer.slice((8 - this.sizeInteger(num)),));
		default:
			buffer.writeBigUInt64BE(BigInt(num), 0);
			return writeBuffer.write(wiretype.WIRE_POSINT, buffer.slice((8 - this.sizeInteger(num)),));
		}
	}

	private sizeInteger(x: number): number {
		return (x < 2) ? 1 : Math.ceil(Math.log2(x) / 8);
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	public polorizeNull(_data: null | undefined): number[] {
		const writeBuffer: WriteBuffer = new WriteBuffer();

		return writeBuffer.write(wiretype.WIRE_NULL, null);
	}

	public polorizeBool(data: boolean): number[] {
		const writeBuffer: WriteBuffer = new WriteBuffer();

		if (data) {
			return writeBuffer.write(wiretype.WIRE_TRUE, null);
		}

		return writeBuffer.write(wiretype.WIRE_FALSE, null);
	}

	public polorizeString(data: string): number[] {
		const writeBuffer: WriteBuffer = new WriteBuffer();

		return writeBuffer.write(wiretype.WIRE_WORD, Buffer.from(data, 'utf8'));
	}

	public polorizeUInt8(data: number): number[] {
		if (this.isUInt(data) && datarange.inUInt8(data)) {
			const buffer: Buffer = Buffer.alloc(8);
			const writeBuffer: WriteBuffer = new WriteBuffer();

			buffer.writeBigUInt64BE(BigInt(data), 0);
			return writeBuffer.write(wiretype.WIRE_POSINT, buffer.slice((8 - this.sizeInteger(data)),));
		}

		throw 'error';
	}

	public polorizeUInt16(data: number): number[] {
		if (this.isUInt(data) && datarange.inUInt16(data)) {
			const buffer: Buffer = Buffer.alloc(8);
			const writeBuffer: WriteBuffer = new WriteBuffer();

			buffer.writeBigUInt64BE(BigInt(data), 0);
			return writeBuffer.write(wiretype.WIRE_POSINT, buffer.slice((8 - this.sizeInteger(data)),));
		}

		throw 'error';
	}

	public polorizeUInt32(data: number): number[] {
		if (this.isUInt(data) && datarange.inUInt32(data)) {
			const buffer: Buffer = Buffer.alloc(8);
			const writeBuffer: WriteBuffer = new WriteBuffer();

			buffer.writeBigUInt64BE(BigInt(data), 0);
			return writeBuffer.write(wiretype.WIRE_POSINT, buffer.slice((8 - this.sizeInteger(data)),));
		}

		throw 'error';
	}

	public polorizeUInt64(data: number): number[] {
		if (this.isUInt(data) && datarange.inUInt64(data)) {
			const buffer: Buffer = Buffer.alloc(8);
			const writeBuffer: WriteBuffer = new WriteBuffer();

			buffer.writeBigUInt64BE(BigInt(data), 0);
			return writeBuffer.write(wiretype.WIRE_POSINT, buffer.slice((8 - this.sizeInteger(data)),));
		}

		throw 'error';
	}

	public polorizeInt8(data: number): number[] {
		if (this.isInt(data) && datarange.inInt8(data)) {
			return this.setIntBuffer(data);
		}

		throw 'error';
	}

	public polorizeInt16(data: number): number[] {
		if (this.isInt(data) && datarange.inInt16(data)) {
			return this.setIntBuffer(data);
		}

		throw 'error';
	}

	public polorizeInt32(data: number): number[] {
		if (this.isInt(data) && datarange.inInt32(data)) {
			return this.setIntBuffer(data);
		}

		throw 'error';
	}

	public polorizeInt64(data: number): number[] {
		if (this.isInt(data) && datarange.inInt64(data)) {
			return this.setIntBuffer(data);
		}

		throw 'error';
	}

	public polorizeFloat64(data: number): number[] {
		if (this.isFloat(data)) {
			const buffer: Buffer = Buffer.alloc(8);
			const writeBuffer: WriteBuffer = new WriteBuffer();

			buffer.writeDoubleBE(data, 0);
			return writeBuffer.write(wiretype.WIRE_FLOAT, buffer);
		}

		throw 'error';
	}


	public polorizeBigInt(data: bigint): number[] {
		if (datarange.inBigInt(data)) {
			const buffer: Buffer = Buffer.alloc(8);
			const writeBuffer: WriteBuffer = new WriteBuffer();

			buffer.writeBigUInt64BE(BigInt(data), 0);
			return writeBuffer.write(wiretype.WIRE_BIGINT, buffer.slice((8 - this.sizeInteger(Number(data))),));
		}

		throw 'error';
	}
}
