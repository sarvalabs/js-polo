import Benchmark from 'benchmark';
import { Depolorizer, documentEncode, Polorizer, schema, type Schema } from '../src';

const mixedObject = {
	a: 'Sins & Virtues',
	b: 567822,
	c: ['pride', 'greed', 'lust', 'gluttony', 'envy', 'wrath', 'sloth'],
	d: new Map([
		['bravery', 'piety'],
		['friendship', 'chastity']
	]),
	e: 45.23
};

const structSchema: Schema = schema.struct({
	a: schema.string,
	b: schema.integer,
	c: schema.arrayOf(schema.string),
	d: schema.map({ keys: schema.string, values: schema.string }),
	e: schema.float
});

(():void => {  
	const suite = new Benchmark.Suite;  
	const polorizer = new Polorizer();
	polorizer.polorize(mixedObject, structSchema);
	const wire = polorizer.bytes();
    
    
	suite.add('Polorize', () => {
		const polorizer = new Polorizer();
		polorizer.polorize(mixedObject, structSchema);
	}).add('Depolorize', () => {
		const depolorizer = new Depolorizer(wire);
		depolorizer.depolorize(structSchema);
	}).on('cycle', (event) => {
		console.log(String(event.target));
	}).run({ 'async': true });
})();

(():void => {
	const suite = new Benchmark.Suite;
	const doc = documentEncode(mixedObject, structSchema);
	const docWire = doc.bytes();

	suite.add('Document Encode', () => {
		documentEncode(mixedObject, structSchema);
	}).add('Decode To Document', () => {
		const deplorizer = new Depolorizer(docWire);
		deplorizer.depolorizeDocument();
	}).add('Decode To Struct', () => {
		const deplorizer = new Depolorizer(docWire);
		deplorizer.depolorize(structSchema);
	}).on('cycle', (event) => {
		console.log(String(event.target));
	}).run({ 'async': true });
})();
