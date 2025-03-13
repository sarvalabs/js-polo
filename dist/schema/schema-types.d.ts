export type PrimitiveKind = 'string' | 'integer' | 'bool' | 'null' | 'bytes' | 'float' | 'raw' | 'document';
export interface PrimitiveSchema<T extends PrimitiveKind> {
    kind: T;
}
export interface ArraySchema {
    kind: 'array';
    fields: {
        values: Schema;
    };
}
export interface MapSchema {
    kind: 'map';
    fields: {
        keys: Schema;
        values: Schema;
    };
}
export type StructPropertyKey = Exclude<PropertyKey, 'symbol'>;
export interface StructSchema {
    kind: 'struct';
    fields: Record<Exclude<PropertyKey, 'symbol'>, Schema>;
}
/**
 * Represents a schema which can be one of the following types:
 *
 * - `PrimitiveSchema<PrimitivePoloTypes>`: A schema for primitive types.
 * - `ArraySchema`: A schema for arrays.
 * - `MapSchema`: A schema for maps.
 * - `StructSchema`: A schema for structured data.
 */
export type Schema = PrimitiveSchema<PrimitiveKind> | ArraySchema | MapSchema | StructSchema;
