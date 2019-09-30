/**
 *
 * This class simulates color vision characteristics.
 *
 * @author Takuto Yanagida
 * @version 2019-09-29
 *
 */


class ColorVisionSimulation {

	/**
	 * Convert LMS to LMS in protanopia.
	 * @param src LMS color
	 * @param dest LMS color in protanopia
	 * @return LMS color in protanopia
	 */
	static lmsToProtanopia(src, dest) {
		const d0 = 0.0 * src[0] + 2.02344 * src[1] + -2.52581 * src[2];
		const d1 = 0.0 * src[0] + 1.0     * src[1] +  0.0     * src[2];
		const d2 = 0.0 * src[0] + 0.0     * src[1] +  1.0     * src[2];
		if (conversionMethod == ConversionMethod.BRETTEL1997) {
			dest[0] = d0; dest[1] = d1; dest[2] = d2;
		} else {
			const sp1 = src[1] / LMS_BASE[1];
			const dp0 = d0 / LMS_BASE[0], dp1 = d1 / LMS_BASE[1], dp2 = d2 / LMS_BASE[2];
			const kp = ColorVisionSimulation._beta * sp1 / (ColorVisionSimulation._alpha * dp0 + ColorVisionSimulation._beta * dp1);
			dest[0] = (kp * dp0) * LMS_BASE[0]; dest[1] = (kp * dp1) * LMS_BASE[1]; dest[2] = (kp * dp2) * LMS_BASE[2];

			// const kp = ColorVisionSimulation._beta * src[1] / (ColorVisionSimulation._alpha * d0 + ColorVisionSimulation._beta * d1);
			// dest[0] = kp * d0; dest[1] = kp * d1; dest[2] = kp * d2;
		}
		return dest;
	}

	/**
	 * Convert LMS to LMS in deuteranopia.
	 * @param src LMS color
	 * @param dest LMS color in deuteranopia
	 * @return LMS color in deuteranopia
	 */
	static lmsToDeuteranopia(src, dest) {
		const d0 = 1.0      * src[0] + 0.0 * src[1] + 0.0     * src[2];
		const d1 = 0.494207 * src[0] + 0.0 * src[1] + 1.24827 * src[2];
		const d2 = 0.0      * src[0] + 0.0 * src[1] + 1.0     * src[2];
		if (conversionMethod == ConversionMethod.BRETTEL1997) {
			dest[0] = d0; dest[1] = d1; dest[2] = d2;
		} else {
			const sp0 = src[0] / LMS_BASE[0];
			const dp0 = d0 / LMS_BASE[0], dp1 = d1 / LMS_BASE[1], dp2 = d2 / LMS_BASE[2];
			const kd = ColorVisionSimulation._alpha * sp0 / (ColorVisionSimulation._alpha * dp0 + ColorVisionSimulation._beta * dp1);
			dest[0] = (kd * dp0) * LMS_BASE[0]; dest[1] = (kd * dp1) * LMS_BASE[1]; dest[2] = (kd * dp2) * LMS_BASE[2];

			// const kd = ColorVisionSimulation._alpha * src[0] / (ColorVisionSimulation._alpha * d0 + ColorVisionSimulation._beta * d1);
			// dest[0] = kd * d0; dest[1] = kd * d1; dest[2] = kd * d2;
		}
		return dest;
	}

	static lrgbToProtanopia(src, dest) {
		const r = 0.992052 * src[0] + 0.003974;
		const g = 0.992052 * src[1] + 0.003974;
		const b = 0.992052 * src[2] + 0.003974;

		const l = 17.8824    * r + 43.5161   * g + 4.11935 * b;
		const m =  3.45565   * r + 27.1554   * g + 3.86714 * b;
		const s =  0.0299566 * r +  0.184309 * g + 1.46709 * b;

		const l2 = 0.0 * l + 2.02344 * m + -2.52581 * s;
		const m2 = 0.0 * l + 1.0     * m +  0.0     * s;
		const s2 = 0.0 * l + 0.0     * m +  1.0     * s;

		let l3, m3, s3;
		if (ColorVisionSimulation.conversionMethod == ColorVisionSimulation.ConversionMethod.BRETTEL1997) {
			l3 = l2; m3 = m2; s3 = s2;
		} else {
			const l2n = l2 / ColorVisionSimulation._BL;
			const m2n = m2 / ColorVisionSimulation._BM;
			const s2n = s2 / ColorVisionSimulation._BS;
			const k = ColorVisionSimulation._beta * (m / ColorVisionSimulation._BM) / (ColorVisionSimulation._alpha * l2n + ColorVisionSimulation._beta * m2n);
			l3 = (k * l2n) * ColorVisionSimulation._BL;
			m3 = (k * m2n) * ColorVisionSimulation._BM;
			s3 = (k * s2n) * ColorVisionSimulation._BS;

			// const k = ColorVisionSimulation._beta * m / (ColorVisionSimulation._alpha * l2 + ColorVisionSimulation._beta * m2);
			// l3 = k * l2; m3 = k * m2; s3 = k * s2;
		}

		const r2 =  0.080944    * l3 + -0.130504   * m3 +  0.116721 * s3;
		const g2 = -0.0102485   * l3 +  0.0540194  * m3 + -0.113615 * s3;
		const b2 = -0.000365294 * l3 + -0.00412163 * m3 +  0.693513 * s3;

		dest[0] = r2; dest[1] = g2; dest[2] = b2;
		return dest;
	}

