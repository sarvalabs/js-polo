/// <reference types="node" />
/// <reference types="node" />
import { Buffer } from 'buffer';
import { ReadBuffer } from './readbuffer.js';
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
declare class LoadReader {
    private body;
    private wires;
    private offsets;
    private index;
    constructor(head: Buffer, body: Buffer);
    /**
     * This method checks whether all elements in the loadreader
     * have been read.
     *
     * @public
     * @returns {boolean} It returns whether all elements in the
     * loadreader have been read.
     */
    done(): boolean;
    /**
     * Returns the number of elements that are not read.
     *
     * @public
     * @returns {number} The number of elements that are not read.
     */
    remaining(): number;
    peek(): [WireType, boolean];
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
    next(): ReadBuffer | null;
}
export default LoadReader;
