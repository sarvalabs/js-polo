import { Depolorizer, Polorizer } from '../src';
import { Schema } from '../types/schema';
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

const testObject = (x: any, schema: Schema, isBN?: boolean): void => {
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
			const schema: Schema = {
				kind: 'bool'
			};
			const value = fuzzer.fuzz(schema);
			testObject(value, schema);
		}
	});

	test('Bool Object', () => {
		for(let i = 0; i < 1000; i++) {
			const schema: Schema = {
				kind: 'struct',
				fields: {
					a: {
						kind: 'bool'
					},
					b: {
						kind: 'bool'
					}
				}
			};

			const value = new Test(fuzzer.fuzz(schema));

			testObject(value, schema);
		}
	});
});

describe('Test integer', () => {
	test('Int', () => {
		for(let i = 0; i < 1000; i++) {
			const schema: Schema = {
				kind: 'integer'
			};
			const value = fuzzer.fuzz(schema);

			testObject(value, schema);
		}
	});
});

describe('Test Word', () => {
	test('String', () => {
		for(let i = 0; i < 1000; i++) {
			const schema: Schema = {
				kind: 'string'
			};
			const value = fuzzer.fuzz(schema);

			testObject(value, schema);
		}
	});

	test('Bytes', () => {
		for(let i = 0; i < 1000; i++) {
			const schema: Schema = {
				kind: 'bytes'
			};
			const value = fuzzer.fuzz(schema);

			testObject(value, schema);
		}
	});

	test('Word Object', () => {
		for(let i = 0; i < 1000; i++) {
			const schema: Schema = {
				kind: 'struct',
				fields: {
					a: { kind: 'string' },
					b: { kind: 'string' },
					c: { kind: 'bytes' },
					d: { kind: 'bytes' }
				}
			};
			const value = fuzzer.fuzz(schema);
	
			testObject(value, schema);
		}
	});
});

describe('Test float', () => {
	test('Float', () => {
		for(let i = 0; i < 1000; i++) {
			const schema: Schema = {
				kind: 'float'
			};
			const value = fuzzer.fuzz(schema);

			testObject(value, schema);
		}
	});

	test('Float Object', () => {
		for(let i = 0; i < 1000; i++) {	
			const schema: Schema = {
				kind: 'struct',
				fields: {
					a: { kind: 'float' },
					b: { kind: 'float' },
				}
			};
			const value = fuzzer.fuzz(schema);
	
			testObject(value, schema);
		}
	});
});

