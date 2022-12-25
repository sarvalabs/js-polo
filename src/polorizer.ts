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

	private isArray(data: object): boolean {
		return (data instanceof Array);
	}

	private isObject(data: object): boolean {
		return Object.getPrototypeOf(data) == Object.prototype;
	}

	private setIntBuffer(num: number, wb?: WriteBuffer): number[] {
		const buffer: Buffer = Buffer.alloc(8);
		wb ||= new WriteBuffer();

		switch (Math.sign(num)) {
		case 0:
			return wb.write(wiretype.WIRE_POSINT, null);
		case -1:
			buffer.writeBigUInt64BE(BigInt(-num), 0);
			return wb.write(
				wiretype.WIRE_NEGINT, 
				buffer.subarray((8 - this.sizeInteger(num)),)
			);
		default:
			buffer.writeBigUInt64BE(BigInt(num), 0);
			return wb.write(
				wiretype.WIRE_POSINT, 
				buffer.subarray((8 - this.sizeInteger(num)),)
			);
		}
	}

	private sizeInteger(x: number): number {
		return (x < 2) ? 1 : Math.ceil(Math.log2(x) / 8);
	}

	private polorizeNumber(value: number, wb?: WriteBuffer): number[] {
		switch(true) {
		case this.isUInt(value):
			return this.polorizeUInt64(value, wb);
		case this.isInt(value):
			return this.polorizeInt64(value, wb);
		case this.isFloat(value):
			return this.polorizeFloat64(value, wb);
		default:
			throw 'error';
		}
	}

	private polorizeObj(value: object, wb?: WriteBuffer): number[] {
		switch(true){
		case this.isArray(value):
			return this.polorizeArray(value as Array<unknown>, wb);
		case this.isObject(value):
			return this.polorize(value, wb);
		default:
			throw 'error';
		}
	}

	public polorize(data: unknown, wb?: WriteBuffer): number[] {
		switch(typeof data) {
		case 'boolean':
			return this.polorizeBool(data, wb);
		case 'string':
			return this.polorizeString(data, wb);
		case 'number':
			return this.polorizeNumber(data, wb);
		case 'bigint':
			return this.polorizeBigInt(data, wb);
		case 'object':
			return this.polorizeObj(data, wb);
		default:
			throw 'error';	
		}
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	public polorizeNull(_data: null | undefined, wb?: WriteBuffer): number[] {
		wb ||= new WriteBuffer();

		return wb.write(wiretype.WIRE_NULL, null);
	}

	public polorizeBool(data: boolean, wb?: WriteBuffer): number[] {
		wb ||= new WriteBuffer();

		if (data) {
			return wb.write(wiretype.WIRE_TRUE, null);
		}

		return wb.write(wiretype.WIRE_FALSE, null);
	}

	public polorizeString(data: string, wb?: WriteBuffer): number[] {
		wb ||= new WriteBuffer();

		return wb.write(wiretype.WIRE_WORD, Buffer.from(data, 'utf8'));
	}

	public polorizeUInt8(data: number, wb?: WriteBuffer): number[] {
		if (this.isUInt(data) && datarange.inUInt8(data)) {
			const buffer: Buffer = Buffer.alloc(8);
			wb ||= new WriteBuffer();

			buffer.writeBigUInt64BE(BigInt(data), 0);
			return wb.write(
				wiretype.WIRE_POSINT, 
				buffer.subarray((8 - this.sizeInteger(data)),)
			);
		}

		throw 'error';
	}

	public polorizeUInt16(data: number, wb?: WriteBuffer): number[] {
		if (this.isUInt(data) && datarange.inUInt16(data)) {
			const buffer: Buffer = Buffer.alloc(8);
			wb ||= new WriteBuffer();

			buffer.writeBigUInt64BE(BigInt(data), 0);
			return wb.write(
				wiretype.WIRE_POSINT, 
				buffer.subarray((8 - this.sizeInteger(data)),)
			);
		}

		throw 'error';
	}

	public polorizeUInt32(data: number, wb?: WriteBuffer): number[] {
		if (this.isUInt(data) && datarange.inUInt32(data)) {
			const buffer: Buffer = Buffer.alloc(8);
			wb ||= new WriteBuffer();

			buffer.writeBigUInt64BE(BigInt(data), 0);
			return wb.write(
				wiretype.WIRE_POSINT, 
				buffer.subarray((8 - this.sizeInteger(data)),)
			);
		}

		throw 'error';
	}

	public polorizeUInt64(data: number, wb?: WriteBuffer): number[] {
		if (this.isUInt(data) && datarange.inUInt64(data)) {
			const buffer: Buffer = Buffer.alloc(8);
			wb ||= new WriteBuffer();

			buffer.writeBigUInt64BE(BigInt(data), 0);
			return wb.write(
				wiretype.WIRE_POSINT, 
				buffer.subarray((8 - this.sizeInteger(data)),)
			);
		}

		throw 'error';
	}

	public polorizeInt8(data: number, wb?: WriteBuffer): number[] {
		if (this.isInt(data) && datarange.inInt8(data)) {
			return this.setIntBuffer(data, wb);
		}

		throw 'error';
	}

	public polorizeInt16(data: number, wb?: WriteBuffer): number[] {
		if (this.isInt(data) && datarange.inInt16(data)) {
			return this.setIntBuffer(data, wb);
		}

		throw 'error';
	}

	public polorizeInt32(data: number, wb?: WriteBuffer): number[] {
		if (this.isInt(data) && datarange.inInt32(data)) {
			return this.setIntBuffer(data, wb);
		}

		throw 'error';
	}

	public polorizeInt64(data: number, wb?: WriteBuffer): number[] {
		if (this.isInt(data) && datarange.inInt64(data)) {
			return this.setIntBuffer(data, wb);
		}

		throw 'error';
	}

	public polorizeFloat64(data: number, wb?: WriteBuffer): number[] {
		if (this.isFloat(data)) {
			const buffer: Buffer = Buffer.alloc(8);
			wb ||= new WriteBuffer();

			buffer.writeDoubleBE(data, 0);
			return wb.write(wiretype.WIRE_FLOAT, buffer);
		}

		throw 'error';
	}


	public polorizeBigInt(data: bigint, wb?: WriteBuffer): number[] {
		if (datarange.inBigInt(data)) {
			const buffer: Buffer = Buffer.alloc(8);
			wb ||= new WriteBuffer();

			buffer.writeBigUInt64BE(BigInt(data), 0);
			return wb.write(
				wiretype.WIRE_BIGINT, 
				buffer.subarray((8 - this.sizeInteger(Number(data))),)
			);
		}

		throw 'error';
	}

	public polorizeArray(value: unknown[], wb?: WriteBuffer): number[] {
		wb ||= new WriteBuffer();

		const awb = new WriteBuffer();
		value.forEach(val => {
			this.polorize(val, awb);
		});

		return wb.write(wiretype.WIRE_PACK, new Uint8Array(awb.load()));
	}

	public polorizeObject(value: object, wb?: WriteBuffer): number[] {
		wb ||= new WriteBuffer();

		const keys = Object.keys(value);
		keys.sort();

		const owb = new WriteBuffer();
		keys.forEach(key => {
			// Polorize the key into the buffer
			this.polorize(key, owb);

			// Polorize the value into the buffer
			this.polorize(value[key], owb);
		});
		
		return wb.write(wiretype.WIRE_PACK, new Uint8Array(owb.load()));
	}
}
