![image](https://moi-polo.s3.amazonaws.com/banner.png)

[latestrelease]: https://github.com/sarvalabs/js-polo/releases/latest
[issueslink]: https://github.com/sarvalabs/js-polo/issues
[pullslink]: https://github.com/sarvalabs/js-polo/pulls
[pkgdocs]: https://docs.moi.technology/docs/build/packages/js-polo

[![docs](https://img.shields.io/badge/npm-documentation-red?style=for-the-badge)][pkgdocs]
[![npm version](https://img.shields.io/npm/v/js-polo.svg?style=for-the-badge)](https://npmjs.com/js-polo)
![license](https://img.shields.io/badge/license-MIT%2FApache--2.0-informational?style=for-the-badge)

[![latest tag](https://img.shields.io/github/v/tag/sarvalabs/js-polo?color=blue&label=latest%20tag&sort=semver&style=for-the-badge)][latestrelease]
[![issue count](https://img.shields.io/github/issues/sarvalabs/js-polo?style=for-the-badge&color=yellow)][issueslink]
[![pulls count](https://img.shields.io/github/issues-pr/sarvalabs/js-polo?style=for-the-badge&color=brightgreen)][pullslink]
![ci status](https://img.shields.io/github/actions/workflow/status/sarvalabs/js-polo/ci.yml?label=ci&style=for-the-badge)


# js-polo

**js-polo** is a JS/TS implementation of the POLO encoding and object serialization scheme. [**POLO**](https://github.com/sarvalabs/polo) stands for Prefix Ordered Lookup Offsets.

It is intended for use in projects that prioritize deterministic serialization, minimal wire sizes and serialization safety. POLO follows a very strict specification that is optimized for partial decoding and differential messaging.

js-polo follows the [POLO Wire Specification](https://app.notion.com/p/sarvalabs/POLO-Wire-Specification-3bfe7e3108eb83b7847a81015d7e0d35) v0.5.0. The reference implementation is [go-polo](https://github.com/sarvalabs/go-polo) v0.5.0. The tests of js-polo compare its output with go-polo (refer to [Canonical Encoding](#canonical-encoding)).

## Installation
Install the latest [release](https://github.com/sarvalabs/js-polo/releases) using the following command.

```sh
npm install js-polo
```

The package has a CommonJS build and an ES module build. Node and bundlers select the correct build.

```javascript
// ES modules
import { Polorizer, Depolorizer } from 'js-polo';

// CommonJS
const { Polorizer, Depolorizer } = require('js-polo');
```

## Features
### Deterministic Serialization
POLO's strict specification is intended to create the same serialized wire for an object regardless of implementation. This is critical for cryptographic security with operations such as hashing which is used to guarantee data consistency and tamper proofing.

### High Wire Efficiency
POLO has a highly optimized wire format allows messages to be relatively small, even surpassing [Protocol Buffers](https://protobuf.dev/programming-guides/encoding/) occassionaly. This is mainly because it supports a larger type based wire tagging that allows some information (especially metadata) to be passed around inferentially and thus reducing the total amount of information actually present in the wire. 

This is augmented by the fact that POLO supports **Atomic Encoding**, because of which simple objects such as integers & strings can be encoded without needing to be wrapped within a larger (structural) message

### Partial Encoding/Decoding Constructs
The POLO wire format prefixes all metadata for the wire in the front, this metadata includes the wire type information as well as the offset position of the data. This kind of *lookup* based offset tags allows us to directly access the data for a particular field order. This capability is currently supported using the `Document` and `Raw` constructs. 

The `Document` construct is used to create a string indexed collection of `Raw` object and it collapses into a special form of the POLO wire called the **document-encoded wire** with the `WireDoc` wire type. It's unique in that it preserves the field name (string index) for the data unlike regular POLO encoding and is similar to encoding schemes like JSON or YAML and consequently consumes more wire space.

The `Raw` construct is useful for capturing the wire data for a specific field in the struct. It can also be used to define a structure that 'skips' the unrequired fields by capturing their raw wire instead of decoding them.

Partial encodign/decoding capabilities for this implementation are unfinished can be extended to support field order based access/write for regular POLO encoded wires in the future.

### Differential Messaging (Coming Soon)
POLO's partially encoding and field order based indexing (and string based indexing for document encoded wires) allows the possibility for messaging that only allows the transmission of the difference between two states, this is useful for any version managment system where the same data is incrementally updated and transmitted, the ability to index the difference and only transmit the difference can result in massive reduction in the wire sizes for these use cases that often re-transmit already available information.

## Canonical Encoding
Each value has exactly one encoding. The encoder writes only this encoding, and the decoder accepts only this encoding. Thus `encode(decode(wire))` gives the same bytes as the wire, and the bytes are safe to hash. The decoder throws an error for each wire that does not obey the rules C1 to C7 of the specification, for example a tag or an integer that is not minimal, a float that does not have 8 bytes, a string that is not valid UTF-8, or map keys that are not in order.

### Null and optional values
A Null means "no value". It is not the same as an empty value: an empty array is `0e 0f`, but a Null is `00`.

| Kind | `null` or `undefined` on encode | A Null on decode |
|---|---|---|
| `array`, `map`, `bytes`, `raw`, `document` | Null | `null` |
| `bool`, `integer`, `float`, `string`, `struct` | Error | Error |
| Any kind with `optional: true` | Null | `null` |

Set `optional: true` for a value that can be absent. Go uses a pointer for such a value, for example `*uint64`.

```javascript
const schema = { kind: 'array', fields: { values: { kind: 'integer', optional: true } } };

const polorizer = new Polorizer();
polorizer.polorize([1, null, 3], schema);
// [14, 63, 3, 16, 19, 1, 3]
```

### Types
- `integer`: the encoder accepts a `number` (a safe integer), a `bigint`, a `BN` and a decimal string. The integer has no size limit. The decoder gives a `number` for a safe integer and a `bigint` for a larger value.
- `float`: an IEEE 754 binary64 float. All numbers are valid floats, also integers, `-0` and `NaN`.
- `string`: UTF-8. The encoder rejects a string with a lone surrogate. POLO does not normalize strings.
- `map`: the value must be a `Map`. The keys can be `bool`, `integer`, `float`, `string` or `bytes`. The encoder sorts them in the POLO order: integers and floats by value, strings and bytes byte by byte (not in the UTF-16 order of JavaScript). It rejects two keys with the same value, for example `5` and `5n`, or two `Uint8Array` keys with the same bytes.
- `struct`: a pack with one element for each field of the schema, in the order of the schema.

### Options
An option is an agreement between the encoder and the decoder. They must use the same options.

```javascript
// Write each struct as a document, at all levels (go-polo: DocStructs).
const polorizer = new Polorizer({ docStructs: true });

// Accept a document and a pack for each struct. Change the nesting limit (default 1000).
const depolorizer = new Depolorizer(wire, { docStructs: true, maxDepth: 1000 });
```

With `docStructs`, the decoder ignores unknown keys and gives the zero value (`false`, `0`, `""` or `null`) to each field that has no key. Without `docStructs`, a struct rejects a document.

## Examples
### Polorizer
```javascript
const fruit = {
    name: 'orange',
    cost: 300,
    alias: ['tangerine', 'mandarin']
};

const schema = {
    kind: 'struct',
    fields: {
        name: {
            kind: 'string'
        },
        cost: {
            kind: 'integer'
        },
        alias: {
            kind: 'array',
            fields: {
                values: {
                    kind: 'string',
                }
            }
        }
    }
}

const polorizer = new Polorizer();
polorizer.polorize(fruit, schema);
console.log(polorizer.bytes())

// Output:
/* 
    [
        14, 79, 6, 99, 142, 1, 111, 114, 97, 110, 103, 101, 1, 44, 63, 6, 150, 1, 116, 97, 110, 103, 101, 114, 105, 110, 101, 109,  97, 110, 100,  97, 114, 105, 110
    ]
*/
```

### Depolorizer
```javascript
const wire = new Uint8Array([14, 79, 6, 99, 142, 1, 111, 114, 97, 110, 103, 101, 1, 44, 63, 6, 150, 1, 116, 97, 110, 103, 101, 114, 105, 110, 101, 109, 97, 110, 100, 97, 114, 105, 110])
const schema = {
    kind: 'struct',
    fields: {
        name: {
            kind: 'string'
        },
        cost: {
            kind: 'integer'
        },
        alias: {
            kind: 'array',
            fields: {
                values: {
                    kind: 'string',
                }
            }
        }
    }
}

const depolorizer = new Depolorizer(wire)
console.log(depolorizer.depolorize(schema))

// Output:
/* 
    { 
        name: 'orange', 
        cost: 300, 
        alias: [ 'tangerine', 'mandarin' ] 
    }
*/
```

### Document Encoding
```javascript
// Create a Fruit object
const fruit = {
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
const document = documentEncode(fruit, schema);

console.log(document.getData());
console.log(document.bytes());

// Output:
/*
    {
        name: Raw {
            bytes: Uint8Array(7) [
                6, 111, 114, 97, 110, 103, 101
            ]
        },
        cost: Raw { bytes: Uint8Array(3) [ 3, 1, 44 ] },
        alias: Raw {
            bytes: Uint8Array(22) [
                14, 63, 6, 150, 1, 116, 97, 110, 103, 101, 114, 105, 110, 101, 109,  97, 110, 100, 97, 114, 105, 110
            ]
        }
    }
*/

/*
    [
        13, 175, 1, 6, 85, 182, 3, 245, 3, 166, 4,229, 4, 97, 108, 105, 97, 115, 14, 63, 6, 150, 1, 116, 97, 110, 103, 101, 114, 105, 110, 101, 109, 97, 110, 100, 97, 114, 105, 110, 99, 111, 115, 116, 3, 1, 44, 110, 97, 109, 101, 6, 111, 114, 97,110, 103, 101
    ]
*/
```

### Document Decoding

#### Decode Document
```javascript
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

console.log(document.keys());
console.log(document.getString('name'));
console.log(document.getArray('alias', schema.fields.alias));

// Output:
/*
    [ 'alias', 'cost', 'name' ]
    orange
    [ 'tangerine', 'mandarin' ]
*/
```

#### Decode Struct
```javascript
const wire = new Uint8Array([
    13, 175, 1, 6, 85, 182, 3, 245, 3, 166, 4, 229, 4, 97, 108, 105, 97, 115, 14, 63, 6, 150, 1, 116, 97, 110, 103, 101, 114, 105, 110, 101, 109, 97, 110, 100, 97, 114, 105, 110, 99, 111, 115, 116, 3, 1, 44, 110, 97, 109, 101, 6, 111, 114,  97, 110, 103, 101
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
const depolorizer = new Depolorizer(wire, { docStructs: true });

console.log(depolorizer.depolorize(schema));

// Output:
/* 
    { 
        name: 'orange', 
        cost: 300, 
        alias: [ 'tangerine', 'mandarin' ] 
    }
*/
```

## Migrating from 0.1.x
Version 0.2.0 follows the POLO Wire Specification v0.5.0. These changes are not backward compatible:

- **The decoder rejects wires that are not canonical.** Some wires that 0.1.x accepted cause an error now.
- **A Null is no longer an empty or zero value.** A Null decodes to `null` for `array`, `map`, `bytes`, `raw` and `document`. Before, it decoded to `[]`, an empty `Map`, empty bytes or an empty Raw. For `bool`, `integer`, `float`, `string` and `struct`, a Null is an error. Mark these schemas `optional: true` if go-polo can write a Null for them (Go pointers).
- **`null` and `undefined` are no longer zero values on encode.** A missing struct field of kind `bool`, `integer`, `float` or `string` causes an error, unless the field is optional.
- **A struct accepts a document only with `{ docStructs: true }`.**
- **Map keys and document keys are in POLO order.** Thus some maps and documents encode to different bytes, and their hashes change. go-polo v0.5.0 rejects the old order.
- **Integers have no leading zero bytes.** 0.1.x wrote 8 bytes for each `bigint` and each positive `BN`. go-polo v0.5.0 rejects these wires.
- **Only `bool`, `integer`, `float`, `string` and `bytes` can be map keys.**
- **Documents:** `new Document(wire)` decodes a document (the `schema` parameter is removed). The getters give `null` for a missing `raw`, `bytes`, `array` or `map` key. `polorizeDocument` writes a `null` value as a Raw that holds a Null (`05 00`).
- **`polorizeRaw(null)` writes `05 00`**, as go-polo does. `polorize(null, { kind: 'raw' })` writes `00`.
- **Package layout:** the builds are in `dist/cjs` and `dist/esm`. The `exports` map permits only `import 'js-polo'` and `require('js-polo')`. `Raw` and the option types are exported from the package.

## Contributing
The tests compare js-polo with go-polo. `scripts/gen-vectors` is a Go program that writes `__tests__/vectors/go-polo.json` with go-polo. Run it with `npm run vectors` after a change to go-polo.

Unless you explicitly state otherwise, any contribution intentionally submitted
for inclusion in the work by you, as defined in the Apache-2.0 license, shall be
dual licensed as below, without any additional terms or conditions.

## License
&copy; 2023 Sarva Labs Inc. & MOI Protocol Developers.

This project is licensed under either of
- [Apache License, Version 2.0](https://www.apache.org/licenses/LICENSE-2.0) ([`LICENSE-APACHE`](LICENSE-APACHE))
- [MIT license](https://opensource.org/licenses/MIT) ([`LICENSE-MIT`](LICENSE-MIT))

at your option.

The [SPDX](https://spdx.dev) license identifier for this project is `MIT OR Apache-2.0`.