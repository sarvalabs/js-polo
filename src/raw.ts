import { WireType } from './wiretype';

// Raw is a container for raw POLO encoded data
export class Raw extends Uint8Array {

	// Is returns whether the raw POLO data is of a certain wire type
	public is(kind: WireType): boolean {
		if (this.length === 0) {
			return kind === WireType.WIRE_NULL;
		}

		return this[0] == kind;
	}
}