/**
 * Represents a utility class for validating data ranges.
 *
 * @class
 */
export declare class DataRange {
    /**
     * Checks if a number is within the range of unsigned 53-bit integers.
     *
     * @param num - The number to check.
     * @returns A boolean indicating whether the number is within the range.
     */
    static inUInt53(num: number): boolean;
    /**
     * Checks if a number is within the range of signed 53-bit integers.
     *
     * @param num - The number to check.
     * @returns A boolean indicating whether the number is within the range.
     */
    static inInt53(num: number): boolean;
}
