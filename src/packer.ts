import { WriteBuffer } from './writebuffer';
import { Polorizer } from './polorizer';
import { wiretype } from './wiretype';

export class Packer {
	private writeBuffer: WriteBuffer;

	constructor() {
		this.writeBuffer = new WriteBuffer();
	}

	public pack(object: unknown): void {
		const polorizer = new Polorizer();
		polorizer.polorize(object, this.writeBuffer);
	}

	public bytes(): number[] {
		return [wiretype.WIRE_PACK, ...this.writeBuffer.load()];
	}
}