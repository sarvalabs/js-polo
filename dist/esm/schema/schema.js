const createPrimitiveScheme = (type) => {
    return Object.freeze({ kind: type });
};
/**
 * The schema definition object.
 */
export const schema = Object.freeze({
    boolean: createPrimitiveScheme('bool'),
    string: createPrimitiveScheme('string'),
    integer: createPrimitiveScheme('integer'),
    null: createPrimitiveScheme('null'),
    bytes: createPrimitiveScheme('bytes'),
    document: createPrimitiveScheme('document'),
    float: createPrimitiveScheme('float'),
    raw: createPrimitiveScheme('raw'),
    struct(schema) {
        return Object.freeze({ kind: 'struct', fields: schema });
    },
    arrayOf(schema) {
        return Object.freeze({ kind: 'array', fields: { values: schema } });
    },
    map(keyValue) {
        return Object.freeze({ kind: 'map', fields: keyValue });
    },
});
