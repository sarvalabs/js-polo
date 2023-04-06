import LoadReader from './loadreader';
import { Schema } from '../types/schema';
import { Raw } from './raw';
import { ReadBuffer } from './readbuffer';
import { Document } from './document';
export declare class Depolorizer {
    done: boolean;
    packed: boolean;
    data: ReadBuffer;
    load: LoadReader;
    constructor(data: Uint8Array, load?: LoadReader);
    isDone(): boolean;
    read(): ReadBuffer;
    private newLoadDepolorizer;
    depolorize(schema: Schema): unknown;
    depolorizeNull(): null;
    depolorizeBool(): boolean;
    depolorizeInteger(): number | bigint;
    depolorizeFloat(): number;
    depolorizeString(): string;
    depolorizeRaw(): Raw;
    depolorizeBytes(): Uint8Array;
    private depolorizeArray;
    depolorizeDocument(): Document;
    depolorizePacked(): Depolorizer;
    depolorizeInner(): Depolorizer;
    private depolorizeMap;
    private depolorizeStruct;
}
