import ByteReader from './bytereader';
import { ReadBuffer } from './readbuffer';
import Varint from './varint';
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
class LoadReader {
	private head: ByteReader;
	private body: Buffer;
	private coff: number;
	private noff: number;
	private cw: WireType;
	private nw: WireType;
    
	constructor(head: Buffer, body: Buffer) {
		this.head = new ByteReader(head);
		this.body = body;

		// Seed the offset values of the loadreader by iterating once
		this.next();
	}

	/**
     * This method checks whether all elements in the loadreader 
	 * have been read.
     *
     * @public
     * @returns {boolean} It returns whether all elements in the 
	 * loadreader have been read.
     */
	public done(): boolean {
		// loadreader is done if the noff is set to -1
		return this.noff == -1;
	}

	public peek(): [WireType, boolean] {
		if(this.done()) {
			return [WireType.WIRE_NULL, false];
		}

		return [this.nw, true];
	}

	/**
	 * This method reads the next element from the loadreader.
	 *
	 * @public
	 * @returns {ReadBuffer|null} It returns the next element from 
	 * the loadreader or null if loadreader is done.
	 * @throws {Error} If an invalid varint is encountered in the head reader, 
	 * or the buffer is not properly formatted.
	*/
	public next(): ReadBuffer | null {
		// Check if the head reader is exhausted
		if(this.head.len() == 0) {
			// Check if load reader is done
			if(this.done()) {
				return null;
			}

			// Update current values from the next values
			this.coff = this.noff;
			this.cw = this.nw;
			// Update next values to nulls. -1 means the loadreader is set as done
			this.noff = -1;
			this.nw = WireType.WIRE_NULL;

			// Create a readbuffer from the current wiretype and 
			// the rest of data in the body and return it
			return new ReadBuffer(
				Uint8Array.from(this.body.subarray(this.coff,)), 
				this.cw
			);
		}

		// Update the current values from the next values
		this.coff = this.noff;
		this.cw = this.nw;

		const [tag] = Varint.consume(this.head);
		// Set the next values based on the tag data (first 4 bits 
		// represent wiretype, rest the offset position of the dats)
		this.noff = tag >> 4;
		this.nw = tag & 15;

		return new ReadBuffer(
			Uint8Array.from(this.body.subarray(this.coff, this.noff)), 
			this.cw
		);
	}
}

export default LoadReader;