describe('Test Sequence', () => {
	test('Array of String', () => {
		for(let i = 0; i < 1000; i++) {
			const schema: Schema = {
				kind: 'array',
				fields: {
					values: {
						kind: 'string'
					}
				}
			};
			const value = fuzzer.fuzz(schema);

			testObject(value, schema);
		}
	});

	test('Integer Array', () => {
		for(let i = 0; i < 1000; i++) {
			const schema: Schema = {
				kind: 'array',
				fields: {
					'values': {
						kind: 'integer'
					}
				}
			};
			const value = fuzzer.fuzz(schema);

			testObject(value, schema);
		}
	});

	test('Array of Maps', () => {
		for(let i = 0; i < 1000; i++) {
			const schema: Schema = {
				kind: 'array',
				fields: {
					values: {
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
				}
			};
			const value = fuzzer.fuzz(schema);

			testObject(value, schema);
		}
	});

	test('Double array string', () => {
		for(let i = 0; i < 1000; i++) {
			const schema: Schema = {
				kind: 'array',
				fields: {
					values: {
						kind: 'array',
						fields: {
							values: {
								kind: 'string'
							}
						}
					}
				}
			};
			const value = fuzzer.fuzz(schema);

			testObject(value, schema);
		}
	});

	test('Double array bytes', () => {
		for(let i = 0; i < 1000; i++) {
			const schema: Schema = {
				kind: 'array',
				fields: {
					values: {
						kind: 'array',
						fields: {
							values: {
								kind: 'bytes'
							}
						}
					}
				}
			};
			const value = fuzzer.fuzz(schema);

			testObject(value, schema);
		}
	});

	test('Word object array', () => {
		for(let i = 0; i < 1000; i++) {
			const schema: Schema = {
				kind: 'array',
				fields: {
					values: {
						kind: 'struct',
						fields: {
							a: { kind: 'string' },
							b: { kind: 'string' },
							c: { kind: 'bytes' },
							d: { kind: 'bytes' }
						}
					}
				}
			};
			const value = fuzzer.fuzz(schema);

			testObject(value, schema);
		}
	});

	test('Sequence object', () => {
		for(let i = 0; i < 1000; i++) {
			const schema: Schema = {
				kind: 'struct',
				fields: {
					a: { 
						kind: 'array',
						fields: {
							values: {
								kind: 'string'
							}
						}
					},
					b: { 
						kind: 'array',
						fields: {
							values: {
								kind: 'integer'
							}
						}
					},
					c: {
						kind: 'array',
						fields: {
							values: {
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
						}
					},
					d: {
						kind: 'array',
						fields: {
							values: {
								kind: 'array',
								fields: {
									values: {
										kind: 'string'
									}
								}
							}
						}
					},
					e: {
						kind: 'array',
						fields: {
							values: {
								kind: 'array',
								fields: {
									values: {
										kind: 'bytes'
									}
								}
							}
						}
					},
					f: {
						kind: 'array',
						fields: {
							values: {
								kind: 'struct',
								fields: {
									a: { kind: 'string' },
									b: { kind: 'string' },
									c: { kind: 'bytes' },
									d: { kind: 'bytes' }
								}
							}
						}
					},
					g: {
						kind: 'array',
						fields: {
							values: {
								kind: 'map',
								fields: {
									keys: { kind: 'integer' },
									values: { kind: 'bool' }
								}
							}
						}
					},
					h: {
						kind: 'array',
						fields: {
							values: {
								kind: 'array',
								fields: {
									values: { kind: 'float' }
								}
							}
						}
					}
				}
			};
			const value = fuzzer.fuzz(schema);

			testObject(value, schema);
		}
	});
});

describe('Test Map Object', () => {
	test('String Map', () => {
		for(let i = 0; i < 1000; i++) {
			const schema: Schema = {
				kind: 'map',
				fields: {
					keys: {
						kind: 'bool'
					},
					values: {
						kind: 'string'
					}
				}
			};
			const value = fuzzer.fuzz(schema);
			testObject(value, schema);
		}
	});

	test('Integer map', () => {
		for(let i = 0; i < 1000; i++) {
			const schema: Schema = {
				kind: 'map',
				fields: {
					keys: {
						kind: 'integer'
					},
					values: {
						kind: 'float'
					}
				}
			};
			const value = fuzzer.fuzz(schema);
			testObject(value, schema);
		}
	});

	test('Array Map', () => {
		for(let i = 0; i < 1000; i++) {
			const schema: Schema = {
				kind: 'map',
				fields: {
					keys: {
						kind: 'array',
						fields: {
							values: {
								kind: 'string'
							}
						}
					},
					values: {
						kind: 'string'
					}
				}
			};
			const value = fuzzer.fuzz(schema);
			testObject(value, schema);
		}
	});

	test('Double Map', () => {
		for(let i = 0; i < 1000; i++) {
			const schema: Schema = {
				kind: 'map',
				fields: {
					keys: {
						kind: 'string',
					},
					values: {
						kind: 'map',
						fields: {
							keys: {
								kind: 'string'
							},
							values: {
								kind: 'bool'
							}
						}
					}
				}
			};
			const value = fuzzer.fuzz(schema);
			testObject(value, schema);
		}
	});

	test('Bytes Map', () => {
		for(let i = 0; i < 1000; i++) {
			const schema: Schema = {
				kind: 'map',
				fields: {
					keys: {
						kind: 'bytes',
					},
					values: {
						kind: 'bytes',
					}
				}
			};
			const value = fuzzer.fuzz(schema);
			testObject(value, schema);
		}
	});

	test('Map Object', () => {
		const schema: Schema = {
			kind: 'struct',
			fields: {
				a: {
					kind: 'map',
					fields: {
						keys: {
							kind: 'bool'
						},
						values: {
							kind: 'string'
						}
					}
				},
				b: {
					kind: 'map',
					fields: {
						keys: {
							kind: 'float'
						},
						values: {
							kind: 'integer'
						}
					}	
				},
				c: {
					kind: 'float',
					fields: {
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
				},
				d: {
					kind: 'integer',
					fields: {
						kind: 'array',
						fields: {
							values: {
								kind: 'string'
							}
						}
					}
				},
				e: {
					kind: 'map',
					fields: {
						keys: {
							kind: 'string'
						},
						values: {
							kind: 'string'
						}
					}
				},
				f: {
					kind: 'map',
					fields: {
						keys: {
							kind: 'integer'
						},
						values: {
							kind: 'string'
						}
					}
				},
				g: {
					kind: 'map',
					fields: {
						keys: {
							kind: 'array',
							fields: {
								values: {
									kind: 'integer'
								}
							}
						},
						values: {
							kind: 'string'
						}
					}
				},
				h: {
					kind: 'map',
					fields: {
						keys: {
							kind: 'array',
							fields: {
								values: {
									kind: 'integer'
								}
							}
						},
						values: {
							kind: 'integer'
						}
					}
				},
				i: {
					kind: 'map',
					fields: {
						keys: {
							kind: 'array',
							fields: {
								values: {
									kind: 'float'
								}
							}
						},
						values: {
							kind: 'integer'
						}
					}
				},
				j: {
					kind: 'map',
					fields: {
						keys: {
							kind: 'array',
							fields: {
								values: {
									kind: 'string'
								}
							}
						},
						values: {
							kind: 'string'
						}
					}
				}
			}
		};
		const value = fuzzer.fuzz(schema);
		testObject(value, schema);
	});
});

describe('Test Nested', () => {
	for(let i = 0; i < 1000; i++) {
		const schema: Schema = {
			kind: 'struct',
			fields: {
				a: {
					kind: 'struct',
					fields: {
						a: { kind: 'string' },
						b: { kind: 'string' },
						c: { kind: 'bytes' },
						d: { kind: 'bytes' }
					}
				},
				b: {
					kind: 'struct',
					fields: {
						a: { kind: 'integer' },
						b: { kind: 'integer' },
						c: { kind: 'float' },
						d: { kind: 'float' }
					}
				}
			}
		};
		const value = fuzzer.fuzz(schema);
		testObject(value, schema);
	}
});

describe('Test BigInt', () => {
	test('BigInt', () => {
		for(let i = 0; i < 1000; i++) {
			let schema: Schema = {
				kind: 'bigint'
			};
			const value = fuzzer.fuzz(schema);
			schema = JSON.parse(JSON.stringify(schema).replace(/bigint/g, 'integer'));
			testObject(value, schema, true);
		}
	});

	test('BigInt Object', () => {
		for(let i = 0; i < 1000; i++) {
			let schema: Schema = {
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
			const value = fuzzer.fuzz(schema);
			schema = JSON.parse(JSON.stringify(schema).replace(/bigint/g, 'integer'));
			testObject(value, schema, true);
		}
	});
});
