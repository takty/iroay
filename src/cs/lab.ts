/**
 * This class converts the CIELAB (L*a*b*) color system.
 * By default, D65 is used as tristimulus value.
 * Reference: http://en.wikipedia.org/wiki/Lab_color_space
 *
 * @author Takuto Yanagida
 * @version 2024-08-18
 */

import { Triplet } from '../type';
import { D65_XYZ } from '../const';

export { toLab as fromLCh, fromLab as toLCh } from './lch';

// Constants for simplification of calculation
const C1 = Math.pow(6, 3) / Math.pow(29, 3);      // (6/29)^3 = 0.0088564516790356308171716757554635
const C2 = 3 * Math.pow(6, 2) / Math.pow(29, 2);  // 3*(6/29)^2 = 0.12841854934601664684898929845422
const C3 = 6 / 29;                                // 6/29 = 0.20689655172413793103448275862069

/**
 * XYZ tristimulus value
 */
const XYZ_TRISTIMULUS_VALUES = D65_XYZ;

// Conversion function
function fn(v: number): number {
	return (v > C1) ? Math.pow(v, 1 / 3) : (v / C2 + 4 / 29);
}

// Inverse conversion function
function ifn(v: number): number {
	return (v > C3) ? Math.pow(v, 3) : ((v - 4 / 29) * C2);
}


// XYZ ---------------------------------------------------------------------


/**
 * Convert CIE 1931 XYZ to CIE 1976 (L*, a*, b*).
 * @param {Triplet} xyz XYZ color.
 * @param {Triplet} dest dest An array where the result will be stored. If not provided, a new array will be created and returned.
 * @return {Triplet} CIELAB color.
 */
export function fromXYZ([x, y, z]: Triplet, dest: Triplet = [0, 0, 0]): Triplet {
	const fx = fn(x / XYZ_TRISTIMULUS_VALUES[0]);
	const fy = fn(y / XYZ_TRISTIMULUS_VALUES[1]);
	const fz = fn(z / XYZ_TRISTIMULUS_VALUES[2]);
	dest[0] = 116 * fy - 16;
	dest[1] = 500 * (fx - fy);
	dest[2] = 200 * (fy - fz);
	return dest;
}

/**
 * Convert CIE 1976 (L*, a*, b*) to CIE 1931 XYZ.
 * @param {Triplet} lab L*, a*, b* of CIELAB color.
 * @param {Triplet} dest dest An array where the result will be stored. If not provided, a new array will be created and returned.
 * @return {Triplet} XYZ color.
 */
export function toXYZ([ls, as, bs]: Triplet, dest: Triplet = [0, 0, 0]): Triplet {
	const fy = (ls + 16) / 116;
	const fx = fy + as / 500;
	const fz = fy - bs / 200;
	dest[0] = ifn(fx) * XYZ_TRISTIMULUS_VALUES[0];
	dest[1] = ifn(fy) * XYZ_TRISTIMULUS_VALUES[1];
	dest[2] = ifn(fz) * XYZ_TRISTIMULUS_VALUES[2];
	return dest;
}

/**
 * Convert CIE 1931 XYZ to L* of CIE 1976 (L*, a*, b*).
 * @param {Triplet} xyz XYZ color.
 * @return {number} L*
 */
export function lightnessFromXYZ([, y,]: Triplet): number {
	const fy = fn(y / XYZ_TRISTIMULUS_VALUES[1]);
	return 116 * fy - 16;
}
