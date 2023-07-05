=============
Documentation
=============

This documentation is for js-polo v0.1.0.

--------------------------------------------------------------------------------

What is js-polo?
----------------
js-polo is a JS implementation of the POLO encoding and object serialization 
scheme. POLO stands for Prefix Ordered Lookup Offsets.

It is intended for use in projects that prioritize deterministic serialization, 
minimal wire sizes and serialization safety. POLO follows a very strict 
specification that is optimized for partial decoding and differential messaging. 
This implementation is compliant with the POLO Specification that describes 
both the encoding (wire) format as well as implementation guidelines for 
several languages.

--------------------------------------------------------------------------------

Features
--------

Deterministic Serialization
~~~~~~~~~~~~~~~~~~~~~~~~~~~
POLO's strict specification is intended to create the same serialized wire for 
an object regardless of implementation. This is critical for cryptographic 
security with operations such as hashing which is used to guarantee data 
consistency and tamper proofing.

High Wire Efficiency
~~~~~~~~~~~~~~~~~~~~
POLO has a highly optimized wire format allows messages to be relatively small, 
even surpassing `Protocol Buffers <https://protobuf.dev/programming-guides/
encoding>`_ occassionaly. This is mainly because it supports a larger type based 
wire tagging that allows some information (especially metadata) to be passed 
around inferentially and thus reducing the total amount of information actually 
present in the wire.

This is augmented by the fact that POLO supports Atomic Encoding, because of 
which simple objects such as integers & strings can be encoded without needing 
to be wrapped within a larger (structural) message.

Partial Encoding/Decoding Constructs
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
The POLO wire format prefixes all metadata for the wire in the front, this 
metadata includes the wire type information as well as the offset position of 
the data. This kind of lookup based offset tags allows us to directly access 
the data for a particular field order. This capability is currently supported 
using the ``Document`` and ``Raw`` constructs.

The ``Document`` construct is used to create a string indexed collection of 
``Raw`` object and it collapses into a special form of the POLO wire called the 
document-encoded wire with the ``WireDoc`` wire type. It's unique in that it 
preserves the field name (string index) for the data unlike regular POLO 
encoding and is similar to encoding schemes like JSON or YAML and consequently 
consumes more wire space.

The ``Raw`` construct is useful for capturing the wire data for a specific field 
in the struct. It can also be used to define a structure that 'skips' the 
unrequired fields by capturing their raw wire instead of decoding them.

Partial encodign/decoding capabilities for this implementation are unfinished 
can be extended to support field order based access/write for regular 
POLO encoded wires in the future.

Differential Messaging (Coming Soon)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
POLO's partially encoding and field order based indexing (and string based 
indexing for document encoded wires) allows the possibility for messaging that 
only allows the transmission of the difference between two states, this is 
useful for any version managment system where the same data is incrementally 
updated and transmitted, the ability to index the difference and only transmit 
the difference can result in massive reduction in the wire sizes for these use 
cases that often re-transmit already available information.

--------------------------------------------------------------------------------

.. toctree::
   :maxdepth: 2
   :caption: Developer Documentation

   getting-started
   serialization-formats
   serialization-schemas
   classes-and-methods
   contributions
   license-and-copyright
