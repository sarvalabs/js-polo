import ByteReader from '../src/bytereader';
import Varint from '../src/varint';
import { Fuzzer } from './utils/fuzzer';

const fuzzer = new Fuzzer();

describe('varint size', () => {
	test('size', () => {
		for(let i = 0; i < 1000; i++) {
			const v = Number(fuzzer.fuzz({kind: 'uint64', fields: {}}));
			let expected = 0;
			switch(true) {
			case v < Math.pow(2, 7):
				expected = 1;
				break;
			case v < Math.pow(2, 14):
				expected = 2;
				break;
			case v < Math.pow(2, 21):
				expected = 3;
				break;
			case v < Math.pow(2, 28):
				expected = 4;
				break;
			case v < Math.pow(2, 35):
				expected = 5;
				break;
			case v < Math.pow(2, 42):
				expected = 6;
				break;
			case v < Math.pow(2, 49):
				expected = 7;
				break;
			case v < Math.pow(2, 56):
				expected = 8;
				break;
			case v < Math.pow(2, 63):
				expected = 9;
				break;
			default:
				expected = 10;
				break;
			}

			expect(Varint.size(v)).toBe(expected);
		}
	});
});

describe('append', () => {
	it('appends 0 to a Uint8Array', () => {
		const result = Varint.append(new Uint8Array([]), 0);
		expect(result).toEqual(new Uint8Array([0]));
	});

	it('appends a number to a Uint8Array', () => {
		let result = Varint.append(new Uint8Array([]), 6);
		expect(result).toEqual(new Uint8Array([6]));

		result = Varint.append(new Uint8Array([]), 976);
		expect(result).toEqual(new Uint8Array([208, 7]));

		result = Varint.append(new Uint8Array([]), 1792);
		expect(result).toEqual(new Uint8Array([128, 14]));

		result = Varint.append(new Uint8Array([]), 51200);
		expect(result).toEqual(new Uint8Array([128, 144, 3]));

		result = Varint.append(new Uint8Array([]), 229376);
		expect(result).toEqual(new Uint8Array([128, 128, 14]));

		result = Varint.append(new Uint8Array([]), 637534208);
		expect(result).toEqual(new Uint8Array([128, 128, 128, 176, 2]));

		result = Varint.append(new Uint8Array([]), 435406604599296);
		expect(result).toEqual(new Uint8Array([
			128, 128, 128, 128, 128, 128, 99
		]));

		result = Varint.append(new Uint8Array([]), Number.MAX_SAFE_INTEGER);
		expect(result).toEqual(new Uint8Array([
			255, 255, 255, 255, 255, 255, 255, 15
		]));
	});

	it('appends a big number to a Uint8Array', () => {
		let result = Varint.append(new Uint8Array([]), 328762772798046208n);
		expect(result).toEqual(new Uint8Array([
			128, 128, 128, 128, 128, 128, 128, 200, 4
		]));

		result = Varint.append(new Uint8Array([]), 13835058055282163712n);
		expect(result).toEqual(new Uint8Array([
			128, 128, 128, 128, 128, 128, 128, 128, 192, 1
		]));
	});
});

describe('consume varint', () => {
	test('consume', () => {
		const tests = [
			{
				input: new Uint8Array([0]),
				value: 0,
				consumed: 1
			},
			{
				input: new Uint8Array([1]),
				value: 1,
				consumed: 1
			},
			{
				input: new Uint8Array([127]),
				value: 127,
				consumed: 1
			},
			{
				input: new Uint8Array([128, 1]),
				value: 128,
				consumed: 2
			},
			{
				input: new Uint8Array([128, 2]),
				value: 256,
				consumed: 2
			},
			{
				input: new Uint8Array([140, 204, 239, 5]),
				value: 12314124,
				consumed: 4
			},
			{
				input: new Uint8Array([129]),
				value: 1,
				consumed: 2
			},
			// value: 127, consumed: 10
			{
				input: new Uint8Array([
					255, 128, 128, 128, 128, 128, 128, 128, 128, 127
				]),
				expectedErr: new Error('varint terminated prematurely')
			},
			// value: 0, consumed: 11
			{
				input: new Uint8Array([
					128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 127
				]),
				expectedErr: new Error('varint terminated prematurely')
			},
		];

		tests.forEach(test => {
			const reader = new ByteReader(Buffer.from(test.input));
			if (test.expectedErr) {
				expect(() => Varint.consume(reader)).toThrow(test.expectedErr);
			} else {
				const [tag, consumed] = Varint.consume(reader);
				expect(tag).toBe(test.value);
				expect(consumed).toBe(test.consumed);
			}
		});
	});
});