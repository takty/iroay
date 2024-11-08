/**
 * Functions for Color Space Conversion
 *
 * @author Takuto Yanagida
 * @version 2024-11-08
 */

import { Triplet } from './type';

import * as Lab from './cs/lab';
import * as Lrgb from './cs/lrgb';
import * as Rgb from './cs/rgb';
import * as Xyz from './cs/xyz';

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
export function toMonochromeRgb(rgb: Triplet): Triplet {
	const l: number = Lab.lightnessFromXyz(Xyz.fromLrgb(Lrgb.fromRgb(rgb)));
	return Rgb.fromLrgb(Lrgb.fromXyz(Xyz.fromLab([l, 0, 0])));
}
