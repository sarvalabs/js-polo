=====================
Serialization Schemas
=====================

--------------------------------------------------------------------------------

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
This schema represents an integer value.

.. code-block:: javascript

    // Example
    const schema = {
        kind: "integer"
    }
    polorizer.polorize(300, schema)

Float Schema
------------
This schema represents a floating-point value.

.. code-block:: javascript

    // Example
    const schema = {
        kind: "float"
    }
    polorizer.polorize(123.456, schema)

String Schema
-------------
This schema represents a string value.

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
This schema represents a map of key-value pairs.

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
This schema represents a structured object with named fields.

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
