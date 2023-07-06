![image](https://moi-polo.s3.amazonaws.com/banner.png)

![license](https://img.shields.io/badge/license-MIT%2FApache--2.0-informational)

# js-polo

**js-polo** is a JS/TS implementation of the POLO encoding and object serialization scheme. [**POLO**](https://github.com/sarvalabs/polo) stands for Prefix Ordered Lookup Offsets.

It is intended for use in projects that prioritize deterministic serialization, minimal wire sizes and serialization safety. POLO follows a very strict specification that is optimized for partial decoding and differential messaging. This implementation is compliant with the [POLO Specification](https://github.com/sarvalabs/polo) that describes both the encoding (wire) format as well as implementation guidelines for several languages.

## Installation
Install the latest [release](https://github.com/sarvalabs/js-polo/releases) using the following command.

```sh
npm install js-polo
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

const document = new Document(wire, schema);

console.log(document.getData());

// Output:
/*
    {
        name: Uint8Array(7) [
            6, 111, 114, 97,
        110, 103, 101
        ],
        cost: Uint8Array(3) [ 3, 1, 44 ],
        alias: Uint8Array(22) [
            14,  63,   6, 150,   1, 116,
            97, 110, 103, 101, 114, 105,
        110, 101, 109,  97, 110, 100,
            97, 114, 105, 110
        ],
    }
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

const depolorizer = new Depolorizer(wire);

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

## Contributing
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