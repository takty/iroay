/**
 * This class converts the LCh color system.
 *
 * @author Takuto Yanagida
 * @version 2024-08-14
 */

import { Triplet } from './_type';
import { DEG_RAD, RAD_DEG, PI2 } from './_const';

export class LCh {

	// Lab ---------------------------------------------------------------------


	/**
	 * Convert CIELAB (L*a*b*) to LCh.
	 * @param {Triplet} lab L*, a*, b* of CIELAB color.
	 * @param {Triplet} dest dest An array where the result will be stored. If not provided, a new array will be created and returned.
	 * @return {Triplet} LCh color.
	 */
	static fromLab([ls, as, bs]: Triplet, dest: Triplet = [0, 0, 0]): Triplet {
		const rad = Math.atan2(bs, as) + (bs < 0 ? PI2 : 0);
		dest[0] = ls;
		dest[1] = Math.sqrt(as * as + bs * bs);
		dest[2] = rad * RAD_DEG;
		return dest;
	}

	/**
	 * Convert LCh to CIELAB (L*a*b*).
	 * @param {Triplet} lch LCh color.
	 * @param {Triplet} dest dest An array where the result will be stored. If not provided, a new array will be created and returned.
	 * @return {Triplet} L*, a*, b* of CIELAB color.
	 */
	static toLab([ls, cs, h]: Triplet, dest: Triplet = [0, 0, 0]): Triplet {
		const rad = h * DEG_RAD;
		dest[0] = ls;
		dest[1] = Math.cos(rad) * cs;
		dest[2] = Math.sin(rad) * cs;
		return dest;
	}

}
