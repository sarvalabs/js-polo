import { Depolorizer } from './depolorizer';
import { ReadBuffer } from './readbuffer';

export class PackDepolorizer {
	public depolorizer: Depolorizer;

	constructor(data: Uint8Array) {
		const rb = new ReadBuffer(data);
		this.depolorizer = new Depolorizer(new Uint8Array([]), rb.load());
	}
}