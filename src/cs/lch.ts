/**
 * This class converts the LCh color system.
 *
 * @author Takuto Yanagida
 * @version 2024-08-19
 */

import { Triplet } from '../type';
import { DEG_RAD, RAD_DEG, atan2rad, mag } from '../math';


// Lab ---------------------------------------------------------------------


/**
 * Convert CIELAB (L*a*b*) to LCh.
 * @param {Triplet} lab L*, a*, b* of CIELAB color.
 * @param {Triplet} dest dest An array where the result will be stored. If not provided, a new array will be created and returned.
 * @return {Triplet} LCh color.
 */
export function fromLab([ls, as, bs]: Triplet, dest: Triplet = [0, 0, 0]): Triplet {
	const rad = atan2rad(bs, as);
	dest[0] = ls;
	dest[1] = mag(as, bs);
	dest[2] = rad * RAD_DEG;
	return dest;
}

/**
 * Convert LCh to CIELAB (L*a*b*).
 * @param {Triplet} lch LCh color.
 * @param {Triplet} dest dest An array where the result will be stored. If not provided, a new array will be created and returned.
 * @return {Triplet} L*, a*, b* of CIELAB color.
 */
export function toLab([ls, cs, h]: Triplet, dest: Triplet = [0, 0, 0]): Triplet {
	const rad = h * DEG_RAD;
	dest[0] = ls;
	dest[1] = Math.cos(rad) * cs;
	dest[2] = Math.sin(rad) * cs;
	return dest;
}
