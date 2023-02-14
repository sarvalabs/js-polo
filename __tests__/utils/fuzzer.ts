import Chance from 'chance';
import Crypto from 'crypto';
import Schema from '../../src/schema.d';


const MIN_INT32 = -2147483648;
const MAX_INT32 = 2147483647;
const MIN_BIGINT = -9223372036854775808n;
const MAX_BIGINT = 9223372036854775807n;

const chance = new Chance();

export class Fuzzer {
	private randBool(): boolean {
		return chance.bool({ likelihood: 50 });
	}

	private randInt(): number {
		return Math.floor(Math.random() * (MAX_INT32 - MIN_INT32)) + MIN_INT32;
	}

	private randUInt64(): number {
		return Math.floor(Math.random() * Number(MAX_BIGINT));
	}

	private randFloat(): number {
		return Math.random();
	}

	private randBigInt(): bigint {
		return MIN_BIGINT + BigInt(Math.floor(Math.random() * 
		(Number(MAX_BIGINT) - Number(MIN_BIGINT) + 1)));
	}

	private randString(): string {
		return chance.string();
	}

	private randBytes(length: number): Uint8Array {
		return Uint8Array.from(
			Crypto.randomBytes(
				Math.floor(Math.random() * length)
			).subarray(0,)
		);
	}

	private randArray(schema: Schema): Array<unknown> {
		const length = Math.floor(Math.random() * (15 - 0 + 1)) + 0;

		if(schema.fields && schema.fields.values && schema.fields.values.kind) {
			return Array(length).fill(null).map(() => 
				this.fuzz(schema.fields.values)
			);
		}

		throw new Error('Invalid schema');
	}

	private randMap(schema: Schema): Map<unknown, unknown> {
		const length = Math.floor(Math.random() * (10 - 0 + 1)) + 0;
		const map = new Map();
		if(schema.fields && schema.fields.keys && schema.fields.values &&
			schema.fields.keys.kind && schema.fields.values.kind) {
			for(let i = 0; i < length; i++) {
				map.set(
					this.fuzz(schema.fields.keys), 
					this.fuzz(schema.fields.values)
				);
			}

			return map;
		}

		throw new Error('Invalid schema');
	}

	private randStruct(schema: Schema): object {
		const obj = {};
		Object.entries(schema.fields).forEach(([key, value]) => {
			obj[key] = this.fuzz(value);
		});

		return obj;
	}

	public fuzzWire(): number {
		return Math.ceil(Math.random() * 18);
	}

	public fuzz(schema: Schema): unknown {
		switch(schema.kind) {
		case 'null':
			return null;
		case 'bool':
			return this.randBool();
		case 'integer':
			return this.randInt();
		case 'float':
			return this.randFloat();
		case 'bigint':
			return this.randBigInt();
		case 'uint64':
			return this.randUInt64();
		case 'string':
			return this.randString();
		case 'bytes':
			return this.randBytes(10);
		case 'array':
			return this.randArray(schema);
		case 'map':
			return this.randMap(schema);
		case 'struct':
			return this.randStruct(schema);
		default:
			throw new Error('unsupported kind');
		}
	}
}