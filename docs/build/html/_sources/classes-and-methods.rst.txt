===================
Classes and Methods
===================

--------------------------------------------------------------------------------

Polorizer
---------
The Polorizer class is an encoding buffer that can sequentially polorize objects 
into it. It can be collapsed into its bytes with bytes() or packed().

.. code-block:: javascript
    
    // Creating a new Polorizer
    const polorizer = new Polorizer()

parameters
~~~~~~~~~~
none

methods
~~~~~~~
.. autofunction:: polorizeNull

.. code-block:: javascript

    // Example
    polorizer.polorizeNull()

.. autofunction:: polorizeBool

.. code-block:: javascript

    // Example
    polorizer.polorizeBool(true)

.. autofunction:: polorizeInteger

.. code-block:: javascript

    // Example
    polorizer.polorizeInteger(300)

.. autofunction:: polorizeFloat

.. code-block:: javascript

    // Example
    polorizer.polorizeFloat(123.456)

.. autofunction:: polorizeString

.. code-block:: javascript

    // Example
    polorizer.polorizeString('foo')

.. autofunction:: polorizeRaw

.. code-block:: javascript

    // Example
    polorizer.polorizeRaw(new Raw([6, 98, 111, 111]))

.. autofunction:: polorizeBytes

.. code-block:: javascript

    // Example
    polorizer.polorizeBytes(new Uint8Array([1, 1, 1, 1]))

.. autofunction:: polorizePacked

.. code-block:: javascript

    // Example
    const orange = {
        name: 'orange',
        cost: 300,
        alias: ['tangerine', 'mandarin']
    }
    // Encode the Name field as a string
    polorizer.polorizeString(orange.name)
    // Encode the Cost field as an integer
    polorizer.polorizeInteger(orange.cost)
    // Create a new Polorizer to serialize the Alias field (slice)
    const aliases = new Polorizer()
    // Encode each element in the Alias slice as a string
    orange.alias.forEach((alias) => aliases.polorizeString(alias))
    // Encode the Polorizer containing the alias field contents as packed data
    polorizer.polorizePacked(aliases)

.. autofunction:: polorizeInner

.. code-block:: javascript

    // Example
    const another = new Polorizer();
    another.polorizeString('foo');

    polorizer.polorizeInner(another);


.. autofunction:: polorize

**polorize array**

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

**polorize map**

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

**polorize struct**

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

.. autofunction:: polorizeDocument

.. code-block:: javascript

    // Example
    const doc = new Document()
    doc.setInteger('far', 123)
    doc.setString('foo', 'bar')

    polorizer.polorizeDocument(doc.document)

.. autofunction:: Polorizer#bytes

.. code-block:: javascript

    // Example
    const orange = {
        name: 'orange',
        cost: 300,
        alias: ['tangerine', 'mandarin']
    }

    // Create a new Polorizer
    const polorizer = new Polorizer()

    // Encode the Name field as a string
    polorizer.polorizeString(orange.name)
    // Encode the Cost field as an integer
    polorizer.polorizeInteger(orange.cost)


    // Create a new Polorizer to serialize the Alias field (slice)
    const aliases = new Polorizer()
    // Encode each element in the Alias slice as a string
    orange.alias.forEach((alias) => aliases.polorizeString(alias))
    // Encode the Polorizer containing the alias field contents as 
    // packed data
    polorizer.polorizePacked(aliases)

    // Print the serialized bytes in the Polorizer buffer
    console.log(polorizer.bytes())

    // Output:
    // [14 79 6 99 142 1 111 114 97 110 103 101 1 44 63 6 150 1 116 97 110 
    // 103 101 114 105 110 101 109 97 110 100 97 114 105 110]

.. autofunction:: packed

.. code-block:: javascript

    // Example
    polorizer.polorizeString('foo')

    console.log(polorizer.packed())

    // Output:
    // [14, 31, 6, 102, 111, 111]

--------------------------------------------------------------------------------

Depolorizer
-----------
The Depolorizer class is a decoding buffer that can sequentially depolorize 
objects from it. It can check whether there are elements left in the buffer 
with `isDone()`, and peek the WireType of the next element with `read()`.

.. code-block:: javascript
    
    // Creating a new Depolorizer
    const depolorizer = new Depolorizer(new Uint8Array([ 14, ... ]));

