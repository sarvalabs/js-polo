import BN from 'bn.js';
import { Depolorizer, Document, Polorizer, Schema, documentEncode } from '../src';
import { Raw } from '../src/raw';

// These tests use the rules of the section "Canonical Serialization" of
// the POLO Wire Specification. The names C1 to C7 are the names of the
// rules in the specification. All wires are in hexadecimal.

const wire = (hex: string): Uint8Array => Buffer.from(hex.replace(/ /g, ''), 'hex');

const decode = (hex: string, schema: Schema): unknown => {
	return new Depolorizer(wire(hex)).depolorize(schema);
};

const encode = (value: unknown, schema: Schema): string => {
	const polorizer = new Polorizer();
	polorizer.polorize(value, schema);
	return Buffer.from(polorizer.bytes()).toString('hex');
};

// Decodes a wire, encodes the result again, and compares the bytes.
const roundTrip = (hex: string, schema: Schema): void => {
	expect(encode(decode(hex, schema), schema)).toBe(hex.replace(/ /g, ''));
};

const integer: Schema = { kind: 'integer' };
const list: Schema = { kind: 'array', fields: { values: integer } };
const optional = (schema: Schema): Schema => ({ ...schema, optional: true });
const map = (keys: Schema, values: Schema): Schema => ({ kind: 'map', fields: { keys, values } });
const struct = (fields: Record<string, Schema>): Schema => ({ kind: 'struct', fields });

describe('C1: tags are minimal', () => {
	test.each([
		['83 00 05', integer, 'the top-level tag uses 2 bytes for the integer 3'],
		['0e af 80 00 03 13 05 06', list, 'the load tag is not minimal'],
		['0e 3f 83 00 03 05 06 07', list, 'a head tag is not minimal'],
	])('reject %s: %s', (hex, schema) => {
		expect(() => decode(hex, schema)).toThrow('varint is not minimal');
	});

	test.each([
		['83', integer, 'the top-level tag'],
		['0e', list, 'the load tag is missing'],
		['0e 2f 03 93', list, 'the second head tag'],
	])('reject %s: a tag is not complete (%s)', (hex, schema) => {
		expect(() => decode(hex, schema)).toThrow('varint is not complete');
	});
});

describe('C2: the offset of the top-level tag is 0', () => {
	test.each([
		['13 05', integer],
		['80 80 80 80 80 01', { kind: 'string' }],
	])('reject %s', (hex, schema) => {
		expect(() => decode(hex, schema)).toThrow('the offset of the top-level tag is not 0');
	});

	test('reject an empty wire', () => {
		expect(() => new Depolorizer(new Uint8Array())).toThrow('the wire is empty');
	});
});

describe('C6: the pack framing is exact', () => {
	test.each([
		['0e 2f 13 23 00 05', 'the offset of the first element is not 0'],
		['0e 2f 03 13', 'an offset is more than the length of the body'],
		['0e 3f 03 23 13 01 02 03', 'an offset is less than the offset before it'],
		['0e 0f ff', 'a load with no elements has a body'],
		['0e 3f 03', 'the head is longer than the remaining data'],
	])('reject %s: %s', (hex, reason) => {
		expect(() => decode(hex, list)).toThrow(reason);
	});

	test.each([
		['0e 0f', []],
		['0e 2f 03 13 01 02', [1, 2]],
		// The first element has no data, so the second element has the same offset.
		['0e 2f 03 03 05', [0, 5]],
	])('accept %s', (hex, value) => {
		expect(decode(hex, list)).toEqual(value);
		roundTrip(hex, list);
	});

	test('a nested pack is in the body of its parent', () => {
		const lists: Schema = { kind: 'array', fields: { values: list } };
		expect(decode('0e 2f 0e 3e 1f 03 01 0f', lists)).toEqual([[1], []]);
		roundTrip('0e 2f 0e 3e 1f 03 01 0f', lists);
	});
});

