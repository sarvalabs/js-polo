import { Depolorizer } from '../src/depolorizer';
import { Document, documentEncode } from '../src/document';
import { Raw } from '../src/raw';

describe('Test Document', () => {
	test('Example Document', () => {
		const document = new Document();

		document.setString('name', 'orange');
		document.setInteger('cost', 300);

		const alias = ['tangerine', 'mandarin'];
		const schema = { kind: 'array', fields: { values: { kind: 'string' } } };

		document.setArray('alias', alias, schema);

		console.log(document.document);
		console.log(document.bytes());

		// Output:
		/*
			{
				name: Raw {
					bytes: Uint8Array(7) [
						6, 111, 114, 97,110, 103, 101
					]
				},
				cost: Raw { bytes: Uint8Array(3) [ 3, 1, 44 ] },
				alias: Raw {
					bytes: Uint8Array(22) [
						14, 63, 6, 150, 1, 116,
						97, 110, 103, 101, 114, 105,
						110, 101, 109,  97, 110, 100,
						97, 114, 105, 110
					]
				}
			}
		*/

		/*
			[
				13, 175, 1, 6, 85, 182, 3, 245, 3, 166, 4,
				229, 4, 97, 108, 105, 97, 115, 14, 63, 6, 150,
				1, 116, 97, 110, 103, 101, 114, 105, 110, 101, 109,
				97, 110, 100, 97, 114, 105, 110, 99, 111, 115, 116,
				3, 1, 44, 110, 97, 109, 101, 6, 111, 114,  97,
				110, 103, 101
			]
		*/
	});

	test('Document Encode', () => {
		// Create a Fruit object
		const orange = {
			name: 'orange',
			cost: 300,
			alias: ['tangerine', 'mandarin']
		};

		const schema = {
			kind: 'struct',
			fields: { 
				name: { kind: 'string' },
				cost: { kind: 'integer' },
				alias: { 
					kind: 'array', 
					fields: { 
						values: { kind: 'string' } 
					} 
				}
			}
		};

		// Encode the object into a Document
		const document = documentEncode(orange, schema);

		console.log(document.document);
		console.log(document.bytes());

		// Output:
		/*
			{
				name: Raw {
					bytes: Uint8Array(7) [
						6, 111, 114, 97,110, 103, 101
					]
				},
				cost: Raw { bytes: Uint8Array(3) [ 3, 1, 44 ] },
				alias: Raw {
					bytes: Uint8Array(22) [
						14, 63, 6, 150, 1, 116,
						97, 110, 103, 101, 114, 105,
						110, 101, 109,  97, 110, 100,
						97, 114, 105, 110
					]
				}
			}
		*/

		/*
			[
				13, 175, 1, 6, 85, 182, 3, 245, 3, 166, 4,
				229, 4, 97, 108, 105, 97, 115, 14, 63, 6, 150,
				1, 116, 97, 110, 103, 101, 114, 105, 110, 101, 109,
				97, 110, 100, 97, 114, 105, 110, 99, 111, 115, 116,
				3, 1, 44, 110, 97, 109, 101, 6, 111, 114,  97,
				110, 103, 101
			]
		*/
	});

	test('Decode To Document', () => {
		const wire = new Uint8Array([
			13, 175, 1, 6, 85, 182, 3, 245, 3, 166, 4, 229, 4, 97, 108, 105, 
			97, 115, 14, 63, 6, 150, 1, 116, 97, 110, 103, 101, 114, 105, 110, 
			101, 109, 97, 110, 100, 97, 114, 105, 110, 99, 111, 115, 116,
			3, 1, 44, 110, 97, 109, 101, 6, 111, 114,  97, 110, 103, 101
		]);

		const schema = {
			kind: 'struct',
			fields: { 
				name: { kind: 'string' },
				cost: { kind: 'integer' },
				alias: { 
					kind: 'array', 
					fields: { 
						values: { kind: 'string' } 
					} 
				}
			}
		};

		const document = new Document(wire, schema);

		console.log(document.document);

		// Output:
		// {
		// 	name: Uint8Array(7) [
		// 		6, 111, 114, 97,
		// 	  110, 103, 101
		// 	],
		// 	cost: Uint8Array(3) [ 3, 1, 44 ],
		// 	alias: Uint8Array(22) [
		// 		14,  63,   6, 150,   1, 116,
		// 		97, 110, 103, 101, 114, 105,
		// 	   110, 101, 109,  97, 110, 100,
		// 		97, 114, 105, 110
		// 	 ],
		// }
	});

	test('Decode To Struct', () => {
		const wire = new Uint8Array([
			13, 175, 1, 6, 85, 182, 3, 245, 3, 166, 4, 229, 4, 97, 108, 105, 
			97, 115, 14, 63, 6, 150, 1, 116, 97, 110, 103, 101, 114, 105, 110, 
			101, 109, 97, 110, 100, 97, 114, 105, 110, 99, 111, 115, 116,
			3, 1, 44, 110, 97, 109, 101, 6, 111, 114,  97, 110, 103, 101
		]);

		const schema = {
			kind: 'struct',
			fields: { 
				name: { kind: 'string' },
				cost: { kind: 'integer' },
				alias: { 
					kind: 'array', 
					fields: { 
						values: { kind: 'string' } 
					} 
				}
			}
		};

		const depolorizer = new Depolorizer(wire);

		console.log(depolorizer.depolorize(schema));

		// Output:
		// { name: 'orange', cost: 300, alias: [ 'tangerine', 'mandarin' ] }
	});
});

