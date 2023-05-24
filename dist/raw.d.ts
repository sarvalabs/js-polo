import { WireType } from './wiretype';
export declare class Raw extends Uint8Array {
    is(kind: WireType): boolean;
}
