/**
 * This class converts the HSL color system.
 *
 * @author Takuto Yanagida
 * @version 2024-11-10
 */

import { Triplet } from '../type';


// RGB -------------------------------------------------------------------------


/**
 * Convert RGB to HSL.
 * @param {Triplet} rgb RGB color.
 * @param {Triplet} dest dest An array where the result will be stored. If not provided, a new array will be created and returned.
 * @return {Triplet} HSL color.
 */
export function fromRgb([r, g, b]: Triplet, dest: Triplet = [0, 0, 0]): Triplet {
	r = r / 255;
	g = g / 255;
	b = b / 255;

	const v: number = Math.max(r, g, b);
	const c: number = v - Math.min(r, g, b);
	const l: number = v - c / 2;

	let s: number = 0;
	if (l !== 0 && l !== 1) {
		s = (v - l) / Math.min(l, 1 - l);
	}

	let h: number = 0;
	if (c !== 0) {
		if (v === r) h = 60 * ((g - b) / c % 6);
		if (v === g) h = 60 * ((b - r) / c + 2);
		if (v === b) h = 60 * ((r - g) / c + 4);
	}
	h = (h + 360) % 360;

	dest[0] = h;
	dest[1] = s * 100;
	dest[2] = l * 100;
	return dest;
}

/**
 * Convert HSL to RGB.
 * @param {Triplet} hsl HSL color.
 * @param {Triplet} dest dest An array where the result will be stored. If not provided, a new array will be created and returned.
 * @return {Triplet} RGB color.
 */
export function toRgb([h, s, l]: Triplet, dest: Triplet = [0, 0, 0]): Triplet {
	s = s / 100;
	l = l / 100;
	const c: number = (1 - Math.abs(2 * l - 1)) * s;

	const hp: number = h / 60;
	const x: number = c * (1 - Math.abs(hp % 2 - 1));

	let r: number = 0, g: number = 0, b: number = 0;
	if (0 <= hp && hp < 1) { r = c, g = x; }
	if (1 <= hp && hp < 2) { r = x, g = c; }
	if (2 <= hp && hp < 3) { g = c, b = x; }
	if (3 <= hp && hp < 4) { g = x, b = c; }
	if (4 <= hp && hp < 5) { r = x, b = c; }
	if (5 <= hp && hp < 6) { r = c, b = x; }

	const m: number = l - c / 2;
	dest[0] = Math.round((r + m) * 255);
	dest[1] = Math.round((g + m) * 255);
	dest[2] = Math.round((b + m) * 255);
	return dest;
}
