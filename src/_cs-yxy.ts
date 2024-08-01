/**
 * This class converts the Yxy color system.
 *
 * @author Takuto Yanagida
 * @version 2024-08-01
 */

import { Triplet } from './_type';
import { Lab } from './_cs-lab';
import { Evaluation } from './_eval';

export class Yxy {
	static isSaturated = false;

	/**
	 * Convert CIE 1931 XYZ to Yxy.
	 * @param {Triplet} xyz XYZ color
	 * @return {Triplet} Yxy color
	 */
	static fromXYZ([x, y, z]: Triplet): Triplet {
		const sum = x + y + z;
		if (sum === 0) return [y, 0.31273, 0.32902];  // White point D65
		return [y, x / sum, y / sum];
	}

	/**
	 * Convert Yxy to CIE 1931 XYZ.
	 * @param {Triplet} yxy Yxy color
	 * @return {Triplet} XYZ color
	 */
	static toXYZ([y, sx, sy]: Triplet): Triplet {
		const d0 = sx * y / sy;
		if (!Number.isFinite(d0)) {
			Yxy.isSaturated = false;
			return [0, 0, 0];
		}
		const d1 = y;
		const d2 = (1 - sx - sy) * y / sy;
		Yxy.isSaturated = (Lab.D65_XYZ[0] < d0 || Lab.D65_XYZ[1] < d1 || Lab.D65_XYZ[2] < d2);
		return [d0, d1, d2];
	}


	// Evaluation Function -----------------------------------------------------


	/**
	 * Calculate the basic categorical color of the specified color.
	 * @param {Triplet} yxy Yxy color
	 * @return {string} Basic categorical color
	 */
	static categoryOf(yxy: Triplet): string {
		return Evaluation.categoryOfYxy(yxy);
	}
}
