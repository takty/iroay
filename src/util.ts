/**
 * Functions for Color Space Conversion
 *
 * @author Takuto Yanagida
 * @version 2024-08-17
 */

import { Triplet } from './type';

import { Lab } from './cs/lab';
import { LRGB } from './cs/lrgb';
import { RGB } from './cs/rgb';
import { XYZ } from './cs/xyz';

/**
 * Convert sRGB to Lightness-only sRGB.
 * @param {Triplet} rgb sRGB color
 * @return {Triplet} Lightness-only sRGB color
 */
export function toMonochromeRGB(rgb: Triplet): Triplet {
	const l = Lab.lightnessFromXYZ(XYZ.fromLRGB(LRGB.fromRGB(rgb)));
	return RGB.fromLRGB(LRGB.fromXYZ(XYZ.fromLab([l, 0, 0])));
}
