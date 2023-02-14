import { Wire, WireType } from '../src';
import { Fuzzer } from './utils/fuzzer';


const fuzzer = new Fuzzer();

describe('Test Wire Type', () => {
	test('Is Null', () => {
		for(let i = 0; i < 1000; i++) {
			const wt = fuzzer.fuzzWire();
			const result = Wire.isNull(wt);

			switch(true) {
			case wt > 15 || wt === 0 || (wt >= 8 && wt <= 12):
				expect(result).toBe(true);
				break;
			default:
				expect(result).toBe(false);
				break;
			}
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
