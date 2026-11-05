import BN from 'bn.js';
import { Polorizer, Depolorizer, Document } from '../src';
import { Raw } from '../src/raw';

describe('Test Polorizer', () => {
	test('Example Polorizer', () => {
		const orange = {
			name: 'orange',
			cost: 300,
			alias: ['tangerine', 'mandarin']
		};
    
		// Create a new Polorizer
		const polorizer = new Polorizer();
    
		// Encode the Name field as a string
		polorizer.polorizeString(orange.name);
		// Encode the Cost field as an integer
		polorizer.polorizeInteger(orange.cost);
    
    
		// Create a new Polorizer to serialize the Alias field (slice)
		const aliases = new Polorizer();
		// Encode each element in the Alias slice as a string
		orange.alias.forEach((alias) => aliases.polorizeString(alias));
		// Encode the Polorizer containing the alias field contents as 
		// packed data
		polorizer.polorizePacked(aliases);
    
		// Print the serialized bytes in the Polorizer buffer
		console.log(polorizer.bytes());
    
		// Output:
		// [14 79 6 99 142 1 111 114 97 110 103 101 1 44 63 6 150 1 116 97 110 
		// 103 101 114 105 110 101 109 97 110 100 97 114 105 110]
	});


	test('Null', () => {
		const polorizer = new Polorizer();

		expect(polorizer.bytes()).toEqual(new Uint8Array([0]));
		expect(polorizer.packed()).toEqual(new Uint8Array([14, 15]));

		polorizer.polorizeNull();
		expect(polorizer.bytes()).toEqual(new Uint8Array([0]));
		expect(polorizer.packed()).toEqual(new Uint8Array([14, 31, 0]));

		polorizer.polorizeNull();
		expect(polorizer.bytes()).toEqual(new Uint8Array([14, 47, 0, 0]));
		expect(polorizer.packed()).toEqual(new Uint8Array([14, 47, 0, 0]));

		polorizer.polorizeNull();
		expect(polorizer.bytes()).toEqual(new Uint8Array([14, 63, 0, 0, 0]));
		expect(polorizer.packed()).toEqual(new Uint8Array([14, 63, 0, 0, 0]));
	});

	test('Bool', () => {
		const polorizer = new Polorizer();

		polorizer.polorizeBool(true);
		expect(polorizer.bytes()).toEqual(new Uint8Array([2]));
		expect(polorizer.packed()).toEqual(new Uint8Array([14, 31, 2]));

		polorizer.polorizeBool(false);
		expect(polorizer.bytes()).toEqual(new Uint8Array([14, 47, 2, 1]));
		expect(polorizer.packed()).toEqual(new Uint8Array([14, 47, 2, 1]));
	});

	test('String', () => {
		const polorizer = new Polorizer();

		polorizer.polorizeString('foo');
		expect(polorizer.bytes()).toEqual(new Uint8Array([
			6, 102, 111, 111
		]));
		expect(polorizer.packed()).toEqual(new Uint8Array([
			14, 31, 6, 102, 111, 111
		]));

		polorizer.polorizeString('bar');
		expect(polorizer.bytes()).toEqual(new Uint8Array([
			14, 47, 6, 54, 102, 111, 111, 98, 97, 114
		]));
		expect(polorizer.packed()).toEqual(new Uint8Array([
			14, 47, 6, 54, 102, 111, 111, 98, 97, 114
		]));
	});

	test('Bytes', () => {
		const polorizer = new Polorizer();

		polorizer.polorizeBytes(new Uint8Array([1, 1, 1, 1]));
		expect(polorizer.bytes()).toEqual(new Uint8Array([
			6, 1, 1, 1, 1
		]));
		expect(polorizer.packed()).toEqual(new Uint8Array([
			14, 31, 6, 1, 1, 1, 1
		]));

		polorizer.polorizeBytes(new Uint8Array([2, 2, 2, 2]));
		expect(polorizer.bytes()).toEqual(new Uint8Array([
			14, 47, 6, 70, 1, 1, 1, 1, 2, 2, 2, 2
		]));
		expect(polorizer.packed()).toEqual(new Uint8Array([
			14, 47, 6, 70, 1, 1, 1, 1, 2, 2, 2, 2
		]));
	});

	test('Uint', () => {
		const polorizer = new Polorizer();

		polorizer.polorizeInteger(300);
		expect(polorizer.bytes()).toEqual(new Uint8Array([
			3, 1, 44
		]));
		expect(polorizer.packed()).toEqual(new Uint8Array([
			14, 31, 3, 1, 44
		]));

		polorizer.polorizeInteger(250);
		expect(polorizer.bytes()).toEqual(new Uint8Array([
			14, 47, 3, 35, 1, 44, 250
		]));
		expect(polorizer.packed()).toEqual(new Uint8Array([
			14, 47, 3, 35, 1, 44, 250
		]));
	});

	test('Int', () => {
		const polorizer = new Polorizer();

		polorizer.polorizeInteger(300);
		expect(polorizer.bytes()).toEqual(new Uint8Array([
			3, 1, 44
		]));
		expect(polorizer.packed()).toEqual(new Uint8Array([
			14, 31, 3, 1, 44
		]));

		polorizer.polorizeInteger(-250);
		expect(polorizer.bytes()).toEqual(new Uint8Array([
			14, 47, 3, 36, 1, 44, 250
		]));
		expect(polorizer.packed()).toEqual(new Uint8Array([
			14, 47, 3, 36, 1, 44, 250
		]));
	});

	test('Float', () => {
		const polorizer = new Polorizer();

		polorizer.polorizeFloat(123.456);
		expect(polorizer.bytes()).toEqual(new Uint8Array([
			7, 64, 94, 221, 47, 26, 159, 190, 119
		]));
		expect(polorizer.packed()).toEqual(new Uint8Array([
			14, 31, 7, 64, 94, 221, 47, 26, 159, 190, 119
		]));

		polorizer.polorizeFloat(-99.99);
		expect(polorizer.bytes()).toEqual(new Uint8Array([
			14, 63, 7, 135, 1, 64, 94, 221, 47, 26, 159, 190, 119, 192, 
			88, 255, 92, 40, 245, 194, 143
		]));
		expect(polorizer.packed()).toEqual(new Uint8Array([
			14, 63, 7, 135, 1, 64, 94, 221, 47, 26, 159, 190, 119, 192, 88, 
			255, 92, 40, 245, 194, 143
		]));
	});

	test('BigInt', () => {
		const polorizer = new Polorizer();

		polorizer.polorizeInteger(9223372036854775807n);
		expect(polorizer.bytes()).toEqual(new Uint8Array([
			3, 127, 255, 255, 255, 255, 255, 255, 255
		]));
		expect(polorizer.packed()).toEqual(new Uint8Array([
			14, 31, 3, 127, 255, 255, 255, 255, 255, 255, 255
		]));

		polorizer.polorizeInteger(-9223372036854775808n);
		expect(polorizer.bytes()).toEqual(new Uint8Array([
			14, 63, 3, 132, 1, 127, 255, 255, 255, 255, 255, 255, 255, 128, 
			0, 0, 0, 0, 0, 0, 0
		]));
		expect(polorizer.packed()).toEqual(new Uint8Array([
			14, 63, 3, 132, 1, 127, 255, 255, 255, 255, 255, 255, 255, 128, 
			0, 0, 0, 0, 0, 0, 0
		]));
	});

	test('Canonical integers', () => {
		const encode = (value: number | bigint | BN): Uint8Array => {
			const polorizer = new Polorizer();
			polorizer.polorizeInteger(value);
			return polorizer.bytes();
		};

		// A bigint has no leading zero bytes. It encodes like the same number.
		for(const value of [1, 255, 256, 65535, 100000000000, Number.MAX_SAFE_INTEGER]) {
			expect(encode(BigInt(value))).toEqual(encode(value));
			expect(encode(-BigInt(value))).toEqual(encode(-value));
			expect(encode(new BN(value))).toEqual(encode(value));
		}

		expect(encode(0n)).toEqual(new Uint8Array([3]));
		expect(encode(-1n)).toEqual(new Uint8Array([4, 1]));
		expect(encode(100000000000n)).toEqual(new Uint8Array([
			3, 0x17, 0x48, 0x76, 0xe8, 0x00
		]));
		expect(encode(-(2n ** 56n))).toEqual(new Uint8Array([
			4, 1, 0, 0, 0, 0, 0, 0, 0
		]));

		// A value of more than 64 bits uses as many bytes as it needs.
		expect(encode(2n ** 64n)).toEqual(new Uint8Array([
			3, 1, 0, 0, 0, 0, 0, 0, 0, 0
		]));
		expect(encode(2n ** 256n - 1n)).toEqual(new Uint8Array([
			3, ...new Array(32).fill(255)
		]));

		// The decoder returns the value that was encoded.
		for(const value of [1n, 255n, 2n ** 53n + 1n, 2n ** 64n - 1n, -(2n ** 63n)]) {
			const decoded = new Depolorizer(encode(value)).depolorizeInteger();
			expect(BigInt(decoded)).toEqual(value);
		}
	});

	test('Raw', () => {
		const polorizer = new Polorizer();

		polorizer.polorizeRaw(new Raw([6, 98, 111, 111]));
		expect(polorizer.bytes()).toEqual(new Uint8Array([
			5, 6, 98, 111, 111
		]));
		expect(polorizer.packed()).toEqual(new Uint8Array([
			14, 31, 5, 6, 98, 111, 111
		]));

		polorizer.polorizeRaw(new Raw([0]));
		expect(polorizer.bytes()).toEqual(new Uint8Array([
			14, 47, 5, 69, 6, 98, 111, 111, 0
		]));
		expect(polorizer.packed()).toEqual(new Uint8Array([
			14, 47, 5, 69, 6, 98, 111, 111, 0
		]));
	});

	test('Document', () => {
		const doc = new Document();
		doc.setInteger('far', 123);
		doc.setString('foo', 'bar');

		const polorizer = new Polorizer();
		
		polorizer.polorizeDocument(doc.getData());
		expect(polorizer.bytes()).toEqual(new Uint8Array([
			13, 95, 6, 53, 86, 133, 1, 102, 97, 114, 3, 123, 102, 111, 111, 
			6, 98, 97, 114
		]));
		expect(polorizer.packed()).toEqual(new Uint8Array([
			14, 31, 13, 95, 6, 53, 86, 133, 1, 102, 97, 114, 3, 123, 102, 111, 
			111, 6, 98, 97, 114
		]));
	});

	test('Packed', () => {
		const polorizer = new Polorizer();

		polorizer.polorizeRaw(new Raw([6, 98, 111, 111]));

		const another = new Polorizer();

		another.polorizePacked(polorizer);
		expect(another.bytes()).toEqual(new Uint8Array([
			14, 31, 5, 6, 98, 111, 111
		]));
		expect(another.packed()).toEqual(new Uint8Array([
			14, 31, 14, 31, 5, 6, 98, 111, 111
		]));
	});

	test('Inner', () => {
		const polorizer = new Polorizer();

		polorizer.polorizeInteger(5);
		expect(polorizer.bytes()).toEqual(new Uint8Array([
			3, 5
		]));
		expect(polorizer.packed()).toEqual(new Uint8Array([
			14, 31, 3, 5
		]));

		const another = new Polorizer();
		another.polorizeString('foo');

		polorizer.polorizeInner(another);
		expect(polorizer.bytes()).toEqual(new Uint8Array([
			14, 47, 3, 22, 5, 102, 111, 111
		]));
		expect(polorizer.packed()).toEqual(new Uint8Array([
			14, 47, 3, 22, 5, 102, 111, 111
		]));

		another.polorizeInteger(250);
		polorizer.polorizeInner(another);
		expect(polorizer.bytes()).toEqual(new Uint8Array([
			14, 63, 3, 22, 78, 5, 102, 111, 111, 47, 6, 51, 102, 111, 111, 250
		]));
		expect(polorizer.packed()).toEqual(new Uint8Array([
			14, 63, 3, 22, 78, 5, 102, 111, 111, 47, 6, 51, 102, 111, 111, 250
		]));
	});
});

