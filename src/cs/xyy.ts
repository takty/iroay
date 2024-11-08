/**
 * This class converts the xyY color system.
 *
 * @author Takuto Yanagida
 * @version 2024-11-08
 */

import { Triplet } from '../type';
import { D65_xyz, D65_XYZ } from '../const';

export let isSaturated: boolean = false;


// XYZ ---------------------------------------------------------------------


/**
 * Convert CIE 1931 XYZ to xyY.
 * @param {Triplet} xyz XYZ color.
 * @param {Triplet} dest dest An array where the result will be stored. If not provided, a new array will be created and returned.
 * @return {Triplet} xyY color.
 */
export function fromXyz([x, y, z]: Triplet, dest: Triplet = [0, 0, 0]): Triplet {
	dest[0] = y;
	const sum = x + y + z;
	if (sum === 0) {
		dest[1] = D65_xyz[0];
		dest[2] = D65_xyz[1];
	} else {
		dest[1] = x / sum;
		dest[2] = y / sum;
	}
	return dest;
}

/**
 * Convert xyY to CIE 1931 XYZ.
 * @param {Triplet} xyy xyY color.
 * @param {Triplet} dest dest An array where the result will be stored. If not provided, a new array will be created and returned.
 * @return {Triplet} XYZ color.
 */
export function toXyz([y, sx, sy]: Triplet, dest: Triplet = [0, 0, 0]): Triplet {
	const d0: number = sx * y / sy;
	if (!Number.isFinite(d0)) {
		isSaturated = false;
		dest[0] = 0;
		dest[1] = 0;
		dest[2] = 0;
	} else {
		const d1: number = y;
		const d2: number = (1 - sx - sy) * y / sy;
		isSaturated = (D65_XYZ[0] < d0 || D65_XYZ[1] < d1 || D65_XYZ[2] < d2);
		dest[0] = d0;
		dest[1] = d1;
		dest[2] = d2;
	}
	return dest;
}
