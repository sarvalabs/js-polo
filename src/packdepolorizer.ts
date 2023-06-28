import { Depolorizer } from './depolorizer';
import { ReadBuffer } from './readbuffer';

/**
 * Represents a PackDepolorizer used for depolarizing encoded data.
 * 
 * @class
 */
export class PackDepolorizer {
	public depolorizer: Depolorizer;

	constructor(data: Uint8Array) {
		const rb = new ReadBuffer(data);
		this.depolorizer = new Depolorizer(new Uint8Array([]), rb.load());
	}
}
