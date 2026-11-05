import { Wire, WireType } from '../src';
import { Fuzzer } from './utils/fuzzer';


const fuzzer = new Fuzzer();

describe('Test Wire Type', () => {
	test('Is Null', () => {
		for(let i = 0; i < 1000; i++) {
			const wt = fuzzer.fuzzWire();
			const result = Wire.isNull(wt);

			// Only WIRE_NULL is null. The decoder rejects a reserved wire type.
			expect(result).toBe(wt === WireType.WIRE_NULL);
		}
	});

	test('Is Reserved', () => {
		for(let wt = 0; wt < 16; wt++) {
			expect(Wire.isReserved(wt)).toBe(wt >= 8 && wt <= 12);
		}
	});

	test('Is Compound', () => {
		for(let i = 0; i < 1000; i++) {
			const wt = fuzzer.fuzzWire();
			const result = Wire.isCompound(wt);

			if(wt === WireType.WIRE_PACK || wt === WireType.WIRE_DOC) {
				expect(result).toBe(true);
			} else {
				expect(result).toBe(false);
			}
		}
	});
});
