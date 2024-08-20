/**
 * Calculation of the conspicuity degree.
 * Reference: Effective use of color conspicuity for Re-Coloring system,
 * Correspondences on Human interface Vol. 12, No. 1, SIG-DE-01, 2010.
 *
 * @author Takuto Yanagida
 * @version 2024-08-18
 */

import { Triplet } from './../type';
import { RAD_DEG, atan2rad } from './../math';

/**
 * Calculate the conspicuity degree.
 * @param {Triplet} lab L*, a*, b* of CIELAB color
 * @return {number} Conspicuity degree [0, 180]
 * TODO Consider chroma (ab radius of LAB)
 */
export function conspicuityOfLab([, as, bs]: Triplet): number {
	const rad = atan2rad(bs, as);
	const h = rad * RAD_DEG;
	const a = 35;  // Constant
	if (h < a) return Math.abs(180 - (360 + h - a));
	else return Math.abs(180 - (h - a));
}
