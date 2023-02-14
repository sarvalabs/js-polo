import { WriteBuffer } from './writebuffer';
import { WireType } from './wiretype';
import Schema from './schema.d';
import BN from 'bn.js';
import { Raw } from './raw';
import { ReadBuffer } from './readbuffer';

export class Polorizer {
	private writeBuffer: WriteBuffer;

	constructor() {
		this.writeBuffer = new WriteBuffer();
	}

	public bytes(): Uint8Array {
		switch(this.writeBuffer.counter){
		case 0:
			return new Uint8Array([0]);
		case 1:
			return this.writeBuffer.bytes();
		default:
			return this.packed();
		}
	}

	public packed(): Uint8Array {
		// Declare a new writebuffer
		const wb: WriteBuffer = new WriteBuffer();
		// Write the contents of the polorized buffer
		// into the writebuffer and tag with WirePack
		wb.write(WireType.WIRE_PACK, this.writeBuffer.load());

		return wb.bytes();
	}

	public polorizeAs(
		value: null | boolean | number | BN | string | Uint8Array | 
		Array<unknown> | Map<unknown, unknown> | object, 
		schema: Schema
	): void {
		switch(schema.kind) {
		case 'null':
			this.polorizeNull(); 
			break;
		case 'bool':
			this.polorizeBool(value);
			break;
		case 'integer':
			this.polorizeInt(value);
			break;
		case 'float':
			this.polorizeFloat(value);
			break;
		case 'string':
			this.polorizeString(value);
			break;
		case 'raw':
			this.polorizeRaw(value);
			break;
		case 'bytes':
			this.polorizeBytes(value);
			break;
		// Array Value (Pack Encoded)
		case 'array':
			this.polorizeArray(value, schema);
			break;
		// Map Value (Pack Encoded. Key-Value. Sorted Keys)
		case 'map':
			this.polorizeMap(value, schema);
			break;
		// Struct Value (Field Ordered Pack Encoded)
		case 'struct':
			this.polorizeStruct(value, schema);
			break;
		default:
			throw Error(schema.kind + ' is unsupported.');
		}
	}

	public polorizeNull(): void {
		this.writeBuffer.writeNull();
	}

	public polorizeBool(value: boolean): void {
		this.writeBuffer.writeBool(value);
	}

	public polorizeInt(value: number | BN): void {
		this.writeBuffer.writeInt(value);
	}

	public polorizeFloat(value: number): void {
		this.writeBuffer.writeFloat(value);
	}

	public polorizeString(value: string): void {
		this.writeBuffer.writeString(value);
	}

	public polorizeRaw(value: Raw): void {
		this.writeBuffer.writeRaw(value);
	}

	public polorizeBytes(value: Uint8Array): void {
		this.writeBuffer.writeBytes(value);
	}

	public polorizePacked(polorizer: Polorizer): void {
		this.writeBuffer.write(WireType.WIRE_PACK, polorizer.writeBuffer.load());
	}

	public polorizeInner(inner: Polorizer): void {
		const readBuffer = new ReadBuffer(inner.bytes())

		this.writeBuffer.write(readBuffer.wire, readBuffer.data)
	}

	private polorizeArray(array: Array<unknown>, schema: Schema): void {
		const polorizer = new Polorizer();

		if(schema.fields && schema.fields.values && schema.fields.values.kind) {
			array.forEach(arr => polorizer.polorizeAs(arr, schema.fields.values));
		}

		this.polorizePacked(polorizer);
	}

	private polorizeMap(map: Map<unknown, unknown>, schema: Schema): void {
		const polorizer = new Polorizer();

		if(schema.fields && schema.fields.keys && schema.fields.values &&
		schema.fields.keys.kind && schema.fields.values.kind) {
			const keys = [...map.keys()];
			keys.sort();

			keys.forEach(key => {
				polorizer.polorizeAs(key, schema.fields.keys);
				polorizer.polorizeAs(map.get(key), schema.fields.values);
			});
		}

		this.polorizePacked(polorizer);
	}

	private polorizeStruct(struct: object, schema: Schema): void {
		const polorizer = new Polorizer();

		Object.entries(schema.fields).forEach(([key, value]) => {
			polorizer.polorizeAs(struct[key], value);
		});

		this.polorizePacked(polorizer);
	}

	public polorizeDocument(document: object): void {
		const keys = Object.keys(document);
		keys.sort();

		const polorizer = new Polorizer();
		keys.forEach(key => {
			polorizer.polorizeString(key);
			polorizer.polorizeRaw(document[key]);
		});

		this.writeBuffer.write(WireType.WIRE_DOC, polorizer.writeBuffer.load());
	}
} 
