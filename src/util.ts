/**
 * Functions for Color Space Conversion
 *
 * @author Takuto Yanagida
 * @version 2024-08-18
 */

import { Triplet } from './type';

import * as Lab from './cs/lab';
import * as LRGB from './cs/lrgb';
import * as RGB from './cs/rgb';
import * as XYZ from './cs/xyz';

/**
 * Convert color integer to sRGB.
 * @param {number} v Color integer.
 * @param {Triplet} dest dest An array where the result will be stored. If not provided, a new array will be created and returned.
 * @return {Triplet} sRGB color.
 */
export function fromColorInteger(v: number, dest: Triplet = [0, 0, 0]): Triplet {
	dest[0] = (v >> 16) & 0xFF;
	dest[1] = (v >>  8) & 0xFF;
	dest[2] = (v      ) & 0xFF;
	return dest;
}

/**
 * Convert sRGB to color integer.
 * @param {Triplet} rgb sRGB color.
 * @return {number} Color integer.
 */
export function toColorInteger([r, g, b]: Triplet): number {
	return (r << 16) | (g << 8) | b | 0xff000000;
}

/**
 * Convert sRGB to Lightness-only sRGB.
 * @param {Triplet} rgb sRGB color
 * @return {Triplet} Lightness-only sRGB color
 */
export function toMonochromeRGB(rgb: Triplet): Triplet {
	const l = Lab.lightnessFromXYZ(XYZ.fromLRGB(LRGB.fromRGB(rgb)));
	return RGB.fromLRGB(LRGB.fromXYZ(XYZ.fromLab([l, 0, 0])));
}