describe('undecoded elements', () => {
	test.each([
		['03 00 05'], ['04'], ['0e 2f 03 13'], ['08'], ['08 ff'],
	])('depolorizeInner does not examine the data of %s', (hex) => {
		expect(() => new Depolorizer(wire(hex)).depolorizeInner()).not.toThrow();
	});

	test.each([
		['00 ff'], ['01 ff'], ['02 ff'],
	])('depolorizeInner rejects %s: a Null, False or True has no data', (hex) => {
		expect(() => new Depolorizer(wire(hex)).depolorizeInner()).toThrow('element has data');
	});

	test.each([
		['83 00 05', 'varint is not minimal'],
		['13 05', 'the offset of the top-level tag is not 0'],
	])('depolorizeInner rejects %s: the tag is not canonical', (hex, reason) => {
		expect(() => new Depolorizer(wire(hex)).depolorizeInner()).toThrow(reason);
	});
});

describe('C3: integers are minimal', () => {
	test.each([
		['03 00 05', 'the data starts with a zero byte'],
		['04 00 05', 'the data starts with a zero byte'],
		['04', 'a NegInt has no data (negative zero)'],
	])('reject %s', (hex, reason) => {
		expect(() => decode(hex, integer)).toThrow(reason);
	});

	test.each([
		['03', 0],
		['03 05', 5],
		['03 01 2c', 300],
		['04 01 2c', -300],
		['03 1f ff ff ff ff ff ff', Number.MAX_SAFE_INTEGER],
		['03 20 00 00 00 00 00 00', 2n ** 53n],
		['04 80 00 00 00 00 00 00 00', -(2n ** 63n)],
		['03 ff ff ff ff ff ff ff ff', 2n ** 64n - 1n],
		// The integer kind has no size limit, for example for a MOI u256.
		['03 01 00 00 00 00 00 00 00 00', 2n ** 64n],
		['03 ' + 'ff '.repeat(32).trim(), 2n ** 256n - 1n],
	])('accept %s', (hex, value) => {
		expect(decode(hex, integer)).toBe(value);
		roundTrip(hex, integer);
	});

	test.each([
		[5n, '0305'],
		[-5n, '0405'],
		[new BN(5), '0305'],
		[new BN(-5), '0405'],
		['300', '03012c'],
		[-0, '03'],
	])('encode %s', (value, hex) => {
		expect(encode(value, integer)).toBe(hex);
	});

	test.each([
		[1.5, 'is not a safe integer'],
		[2 ** 53, 'is not a safe integer'],
		[NaN, 'is not a safe integer'],
		['0x10', 'is not a decimal integer'],
		[true, 'expected a number, a bigint or a BN'],
	])('reject the value %s', (value, reason) => {
		expect(() => encode(value, integer)).toThrow(reason);
	});
});

describe('C4: Null, False and True have no data', () => {
	test.each([
		['00 ff', optional(integer), 'a Null element has data'],
		['01 ff', { kind: 'bool' }, 'a False element has data'],
		['02 ff', { kind: 'bool' }, 'a True element has data'],
		['00 ff', { kind: 'null' }, 'a Null element has data'],
	])('reject %s', (hex, schema, reason) => {
		expect(() => decode(hex, schema)).toThrow(reason);
	});
});

describe('wire types', () => {
	test.each([
		['03 05', { kind: 'null' }],
		['03 61', { kind: 'string' }],
		['06 61', { kind: 'raw' }],
		['06 3f f8 00 00 00 00 00 00', { kind: 'float' }],
		// There is no agreement for bytes in a pack.
		['0e 2f 03 13 00 01', { kind: 'bytes' }],
		['08', { kind: 'string' }],
		['0c', integer],
		['0f', { kind: 'bytes' }],
		['0d 0f', list],
		['0e 0f', struct({ a: integer, b: integer }).fields.a],
		['02', integer],
		['06', { kind: 'bool' }],
	])('reject %s', (hex, schema) => {
		expect(() => decode(hex, schema)).toThrow('incompatible wire');
	});
});

describe('C5: floats have exactly 8 bytes', () => {
	const float: Schema = { kind: 'float' };

	test.each([
		['07'],
		['07 3f c0 00 00'],
		['07 3f f8 00 00 00 00 00 00 99'],
	])('reject %s', (hex) => {
		expect(() => decode(hex, float)).toThrow('a binary64 float has 8 bytes');
	});

	test.each([
		[1, '073ff0000000000000'],
		[0, '070000000000000000'],
		[-0, '078000000000000000'],
		[1.5, '073ff8000000000000'],
		[Infinity, '077ff0000000000000'],
	])('encode %s', (value, hex) => {
		expect(encode(value, float)).toBe(hex);
		expect(Object.is(decode(hex, float), value)).toBe(true);
	});

	test.each([
		['07 7f f8 00 00 00 00 00 01'],
		['07 7f f0 00 00 00 00 00 01'],
		['07 ff ff ff ff ff ff ff ff'],
	])('NaN keeps all of its bits: %s', (hex) => {
		expect(Number.isNaN(decode(hex, float))).toBe(true);
		roundTrip(hex, float);
	});
});