describe('Test Document Methods', () => {
	test('Bytes', () => {
		const tests = [
			{
				data: {},
				wire: new Uint8Array([
					13, 15
				])
			},
			{
				data: {
					foo: new Raw([6, 1, 0, 1, 0])
				},
				wire: new Uint8Array([
					13, 47, 6, 53, 102, 111, 111, 6, 1, 0, 1, 0
				])
			},
			{
				data: {
					foo: new Raw([3, 1, 0, 1, 0]),
					bar: new Raw([6, 2, 1, 2, 1])
				},
				wire: new Uint8Array([
					13, 111, 6, 53, 134, 1, 181, 1, 98, 97, 114, 6, 2, 1, 2, 1, 
					102, 111, 111, 3, 1, 0, 1, 0
				])
			},
		];

		tests.forEach(test => {
			const doc = new Document();
			doc.document = test.data;
			expect(doc.bytes()).toEqual(test.wire);
		});
	});

	test('Size', () => {
		const tests = [
			{
				data: {},
				size: 0
			},
			{
				data: {
					foo: new Raw([1, 0, 1, 0])
				},
				size: 1
			},
			{
				data: {
					foo: new Raw([1, 0, 1, 0]),
					bar: new Raw()
				},
				size: 2
			},
		];

		tests.forEach(test => {
			const doc = new Document();
			doc.document = test.data;
			expect(doc.size()).toEqual(test.size);
		});
	});

	test('Get Set', () => {
		// Create a Document
		const doc = new Document();

		// Set some objects into the document
		doc.setNull('foo');
		doc.setBool('boo', true);
		doc.setInteger('far', 500000);
		doc.setFloat('tar', 12.5789);
		doc.setString('dar', 'aar');
		doc.setBytes('par', new Uint8Array([2, 1, 2, 1]));
		doc.setArray(
			'sar', 
			['foo', 'boo'], 
			{ 
				kind: 'array', 
				fields: { 
					values: { 
						kind: 'string' 
					} 
				} 
			}
		);
		doc.setMap(
			'var', 
			new Map([['foo', 'bar']]), 
			{ 
				kind: 'map', 
				fields: { 
					keys: {
						kind: 'string' 
					},
					values: { 
						kind: 'string' 
					} 
				} 
			}
		);
		doc.setStruct(
			'zar', 
			{ 
				foo: 'bar' 
			},
			{ 
				kind: 'struct', 
				fields: { 
					foo: {
						kind: 'string'
					}
				} 
			}
		);

		// Attempt to retrieve some unset keys from the document
		// TODO: check for errors
		expect(doc.getString('faa')).toBe('');

		// Attempt to retrieve some set keys from the document and confirm equality
		expect(doc.getNull('foo')).toBe(null);
		expect(doc.getBool('boo')).toBe(true);
		expect(doc.getInteger('far')).toBe(500000);
		expect(doc.getFloat('tar')).toBe(12.5789);
		expect(doc.getString('dar')).toBe('aar');
		expect(doc.getBytes('par')).toEqual(new Uint8Array([2, 1, 2, 1]));
		expect(doc.getArray('sar', { 
			kind: 'array', 
			fields: { 
				values: { 
					kind: 'string' 
				} 
			} 
		})).toEqual(['foo', 'boo']);
		expect(doc.getMap('var', { 
			kind: 'map', 
			fields: { 
				keys: {
					kind: 'string' 
				},
				values: { 
					kind: 'string' 
				} 
			} 
		})).toEqual(new Map([['foo', 'bar']]));
		expect(doc.getStruct('zar', { 
			kind: 'struct', 
			fields: { 
				foo: {
					kind: 'string'
				}
			} 
		})).toEqual({foo: 'bar'});
	});

	test('GetRaw SetRaw', () => {
		const doc = new Document();
		// Set some fields into the document
		doc.setRaw('foo', new Raw([1, 0, 1, 0]));
		doc.setRaw('bar', new Raw([2, 1, 2, 1]));

		// Attempt to retrieve some unset keys from the document
		expect(doc.getRaw('far')).toEqual(new Raw());
		expect(doc.getRaw('boo')).toEqual(new Raw());

		// Attempt to retrieve some set keys from the document
		expect(doc.getRaw('foo')).toEqual(new Raw([1, 0, 1, 0]));
		expect(doc.getRaw('bar')).toEqual(new Raw([2, 1, 2, 1]));
	});
});
