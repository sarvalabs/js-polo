/// <reference types="node" />
import { ReadBuffer } from './readbuffer';
import { WireType } from './wiretype';
/**
 * LoadReader is a read-only buffer that is obtained from a
 * compound wire (pack). Iteration over the loadreader will return
 * elements from the load one by one.
 *
 * @class
 * @param {Buffer} head - The buffer that contains the metadata of the data.
 * @param {Buffer} body - The buffer that contains the data.
 */
declare class LoadReader {
    private head;
    private body;
    private coff;
    private noff;
    private cw;
    private nw;
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
    peek(): [WireType, boolean];
    /**
     * This method reads the next element from the loadreader.
     *
     * @public
     * @returns {ReadBuffer|null} It returns the next element from
     * the loadreader or null if loadreader is done.
     * @throws {Error} If an invalid varint is encountered in the head reader,
     * or the buffer is not properly formatted.
    */
    next(): ReadBuffer | null;
}
export default LoadReader;
