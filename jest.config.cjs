module.exports = {
	transform: {
		'^.+\\.tsx?$': 'ts-jest',
	},
	testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.(jsx?|tsx?)$',
	testPathIgnorePatterns: ['/lib/', '/node_modules/', '/__tests__/utils/'],
	moduleFileExtensions: ['js', 'ts', 'd.ts'],
	// The source files import each other with a .js extension, as ES modules
	// must. Jest loads the TypeScript files, so remove the extension.
	moduleNameMapper: {
		'^(\\.{1,2}/.*)\\.js$': '$1',
	},
	collectCoverage: true,
};
