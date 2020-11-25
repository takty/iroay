/**
 *
 * This class converts the Yxy color system.
 *
 * @author Takuto Yanagida
 * @version 2019-10-13
 *
 */


class Yxy {

	/**
	 * Convert CIE 1931 XYZ to Yxy.
	 * @param x X of XYZ color
	 * @param y Y of XYZ color
	 * @param z Z of XYZ color
	 * @return Yxy color
	 */
	static fromXYZ(x, y, z) {
		const sum = x + y + z;
		if (sum === 0) return [y, 0.31273, 0.32902];  // White point D65
		return [y, x / sum, y / sum];
	}

	/**
	 * Convert Yxy to CIE 1931 XYZ.
	 * @param y Y of Yxy color
	 * @param sx Small x of Yxy color
	 * @param sy Small y of Yxy color
	 * @return XYZ color
	 */
	static toXYZ(y, sx, sy) {
		const d0 = sx * y / sy;
		if (Number.isNaN(d0)) {
			Yxy.isSaturated = false;
			return [0.0, 0.0, 0.0];
		}
		const d1 = y;
		const d2 = (1 - sx - sy) * y / sy;
		Yxy.isSaturated = (Lab.D65_XYZ[0] < d0 || Lab.D65_XYZ[1] < d1 || Lab.D65_XYZ[2] < d2);
		return [d0, d1, d2];
	}


	// Evaluation Function -----------------------------------------------------


	/**
	 * Calculate the basic categorical color of the specified color.
	 * @param y Y of Yxy color
	 * @param sx Small x of Yxy color
	 * @param sy Small y of Yxy color
	 * @return Basic categorical color
	 */
	static categoryOf(y, sx, sy) {
		return Evaluation.categoryOfYxy(y, sx, sy);
	}

}

Yxy.isSaturated = false;