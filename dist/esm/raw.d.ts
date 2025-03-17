import { WireType } from './wiretype';
/**
 * Represents the raw POLO encoded data. Extends Uint8Array to provide
 * additional functionality.
 *
 * @class
 */
export declare class Raw extends Uint8Array {
    /**
     * Checks whether the raw POLO data is of a certain wire type.
     *
     * @param kind - The wire type to check.
     * @returns A boolean indicating whether the raw data matches the
     * specified wire type.
     */
    is(kind: WireType): boolean;
}
