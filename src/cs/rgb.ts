/**
 * This class converts the sRGB color system.
 * Reference: http://www.w3.org/Graphics/Color/sRGB.html
 *
 * @author Takuto Yanagida
 * @version 2024-08-18
 */

import { Triplet } from '../type';

export const MIN: number = 0;
export const MAX: number = 255;
export const INV_MAX: number = 1 / MAX;

export let isSaturated: boolean = false;

function _checkRange(vs: Triplet, min: number, max: number): boolean {
	let isSaturated: boolean = false;
	for (let i = 0; i < 3; ++i) {
		if (vs[i] > max) { vs[i] = max; isSaturated = true; }
		else if (vs[i] < min) { vs[i] = min; isSaturated = true; }
	}
	return isSaturated;
}

// Convert sRGB to Linear RGB (gamma correction).
function _fn(v: number): number {
	return (v < 0.03928) ? (v / 12.92) : Math.pow((v + 0.055) / 1.055, 2.4);
}

// Convert Linear RGB to sRGB (inverse gamma correction).
function _ifn(v: number): number {
	return (v > 0.00304) ? (Math.pow(v, 1 / 2.4) * 1.055 - 0.055) : (v * 12.92);
}


// LRGB --------------------------------------------------------------------


/**
 * Convert Linear RGB to sRGB (Gamma 2.2).
 * @param {Triplet} lrgb Linear RGB color.
 * @param {Triplet} dest dest An array where the result will be stored. If not provided, a new array will be created and returned.
 * @return {Triplet} sRGB color.
 */
export function fromLRGB([lr, lg, lb]: Triplet, dest: Triplet = [0, 0, 0]): Triplet {
	dest[0] = _ifn(lr) * MAX | 0;
	dest[1] = _ifn(lg) * MAX | 0;
	dest[2] = _ifn(lb) * MAX | 0;
	isSaturated = _checkRange(dest, MIN, MAX);
	return dest;
}

/**
 * Convert sRGB (Gamma 2.2) to Linear RGB.
 * @param {Triplet} rgb sRGB color.
 * @param {Triplet} dest dest An array where the result will be stored. If not provided, a new array will be created and returned.
 * @return {Triplet} Linear RGB color.
 */
export function toLRGB([r, g, b]: Triplet, dest: Triplet = [0, 0, 0]): Triplet {
	dest[0] = _fn(r * INV_MAX);
	dest[1] = _fn(g * INV_MAX);
	dest[2] = _fn(b * INV_MAX);
	return dest;
}
