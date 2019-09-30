/**
 *
 * This class converts the Yxy color system.
 *
 * @author Takuto Yanagida
 * @version 2019-09-29
 *
 */


class Yxy extends ColorSpace {

	/**
	 * Convert CIE 1931 XYZ to Yxy.
	 * @param src XYZ color
	 * @return Yxy color
	 */
	static fromXYZ(src) {
		const d0 = src[1];
		const d1 = src[0] / (src[0] + src[1] + src[2]);
		const d2 = src[1] / (src[0] + src[1] + src[2]);
		if (Number.isNaN(d1) || Number.isNaN(d2)) {  // When X = 0, Y = 0, Z = 0
			return [d0, 0.31273, 0.32902];  // White point D65
		}
		return [d0, d1, d2];
	}

	/**
	 * Convert Yxy to CIE 1931 XYZ.
	 * @param src Yxy color
	 * @return XYZ color
	 */
	static toXYZ(src) {
		const d0 = src[1] * src[0] / src[2];
		if (Number.isNaN(d0)) {
			Yxy.isSaturated = false;
			return [0.0, 0.0, 0.0];
		}
		const d1 = src[0];
		const d2 = (1 - src[1] - src[2]) * src[0] / src[2];
		Yxy.isSaturated = (Lab.D65_XYZ[0] < d0 || Lab.D65_XYZ[1] < d1 || Lab.D65_XYZ[2] < d2);
		return [d0, d1, d2];
	}


	// Evaluation Function -----------------------------------------------------


	/**
	 * Calculate the basic categorical color of the specified color.
	 * @param yxy Yxy color
	 * @return Basic categorical color
	 */
	static categoryOf(yxy) {
		return Evaluation.categoryOfYxy(yxy);
	}

}

Yxy.isSaturated = false;
