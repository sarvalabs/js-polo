import { Buffer } from 'buffer';

// "fatal" makes the decoder throw an error for data that is not valid
// UTF-8. Without it, the decoder changes each incorrect sequence to U+FFFD.
// "ignoreBOM" keeps a byte order mark at the start of the data. Without it,
// the decoder removes the byte order mark.
const decoder = new TextDecoder('utf-8', { fatal: true, ignoreBOM: true });

/**
 * Returns true if a string is well-formed UTF-16. A well-formed string has
 * no lone surrogate. Only a well-formed string has a UTF-8 encoding.
 *
 * @param {string} value - The string to examine.
 * @returns {boolean} True if the string is well-formed.
 */
export const isWellFormed = (value: string): boolean => {
	for(let i = 0; i < value.length; i++) {
		const unit = value.charCodeAt(i);

		if(unit < 0xd800 || unit > 0xdfff) {
			continue;
		}

		// A low surrogate must follow a high surrogate.
		const next = value.charCodeAt(i + 1);
		if(unit > 0xdbff || !(next >= 0xdc00 && next <= 0xdfff)) {
			return false;
		}

		i++;
	}

	return true;
};

/**
 * Encodes a string as UTF-8. POLO does not normalize strings.
 *
 * @param {string} value - The string to encode.
 * @returns {Buffer} The UTF-8 bytes of the string.
 * @throws {Error} If the value is not a string or is not well-formed. The
 * encoder must not change a lone surrogate to U+FFFD.
 */
export const encodeUTF8 = (value: string): Buffer => {
	if(typeof value !== 'string') {
		throw new Error(`invalid string: expected a string, received ${typeof value}`);
	}

	if(!isWellFormed(value)) {
		throw new Error('invalid UTF-8 string: the string has a lone surrogate');
	}

	return Buffer.from(value, 'utf8');
};

/**
 * Decodes UTF-8 data into a string. The data must be valid UTF-8 as the
 * Unicode standard defines it. Thus the decoder rejects overlong forms,
 * surrogates and code points above U+10FFFF.
 *
 * @param {Uint8Array} data - The UTF-8 data.
 * @returns {string} The string.
 * @throws {Error} If the data is not valid UTF-8.
 */
export const decodeUTF8 = (data: Uint8Array): string => {
	try {
		return decoder.decode(data);
	} catch {
		throw new Error('invalid UTF-8 string');
	}
};

/**
 * Compares two well-formed strings in the order of their UTF-8 bytes. This
 * order is the same as the order of the code points. It is not the same as
 * the UTF-16 order of JavaScript: for example, U+FFFF is before U+10000.
 *
 * @param {string} a - The first string.
 * @param {string} b - The second string.
 * @returns {number} A negative number if a is before b, 0 if a and b are
 * equal, and a positive number if a is after b.
 */
export const compareUTF8 = (a: string, b: string): number => {
	let i = 0;

	while(i < a.length && i < b.length) {
		const x = a.codePointAt(i);
		const y = b.codePointAt(i);

		if(x !== y) {
			return x < y ? -1 : 1;
		}

		// The two code points are equal, so they use the same number of units.
		i += x > 0xffff ? 2 : 1;
	}

	return (a.length - i) - (b.length - i);
};