	static lrgbToDeuteranopia(src, dest) {
		const r = 0.957237 * src[0] + 0.0213814;
		const g = 0.957237 * src[1] + 0.0213814;
		const b = 0.957237 * src[2] + 0.0213814;

		const l = 17.8824    * r + 43.5161   * g + 4.11935 * b;
		const m =  3.45565   * r + 27.1554   * g + 3.86714 * b;
		const s =  0.0299566 * r +  0.184309 * g + 1.46709 * b;

		const l2 = 1.0      * l + 0.0 * m + 0.0     * s;
		const m2 = 0.494207 * l + 0.0 * m + 1.24827 * s;
		const s2 = 0.0      * l + 0.0 * m + 1.0     * s;

		let l3, m3, s3;
		if (ColorVisionSimulation.conversionMethod == ColorVisionSimulation.ConversionMethod.BRETTEL1997) {
			l3 = l2; m3 = m2; s3 = s2;
		} else {
			const l2n = l2 / ColorVisionSimulation._BL;
			const m2n = m2 / ColorVisionSimulation._BM;
			const s2n = s2 / ColorVisionSimulation._BS;
			const k = ColorVisionSimulation._alpha * (l / ColorVisionSimulation._BL) / (ColorVisionSimulation._alpha * l2n + ColorVisionSimulation._beta * m2n);
			l3 = (k * l2n) * ColorVisionSimulation._BL;
			m3 = (k * m2n) * ColorVisionSimulation._BM;
			s3 = (k * s2n) * ColorVisionSimulation._BS;

			// const k = ColorVisionSimulation._alpha * l / (ColorVisionSimulation._alpha * l2 + ColorVisionSimulation._beta * m2);
			// l3 = k * l2; m3 = k * m2; s3 = k * s2;
		}

		const r2 =  0.080944    * l3 + -0.130504   * m3 +  0.116721 * s3;
		const g2 = -0.0102485   * l3 +  0.0540194  * m3 + -0.113615 * s3;
		const b2 = -0.000365294 * l3 + -0.00412163 * m3 +  0.693513 * s3;

		dest[0] = r2; dest[1] = g2; dest[2] = b2;
		return dest;
	}

}

ColorVisionSimulation.LMS_BASE = LMS.fromXYZ([1.0, 1.0, 1.0]);

/**
 * Enum type for color vision conversion methods.
 */
ColorVisionSimulation.ConversionMethod = {
	/**
	 * Reference: Brettel, H.; Viénot, F. & Mollon, J. D.,
	 * Computerized simulation of color appearance for dichromats,
	 * Journal of the Optical Society of America A, 1997, 14, 2647-2655.
	 */
	BRETTEL1997: 0,

	/**
	 * Reference: Katsunori Okajima, Syuu Kanbe,
	 * A Real-time Color Simulation of Dichromats,
	 * IEICE technical report 107(117), 107-110, 2007-06-21.
	 */
	OKAJIMA2007: 1
};

/**
 * Represents the currently selected color vision characteristic conversion method.
 */
ColorVisionSimulation.conversionMethod = ColorVisionSimulation.ConversionMethod.BRETTEL1997;

// Constants used in Okajima 2007
ColorVisionSimulation._alpha = 1.0;
ColorVisionSimulation._beta  = 1.0;

ColorVisionSimulation._BL = 17.8824    * 1.0 + 43.5161   * 1.0 + 4.11935 * 1.0;
ColorVisionSimulation._BM =  3.45565   * 1.0 + 27.1554   * 1.0 + 3.86714 * 1.0;
ColorVisionSimulation._BS =  0.0299566 * 1.0 +  0.184309 * 1.0 + 1.46709 * 1.0;
