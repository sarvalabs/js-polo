import { VarInt } from './varint';
import { wiretype } from './wiretype';

// write appends v to the body of the writebuffer and appends
// a key to its head based on given wiretype w and the offset
// value which is incremented by the length of v after the write.
export class WriteBuffer {
	head: number[];
	body: number[];
	boff: number;
	varint: VarInt;

	constructor() {
		this.head = [];
		this.body = [];
		this.boff = 0;
		this.varint = new VarInt();
	}

	public write(w: wiretype, v: Uint8Array): number[] {
		this.head = this.varint.append(this.head, (this.boff<<4)|w);
		if(v) {
			this.body = [...this.body, ...v];
			this.boff += v.length;
		}

		return this.bytes();
	}

	public bytes(): number[] {
		return [...this.head, ...this.body];
	}
}