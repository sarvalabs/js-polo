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
    polorizer.polorize(null, schema.null)

Boolean Schema
--------------
This schema represents a boolean value.

.. code-block:: javascript

    // Example
    polorizer.polorize(true, schema.boolean)

Integer Schema
--------------
This schema represents an integer value.

.. code-block:: javascript

    // Example
    polorizer.polorize(300, schema.integer)

Float Schema
------------
This schema represents a floating-point value.

.. code-block:: javascript

    // Example
    polorizer.polorize(123.456, schema.float)

String Schema
-------------
This schema represents a string value.

.. code-block:: javascript

    // Example
    polorizer.polorize("foo", schema.string)

Raw Schema
----------
This schema represents a polo encoded raw data.

.. code-block:: javascript

    // Example
    polorizer.polorize(new Raw([6, 98, 111, 111]), schema.raw)

Bytes Schema
------------
This schema represents a byte array.

.. code-block:: javascript

    // Example
    polorizer.polorize(new Uint8Array([1, 1, 1, 1]), schema.bytes)

Array Schema
------------
This schema represents an array of values.

.. code-block:: javascript

    // Example
    const arr = ["foo", "bar"]
    const arrSchema = schema.arrayOf(schema.string)

    polorizer.polorize(arr, arrSchema);

Map Schema
----------
This schema represents a map of key-value pairs.

.. code-block:: javascript

    // Example
    const map = new Map()
    map.set(0, "foo")
    map.set(1, "bar")

    const mapSchema = schema.map({
        key: schema.integer,
        value: schema.string
    })

    polorizer.polorize(map, mapSchema)

Struct Schema
-------------
This schema represents a structured object with named fields.

.. code-block:: javascript

    // Example
    const struct = {
        name: 'orange',
        cost: 300,
    }

    const structSchema = schema.struct({
        name: schema.string,
        cost: schema.integer
    })

    polorizer.polorize(struct, schema)

Document Schema
---------------
This schema represents a polo document.

.. code-block:: javascript

    // Example
    const doc = new Document()
    doc.setInteger('far', 123)
    doc.setString('foo', 'bar')

    polorizer.polorize(doc, schema.document)
