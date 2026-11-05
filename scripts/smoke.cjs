// Load the CommonJS build through the "exports" map of the package.
const assert = require('assert');
const { Polorizer, Depolorizer } = require('js-polo');

const polorizer = new Polorizer();
polorizer.polorizeString('foo');
const wire = polorizer.bytes();

assert.deepStrictEqual(Array.from(wire), [6, 102, 111, 111]);
assert.strictEqual(new Depolorizer(wire).depolorizeString(), 'foo');
console.log('require(\'js-polo\'): ok');
