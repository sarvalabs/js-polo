import LoadReader from './loadreader';
import { Schema } from '../types/schema';
import { Raw } from './raw';
import { ReadBuffer } from './readbuffer';
import { WireType } from './wiretype';
import { Document, documentDecode } from './document';

export class Depolorizer {
	public done: boolean;
	public packed: boolean;
	public data: ReadBuffer;
	public load: LoadReader;

	constructor(data: Uint8Array, load?: LoadReader) {
		if(!load) {
			this.data = new ReadBuffer(data);
			this.packed = false;
		} else {
			this.load = load;
			this.packed = true;
		}

		this.done = false;
	}

	public isDone(): boolean {
		// Check if loadreader is done if in packed mode
		if(this.packed) {
			return this.load.done();
		}

		// Return flag for non-pack data
		return this.done;
	}

	public read(): ReadBuffer {
		// Check if there is another element to read
		if(this.isDone()) {
			throw new Error('insufficient data in wire for decode');
		}

		// Read from the loadreader if in packed mode
		if(this.packed) {
			return this.load.next();
		}

		// Set the atomic read flag to done
		this.done = true

		// Return the data from the atomic buffer
		return this.data;
	}

	private newLoadDepolorizer(data: ReadBuffer): Depolorizer {
		// Convert the element into a loadreader
		const load = data.load();

		// Create a new Depolorizer in packed mode
		return new Depolorizer(null, load);
	}

	public depolorize(schema: Schema): unknown {
		switch(schema.kind) {
		case 'null':
			return this.depolorizeNull();
		case 'bool':
			return this.depolorizeBool();
		case 'integer':
			return this.depolorizeInteger();
		case 'float':
			return this.depolorizeFloat();
		case 'string':
			return this.depolorizeString();
		case 'raw':
			return this.depolorizeRaw();
		case 'bytes':
			return this.depolorizeBytes();
		case 'array':
			return this.depolorizeArray(schema);
		case 'map':
			return this.depolorizeMap(schema);
		case 'struct':
			return this.depolorizeStruct(schema);
		default:
			throw Error(schema.kind + ' is unsupported.');
		}
	}

	public depolorizeNull(): null {
		return this.read().readNull();
	}

	public depolorizeBool(): boolean {
		return this.read().readBool();
	}

	public depolorizeInteger(): number | bigint {
		return this.read().readInteger();
	}

	public depolorizeFloat(): number {
		return this.read().readFloat();
	}

	public depolorizeString(): string {
		return this.read().readString();
	}

	public depolorizeRaw(): Raw {
		return this.read().readRaw();
	}

	public depolorizeBytes(): Uint8Array {
		return this.read().readBytes();
	}

	private depolorizeArray(schema: Schema): Array<unknown> {
		// Peek the wire type of the next element
		const data = this.read();

		if(schema.fields && schema.fields.values && schema.fields.values.kind) {
			const arr: Array<unknown> = [];
			// Get the next element as a pack
			// depolorizer with the slice elements
			const pack = this.newLoadDepolorizer(data);
			// Iterate until loadreader is done
			while(!pack.isDone()) {
				// Depolorize the element into the element type
				const element = pack.depolorize(schema.fields.values);
				if(element) {
					// const ele = pack.unpack(schema.fields.values, element);
					arr.push(element);
				}
			}

			return arr;
		}

		throw new Error('Invalid kind');
	}

	public depolorizeDocument(): Document {
		// Read the next element
		const data = this.read();

		return documentDecode(data)
	}

	public depolorizePacked(): Depolorizer {
		// Read the next element
		const data = this.read();

		switch(data.wire) {
			case WireType.WIRE_PACK:
			case WireType.WIRE_DOC:
				return this.newLoadDepolorizer(data)
			case WireType.WIRE_NULL:
				throw new Error('null pack element')
			default:
				throw new Error('incompatible wire type')
		}
	}

	public depolorizeInner(): Depolorizer {
		// Read the next element
		const data = this.read();

		return new Depolorizer(data.bytes())
	}

	private depolorizeMap(schema: Schema): Map<unknown, unknown> {
		// Peek the wire type of the next element
		const data = this.read();

		if(schema.fields && schema.fields.keys && schema.fields.values &&
			schema.fields.keys.kind && schema.fields.values.kind) {
			// Get the next element as a pack
			// depolorizer with the slice elements
			const pack = this.newLoadDepolorizer(data);

			switch(data.wire){
			case WireType.WIRE_PACK: {
				const map: Map<unknown, unknown> = new Map();
				// Iterate until loadreader is done
				while(!pack.isDone()) {
					// Get the next element from the load (key)
					const key = pack.depolorize(schema.fields.keys);
					const value = pack.depolorize(schema.fields.values);
					map.set(key, value);
				}
		
				return map;
			}
			default:
				throw new Error('Incompatible wire type');
			}
		}
	
		throw new Error('Invalid kind');
	}

	private depolorizeStruct(schema: Schema): object {
		// Peek the wire type of the next element
		const data = this.read();

		// Get the next element as a pack
		// depolorizer with the slice elements
		const pack = this.newLoadDepolorizer(data);

		switch(data.wire) {
		case WireType.WIRE_PACK:{
			const obj: object = {};
			const entries = Object.entries(schema.fields);
			let index = 0;

			// Iterate until loadreader is done
			while(!pack.isDone()) {
				// Get the next element from the load (key)
				const value = pack.depolorize(entries[index][1]);
				obj[entries[index][0]] = value;
				index++;
			}
		
			return obj;
		}
		case WireType.WIRE_DOC:{
			const doc = documentDecode(data)
			const obj = {}

			Object.entries(schema.fields).forEach(([key, value]) =>{
				const data = doc.getRaw(key)
				const depolorizer = new Depolorizer(new Uint8Array(data.bytes))
				obj[key] = depolorizer.depolorize(value)
			})

			return obj
		}
		default:
			throw new Error('Incompatible wire type');
		}
	}
}
