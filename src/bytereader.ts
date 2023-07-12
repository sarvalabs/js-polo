import { Buffer } from 'buffer';

/**
 * ByteReader is a class for reading bytes from a buffer.
 * This class provides an efficient way to read byte-by-byte from a buffer.
 *
 * @class
 */
class ByteReader {
	private buffer: Buffer;
	private position: number; // current reading index

	constructor(buffer: Buffer) {
		this.buffer = buffer;
		this.position = 0;
	}

	/**
     * Reads up to len(p) bytes into the given buffer(p).
     *
     * @public
	 * @param {Buffer} p - An empty buffer of length n.
     * @returns {number} The number of bytes read (0 <= n <= len(p)). 
	 * If the end of the buffer has been reached, return 0.
     */
	public read(p: Buffer): number {
		if (this.position >= this.buffer.length) {
			return 0;
		}

		const bytesRead = this.buffer.copy(p, 0, this.position);
		this.position += bytesRead;
		return bytesRead;
	}

	/**
     * Provides an efficient interface for byte-at-time processing.
     *
     * @public
     * @returns {number|null} The next byte in the buffer, or null if 
	 * the end of the buffer has been reached.
     */
	public readByte(): number | null {
		if (this.position >= this.buffer.length) {
			return null;
		}
        
		return this.buffer[this.position++];
	}

	/**
     * Gets the number of unread bytes of the buffer.
     *
     * @public
     * @returns {number} The number of unread bytes of the buffer. 
	 * If the end of the buffer has been reached, return 0.
     */
	public len(): number {
		if (this.position >= this.buffer.length) {
			return 0;
		}

		return this.buffer.length - this.position;
	}
}

export default ByteReader;
