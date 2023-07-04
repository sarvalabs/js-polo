=====================
Serialization Formats
=====================

--------------------------------------------------------------------------------

Wire Types
----------

Wire types are used to encode different types of data in a specific format. This 
enumeration provides a list of wire types and their corresponding values.

- ``WIRE_NULL`` Represents a null wire. Used for consuming field orders without data. (Value: 0)
- ``WIRE_FALSE`` Represents a Boolean False. (Value: 1)
- ``WIRE_TRUE`` Represents a Boolean True. (Value: 2)
- ``WIRE_POSINT`` Represents a Binary encoded positive Integer in BigEndian Order. (Value: 3)
- ``WIRE_NEGINT`` Represents a Binary encoded negative Integer in BigEndian Order. The number is encoded as its absolute value and must be multiplied with -1 to get its actual value. (Value: 4)
- ``WIRE_RAW`` Represents polo encoded bytes. (Value: 5)
- ``WIRE_WORD`` Represents UTF-8 encoded string/bytes. (Value: 6)
- ``WIRE_FLOAT`` Represents some floating point data encoded in the IEEE754 standard (floats). (Value: 7)
- ``WIRE_DOC`` Represents doc encoded data (string keyed maps, tagged structs, and Document objects). (Value: 13)
- ``WIRE_PACK`` Represents pack encoded data (slices, arrays, maps, structs). (Value: 14)
- ``WIRE_LOAD`` Represents a load tag for compound wire type. (Value: 15)

--------------------------------------------------------------------------------

Wire
----
A utility class for working with wire types.

.. autofunction:: isNull

.. code-block:: javascript

    // Example
    Wire.isNull(WIRE_NULL)
    >> true

.. autofunction:: isCompound

.. code-block:: javascript

    // Example
    Wire.isCompound(WIRE_PACK)
    >> true
