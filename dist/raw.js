export class Raw {
    bytes;
    constructor(bytes) {
        this.bytes = bytes;
    }
    is(kind) {
        return this.bytes[0] == kind;
    }
}
