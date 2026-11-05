/**
 * Schema gives the type of a value. The encoder and the decoder use the
 * schema to select the wire form of the value.
 *
 * - `kind` is the name of the type, for example `integer` or `struct`.
 * - `fields` holds the schemas of the parts of a compound type. An array
 *   has `values`. A map has `keys` and `values`. A struct has one schema
 *   for each field, in the order of the fields.
 * - `optional` marks a type that can hold "no value". Refer to Schema.optional.
 */
export interface Schema {
	kind: string;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	fields?: Record<string, any>;

	/**
	 * Set `optional` to true for a value that can be absent. Go uses a
	 * pointer for such a value, for example `*uint64`, and go-polo writes a
	 * Null for a nil pointer.
	 *
	 * - The encoder writes a Null for `null` and `undefined`.
	 * - The decoder gives `null` for a Null.
	 *
	 * The kinds `array`, `map`, `bytes`, `raw` and `document` accept a Null
	 * without `optional`, because "no value" is a valid value for them.
	 * The kinds `bool`, `integer`, `float`, `string` and `struct` reject a
	 * Null without `optional`.
	 */
	optional?: boolean;
}
