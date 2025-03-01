/**
 * This class converts the HWB color system.
 *
 * @author Takuto Yanagida
 * @version 2025-03-01
 */

import { Triplet } from '../type';

import { toRgb as fromHsl } from './hsl';


// RGB -------------------------------------------------------------------------


/**
 * Convert RGB to HWB.
 * @param {Triplet} rgb RGB color.
 * @param {Triplet} dest dest An array where the result will be stored. If not provided, a new array will be created and returned.
 * @return {Triplet} HWB color.
 */
export function fromRgb([r, g, b]: Triplet, dest: Triplet = [0, 0, 0]): Triplet {
	r = r / 255;
	g = g / 255;
	b = b / 255;

	const v: number = Math.max(r, g, b);
	const c: number = v - Math.min(r, g, b);

	let h: number = 0;
	if (c !== 0) {
		if (v === r) h = 60 * ((g - b) / c % 6);
		if (v === g) h = 60 * ((b - r) / c + 2);
		if (v === b) h = 60 * ((r - g) / c + 4);
	}
	h = (h + 360) % 360;

	dest[0] = h;
	dest[1] = 100 * Math.min(r, g, b);
	dest[2] = 100 * (1 - Math.max(r, g, b));
	return dest;
}

/**
 * Convert HWB to RGB.
 * @param {Triplet} hwb HWB color.
 * @param {Triplet} dest dest An array where the result will be stored. If not provided, a new array will be created and returned.
 * @return {Triplet} RGB color.
 */
export function toRgb([h, w, b]: Triplet, dest: Triplet = [0, 0, 0]): Triplet {
	w /= 100;
	b /= 100;
	if (w + b >= 1) {
		const g: number = w / (w + b);
		return [g, g, g];
	}
	fromHsl([h, 100, 50], dest);
	for (let i: number = 0; i < 3; i++) {
		dest[i] *= (1 - w - b);
		dest[i] += w;
	}
	return dest;
}
