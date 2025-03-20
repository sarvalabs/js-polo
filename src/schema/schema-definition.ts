import type { ArraySchema, MapSchema, PrimitiveSchema, Schema, StructSchema } from './schema-types';

/**
 * Interface representing the definition of a schema.
 */
export interface SchemaDefinition {
	/**
	 * Schema for a boolean primitive type.
	 */
	boolean: PrimitiveSchema<'bool'>;

	/**
	 * Schema for an integer primitive type.
	 */
	integer: PrimitiveSchema<'integer'>;

	/**
	 * Schema for a string primitive type.
	 */
	string: PrimitiveSchema<'string'>;

	/**
	 * Schema for a null primitive type.
	 */
	null: PrimitiveSchema<'null'>;

	/**
	 * Schema for a bytes primitive type.
	 */
	bytes: PrimitiveSchema<'bytes'>;

	/**
	 * Schema for a float primitive type.
	 */
	float: PrimitiveSchema<'float'>;

	/**
	 * Schema for a raw primitive type.
	 */
	raw: PrimitiveSchema<'raw'>;

	/**
	 * Schema for a document primitive type.
	 */
	document: PrimitiveSchema<'document'>;

	/**
	 * Creates a schema for a structured object.
	 *
	 * @param schema - A record where keys are string names and values are schemas.
	 * @returns A structured schema.
	 */
	struct(schema: Record<string, Schema>): StructSchema;

	/**
	 * Creates a schema for an array of a given schema type.
	 *
	 * @param schema - The schema of the array elements.
	 * @returns An array schema.
	 */
	arrayOf(schema: Schema): ArraySchema;

	/**
	 * Creates a schema for a map with specified key & value schema.
	 *
	 * @param value - The schema of the map values.
	 * @returns A map schema.
	 */
	map(value: MapSchema['fields']): MapSchema;
}
