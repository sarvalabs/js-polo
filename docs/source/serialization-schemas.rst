=====================
Serialization Schemas
=====================

Serialization schemas are a vital part of a JavaScript implementation. These 
schemas are responsible for encoding and decoding elements in a defined order 
and format, ensuring data consistency and interoperability.

By using serialization schemas, we establish a structure that determines how 
data should be represented and organized during the serialization and 
deserialization processes. This structure enables data to be encoded into a 
format that can be easily transmitted or stored, and then decoded back into 
its original form.

.. code-block:: javascript
    
    // Creating a new Polorizer
    const polorizer = new Polorizer()

The following are the listed schemas for serialization, each representing 
a specific format:

Null Schema
-----------
This schema represents a null value.

.. code-block:: javascript

    // Example
    const schema = {
        kind: "null"
    }
    polorizer.polorize(null, schema)

Boolean Schema
--------------
This schema represents a boolean value.

.. code-block:: javascript

    // Example
    const schema = {
        kind: "bool"
    }
    polorizer.polorize(true, schema)

Integer Schema
--------------
This schema represents an integer value. The encoder accepts a ``number``
(a safe integer), a ``bigint``, a ``BN`` and a string that holds a decimal
integer. The integer has no size limit. The decoder gives a ``number`` for a
safe integer and a ``bigint`` for a larger value.

.. code-block:: javascript

    // Example
    const schema = {
        kind: "integer"
    }
    polorizer.polorize(300, schema)

Float Schema
------------
This schema represents a floating-point value: an IEEE 754 binary64 float.
All numbers are valid floats, also integers, ``-0`` and ``NaN``.

.. code-block:: javascript

    // Example
    const schema = {
        kind: "float"
    }
    polorizer.polorize(123.456, schema)

String Schema
-------------
This schema represents a string value. The data is UTF-8. The encoder
rejects a string with a lone surrogate, and the decoder rejects data that is
not valid UTF-8. POLO does not normalize strings.

.. code-block:: javascript

    // Example
    const schema = {
        kind: "string"
    }
    polorizer.polorize("foo", schema)

Raw Schema
----------
This schema represents a polo encoded raw data.

.. code-block:: javascript

    // Example
    const schema = {
        kind: "raw"
    }
    polorizer.polorize(new Raw([6, 98, 111, 111]), schema)

Bytes Schema
------------
This schema represents a byte array.

.. code-block:: javascript

    // Example
    const schema = {
        kind: "bytes"
    }
    polorizer.polorize(new Uint8Array([1, 1, 1, 1]), schema)

Array Schema
------------
This schema represents an array of values.

.. code-block:: javascript

    // Example
    const arr = ["foo", "bar"]
    const schema = {
        kind: 'array',
        fields: {
            values: {
                kind: 'string'
            }
        }
    }

    polorizer.polorize(arr, schema)

Map Schema
----------
This schema represents a map of key-value pairs. The value must be a
``Map``. The keys can be ``bool``, ``integer``, ``float``, ``string`` or
``bytes``. The encoder sorts the keys in the POLO order of their kind:

- ``bool``: false, then true.
- ``integer`` and ``float``: by numeric value. A ``NaN`` cannot be a key.
- ``string``: byte by byte on the UTF-8 data. This is not the UTF-16 order
  of JavaScript.
- ``bytes``: byte by byte. A shorter key that is the start of a longer key
  is first.

The encoder rejects two keys with the same value, for example ``5`` and
``5n``, or two ``Uint8Array`` keys with the same bytes. The decoder rejects
keys that are not in strictly ascending order.

.. code-block:: javascript

    // Example
    const map = new Map()
    map.set(0, "foo")
    map.set(1, "bar")

    const schema = {
        kind: 'map',
        fields: {
            keys: {
                kind: 'integer'
            },
            values: {
                kind: 'string'
            }
        }	
    }

    polorizer.polorize(map, schema)

Struct Schema
-------------
This schema represents a structured object with named fields. The wire is
a pack with one element for each field of the schema, in the order of the
schema. With the option ``docStructs``, the wire is a document with one key
for each field.

.. code-block:: javascript

    // Example
    const struct = {
        name: 'orange',
        cost: 300,
    }

    const schema = {
        kind: 'struct',
        fields: {
            name: {
                kind: 'string'
            },
            cost: {
                kind: 'integer'
            }
        }	
    }

    polorizer.polorize(struct, schema)

Document Schema
---------------
This schema represents a polo document.

.. code-block:: javascript

    // Example
    const doc = new Document()
    doc.setInteger('far', 123)
    doc.setString('foo', 'bar')

    const schema = {
        kind: 'document'
    }

    polorizer.polorize(doc, schema)

Optional Values and Null
------------------------
A Null means "no value". It is not the same as an empty value: an empty
array is ``0e 0f``, but a Null is ``00``.

- The kinds ``array``, ``map``, ``bytes``, ``raw`` and ``document`` accept a
  Null. The encoder writes a Null for ``null`` and ``undefined``, and the
  decoder gives ``null`` for a Null.
- The kinds ``bool``, ``integer``, ``float``, ``string`` and ``struct``
  reject a Null. Set ``optional: true`` in the schema for a value that can
  be absent. Go uses a pointer for such a value, for example ``*uint64``.

.. code-block:: javascript

    // Example
    const schema = {
        kind: 'array',
        fields: {
            values: {
                kind: 'integer',
                optional: true
            }
        }
    }

    polorizer.polorize([1, null, 3], schema)

Canonical Encoding
------------------
js-polo follows the POLO Wire Specification v0.5.0. Each value has exactly
one encoding. The encoder writes only this encoding, and the decoder accepts
only this encoding. Thus ``encode(decode(wire))`` gives the same bytes as the
wire, and the bytes are safe to hash. The tests of js-polo compare its
output with go-polo, the reference implementation.
