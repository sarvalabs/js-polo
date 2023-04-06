const MIN_UINT = 0;
const MAX_UINT53 = Number.MAX_SAFE_INTEGER;
const MIN_INT53 = Number.MIN_SAFE_INTEGER;
const MAX_INT53 = Number.MAX_SAFE_INTEGER;
export class DataRange {
    static inUInt53(num) {
        return num >= MIN_UINT && num <= MAX_UINT53;
    }
    static inInt53(num) {
        return num >= MIN_INT53 && num <= MAX_INT53;
    }
}
