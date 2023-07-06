module.exports = {
	transform: {
		'^.+\\.tsx?$': 'ts-jest',
	},
	testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.(jsx?|tsx?)$',
	testPathIgnorePatterns: ['/lib/', '/node_modules/', '/__tests__/utils/'],
	moduleFileExtensions: ['js', 'ts', 'd.ts'],
	collectCoverage: true,
};