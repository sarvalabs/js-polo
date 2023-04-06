/// <reference types="node" />
/**
 * ByteReader is a class for reading bytes from a buffer.
 * This class provides an efficient way to read byte-by-byte from a buffer.
 *
 * @class
 */
declare class ByteReader {
    private buffer;
    private position;
    constructor(buffer: Buffer);
    /**
     * Reads up to len(p) bytes into the given buffer(p).
     *
     * @public
     * @param {Buffer} p - An empty buffer of length n.
     * @returns {number} The number of bytes read (0 <= n <= len(p)).
     * If the end of the buffer has been reached, return 0.
     */
    read(p: Buffer): number;
    /**
     * Provides an efficient interface for byte-at-time processing.
     *
     * @public
     * @returns {number|null} The next byte in the buffer, or null if
     * the end of the buffer has been reached.
     */
    readByte(): number | null;
    /**
     * Gets the number of unread bytes of the buffer.
     *
     * @public
     * @returns {number} The number of unread bytes of the buffer.
     * If the end of the buffer has been reached, return 0.
     */
    len(): number;
}
export default ByteReader;
