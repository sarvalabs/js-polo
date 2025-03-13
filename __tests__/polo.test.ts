import { Depolorizer, Polorizer, schema, type Schema } from '../src';
import { Fuzzer } from './utils/fuzzer';


const fuzzer = new Fuzzer();

class Assignable {
	constructor(properties) {
		Object.keys(properties).map((key) => {
			this[key] = properties[key];
		});
	}
}

class Test extends Assignable { }

// helper functions
const bigIntToNum = (x: any): unknown => {
	if(typeof x === 'bigint') {
		x = Number(x);
	} else if (typeof x === 'object') {
		if(x instanceof Array){
			x = x.map(val => bigIntToNum(val));
		} else {
			Object.entries(x).forEach(([key, value]) => {
				x[key] = bigIntToNum(value);
			});
		}
	}

	return x;
};

const testObject = (x: unknown, schema: Schema, isBN?: boolean): void => {
	const polorizer = new Polorizer();
	polorizer.polorize(x, schema);
	const wire = polorizer.bytes();
	
	const depolorizer = new Depolorizer(wire);
	const y = depolorizer.depolorize(schema);

	if(isBN) {
		x = bigIntToNum(x);
	}

	expect(y).toEqual(x);
};

describe('Test Bool', () => {
	test('Bool', () => {
		for(let i = 0; i < 1000; i++) {
			const value = fuzzer.fuzz(schema.boolean);
			testObject(value, schema.boolean);
		}
	});

	test('Bool Object', () => {
		for(let i = 0; i < 1000; i++) {
			const struct = schema.struct({
				a: schema.boolean,
				b: schema.boolean
			});
			const value = new Test(fuzzer.fuzz(struct));

			testObject(value, struct);
		}
	});
});

describe('Test integer', () => {
	test('Int', () => {
		for(let i = 0; i < 1000; i++) {
			const value = fuzzer.fuzz(schema.integer);

			testObject(value, schema.integer);
		}
	});
});

describe('Test Word', () => {
	test('String', () => {
		for(let i = 0; i < 1000; i++) {
			const value = fuzzer.fuzz(schema.string);

			testObject(value, schema.string);
		}
	});

	test('Bytes', () => {
		for(let i = 0; i < 1000; i++) {
			const value = fuzzer.fuzz(schema.bytes);

			testObject(value, schema.bytes);
		}
	});

	test('Word Object', () => {
		for(let i = 0; i < 1000; i++) {
			const struct = schema.struct({
				a: schema.string,
				b: schema.string,
				c: schema.bytes,
				d: schema.bytes
			});
			const value = fuzzer.fuzz(struct);
	
			testObject(value, struct);
		}
	});
});

describe('Test float', () => {
	test('Float', () => {
		for(let i = 0; i < 1000; i++) {
			const value = fuzzer.fuzz(schema.float);

			testObject(value, schema.float);
		}
	});

	test('Float Object', () => {
		const struct = schema.struct({
			a: schema.float,
			b: schema.float
		});	

		for(let i = 0; i < 1000; i++) {
			const value = fuzzer.fuzz(struct);
	
			testObject(value, struct);
		}
	});
});

describe('Test Sequence', () => {
	test('Array of String', () => {
		const array = schema.arrayOf(schema.string);
		
		for(let i = 0; i < 1000; i++) {
			const value = fuzzer.fuzz(array);

			testObject(value, array);
		}
	});

	test('Integer Array', () => {
		const array = schema.arrayOf(schema.integer);

		for(let i = 0; i < 1000; i++) {
			const value = fuzzer.fuzz(array);

			testObject(value, array);
		}
	});

	test('Array of Maps', () => {
		const array = schema.arrayOf(schema.map({
			keys: schema.string,
			values: schema.string
		}));

		for(let i = 0; i < 1000; i++) {
			const value = fuzzer.fuzz(array);

			testObject(value, array);
		}
	});

	test('Double array string', () => {
		const array = schema.arrayOf(schema.arrayOf(schema.string));
		for(let i = 0; i < 1000; i++) {
			const value = fuzzer.fuzz(array);

			testObject(value, array);
		}
	});

	test('Double array bytes', () => {
		const array = schema.arrayOf(schema.arrayOf(schema.bytes));
		for(let i = 0; i < 1000; i++) {
			const value = fuzzer.fuzz(array);

			testObject(value, array);
		}
	});

	test('Word object array', () => {
		const array = schema.arrayOf(schema.struct({
			a: schema.string,
			b: schema.string,
			c: schema.bytes,
			d: schema.bytes
		}));

		for(let i = 0; i < 1000; i++) {
			const value = fuzzer.fuzz(array);

			testObject(value, array);
		}
	});

	test('Sequence object', () => {
		const struct = schema.struct({
			a: schema.arrayOf(schema.string),
			b: schema.arrayOf(schema.integer),
			c: schema.arrayOf(schema.map({
				keys: schema.string,
				values: schema.string
			})),
			d: schema.arrayOf(schema.arrayOf(schema.string)),
			e: schema.arrayOf(schema.arrayOf(schema.bytes)),
			f: schema.arrayOf(schema.struct({
				a: schema.string,
				b: schema.string,
				c: schema.bytes,
				d: schema.bytes
			})),
			g: schema.arrayOf(schema.map({
				keys: schema.integer,
				values: schema.boolean
			})),
			h: schema.arrayOf(schema.arrayOf(schema.float))
		});

		for(let i = 0; i < 1000; i++) {
			const value = fuzzer.fuzz(struct);

			testObject(value, struct);
		}
	});
});

