/**
 * Functions for Color Space Conversion
 *
 * @author Takuto Yanagida
 * @version 2024-08-14
 */

import { Triplet } from './_type';
import { Lab } from './_cs-lab';
import { LRGB } from './_cs-lrgb';
import { RGB } from './_cs-rgb';
import { XYZ } from './_cs-xyz';
import { Yxy } from './_cs-yxy';
import { Munsell } from './_cs-munsell';

export function isRGBSaturated(): boolean {
	return RGB.isSaturated;
}

export function isYxySaturated(): boolean {
	return Yxy.isSaturated;
}

export function isMunsellSaturated(): boolean {
	return Munsell.isSaturated;
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