parameters
~~~~~~~~~~
1. ``data`` - ``Uint8Array``: The polo encoded data.
2. ``load`` - ``LoadReader``: The read-only buffer that is obtained from a compound wire (pack).

methods
~~~~~~~
.. autofunction:: depolorizeNull

.. code-block:: javascript

    // Example
    depolorizer.depolorizeNull()
    >> null

.. autofunction:: depolorizeBool

.. code-block:: javascript

    // Example
    depolorizer.depolorizeBool()
    >> true

.. autofunction:: depolorizeInteger

.. code-block:: javascript

    // Example
    depolorizer.depolorizeInteger()
    >> 300

.. autofunction:: depolorizeFloat

.. code-block:: javascript

    // Example
    depolorizer.depolorizeFloat()
    >> 123.456

.. autofunction:: depolorizeString

.. code-block:: javascript

    // Example
    depolorizer.depolorizeString()
    >> foo

.. autofunction:: depolorizeRaw

.. code-block:: javascript

    // Example
    depolorizer.depolorizeRaw()
    >> new Raw([6, 98, 111, 111])

.. autofunction:: depolorizeBytes

.. code-block:: javascript

    // Example
    depolorizer.depolorizeBytes()
    >> new Uint8Array([1, 1, 1, 1])

.. autofunction:: depolorizePacked

.. code-block:: javascript

    // Example
    depolorizer.depolorizePacked()
    >> Depolorizer

.. autofunction:: depolorizeInner

.. code-block:: javascript

    // Example
    depolorizer.depolorizeInner()
    >> new Uint8Array(6, ...)

.. autofunction:: depolorize

**depolorize array**

.. code-block:: javascript

    // Example
    const schema = {
        kind: 'array',
        fields: {
            values: {
                kind: 'string'
            }
        }
    }

    polorizer.depolorize(schema)
    >> ["foo", "bar"]

**depolorize map**

.. code-block:: javascript

    // Example
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

    const map = polorizer.depolorize(schema)
    map.get(0)
    >> foo
    map.get(1)
    >> bar

**depolorize struct**

.. code-block:: javascript

    // Example
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

    polorizer.depolorize(schema)
    >> { name: 'orange', cost: 300 }

.. autofunction:: depolorizeDocument

.. code-block:: javascript

    // Example
    depolorizer.depolorize()
    >> Document

.. autofunction:: isDone

.. code-block:: javascript

    // Example
    depolorizer.isDone()
    >> false

.. autofunction:: Depolorizer#read

.. code-block:: javascript

    // Example
    depolorizer.read()
    >> ReadBuffer

--------------------------------------------------------------------------------

Document
--------
The Document class is a representation for a string indexed collection of 
encoded object data. It represents an intermediary access format with objects 
settable/gettable with string keys.

.. code-block:: javascript
    
    // Creating a new Document
    const doc = new Document()

parameters
~~~~~~~~~~
1. ``data`` - ``Uint8Array`` (Optional): The polo encoded data.
2. ``schema`` - ``Schema`` (Optional): The polo schema that describes the data and its encoding.

methods
~~~~~~~
.. autofunction:: setNull

.. code-block:: javascript

    // Example
    doc.setNull("foo")

.. autofunction:: setBool

.. code-block:: javascript

    // Example
    doc.setBool("foo", true)

.. autofunction:: setInteger

.. code-block:: javascript

    // Example
    doc.setInteger("foo", 300)

.. autofunction:: setFloat

.. code-block:: javascript

    // Example
    doc.setFloat("foo", 123.456)

.. autofunction:: setString

.. code-block:: javascript

    // Example
    doc.setString("foo", "bar")

.. autofunction:: setRaw

.. code-block:: javascript

    // Example
    doc.setRaw("foo", new Raw([6, 98, 111, 111]))

.. autofunction:: setBytes

.. code-block:: javascript

    // Example
    doc.setBytes("foo", new Uint8Array([1, 1, 1, 1]))

.. autofunction:: setArray

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

    doc.setArray("foo", arr, schema)

.. autofunction:: setMap

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

    doc.setMap("foo", map, schema)

.. autofunction:: setStruct

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

    doc.setStruct("foo", struct, schema)

.. autofunction:: getNull

.. code-block:: javascript

    // Example
    doc.getNull("foo")
    >> null

.. autofunction:: getBool

.. code-block:: javascript

    // Example
    doc.getBool("foo")
    >> true

.. autofunction:: getInteger

.. code-block:: javascript

    // Example
    doc.getInteger("foo")
    >> 300

