import type { SchemaDefinition } from './schema-definition';
import type { MapSchema, PrimitiveKind, PrimitiveSchema, Schema } from './schema-types';

const createPrimitiveScheme = <TKind extends PrimitiveKind>(type: TKind): PrimitiveSchema<TKind> => {
	return Object.freeze({ kind: type });
};

/**
 * The schema definition object.
 */
export const schema: SchemaDefinition = Object.freeze({
	boolean: createPrimitiveScheme('bool'),

	string: createPrimitiveScheme('string'),

	integer: createPrimitiveScheme('integer'),

	null: createPrimitiveScheme('null'),

	bytes: createPrimitiveScheme('bytes'),

	document: createPrimitiveScheme('document'),

	float: createPrimitiveScheme('float'),

	raw: createPrimitiveScheme('raw'),

	struct(schema: Record<string, Schema>) {
		return Object.freeze({ kind: 'struct', fields: schema });
	},

	arrayOf(schema: Schema) {
		return Object.freeze({ kind: 'array', fields: { values: schema } });
	},

	map(keyValue: MapSchema['fields']): MapSchema {
		return Object.freeze({ kind: 'map', fields: keyValue });
	},
});
