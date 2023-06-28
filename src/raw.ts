import { WireType } from './wiretype';

/**
 * Represents the raw POLO encoded data. Extends Uint8Array to provide 
 * additional functionality.
 * 
 * @class
 */
export class Raw extends Uint8Array {
	/**
     * Checks whether the raw POLO data is of a certain wire type.
	 * 
     * @param kind - The wire type to check.
     * @returns A boolean indicating whether the raw data matches the 
	 * specified wire type.
     */
	public is(kind: WireType): boolean {
		if (this.length === 0) {
			return kind === WireType.WIRE_NULL;
		}

		return this[0] == kind;
	}
}