.. autofunction:: getFloat

.. code-block:: javascript

    // Example
    doc.getFloat("foo")
    >> 123.456

.. autofunction:: getString

.. code-block:: javascript

    // Example
    doc.getString("foo")
    >> bar

.. autofunction:: getRaw

.. code-block:: javascript

    // Example
    doc.getRaw("foo")
    >> new Raw([6, 98, 111, 111])

.. autofunction:: getBytes

.. code-block:: javascript

    // Example
    doc.getBytes("foo")
    >> new Uint8Array([1, 1, 1, 1])

.. autofunction:: getArray

.. code-block:: javascript

    // Example
    const schema = {
        kind: 'array',
        fields: {
            values: {
                kind: 'string'
            }
        }
    }

    doc.getArray("foo", schema)
    >> ["foo", "bar"]

.. autofunction:: getMap

.. code-block:: javascript

    // Example
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

    const map = doc.getMap("foo", schema)
    map.get(0)
    >> foo
    map.get(1)
    >> bar

.. autofunction:: getStruct

.. code-block:: javascript

    // Example
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

    doc.getStruct("foo", schema)
    >> { name: 'orange', cost: 300 }

.. autofunction:: Document#is

.. code-block:: javascript

    // Example
    doc.is("foo", WIRE_STRING)
    >> true

.. autofunction:: Document#size

.. code-block:: javascript

    // Example
    doc.size()
    >> 5

.. autofunction:: Document#bytes

.. code-block:: javascript

    // Example
    doc.bytes()
    >> new Uint8Array([14 79 6 99 142 1 111 114 97 110 103 101 1 44 63 6 150 1 
    116 97 110 103 101 114 105 110 101 109 97 110 100 97 114 105 110])

functions
~~~~~~~~~

.. autofunction:: documentEncode

.. code-block:: javascript

    // Example
    const orange = {
        name: 'orange',
        cost: 300,
        alias: ['tangerine', 'mandarin']
    }

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
    }

    // Encode the object into a Document
    const document = documentEncode(orange, schema)

    console.log(document.document)
    console.log(document.bytes())

    // Output:
    /*
        {
            name: Raw {
                bytes: Uint8Array(7) [
                    6, 111, 114, 97,110, 103, 101
                ]
            },
            cost: Raw { bytes: Uint8Array(3) [ 3, 1, 44 ] },
            alias: Raw {
                bytes: Uint8Array(22) [
                    14, 63, 6, 150, 1, 116,
                    97, 110, 103, 101, 114, 105,
                    110, 101, 109,  97, 110, 100,
                    97, 114, 105, 110
                ]
            }
        }
    */

    /*
        [
            13, 175, 1, 6, 85, 182, 3, 245, 3, 166, 4,
            229, 4, 97, 108, 105, 97, 115, 14, 63, 6, 150,
            1, 116, 97, 110, 103, 101, 114, 105, 110, 101, 109,
            97, 110, 100, 97, 114, 105, 110, 99, 111, 115, 116,
            3, 1, 44, 110, 97, 109, 101, 6, 111, 114,  97,
            110, 103, 101
        ]
    */

.. autofunction:: documentDecode

.. code-block:: javascript

    // Example
    const wire = new Uint8Array([
        13, 175, 1, 6, 85, 182, 3, 245, 3, 166, 4, 229, 4, 97, 108, 105, 
        97, 115, 14, 63, 6, 150, 1, 116, 97, 110, 103, 101, 114, 105, 110, 
        101, 109, 97, 110, 100, 97, 114, 105, 110, 99, 111, 115, 116,
        3, 1, 44, 110, 97, 109, 101, 6, 111, 114,  97, 110, 103, 101
    ])

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
    }

    const depolorizer = new Depolorizer(wire)
    const readBuffer = depolorizer.read()
    const doc = documentDecode(readBuffer)
    console.log(doc.document)

    // Output:
    // {
    // 	name: Uint8Array(7) [
    // 		6, 111, 114, 97,
    // 	  110, 103, 101
    // 	],
    // 	cost: Uint8Array(3) [ 3, 1, 44 ],
    // 	alias: Uint8Array(22) [
    // 		14,  63,   6, 150,   1, 116,
    // 		97, 110, 103, 101, 114, 105,
    // 	   110, 101, 109,  97, 110, 100,
    // 		97, 114, 105, 110
    // 	 ],
    // }
