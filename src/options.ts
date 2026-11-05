/**
 * The default limit on the nesting depth of compound elements for the
 * decoder. go-polo and rs-polo have the same default: 1000 levels decode,
 * and 1001 levels are an error.
 */
export const DEFAULT_MAX_DEPTH = 1000;

/**
 * Options of the encoder. An option is an agreement: the encoder and the
 * decoder must use the same options.
 */
export interface EncodeOptions {
	/**
	 * Write each struct as a document, at all levels. The keys are the
	 * field names. The encoder writes all fields, also the fields with zero
	 * values. go-polo has the same option: DocStructs.
	 */
	docStructs?: boolean;
}

/**
 * Options of the decoder.
 */
export interface DecodeOptions {
	/**
	 * Accept a document and a pack for each struct. For a document, the
	 * decoder ignores unknown keys and gives the zero value to each field
	 * that has no key. go-polo has the same option: DocStructs. Without
	 * this option, a struct rejects a document.
	 */
	docStructs?: boolean;

	/**
	 * The maximum nesting depth of compound elements. A wire with more
	 * levels causes an error. The default is DEFAULT_MAX_DEPTH. A value less
	 * than 1 removes the limit.
	 */
	maxDepth?: number;
}

/**
 * The decode options with a value for each option.
 */
export interface DecodeConfig {
	docStructs: boolean;
	maxDepth: number;
}

/**
 * Returns the decode options with the default value for each option that
 * is not set.
 *
 * @param {DecodeOptions} options - The options.
 * @returns {DecodeConfig} The options with a value for each option.
 */
export const decodeConfig = (options?: DecodeOptions): DecodeConfig => ({
	docStructs: options?.docStructs ?? false,
	maxDepth: options?.maxDepth ?? DEFAULT_MAX_DEPTH,
});

/**
 * Throws an error if a nesting depth is more than the limit.
 *
 * @param {DecodeConfig} config - The decode options.
 * @param {number} depth - The nesting depth. The top-level element of a
 * wire has the depth 0, and its compound element is at depth 1.
 */
export const checkDepth = (config: DecodeConfig, depth: number): void => {
	if(config.maxDepth > 0 && depth > config.maxDepth) {
		throw new Error(`nesting limit: the wire has more than ${config.maxDepth} levels of compound elements`);
	}
};
