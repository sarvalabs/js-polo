"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkDepth = exports.decodeConfig = exports.DEFAULT_MAX_DEPTH = void 0;
/**
 * The default limit on the nesting depth of compound elements for the
 * decoder. go-polo and rs-polo have the same default: 1000 levels decode,
 * and 1001 levels are an error.
 */
exports.DEFAULT_MAX_DEPTH = 1000;
/**
 * Returns the decode options with the default value for each option that
 * is not set.
 *
 * @param {DecodeOptions} options - The options.
 * @returns {DecodeConfig} The options with a value for each option.
 */
const decodeConfig = (options) => ({
    docStructs: options?.docStructs ?? false,
    maxDepth: options?.maxDepth ?? exports.DEFAULT_MAX_DEPTH,
});
exports.decodeConfig = decodeConfig;
/**
 * Throws an error if a nesting depth is more than the limit.
 *
 * @param {DecodeConfig} config - The decode options.
 * @param {number} depth - The nesting depth. The top-level element of a
 * wire has the depth 0, and its compound element is at depth 1.
 */
const checkDepth = (config, depth) => {
    if (config.maxDepth > 0 && depth > config.maxDepth) {
        throw new Error(`nesting limit: the wire has more than ${config.maxDepth} levels of compound elements`);
    }
};
exports.checkDepth = checkDepth;
