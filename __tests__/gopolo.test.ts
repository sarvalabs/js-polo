import fs from 'fs';
import path from 'path';
import { Depolorizer, Document, Polorizer, Raw, Schema, EncodeOptions } from '../src';

// These tests compare js-polo with go-polo, the reference implementation of
// the POLO Wire Specification. scripts/gen-vectors writes the vectors with
// go-polo. Refer to the comment at the top of scripts/gen-vectors/main.go.
//
// - A valid vector holds a value and the wire that go-polo writes for it.
//   js-polo must decode the wire to the value, and it must encode the value
//   to the same wire.
// - An invalid vector holds a wire that go-polo rejects. js-polo must also
//   reject it.

interface Vector {
	name: string;
	schema: Schema;
	options?: EncodeOptions;
	wire: string;
	valid: boolean;
	value?: Tagged;
	error?: string;
}

// The JSON form of a value. It keeps the type of the value.
type Tagged = null | {
	bool?: boolean;
	int?: string;
	float?: string;
	string?: string;
	bytes?: string;
	list?: Tagged[];
	map?: [Tagged, Tagged][];
	struct?: [string, Tagged][];
	document?: [string, string][];
	raw?: string;
};

const MAX_SAFE = BigInt(Number.MAX_SAFE_INTEGER);

const fromHex = (hex: string): Uint8Array => Uint8Array.from(Buffer.from(hex, 'hex'));

// Converts the JSON form of a value to the value that js-polo gives.
const fromTagged = (tagged: Tagged | undefined): unknown => {
	if(tagged === null || tagged === undefined) {
		return null;
	}

	if(tagged.bool !== undefined) {
		return tagged.bool;
	}

	if(tagged.int !== undefined) {
		const value = BigInt(tagged.int);
		return value >= -MAX_SAFE && value <= MAX_SAFE ? Number(value) : value;
	}

	if(tagged.float !== undefined) {
		return Buffer.from(tagged.float, 'hex').readDoubleBE(0);
	}

	if(tagged.string !== undefined) {
		return tagged.string;
	}

	if(tagged.bytes !== undefined) {
		return fromHex(tagged.bytes);
	}

	if(tagged.list !== undefined) {
		return tagged.list.map(fromTagged);
	}

	if(tagged.map !== undefined) {
		return new Map(tagged.map.map(([key, value]) => [fromTagged(key), fromTagged(value)]));
	}

	if(tagged.struct !== undefined) {
		return Object.fromEntries(tagged.struct.map(([name, value]) => [name, fromTagged(value)]));
	}

	if(tagged.document !== undefined) {
		const doc = new Document();
		tagged.document.forEach(([key, value]) => doc.setRaw(key, new Raw(fromHex(value))));
		return doc;
	}

	if(tagged.raw !== undefined) {
		return new Raw(fromHex(tagged.raw));
	}

	throw new Error(`unknown JSON form: ${JSON.stringify(tagged)}`);
};

const encode = (value: unknown, schema: Schema, options?: EncodeOptions): string => {
	const polorizer = new Polorizer(options);
	polorizer.polorize(value, schema);
	return Buffer.from(polorizer.bytes()).toString('hex');
};

const vectors: { goPolo: string; vectors: Vector[] } = JSON.parse(
	fs.readFileSync(path.join(__dirname, 'vectors', 'go-polo.json'), 'utf8')
);
const all = vectors.vectors;

describe(`go-polo vectors (${vectors.goPolo})`, () => {
	test('the file has valid and invalid vectors', () => {
		expect(all.filter(vector => vector.valid).length).toBeGreaterThan(50);
		expect(all.filter(vector => !vector.valid).length).toBeGreaterThan(50);
	});

	describe('valid', () => {
		test.each(all.filter(vector => vector.valid).map(vector => [vector.name, vector]))(
			'%s', (_, vector: Vector) => {
				const value = fromTagged(vector.value);
				const decoded = new Depolorizer(fromHex(vector.wire), vector.options).depolorize(vector.schema);

				expect(decoded).toEqual(value);
				expect(encode(decoded, vector.schema, vector.options)).toBe(vector.wire);
				expect(encode(value, vector.schema, vector.options)).toBe(vector.wire);
			}
		);
	});

	describe('invalid', () => {
		test.each(all.filter(vector => !vector.valid).map(vector => [vector.name, vector]))(
			'%s', (_, vector: Vector) => {
				expect(() => new Depolorizer(fromHex(vector.wire), vector.options).depolorize(vector.schema)).toThrow();
			}
		);
	});
});
