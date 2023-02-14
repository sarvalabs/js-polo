import BN from 'bn.js';
import { WriteBuffer } from './writebuffer';
import { ReadBuffer } from './readbuffer';
import { Raw } from './raw';
import { Polorizer } from './polorizer';
import Schema from './schema.d';
import { Depolorizer } from './depolorizer';
import { WireType } from './wiretype';

export class Document {
	public document: object;

	constructor(data?: Uint8Array, schema?: Schema) {
		if(data && schema) {
			const depolorizer = new Depolorizer(data);
			const obj = depolorizer.depolorize(schema);
			this.document = obj as object;
			return;
		}

		this.document = {};
	}

	public size(): number {
		return Object.keys(this.document).length;
	}

	public bytes(): Uint8Array {
		const polorizer = new Polorizer();
		polorizer.polorizeDocument(this.document);
		return polorizer.bytes()
	}

	private get(key: string): Uint8Array {
		return this.document[key].bytes;
	}

	private set(key: string, val: Uint8Array): void {
		this.setRaw(key, new Raw(val))
	}

	public is(key: string, kind: WireType): boolean {
		const data = this.get(key);

		if(!data || data.length === 0) {
			return kind === WireType.WIRE_NULL;
		}

		return data[0] === kind;
	}

	public setNull(key: string): void {
		const wb: WriteBuffer = new WriteBuffer();
		wb.writeNull();

		this.set(key, wb.bytes());
	}

	public setBool(key: string, data: boolean): void {
		const wb: WriteBuffer = new WriteBuffer();
		wb.writeBool(data);

		this.set(key, wb.bytes());
	}

	public setInteger(key: string, data: number | BN): void {
		const wb: WriteBuffer = new WriteBuffer();
		wb.writeInt(data);

		this.set(key, wb.bytes());
	}

	public setFloat(key: string, data: number): void {
		const wb: WriteBuffer = new WriteBuffer();
		wb.writeFloat(data);

		this.set(key, wb.bytes());
	}
	
	public setString(key: string, data: string): void {
		const wb: WriteBuffer = new WriteBuffer();
		wb.writeString(data);

		this.set(key, wb.bytes());
	}

	public setRaw(key: string, data: Raw): void {
		this.document[key] = data
	}

	public setBytes(key: string, data: Uint8Array): void {
		const wb: WriteBuffer = new WriteBuffer();
		wb.writeBytes(data);

		this.set(key, wb.bytes());
	}

	public setArray(key: string, array: Array<unknown>, schema: Schema): void {
		const polorizer = new Polorizer();
		if(schema.fields && schema.fields.values && schema.fields.values.kind) {
			array.forEach(arr => polorizer.polorize(arr, schema.fields.values));
		}

		this.set(key, polorizer.bytes());
	}

	public setMap(key: string, map: Map<unknown, unknown>, schema: Schema): void {
		const polorizer = new Polorizer();
		if(schema.fields && schema.fields.keys && schema.fields.values &&
		schema.fields.keys.kind && schema.fields.values.kind) {
			const keys = [...map.keys()];
			keys.sort();

			keys.forEach(key => {
				polorizer.polorize(key, schema.fields.keys);
				polorizer.polorize(map.get(key), schema.fields.values);
			});
		}

		this.set(key, polorizer.bytes());
	}

	public setStruct(key: string, struct: object, schema: Schema): void {
		const polorizer = new Polorizer();
		Object.entries(struct).forEach(([key, value]) => {
			polorizer.polorize(value, schema.fields[key]);
		});

		this.set(key, polorizer.bytes());
	}

	public getNull(key: string): null {
		if(this.document[key]){
			const rb: ReadBuffer = new ReadBuffer(this.get(key));
			return rb.readNull();
		}

		return null;
	}

	public getBool(key: string): boolean {
		if(this.document[key]){
			const rb: ReadBuffer = new ReadBuffer(this.get(key));
			return rb.readBool();
		}

		return false;
	}

	public getInteger(key: string): number | bigint {
		if(this.document[key]) {
			const rb: ReadBuffer = new ReadBuffer(this.get(key));
			return rb.readInteger();
		}

		return 0;
	}

	public getFloat(key: string): number {
		if(this.document[key]) {
			const rb: ReadBuffer = new ReadBuffer(this.get(key));
			return rb.readFloat();
		}

		return 0;
	}

	public getString(key: string): string {
		if(this.document[key]) {
			const rb: ReadBuffer = new ReadBuffer(this.get(key));
			return rb.readString();
		}

		return "";
	}

	public getRaw(key: string): Raw {
		if(this.document[key]) {
			return this.document[key];
		}

		return new Raw(new Uint8Array());
	}

	public getBytes(key: string): Uint8Array {
		if(this.document[key]) {
			const rb: ReadBuffer = new ReadBuffer(this.get(key));
			return rb.readBytes();
		}

		return new Uint8Array();
	}

	public getArray(key: string, schema: Schema): Array<unknown> {
		if(this.document[key]) {
			const depolorizer = new Depolorizer(this.get(key));
			return depolorizer.depolorize(schema) as Array<unknown>;
		}

		return [];
	}

	public getMap(key: string, schema: Schema): Map<unknown, unknown> {
		if(this.document[key]) {
			const depolorizer = new Depolorizer(this.get(key));
			return depolorizer.depolorize(schema) as Map<unknown, unknown>;
		}

		return new Map();
	}

	public getStruct(key: string, schema: Schema): object {
		const obj = {};

		if(this.document[key]) {
			const depolorizer = new Depolorizer(this.get(key));
			Object.keys(schema.fields).forEach((key) => {
				obj[key] = depolorizer.depolorize(schema.fields[key])
			});
		}

		return obj;
	}
}

export const documentEncode = (obj: object | Map<string, unknown>, schema: Schema): Document => {
	const doc = new Document();
	switch(schema.kind){
	case 'map':
		const data: Map<string, unknown> = obj as Map<string, unknown>;
		[...data.keys()].forEach(key => {
			const polorizer = new Polorizer()
			polorizer.polorize(data.get(key), schema.fields.values)
			doc.setRaw(key, new Raw(polorizer.bytes()));
		})
		break;
	case 'struct':
		Object.entries(obj).forEach(([key, value]) => {
			const polorizer = new Polorizer()
			polorizer.polorize(value, schema.fields[key])
			doc.setRaw(key, new Raw(polorizer.bytes()));
		});
		break;
	default:
		throw 'unsupported kind';
	}

	return doc;
};

export const documentDecode = (data: ReadBuffer): Document => {
	const doc = new Document()
	switch(data.wire){
	case WireType.WIRE_DOC:{
		// Convert the element into a loadreader
		const load = data.load();
		const pack = new Depolorizer(null, load)

		while(!pack.isDone()) {
			const docKey = pack.depolorizeString()
			const val = pack.read()
			doc.setRaw(docKey, new Raw(new Uint8Array(val.data)))
		}

		return doc
	}
	default:
		throw 'unsupported kind';
	}
};