describe('C6: a struct pack has one element for each field', () => {
	const fields = struct({ a: integer, b: { kind: 'string' } });

	test.each([
		['0e 3f 03 16 26 05 41 42', 'the pack has 3 elements'],
		['0e 1f 03 05', 'the pack has 1 elements'],
		['0e 0f', 'the pack has 0 elements'],
	])('reject %s', (hex, reason) => {
		expect(() => decode(hex, fields)).toThrow(reason);
	});

	test('a field with a zero value has an element', () => {
		expect(encode({ a: 0, b: '' }, fields)).toBe('0e2f0306');
		expect(decode('0e 2f 03 06', fields)).toEqual({ a: 0, b: '' });
	});

	test('the fields are in the order of the schema', () => {
		expect(encode({ b: 'A', a: 5 }, fields)).toBe('0e2f031605' + '41');
	});

	test('an optional field with no value has a Null element', () => {
		const schema = struct({ a: optional(integer) });
		expect(encode({ a: null }, schema)).toBe('0e1f00');
		expect(encode({}, schema)).toBe('0e1f00');
		expect(decode('0e 1f 00', schema)).toEqual({ a: null });
	});

	test('a struct with no fields is an empty pack', () => {
		expect(encode({}, struct({}))).toBe('0e0f');
		expect(decode('0e 0f', struct({}))).toEqual({});
	});
});

describe('Null values', () => {
	test.each([
		[{ kind: 'bool' }],
		[integer],
		[{ kind: 'float' }],
		[{ kind: 'string' }],
		[struct({ a: integer })],
	])('a Null is not a valid %j', (schema) => {
		expect(() => decode('00', schema)).toThrow('does not accept a Null');
		expect(() => encode(null, schema)).toThrow('cannot be null');
		expect(() => encode(undefined, schema)).toThrow('cannot be null');
	});

	test.each([
		[list],
		[map({ kind: 'string' }, integer)],
		[{ kind: 'bytes' }],
		[{ kind: 'raw' }],
		[{ kind: 'document' }],
		[{ kind: 'null' }],
		[optional(integer)],
		[optional(struct({ a: integer }))],
	])('a Null is "no value" for %j', (schema) => {
		expect(decode('00', schema)).toBe(null);
		expect(encode(null, schema)).toBe('00');
	});

	test('a Null is not the same as an empty value', () => {
		expect(encode([], list)).toBe('0e0f');
		expect(encode(new Map(), map(integer, integer))).toBe('0e0f');
		expect(encode(new Uint8Array(), { kind: 'bytes' })).toBe('06');
		expect(decode('0e 0f', list)).toEqual([]);
		expect(decode('06', { kind: 'bytes' })).toEqual(new Uint8Array());
	});

	test('the rule applies at all levels', () => {
		const hex = '0e 3f 03 10 13 01 03';
		expect(() => decode(hex, list)).toThrow('a integer does not accept a Null');
		expect(decode(hex, { kind: 'array', fields: { values: optional(integer) } })).toEqual([1, null, 3]);
		roundTrip(hex, { kind: 'array', fields: { values: optional(integer) } });

		const values = map({ kind: 'string' }, integer);
		expect(() => decode('0e 2f 06 10 61', values)).toThrow('does not accept a Null');
		expect(decode('0e 2f 06 10 61', map({ kind: 'string' }, optional(integer)))).toEqual(new Map([['a', null]]));
	});

	test('a Raw that holds a Null is not a Null', () => {
		expect(decode('05 00', { kind: 'raw' })).toEqual(new Raw([0]));
		expect(decode('00', { kind: 'raw' })).toBe(null);

		const polorizer = new Polorizer();
		polorizer.polorizeRaw(null);
		expect(Buffer.from(polorizer.bytes()).toString('hex')).toBe('0500');
	});
});

