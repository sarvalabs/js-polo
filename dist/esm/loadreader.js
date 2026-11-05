import ByteReader from './bytereader.js';
import { ReadBuffer } from './readbuffer.js';
import Varint from './varint.js';
import { WireType } from './wiretype.js';
/**
 * LoadReader is a read-only buffer that is obtained from a
 * compound wire (pack). Iteration over the loadreader will return
 * elements from the load one by one.
 *
 * The constructor reads all tags of the head and examines the framing
 * (rule C6). It rejects a load that does not obey these rules:
 * - All tags in the head must be complete and minimal.
 * - The offset of the first element must be 0.
 * - An offset must not be less than the offset before it.
 * - An offset must not be more than the length of the body.
 * - A load with no elements must have no body.
 *
 * @class
 * @param {Buffer} head - The buffer that contains the metadata of the data.
 * @param {Buffer} body - The buffer that contains the data.
 */
class LoadReader {
    body;
    wires;
    offsets;
    index;
    constructor(head, body) {
        this.body = body;
        this.wires = [];
        this.offsets = [];
        this.index = 0;
        const reader = new ByteReader(head);
        while (reader.len() > 0) {
            const [tag] = Varint.consume(reader);
            const wire = tag % 16;
            const offset = Math.floor(tag / 16);
            if (this.offsets.length === 0 && offset !== 0) {
                throw new Error('malformed load: the offset of the first element is not 0');
            }
            if (offset < this.offsets[this.offsets.length - 1]) {
                throw new Error('malformed load: an offset is less than the offset before it');
            }
            if (offset > body.length) {
                throw new Error('malformed load: an offset is more than the length of the body');
            }
            this.wires.push(wire);
            this.offsets.push(offset);
        }
        if (this.offsets.length === 0 && body.length > 0) {
            throw new Error('malformed load: a load with no elements has a body');
        }
    }
    /**
     * This method checks whether all elements in the loadreader
     * have been read.
     *
     * @public
     * @returns {boolean} It returns whether all elements in the
     * loadreader have been read.
     */
    done() {
        return this.index >= this.offsets.length;
    }
    /**
     * Returns the number of elements that are not read.
     *
     * @public
     * @returns {number} The number of elements that are not read.
     */
    remaining() {
        return this.offsets.length - this.index;
    }
    peek() {
        if (this.done()) {
            return [WireType.WIRE_NULL, false];
        }
        return [this.wires[this.index], true];
    }
    /**
     * This method reads the next element from the loadreader.
     * The data of an element starts at its offset and stops at the offset
     * of the next element. The data of the last element stops at the end
     * of the body.
     *
     * @public
     * @returns {ReadBuffer|null} It returns the next element from
     * the loadreader or null if loadreader is done.
    */
    next() {
        if (this.done()) {
            return null;
        }
        const start = this.offsets[this.index];
        const end = this.index + 1 < this.offsets.length
            ? this.offsets[this.index + 1]
            : this.body.length;
        const wire = this.wires[this.index];
        this.index++;
        return new ReadBuffer(this.body.subarray(start, end), wire);
    }
}
export default LoadReader;
