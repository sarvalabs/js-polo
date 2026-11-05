// Load the ES module build through the "exports" map of the package.
import assert from 'assert';
import { Polorizer, Depolorizer } from 'js-polo';

const polorizer = new Polorizer();
polorizer.polorizeString('foo');
const wire = polorizer.bytes();

assert.deepStrictEqual(Array.from(wire), [6, 102, 111, 111]);
assert.strictEqual(new Depolorizer(wire).depolorizeString(), 'foo');
console.log('import \'js-polo\': ok');
