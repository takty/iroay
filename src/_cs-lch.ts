/**
 * This class converts the LCh color system.
 *
 * @author Takuto Yanagida
 * @version 2024-08-14
 */

import { Triplet } from './_type';

export class LCh {

	// Lab ---------------------------------------------------------------------


	/**
	 * Convert CIELAB (L*a*b*) to LCh.
	 * @param {Triplet} lab L*, a*, b* of CIELAB color.
	 * @param {Triplet} dest dest An array where the result will be stored. If not provided, a new array will be created and returned.
	 * @return {Triplet} LCh color.
	 */
	static fromLab([ls, as, bs]: Triplet, dest: Triplet = [0, 0, 0]): Triplet {
		const rad = (bs > 0) ? Math.atan2(bs, as) : (Math.atan2(-bs, -as) + Math.PI);
		dest[0] = ls;
		dest[1] = Math.sqrt(as * as + bs * bs);
		dest[2] = rad * 360 / (Math.PI * 2);
		return dest;
	}

	/**
	 * Convert LCh to CIELAB (L*a*b*).
	 * @param {Triplet} lch LCh color.
	 * @param {Triplet} dest dest An array where the result will be stored. If not provided, a new array will be created and returned.
	 * @return {Triplet} L*, a*, b* of CIELAB color.
	 */
	static toLab([ls, cs, h]: Triplet, dest: Triplet = [0, 0, 0]): Triplet {
		const rad = h * (Math.PI * 2) / 360;
		dest[0] = ls;
		dest[1] = Math.cos(rad) * cs;
		dest[2] = Math.sin(rad) * cs;
		return dest;
	}

}
