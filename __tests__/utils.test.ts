import { Polorizer } from '../src';

describe('Testing Polorizer methods', () => {
	const polorizer = new Polorizer();

	test('polorizeNull', () => {
		expect(polorizer.polorizeNull(null).length).toBe(1);
		// Checking the wire type
		expect(polorizer.polorizeNull(null)[0]).toBe(0);
		expect(polorizer.polorizeNull(null)).toEqual([0]);
	});

	test('polorizeBool', () => {
		expect(polorizer.polorizeBool(false).length).toBe(1);
		expect(polorizer.polorizeBool(true).length).toBe(1);
		// Checking the wire type
		expect(polorizer.polorizeBool(false)[0]).toBe(1);
		expect(polorizer.polorizeBool(true)[0]).toBe(2);
		expect(polorizer.polorizeBool(false)).toEqual([1]);
		expect(polorizer.polorizeBool(true)).toEqual([2]);
	});

	test('polorizeString', () => {
		expect(polorizer.polorizeString('Jack').length).toBe(5);
		// Checking the wire type
		expect(polorizer.polorizeString('Jack')[0]).toBe(6);
		expect(polorizer.polorizeString('Jack')).toEqual([6, 74, 97, 99, 107]);
	});

	test('polorizeUInt8', () => {
		expect(polorizer.polorizeUInt8(200).length).toBe(2);
		// Checking the wire type
		expect(polorizer.polorizeUInt8(200)[0]).toBe(3);
		expect(polorizer.polorizeUInt8(200)).toEqual([3, 200]);
		expect(() => polorizer.polorizeUInt8(-1)).toThrowError('error');
		expect(() => polorizer.polorizeUInt8(256)).toThrowError('error');
	});

	test('polorizeUInt16', () => {
		expect(polorizer.polorizeUInt16(1025).length).toBe(3);
		// Checking the wire type
		expect(polorizer.polorizeUInt16(1025)[0]).toBe(3);
		expect(polorizer.polorizeUInt16(1025)).toEqual([3, 4, 1]);
		expect(() => polorizer.polorizeUInt16(-1)).toThrowError('error');
		expect(() => polorizer.polorizeUInt16(65538)).toThrowError('error');
	});

	test('polorizeUInt32', () => {
		expect(polorizer.polorizeUInt32(75535).length).toBe(4);
		// Checking the wire type
		expect(polorizer.polorizeUInt32(75535)[0]).toBe(3);
		expect(polorizer.polorizeUInt32(75535)).toEqual([3, 1, 39, 15]);
		expect(() => polorizer.polorizeUInt32(-1)).toThrowError('error');
		expect(() => polorizer.polorizeUInt32(5294967295)).toThrowError('error');
	});

	test('polorizeUInt64', () => {
		expect(polorizer.polorizeUInt64(5294967295).length).toBe(6);
		// Checking the wire type
		expect(polorizer.polorizeUInt64(5294967295)[0]).toBe(3);
		expect(polorizer.polorizeUInt64(5294967295)).toEqual([3, 1, 59, 154, 201, 255]);
		expect(() => polorizer.polorizeUInt64(-1)).toThrowError('error');
		expect(() => polorizer.polorizeUInt64(Number.MAX_SAFE_INTEGER + 1)).toThrowError('error');
		expect(() => polorizer.polorizeUInt64(3.5)).toThrowError('error');
	});

	test('polorizeInt8', () => {
		expect(polorizer.polorizeInt8(-5).length).toBe(2);
		// Checking the wire type
		expect(polorizer.polorizeInt8(-5)[0]).toBe(4);
		expect(polorizer.polorizeInt8(-5)).toEqual([4, 5]);
		expect(() => polorizer.polorizeInt8(-129)).toThrowError('error');
		expect(() => polorizer.polorizeInt8(130)).toThrowError('error');
		expect(() => polorizer.polorizeInt8(2.1)).toThrowError('error');
	});

	test('polorizeInt16', () => {
		expect(polorizer.polorizeInt16(400).length).toBe(3);
		// Checking the wire type
		expect(polorizer.polorizeInt16(400)[0]).toBe(3);
		expect(polorizer.polorizeInt16(400)).toEqual([3, 1, 144]);
		expect(() => polorizer.polorizeInt16(-32769)).toThrowError('error');
		expect(() => polorizer.polorizeInt16(32777)).toThrowError('error');
	});

	test('polorizeInt32', () => {
		expect(polorizer.polorizeInt32(-5).length).toBe(2);
		// Checking the wire type
		expect(polorizer.polorizeInt32(-5)[0]).toBe(4);
		expect(polorizer.polorizeInt32(-5)).toEqual([4, 5]);
		expect(() => polorizer.polorizeInt32(-2147483649)).toThrowError('error');
		expect(() => polorizer.polorizeInt32(2147483648)).toThrowError('error');
		expect(() => polorizer.polorizeInt32(NaN)).toThrowError('error');
	});

	test('polorizeInt64', () => {
		expect(polorizer.polorizeInt64(500000).length).toBe(4);
		// Checking the wire type
		expect(polorizer.polorizeInt64(500000)[0]).toBe(3);
		expect(polorizer.polorizeInt64(500000)).toEqual([3, 7, 161, 32]);
		expect(() => polorizer.polorizeInt64(-(Number.MAX_SAFE_INTEGER + 5))).toThrowError('error');
		expect(() => polorizer.polorizeInt64((Number.MAX_SAFE_INTEGER + 5))).toThrowError('error');
	});


	test('polorizeFloat64', () => {
		expect(polorizer.polorizeFloat64(5.6).length).toBe(9);
		// Checking the wire type
		expect(polorizer.polorizeFloat64(5.6)[0]).toBe(7);
		expect(polorizer.polorizeFloat64(5.6)).toEqual([7, 64, 22, 102, 102, 102, 102, 102, 102]);
		expect(() => polorizer.polorizeFloat64(5)).toThrowError('error');
		expect(() => polorizer.polorizeFloat64(-5)).toThrowError('error');
	});

	test('polorizeBigInt', () => {
		expect(polorizer.polorizeBigInt(BigInt('5555')).length).toBe(3);
		// Checking the wire type
		expect(polorizer.polorizeBigInt(BigInt('5555'))[0]).toBe(5);
		expect(polorizer.polorizeBigInt(BigInt('5555'))).toEqual([5, 21, 179]);
		expect(() => polorizer.polorizeBigInt(9223372036854775817n)).toThrowError('error');
	});
});