describe('UTF-8 strings', () => {
	const string: Schema = { kind: 'string' };
	const bytes: Schema = { kind: 'bytes' };

	test.each([
		['', ''],
		['61', 'a'],
		['00', '\u0000'],
		['ef bb bf', '\uFEFF'],
		['ef bf bd', '\uFFFD'],
		['f0 9f 98 80', '\u{1F600}'],
		['f4 8f bf bf', '\u{10FFFF}'],
	])('accept 06 %s', (data, value) => {
		expect(decode('06 ' + data, string)).toBe(value);
		roundTrip('06 ' + data, string);
		roundTrip('06 ' + data, bytes);
	});

	test.each([
		['ff'], ['80'],
		['c3'], ['61 ff 62'],
		['c0 80'], ['e0 80 af'], ['f0 80 80 80'],
		['ed a0 80'], ['ed bf bf'],
		['f4 90 80 80'], ['f5 80 80 80'], ['f8 88 80 80 80'],
	])('reject 06 %s as a string, accept it as bytes', (data) => {
		expect(() => decode('06 ' + data, string)).toThrow('invalid UTF-8 string');
		roundTrip('06 ' + data, bytes);
	});

	test.each([
		['\uD800'], ['\uDC00'], ['a\uD800b'], ['\uDC00\uD800'],
	])('reject the string %j on encode', (value) => {
		expect(() => encode(value, string)).toThrow('invalid UTF-8 string');
	});
});

describe('C7: map keys are sorted and unique', () => {
	const strings = map({ kind: 'string' }, integer);
	const floats = map({ kind: 'float' }, integer);
	const integers = map(integer, integer);

	test.each([
		['0e 4f 06 13 26 33 62 02 61 01', strings, 'not in strictly ascending order'],
		['0e 4f 06 13 26 33 61 01 61 02', strings, 'not in strictly ascending order'],
		['0e 3f 07 83 01 7f f8 00 00 00 00 00 00 01', floats, 'a NaN has no order'],
		['0e 7f 07 83 01 97 01 93 02 80 00 00 00 00 00 00 00 01 00 00 00 00 00 00 00 00 01', floats,
			'cannot hold the float key -0'],
		['0e 3f 06 13 26 61 01 62', strings, 'a key has no value'],
		['0e 2f 00 03', map(optional(integer), integer), 'a map key cannot be a Null'],
	])('reject %s', (hex, schema, reason) => {
		expect(() => decode(hex, schema)).toThrow(reason);
	});

	test.each([
		['0e 4f 01 03 12 13 01 01', map({ kind: 'bool' }, integer)],
		['0e 6f 04 13 23 23 33 43 01 01 01 01 01', integers],
		['0e 6f 06 13 26 43 56 63 61 01 61 61 01 62 01', strings],
		['0e 4f 06 23 36 53 00 ff 01 01 00 01', map({ kind: 'bytes' }, integer)],
		['0e 5f 06 33 46 83 01 ef bf bf 01 f0 90 80 80 01', strings],
	])('accept %s', (hex, schema) => {
		roundTrip(hex, schema);
	});

	// The wires from go-polo in issue #28.
	test.each([
		[[9, 10], integers, '0e4f0313233309010a01'],
		[[100, 2], integers, '0e4f0313233302016401'],
		[[-1, -2], integers, '0e4f0413243302010101'],
		[[new BN(10), new BN(9)], integers, '0e4f0313233309010a01'],
		[[10n, 9], integers, '0e4f0313233309010a01'],
		[[10.5, 9.5], floats, '0e7f07830197019302402300000000000001402500000000000001'],
		[['\u{10000}', '\uFFFF'], strings, '0e5f0633468301efbfbf01f090808001'],
	])('encode the keys %p in POLO order', (keys, schema, hex) => {
		expect(encode(new Map(keys.map(key => [key, 1])), schema)).toBe(hex);
	});

	test.each([
		[[5, 5n], integers],
		[[new BN(5), new BN(5)], integers],
		[[new Uint8Array([1]), new Uint8Array([1])], map({ kind: 'bytes' }, integer)],
	])('reject the keys %p: two keys have the same value', (keys, schema) => {
		expect(() => encode(new Map(keys.map(key => [key, 1])), schema)).toThrow('two keys have the same value');
	});

	test('reject a NaN key on encode', () => {
		expect(() => encode(new Map([[NaN, 1]]), floats)).toThrow('a NaN has no order');
	});

	test.each([
		[list], [struct({})], [{ kind: 'raw' }], [{ kind: 'document' }], [{ kind: 'null' }],
	])('reject the key kind %j', (keys) => {
		expect(() => encode(new Map(), map(keys, integer))).toThrow('cannot be a map key');
		expect(() => decode('0e 0f', map(keys, integer))).toThrow('cannot be a map key');
	});
});

