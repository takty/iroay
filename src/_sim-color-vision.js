/**
 *
 * This class simulates color vision characteristics.
 *
 * @author Takuto Yanagida
 * @version 2020-11-27
 *
 */


class ColorVisionSimulation {

	/**
	 * Reference: Brettel, H.; Viénot, F. & Mollon, J. D.,
	 * Computerized simulation of color appearance for dichromats,
	 * Journal of the Optical Society of America A, 1997, 14, 2647-2655.
	 */
	static brettelP(l, m, s) {
		return [
			0.0 * l + 2.02344 * m + -2.52581 * s,
			0.0 * l + 1.0     * m +  0.0     * s,
			0.0 * l + 0.0     * m +  1.0     * s,
		];
	}

	static brettelD(l, m, s) {
		return [
			1.0      * l + 0.0 * m + 0.0     * s,
			0.494207 * l + 0.0 * m + 1.24827 * s,
			0.0      * l + 0.0 * m + 1.0     * s,
		];
	}

	/**
	 * Reference: Katsunori Okajima, Syuu Kanbe,
	 * A Real-time Color Simulation of Dichromats,
	 * IEICE technical report 107(117), 107-110, 2007-06-21.
	 */
	static okajimaCorrectionP(m, l2, m2, s2, base) {
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

	static okajimaCorrectionD(l, l2, m2, s2, base) {
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
	 * @param l L of LMS color
	 * @param m M of LMS color
	 * @param s S of LMS color
	 * @param doCorrection
	 * @return LMS color in protanopia
	 */
	static lmsToProtanopia(l, m, s, doCorrection = false) {
		const ds = ColorVisionSimulation.brettelP(l, m, s);
		if (!doCorrection) return ds;
		return ColorVisionSimulation.okajimaCorrectionP(m, ...ds, ColorVisionSimulation.LMS_BASE);
	}

	/**
	 * Convert LMS to LMS in deuteranopia (Method 1).
	 * @param l L of LMS color
	 * @param m M of LMS color
	 * @param s S of LMS color
	 * @param doCorrection
	 * @return LMS color in deuteranopia
	 */
	static lmsToDeuteranopia(l, m, s, doCorrection = false) {
		const ds = ColorVisionSimulation.brettelD(l, m, s);
		if (!doCorrection) return ds;
		return ColorVisionSimulation.okajimaCorrectionD(l, ...ds, ColorVisionSimulation.LMS_BASE);
	}


	// -------------------------------------------------------------------------


	/**
	 * Convert Linear RGB to LMS in protanopia (Method 2).
	 * @param lr R of Linear RGB color
	 * @param lg G of Linear RGB color
	 * @param lb B of Linear RGB color
	 * @param doCorrection
	 * @return LMS color in protanopia
	 */
	static lrgbToProtanopia(lr, lg, lb, doCorrection = false) {
		const lr2 = 0.992052 * lr + 0.003974;
		const lg2 = 0.992052 * lg + 0.003974;
		const lb2 = 0.992052 * lb + 0.003974;

		const [l, m, s] = COLOR_SPACE_NS.LMS.fromXYZ(...COLOR_SPACE_NS.XYZ.fromLRGB(lr2, lg2, lb2));
		const [l2, m2, s2] = ColorVisionSimulation.brettelP(l, m, s);

		let l3, m3, s3;
		if (doCorrection) {
			[l3, m3, s3] = ColorVisionSimulation.okajimaCorrectionP(m, l2, m2, s2, ColorVisionSimulation.LMS_BASE2);
		} else {
			[l3, m3, s3] = [l2, m2, s2];
		}
		return COLOR_SPACE_NS.LRGB.fromXYZ(...COLOR_SPACE_NS.XYZ.fromLMS(l3, s3, m3));
	}

	/**
	 * Convert Linear RGB to LMS in deuteranopia (Method 2).
	 * @param lr R of Linear RGB color
	 * @param lg G of Linear RGB color
	 * @param lb B of Linear RGB color
	 * @param doCorrection
	 * @return LMS color in deuteranopia
	 */
	static lrgbToDeuteranopia(lr, lg, lb, doCorrection = false) {
		const lr2 = 0.957237 * lr + 0.0213814;
		const lg2 = 0.957237 * lg + 0.0213814;
		const lb2 = 0.957237 * lb + 0.0213814;

		const [l, m, s] = COLOR_SPACE_NS.LMS.fromXYZ(...COLOR_SPACE_NS.XYZ.fromLRGB(lr2, lg2, lb2));
		const [l2, m2, s2] = ColorVisionSimulation.brettelD(l, m, s);

		let l3, m3, s3;
		if (doCorrection) {
			[l3, m3, s3] = ColorVisionSimulation.okajimaCorrectionD(l, l2, m2, s2, ColorVisionSimulation.LMS_BASE2);
		} else {
			[l3, m3, s3] = [l2, m2, s2];
		}
		return ColorVisionSimulation.LRGB.fromXYZ(...COLOR_SPACE_NS.XYZ.fromLMS(l3, s3, m3));
	}

}

ColorVisionSimulation.LMS_BASE  = COLOR_SPACE_NS.LMS.fromXYZ(1, 1, 1);
ColorVisionSimulation.LMS_BASE2 = COLOR_SPACE_NS.LMS.fromXYZ(...COLOR_SPACE_NS.XYZ.fromLRGB(1, 1, 1));

ColorVisionSimulation.ALPHA = 1;
ColorVisionSimulation.BETA  = 1;