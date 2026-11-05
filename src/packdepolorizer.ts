import { Depolorizer } from './depolorizer.js';
import { DecodeOptions } from './options.js';

/**
 * Represents a PackDepolorizer used for depolarizing encoded data.
 * The wire must be a pack or a document.
 * 
 * @class
 */
export class PackDepolorizer {
	public depolorizer: Depolorizer;

	constructor(data: Uint8Array, options?: DecodeOptions) {
		this.depolorizer = new Depolorizer(data, options).depolorizePacked();
	}
}