describe('Test Map Object', () => {
	test('String Map', () => {
		const map = schema.map({
			keys: schema.string,
			values: schema.string
		});

		for(let i = 0; i < 1000; i++) {
			const value = fuzzer.fuzz(map);
			testObject(value, map);
		}
	});

	test('Integer map', () => {
		const map = schema.map({
			keys: schema.integer,
			values: schema.integer
		});

		for(let i = 0; i < 1000; i++) {
			const value = fuzzer.fuzz(map);
			testObject(value, map);
		}
	});

	test('Array Map', () => {
		const map = schema.map({
			keys: schema.arrayOf(schema.string),
			values: schema.string
		});

		for(let i = 0; i < 1000; i++) {
			const value = fuzzer.fuzz(map);
			testObject(value, map);
		}
	});

	test('Nested Map', () => {
		const map = schema.map({
			keys: schema.string,
			values: schema.map({
				keys: schema.string,
				values: schema.boolean
			})
		});
		for(let i = 0; i < 1000; i++) {
			const value = fuzzer.fuzz(map);
			testObject(value, map);
		}
	});

	test('Bytes Map', () => {
		const map = schema.map({
			keys: schema.bytes,
			values: schema.bytes
		});
		
		for(let i = 0; i < 1000; i++) {
			const value = fuzzer.fuzz(map);
			testObject(value, map);
		}
	});

	test('Map Object', () => {
		const struct = schema.struct({
			a: schema.map({
				keys: schema.boolean,
				values: schema.string
			}),
			b: schema.map({
				keys: schema.float,
				values: schema.integer
			}),
			c: schema.map({
				keys: schema.float,
				values: schema.string
			}),
			d: schema.map({
				keys: schema.arrayOf(schema.float),
				values: schema.string
			}),
			e: schema.map({
				keys: schema.string,
				values: schema.string
			}),
			f: schema.map({
				keys: schema.integer,
				values: schema.string
			}),
			g: schema.map({
				keys: schema.arrayOf(schema.integer),
				values: schema.string
			}),
			h: schema.map({
				keys: schema.arrayOf(schema.integer),
				values: schema.integer
			}),
			i: schema.map({
				keys: schema.arrayOf(schema.float),
				values: schema.integer
			}),
			j: schema.map({
				keys: schema.arrayOf(schema.string),
				values: schema.string
			})
		});
		
		const value = fuzzer.fuzz(struct);
		testObject(value, struct);
	});
});

describe('Test Nested', () => {
	const struct = schema.struct({
		a: schema.struct({
			a: schema.string,
			b: schema.string,
			c: schema.bytes,
			d: schema.bytes
		}),
		b: schema.struct({
			a: schema.integer,
			b: schema.integer,
			c: schema.float,
			d: schema.float
		})
	});
	for(let i = 0; i < 1000; i++) {
		const value = fuzzer.fuzz(struct);
		testObject(value, struct);
	}
});

describe('Test BigInt', () => {
	test('BigInt', () => {
		for(let i = 0; i < 1000; i++) {
			const bnSchema = {
				kind: 'bigint'
			};
			const value = fuzzer.fuzz(bnSchema);
			const schema: Schema = JSON.parse(JSON.stringify(bnSchema).replace(/bigint/g, 'integer'));
			testObject(value, schema, true);
		}
	});

	test('BigInt Object', () => {
		for(let i = 0; i < 1000; i++) {
			const bnSchema = {
				kind: 'struct',
				fields: {
					a: { 
						kind: 'bigint' 
					},
					b: { 
						kind: 'bigint' 
					},
					c: { 
						kind: 'array',
						fields: {
							values: {
								kind: 'bigint'
							}
						}
					}
				}
			};
			const value = fuzzer.fuzz(bnSchema);
			const schema: Schema = JSON.parse(JSON.stringify(bnSchema).replace(/bigint/g, 'integer'));
			testObject(value, schema, true);
		}
	});
});