// TODO: Check for null if required
// An asset invoke with funds (go-moi common.AssetActionPayload). go-moi
// decodes the funds into map[AssetID]*big.Int. An asset ID is a 32-byte
// array, so the keys are bytes, in the order of their unsigned byte values.
// The wires are from go-polo (release-v0.5.0, commit bc1c611).
describe('Asset invoke with funds', () => {
	const schema = {
		kind: 'struct',
		fields: {
			asset_id: { kind: 'bytes' },
			callsite: { kind: 'string' },
			calldata: { kind: 'bytes' },
			funds: { kind: 'map', fields: { keys: { kind: 'bytes' }, values: { kind: 'integer' } } }
		}
	};

	const KMOI = '1080fffe4cd973c4eb83cdb8870c0de209736270491b7acc99873da100000000';
	const assetID = (byte20?: number): Uint8Array => {
		const id = Uint8Array.from(Buffer.from(KMOI, 'hex'));
		if(byte20 !== undefined) {
			id[20] = byte20;
		}
		return id;
	};

	const encode = (funds: unknown): string => {
		const polorizer = new Polorizer();
		polorizer.polorize({
			asset_id: assetID(), callsite: 'Transfer', calldata: new Uint8Array([0x0d]), funds
		}, schema);
		return Buffer.from(polorizer.bytes()).toString('hex');
	};

	const head = '0e7f06860486059e05' + KMOI + '5472616e736665720d';

	test('one asset', () => {
		expect(encode(new Map([[assetID(), 5n]]))).toBe(head + '3f068304' + KMOI + '05');
	});

	test('two assets are in the order of their bytes', () => {
		// The key with 0a at byte 20 is first in the Map, but 09 is less than 0a.
		const funds = new Map([[assetID(0x0a), 6n], [assetID(0x09), 5n]]);
		const lo = KMOI.slice(0, 40) + '09' + KMOI.slice(42);
		const hi = KMOI.slice(0, 40) + '0a' + KMOI.slice(42);

		expect(encode(funds)).toBe(head + '7f06830496049308' + lo + '05' + hi + '06');
	});

	test('no funds is a Null, and empty funds is an empty pack', () => {
		expect(encode(undefined)).toBe('0e7f06860486059005' + KMOI + '5472616e736665720d');
		expect(encode(new Map())).toBe(head + '0f');
	});

	test('two keys with the same bytes are an error', () => {
		expect(() => encode(new Map([[assetID(), 5n], [assetID(), 6n]]))).toThrow('two keys have the same value');
	});

	test('a plain object is not a map', () => {
		expect(() => encode({ [KMOI]: 5n })).toThrow('invalid map: expected a Map');
	});

	test('the decoder rejects keys that are not in order', () => {
		const wire = Buffer.from(head + '7f06830496049308' +
			KMOI.slice(0, 40) + '0a' + KMOI.slice(42) + '06' + KMOI.slice(0, 40) + '09' + KMOI.slice(42) + '05', 'hex');
		expect(() => new Depolorizer(wire).depolorize(schema)).toThrow('not in strictly ascending order');
	});
});
