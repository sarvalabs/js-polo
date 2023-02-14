import Benchmark from 'benchmark';
import { Depolorizer } from '../src/depolorizer.js';
import { Polorizer } from '../src/polorizer.js';
import { documentEncode } from '../src/document.js';

const mixedObject = {
    a: "Sins & Virtues",
    b: 567822,
    c: ["pride", "greed", "lust", "gluttony", "envy", "wrath", "sloth"],
    d: new Map([
        ["bravery", "piety"],
        ["friendship", "chastity"]
    ]),
    e: 45.23
};

const schema = {
    kind: 'struct',
    fields: {
        a: {
            kind: 'string'
        },
        b: {
            kind: 'integer'
        },
        c: {
            kind: 'array',
            fields: {
                values: {
                    kind: 'string'
                }
            }
        },
        d: {
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
        e: {
            kind: 'float'
        }
    }
};

(() => {  
    const suite = new Benchmark.Suite;  
    const polorizer = new Polorizer();
    polorizer.polorizeAs(mixedObject, schema)
    const wire = polorizer.bytes();
    
    
    suite.add("Polorize", () => {
        const polorizer = new Polorizer();
        polorizer.polorizeAs(mixedObject, schema);
    }).add("Depolorize", () => {
        const depolorizer = new Depolorizer(wire);
        depolorizer.depolorizeAs(schema);
    }).on("cycle", (event) => {
        console.log(String(event.target));
    }).run({ 'async': true });
})();

(() => {
    const suite = new Benchmark.Suite;
    const doc = documentEncode(mixedObject, schema);
    const docWire = doc.bytes();

    suite.add("Document Encode", () => {
        documentEncode(mixedObject, schema);
    }).add("Decode To Document", () => {
        const deplorizer = new Depolorizer(docWire)
        deplorizer.depolorizeDocument()
    }).add("Decode To Struct", () => {
        const deplorizer = new Depolorizer(docWire)
        deplorizer.depolorizeAs(schema)
    }).on("cycle", (event) => {
        console.log(String(event.target));
    }).run({ 'async': true });
})();
