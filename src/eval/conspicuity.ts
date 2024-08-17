/**
 * Evaluation Methods (Conspicuity)
 *
 * @author Takuto Yanagida
 * @version 2024-08-17
 */

import { Triplet } from './../type';
import { RAD_DEG, PI2 } from './../const';

export class Conspicuity {

	// Calculation of the conspicuity degree -----------------------------------


	/**
	 * Calculate the conspicuity degree.
	 * Reference: Effective use of color conspicuity for Re-Coloring system,
	 * Correspondences on Human interface Vol. 12, No. 1, SIG-DE-01, 2010.
	 * @param {Triplet} lab L*, a*, b* of CIELAB color
	 * @return {number} Conspicuity degree [0, 180]
	 * TODO Consider chroma (ab radius of LAB)
	 */
	static conspicuityOfLab([, as, bs]: Triplet): number {
		const rad = Math.atan2(bs, as) + (bs < 0 ? PI2 : 0);
		const h = rad * RAD_DEG;
		const a = 35;  // Constant
		if (h < a) return Math.abs(180 - (360 + h - a));
		else return Math.abs(180 - (h - a));
	}

}
