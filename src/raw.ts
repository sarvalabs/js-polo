import { WireType } from './wiretype';

export class Raw {
	public bytes: Uint8Array;

	constructor(bytes: Uint8Array) {
		this.bytes = bytes;
	}

	public is(kind: WireType): boolean {
		return this.bytes[0] == kind;
	}
}