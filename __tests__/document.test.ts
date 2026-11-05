import { Depolorizer } from '../src/depolorizer';
import { Polorizer } from '../src/polorizer';
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

		console.log(document.getData());
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

		console.log(document.getData());
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

		const document = new Document(wire);

		expect(document.keys()).toEqual(['alias', 'cost', 'name']);
		expect(document.getString('name')).toBe('orange');
		expect(document.getInteger('cost')).toBe(300);
		expect(document.getArray('alias', schema.fields.alias)).toEqual(['tangerine', 'mandarin']);
		expect(document.bytes()).toEqual(wire);
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

		// A struct accepts a document only with the option docStructs.
		expect(() => new Depolorizer(wire).depolorize(schema)).toThrow('set the option docStructs');

		const depolorizer = new Depolorizer(wire, { docStructs: true });
		expect(depolorizer.depolorize(schema)).toEqual({
			name: 'orange', cost: 300, alias: ['tangerine', 'mandarin']
		});
	});
});

describe('Test Document Methods', () => {
	test('Bytes', () => {
		const tests = [
			{
				data: {},
				schema: {
					kind: 'struct'
				},
				wire: new Uint8Array([
					13, 15
				])
			},
			{
				data: {
					foo: new Uint8Array([1, 0, 1, 0])
				},
				schema: {
					kind: 'struct',
					fields: {
						foo: {
							kind: 'bytes'
						}
					}
				},
				wire: new Uint8Array([
					13, 47, 6, 53, 102, 111, 111, 6, 1, 0, 1, 0
				])
			},
			{
				data: {
					foo: 16777472,
					bar: new Uint8Array([2, 1, 2, 1])
				},
				schema: {
					kind: 'struct',
					fields: {
						foo: {
							kind: 'integer'
						},
						bar: {
							kind: 'bytes'
						}
					}
				},
				wire: new Uint8Array([
					13, 111, 6, 53, 134, 1, 181, 1, 98, 97, 114, 6, 2, 1, 2, 1, 
					102, 111, 111, 3, 1, 0, 1, 0
				])
			},
		];

		tests.forEach(test => {
			const doc = documentEncode(test.data, test.schema);
			expect(doc.bytes()).toEqual(test.wire);
		});
	});

	test('Size', () => {
		const tests = [
			{
				data: {},
				schema: {
					kind: 'struct'
				},
				size: 0
			},
			{
				data: {
					foo: new Uint8Array([1, 0, 1, 0])
				},
				schema: {
					kind: 'struct',
					fields: {
						foo: {
							kind: 'bytes'
						}
					}
				},
				size: 1
			},
			{
				data: {
					foo: new Uint8Array([1, 0, 1, 0]),
					bar: new Uint8Array()
				},
				schema: {
					kind: 'struct',
					fields: {
						foo: {
							kind: 'bytes'
						},
						bar: {
							kind: 'bytes'
						}
					}
				},
				size: 2
			},
		];

		tests.forEach(test => {
			const doc = documentEncode(test.data, test.schema);
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

		// A key that is not in the document gives the zero value of its type
		expect(doc.getString('faa')).toBe('');
		expect(doc.getInteger('faa')).toBe(0);
		expect(doc.getBool('faa')).toBe(false);
		expect(doc.getBytes('faa')).toBe(null);
		expect(doc.getArray('faa', { kind: 'array', fields: { values: { kind: 'string' } } })).toBe(null);
		expect(doc.getStruct('faa', { kind: 'struct', fields: { foo: { kind: 'string' } } })).toEqual({ foo: '' });

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
		expect(doc.getRaw('far')).toBe(null);
		expect(doc.getRaw('boo')).toBe(null);

		// Attempt to retrieve some set keys from the document
		expect(doc.getRaw('foo')).toEqual(new Raw([1, 0, 1, 0]));
		expect(doc.getRaw('bar')).toEqual(new Raw([2, 1, 2, 1]));
	});
});

// Issue #25: encode a list of structs that hold a list of structs.
// js-moi-manifest encoded each struct as a document by hand and changed the
// schema of the struct to `document`. The second item then reached
// polorizeDocument as a plain object. The option docStructs encodes each
// struct as a document, so the schema does not change.
describe('Issue #25: nested structs as documents', () => {
	const inner = { kind: 'struct', fields: { amount: { kind: 'integer' } } };
	const outer = { kind: 'struct', fields: { items: { kind: 'array', fields: { values: inner } } } };
	const schema = { kind: 'struct', fields: { outers: { kind: 'array', fields: { values: outer } } } };
	const documents = { kind: 'array', fields: { values: { kind: 'document' } } };

	const calldata = {
		outers: [
			{ items: [{ amount: 1n }] },
			{ items: [{ amount: 2n }] },
		]
	};

	// The document that js-moi-manifest builds by hand.
	const byHand = (): Document => {
		const outerDocument = (amount: bigint): Document => {
			const doc = new Document();
			doc.setArray('items', [documentEncode({ amount }, inner)], documents);
			return doc;
		};

		const doc = new Document();
		doc.setArray('outers', [outerDocument(1n), outerDocument(2n)], documents);
		return doc;
	};

	test('documentEncode with docStructs gives the same bytes', () => {
		const doc = documentEncode(calldata, schema, { docStructs: true });
		expect(doc.bytes()).toEqual(byHand().bytes());
	});

	test('the Polorizer with docStructs gives the same bytes', () => {
		const polorizer = new Polorizer({ docStructs: true });
		polorizer.polorize(calldata, schema);
		expect(polorizer.bytes()).toEqual(byHand().bytes());
	});

	test('the Depolorizer with docStructs decodes the value', () => {
		const wire = documentEncode(calldata, schema, { docStructs: true }).bytes();
		expect(new Depolorizer(wire, { docStructs: true }).depolorize(schema)).toEqual({
			outers: [
				{ items: [{ amount: 1 }] },
				{ items: [{ amount: 2 }] },
			]
		});
	});

	test('a plain object in place of a document gives a clear error', () => {
		const polorizer = new Polorizer();
		expect(() => polorizer.polorize({ amount: 2n }, { kind: 'document' }))
			.toThrow('invalid document value for key "amount"');
	});
});