describe('documents', () => {
	const document: Schema = { kind: 'document' };
	const hexOf = (bytes: Uint8Array): string => Buffer.from(bytes).toString('hex');

	test.each([
		['0d 4f 06 15 36 45 62 03 01 61 03 01', 'not in strictly ascending order'],
		['0d 4f 06 15 36 45 61 03 01 61 03 02', 'not in strictly ascending order'],
		['0d 2f 06 13 05 01', 'must be a Raw element'],
		['0d 2f 06 10 61', 'must be a Raw element'],
		['0d 2f 06 15 ff 03 01', 'invalid UTF-8 string'],
		['0d 2f 03 15 01', 'a key must be a Word'],
		['0d 1f 06 61', 'a key has no value'],
		['0d 0f ff', 'a load with no elements has a body'],
	])('reject %s', (hex, reason) => {
		expect(() => decode(hex, document)).toThrow(reason);
	});

	test('the decoder does not examine the data of a value', () => {
		const doc = decode('0d 2f 06 15 61 ff', document) as Document;
		expect(doc.getRaw('a')).toEqual(new Raw([0xff]));
		roundTrip('0d 2f 06 15 61 ff', document);
	});

	test('the key __proto__ is an ordinary key', () => {
		const hex = '0d 3f 06 95 01 5f 5f 70 72 6f 74 6f 5f 5f 03 01';
		const doc = decode(hex, document) as Document;
		expect(doc.keys()).toEqual(['__proto__']);
		expect(doc.getInteger('__proto__')).toBe(1);
		roundTrip(hex, document);
	});

	test('a Null document and an empty document are different', () => {
		expect(decode('00', document)).toBe(null);
		expect((decode('0d 0f', document) as Document).size()).toBe(0);
		expect(hexOf(new Document().bytes())).toBe('0d0f');
	});

	test('a null value is a Raw that holds a Null', () => {
		const polorizer = new Polorizer();
		polorizer.polorizeDocument({ a: null });
		expect(hexOf(polorizer.bytes())).toBe('0d2f06156100');
	});

	test('the keys are in the order of their UTF-8 bytes', () => {
		const polorizer = new Polorizer();
		polorizer.polorizeDocument({ '\u{10000}': new Raw([3, 1]), '\uFFFF': new Raw([3, 1]) });
		expect(hexOf(polorizer.bytes())).toBe('0d5f0635569501efbfbf0301f09080800301');
	});

	test('reject a value that is not the wire of a value', () => {
		// This is the error of issue #25: the value 2n is not encoded.
		expect(() => encode({ amount: 2n }, document))
			.toThrow('invalid document value for key "amount"');
	});

	test('the setters write one complete element', () => {
		const array: Schema = { kind: 'array', fields: { values: integer } };
		const fields = struct({ a: integer, b: integer });
		const doc = new Document();

		doc.setArray('a', [5], array);
		doc.setArray('b', [], array);
		doc.setMap('c', new Map(), map(integer, integer));
		doc.setStruct('d', { b: 2, a: 1 }, fields);
		doc.setStruct('e', { a: 1 }, struct({ a: integer }));
		doc.setMap('f', new Map([[10, 1], [9, 1]]), map(integer, integer));

		expect(hexOf(doc.getRaw('a'))).toBe('0e1f0305');
		expect(hexOf(doc.getRaw('b'))).toBe('0e0f');
		expect(hexOf(doc.getRaw('c'))).toBe('0e0f');
		expect(hexOf(doc.getRaw('d'))).toBe('0e2f03130102');
		expect(hexOf(doc.getRaw('e'))).toBe('0e1f0301');
		expect(hexOf(doc.getRaw('f'))).toBe('0e4f0313233309010a01');

		expect(doc.getStruct('d', fields)).toEqual({ a: 1, b: 2 });
		expect(doc.getArray('a', array)).toEqual([5]);
	});

	test('documentEncode writes all fields of the schema', () => {
		const doc = documentEncode({ a: 0 }, struct({ a: integer, b: optional(integer) }));
		// The keys a and b, with the values 03 (the integer 0) and 00 (a Null).
		expect(hexOf(doc.bytes())).toBe('0d4f0615263561036200');
	});
});

