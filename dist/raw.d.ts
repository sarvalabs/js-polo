import { WireType } from './wiretype';
export declare class Raw {
    bytes: Uint8Array;
    constructor(bytes: Uint8Array);
    is(kind: WireType): boolean;
}
