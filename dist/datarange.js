"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataRange = void 0;
const MIN_UINT = 0;
const MAX_UINT53 = Number.MAX_SAFE_INTEGER;
const MIN_INT53 = Number.MIN_SAFE_INTEGER;
const MAX_INT53 = Number.MAX_SAFE_INTEGER;
/**
 * Represents a utility class for validating data ranges.
 *
 * @class
 */
class DataRange {
    /**
     * Checks if a number is within the range of unsigned 53-bit integers.
     *
     * @param num - The number to check.
     * @returns A boolean indicating whether the number is within the range.
     */
    static inUInt53(num) {
        return num >= MIN_UINT && num <= MAX_UINT53;
    }
    /**
     * Checks if a number is within the range of signed 53-bit integers.
     *
     * @param num - The number to check.
     * @returns A boolean indicating whether the number is within the range.
     */
    static inInt53(num) {
        return num >= MIN_INT53 && num <= MAX_INT53;
    }
}
exports.DataRange = DataRange;