describe('agreements: structs as documents', () => {
	const fields = struct({ a: integer });

	test('a struct rejects a document without the option', () => {
		expect(() => decode('0d 2f 06 15 61 03 05', fields)).toThrow('set the option docStructs');
	});

	test('a struct accepts a document and a pack with the option', () => {
		const options = { docStructs: true };
		expect(new Depolorizer(wire('0d 2f 06 15 61 03 05'), options).depolorize(fields)).toEqual({ a: 5 });
		expect(new Depolorizer(wire('0e 1f 03 05'), options).depolorize(fields)).toEqual({ a: 5 });
	});

	test('absent keys give zero values, and unknown keys are ignored', () => {
		const schema = struct({ a: integer, b: { kind: 'string' }, c: optional(integer), d: list, e: fields });
		const value = new Depolorizer(wire('0d 2f 06 15 7a 03 05'), { docStructs: true }).depolorize(schema);
		expect(value).toEqual({ a: 0, b: '', c: null, d: null, e: { a: 0 } });
	});

	test('a Null value follows the Null rule', () => {
		const options = { docStructs: true };
		expect(() => new Depolorizer(wire('0d 2f 06 15 41 00'), options).depolorize(struct({ A: integer })))
			.toThrow('does not accept a Null');
		expect(new Depolorizer(wire('0d 2f 06 15 41 00'), options).depolorize(struct({ A: optional(integer) })))
			.toEqual({ A: null });
	});

	test('the encoder writes all fields in key order', () => {
		const polorizer = new Polorizer({ docStructs: true });
		polorizer.polorize({ B: '', A: 0 }, struct({ B: { kind: 'string' }, A: integer }));
		expect(Buffer.from(polorizer.bytes()).toString('hex')).toBe('0d4f061526354103' + '4206');
	});
});

describe('nesting limit', () => {
	// An array schema that refers to itself. The wire 0e (1f 0e)^n 0f has
	// n + 1 levels of packs.
	const nested: Schema = { kind: 'array', fields: {} };
	nested.fields.values = nested;

	const levels = (n: number): Uint8Array => wire('0e' + '1f0e'.repeat(n - 1) + '0f');

	test('1000 levels decode', () => {
		expect(() => new Depolorizer(levels(1000)).depolorize(nested)).not.toThrow();
	});

	test.each([[1001], [1002], [5001], [10001]])('%i levels are an error', (n) => {
		expect(() => new Depolorizer(levels(n)).depolorize(nested)).toThrow('more than 1000 levels');
	});

	test('the option maxDepth sets the limit', () => {
		expect(() => new Depolorizer(levels(3), { maxDepth: 3 }).depolorize(nested)).not.toThrow();
		expect(() => new Depolorizer(levels(4), { maxDepth: 3 }).depolorize(nested)).toThrow('more than 3 levels');
		expect(() => new Depolorizer(levels(1500), { maxDepth: 0 }).depolorize(nested)).not.toThrow();
	});

	test('documents and their values count as levels', () => {
		// A document with the key "a". Its value is a document with the key "a", and so on.
		let hex = '0d0f';
		for(let i = 0; i < 4; i++) {
			const value = Buffer.from(hex, 'hex');
			const doc = new Document();
			doc.setRaw('a', value);
			hex = Buffer.from(doc.bytes()).toString('hex');
		}

		const schema: Schema = { kind: 'struct', fields: {} };
		schema.fields.a = optional(schema);

		expect(() => new Depolorizer(wire(hex), { docStructs: true, maxDepth: 5 }).depolorize(schema)).not.toThrow();
		expect(() => new Depolorizer(wire(hex), { docStructs: true, maxDepth: 4 }).depolorize(schema)).toThrow('more than 4 levels');
	});
});
