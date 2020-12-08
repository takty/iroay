/**
 *
 * This class simulates color vision characteristics.
 *
 * @author Takuto Yanagida
 * @version 2020-12-08
 *
 */


class ColorVisionSimulation {

	/*
	 * Reference: Brettel, H.; Viénot, F. & Mollon, J. D.,
	 * Computerized simulation of color appearance for dichromats,
	 * Journal of the Optical Society of America A, 1997, 14, 2647-2655.
	 */

	/**
	 * Simulate protanopia
	 * @param {number[]} lms LMS color
	 * @return {number[]} LMS color in protanopia
	 */
	static brettelP([l, m, s]) {
		return [
			0.0 * l + 2.02344 * m + -2.52581 * s,
			0.0 * l + 1.0     * m +  0.0     * s,
			0.0 * l + 0.0     * m +  1.0     * s,
		];
	}

	/**
	 * Simulate deuteranopia
	 * @param {number[]} lms LMS color
	 * @return {number[]} LMS color in deuteranopia
	 */
	static brettelD([l, m, s]) {
		return [
			1.0      * l + 0.0 * m + 0.0     * s,
			0.494207 * l + 0.0 * m + 1.24827 * s,
			0.0      * l + 0.0 * m + 1.0     * s,
		];
	}

	/*
	 * Reference: Katsunori Okajima, Syuu Kanbe,
	 * A Real-time Color Simulation of Dichromats,
	 * IEICE technical report 107(117), 107-110, 2007-06-21.
	 */

	/**
	 * Correct simulation of protanopia
	 * @param {number} m Original M of LMS color
	 * @param {number[]} lms LMS color of protanopia simulation
	 * @param {number[]} base Base LMS color
	 * @return {number[]} LMS color in protanopia
	 */
	static okajimaCorrectionP(m, [l2, m2, s2], base) {
		const sp1 = m / base[1];
		const dp0 = l2 / base[0];
		const dp1 = m2 / base[1];
		const dp2 = s2 / base[2];
		const k = ColorVisionSimulation.BETA * sp1 / (ColorVisionSimulation.ALPHA * dp0 + ColorVisionSimulation.BETA * dp1);
		return [
			(k * dp0) * base[0],
			(k * dp1) * base[1],
			(k * dp2) * base[2]
		];
	}

	/**
	 * Correct simulation of deuteranopia
	 * @param {number} l Original L of LMS color
	 * @param {number[]} lms LMS color of deuteranopia simulation
	 * @param {number[]} base Base LMS color
	 * @return {number[]} LMS color in deuteranopia
	 */
	static okajimaCorrectionD(l, [l2, m2, s2], base) {
		const sp0 = l / base[0];
		const dp0 = l2 / base[0];
		const dp1 = m2 / base[1];
		const dp2 = s2 / base[2];
		const k = ColorVisionSimulation.ALPHA * sp0 / (ColorVisionSimulation.ALPHA * dp0 + ColorVisionSimulation.BETA * dp1);
		return [
			(k * dp0) * base[0],
			(k * dp1) * base[1],
			(k * dp2) * base[2]
		];
	}


	// -------------------------------------------------------------------------


	/**
	 * Convert LMS to LMS in protanopia (Method 1).
	 * @param {number[]} lms LMS color
	 * @param {boolean} doCorrection
	 * @return {number[]} LMS color in protanopia
	 */
	static lmsToProtanopia(lms, doCorrection = false) {
		const ds = ColorVisionSimulation.brettelP(lms);
		if (!doCorrection) return ds;
		return ColorVisionSimulation.okajimaCorrectionP(lms[1], ds, ColorVisionSimulation.LMS_BASE);
	}

	/**
	 * Convert LMS to LMS in deuteranopia (Method 1).
	 * @param {number[]} lms LMS color
	 * @param {boolean} doCorrection
	 * @return {number[]} LMS color in deuteranopia
	 */
	static lmsToDeuteranopia(lms, doCorrection = false) {
		const ds = ColorVisionSimulation.brettelD(lms);
		if (!doCorrection) return ds;
		return ColorVisionSimulation.okajimaCorrectionD(lms[0], ds, ColorVisionSimulation.LMS_BASE);
	}


	// -------------------------------------------------------------------------


	/**
	 * Convert Linear RGB to LMS in protanopia (Method 2).
	 * @param {number[]} lrgb Linear RGB color
	 * @param {boolean} doCorrection
	 * @return {number[]} LMS color in protanopia
	 */
	static lrgbToProtanopia([lr, lg, lb], doCorrection = false) {
		const lrgb2 = [
			0.992052 * lr + 0.003974,
			0.992052 * lg + 0.003974,
			0.992052 * lb + 0.003974,
		];
		const lms = COLOR_SPACE_NS.LMS.fromXYZ(COLOR_SPACE_NS.XYZ.fromLRGB(lrgb2));
		const lms2 = ColorVisionSimulation.brettelP(lms);

		let lms3;
		if (doCorrection) {
			lms3 = ColorVisionSimulation.okajimaCorrectionP(lms[1], lms2, ColorVisionSimulation.LMS_BASE2);
		} else {
			lms3 = lms2;
		}
		return COLOR_SPACE_NS.LRGB.fromXYZ(COLOR_SPACE_NS.XYZ.fromLMS(lms3));
	}

	/**
	 * Convert Linear RGB to LMS in deuteranopia (Method 2).
	 * @param {number[]} lrgb Linear RGB color
	 * @param {boolean} doCorrection
	 * @return {number[]} LMS color in deuteranopia
	 */
	static lrgbToDeuteranopia([lr, lg, lb], doCorrection = false) {
		const lrgb2 = [
			0.957237 * lr + 0.0213814,
			0.957237 * lg + 0.0213814,
			0.957237 * lb + 0.0213814,
		];
		const lms = COLOR_SPACE_NS.LMS.fromXYZ(COLOR_SPACE_NS.XYZ.fromLRGB(lrgb2));
		const lms2 = ColorVisionSimulation.brettelD(lms);

		let lms3;
		if (doCorrection) {
			lms3 = ColorVisionSimulation.okajimaCorrectionD(lms[0], lms2, ColorVisionSimulation.LMS_BASE2);
		} else {
			lms3 = lms2;
		}
		return ColorVisionSimulation.LRGB.fromXYZ(COLOR_SPACE_NS.XYZ.fromLMS(lms3));
	}

}

ColorVisionSimulation.LMS_BASE  = COLOR_SPACE_NS.LMS.fromXYZ([1, 1, 1]);
ColorVisionSimulation.LMS_BASE2 = COLOR_SPACE_NS.LMS.fromXYZ(COLOR_SPACE_NS.XYZ.fromLRGB([1, 1, 1]));

ColorVisionSimulation.ALPHA = 1;
ColorVisionSimulation.BETA  = 1;