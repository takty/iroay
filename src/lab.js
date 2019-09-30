/**
 *
 * This class converts the CIELAB (L*a*b*) color system.
 * By default, D65 is used as tristimulus value.
 * Reference: http://en.wikipedia.org/wiki/Lab_color_space
 *
 * @author Takuto Yanagida
 * @version 2019-09-29
 *
 */


class Lab extends ColorSpace {

	// Conversion function
	static _func(x) {
		return (x > Lab._C1) ? Math.pow(x, 1.0 / 3.0) : (Lab._C2 * x + 16.0 / 116.0);
	}

	// Inverse conversion function
	static _invFunc(x) {
		return (x > Lab._C3) ? Math.pow(x, 3.0) : ((x - 16.0 / 116.0) * Lab._C4);
	}

	/**
	 * Convert CIE 1931 XYZ to CIE 1976 (L*, a*, b*).
	 * @param src XYZ color
	 * @return CIELAB color
	 */
	static fromXYZ(src) {
		const fy = Lab._func(src[1] / Lab.XYZ_TRISTIMULUS_VALUES[1]);
		return [
			116.0 * fy - 16.0,
			500.0 * (Lab._func(src[0] / Lab.XYZ_TRISTIMULUS_VALUES[0]) - fy),
			200.0 * (fy - Lab._func(src[2] / Lab.XYZ_TRISTIMULUS_VALUES[2])),
		];
	}

	/**
	 * Convert CIE 1931 XYZ to L* of CIE 1976 (L*, a*, b*).
	 * @param src XYZ color
	 * @return L*
	 */
	static lightnessFromXYZ(src) {
		const fy = Lab._func(src[1] / Lab.XYZ_TRISTIMULUS_VALUES[1]);
		return 116.0 * fy - 16.0;
	}

	/**
	 * Convert CIE 1976 (L*, a*, b*) to CIE 1931 XYZ.
	 * @param src CIELAB color
	 * @return XYZ color
	 */
	static toXYZ(src) {
		const fy = (src[0] + 16.0) / 116.0;
		return [
			Lab._invFunc(fy + src[1] / 500.0) * Lab.XYZ_TRISTIMULUS_VALUES[0],
			Lab._invFunc(fy) * Lab.XYZ_TRISTIMULUS_VALUES[1],
			Lab._invFunc(fy - src[2] / 200.0) * XYZ_TRISTIMULUS_VALUES[2],
		];
	}


	// Evaluation Functions ----------------------------------------------------


	/**
	 * Calculate the conspicuity degree.
	 * Reference: Effective use of color conspicuity for Re-Coloring system,
	 * Correspondences on Human interface Vol. 12, No. 1, SIG-DE-01, 2010.
	 * @param lab CIELAB color
	 * @return Conspicuity degree [0, 180]
	 * TODO Consider chroma (ab radius of LAB)
	 */
	static conspicuityOf(lab) {
		return Evaluation.conspicuityOfLab(lab);
	}

	/**
	 * Calculate the color difference between the two colors.
	 * @param v1 CIELAB color 1
	 * @param v2 CIELAB color 2
	 * @return Color difference
	 */
	static differenceBetween(v1, v2) {
		return Evaluation.differenceBetweenLab(v1, v2);
	}


	// Conversion Functions ----------------------------------------------------


	/**
	 * Convert CIELAB (L*a*b*) to sRGB (Gamma 2.2).
	 * @param src CIELAB color
	 * @return sRGB color
	 */
	static toRGB(src) {
		return RGB.fromLRGB(LRGB.fromXYZ(XYZ.fromLab(src)));
	}

	/**
	 * Convert sRGB (Gamma 2.2) to CIELAB (L*a*b*).
	 * @param src sRGB color
	 * @return CIELAB color
	 */
	static fromRGB(src) {
		return Lab.fromXYZ(XYZ.fromLRGB(LRGB.fromRGB(src)));
	}

	/**
	 * Convert CIELAB (L*a*b*) from rectangular coordinate format to polar coordinate format.
	 * @param src Color in rectangular coordinate format (CIELAB)
	 * @return  Color in polar format
	 */
	static toPolarCoordinate(src) {
		const rad = (src[2] > 0) ? Math.atan2(src[2], src[1]) : (Math.atan2(-src[2], -src[1]) + Math.PI);
		const c = Math.sqrt(src[1] * src[1] + src[2] * src[2]);
		const h = rad * 360.0 / (Math.PI * 2);
		return [src[0], c, h];
	}

	/**
	 * Convert CIELAB (L*a*b*) from polar coordinate format to rectangular coordinate format.
	 * @param src  Color in polar format (CIELAB)
	 * @return Color in rectangular coordinate format
	 */
	static toOrthogonalCoordinate(src) {
		const rad = src[2] * (Math.PI * 2) / 360.0;
		const a = Math.cos(rad) * src[1];
		const b = Math.sin(rad) * src[1];
		return [src[0], a, b];
	}

}

// Constants for simplification of calculation
Lab._C1 = Math.pow(6.0, 3.0) / Math.pow(29.0, 3.0);        // (6/29)^3 = 0.0088564516790356308171716757554635
Lab._C2 = Math.pow(29.0, 2.0) / Math.pow(6.0, 2.0) / 3.0;  // (1/3)*(29/6)^2 = 7.787037037037037037037037037037
Lab._C3 = 6.0 / 29.0;                                      // 6/29 = 0.20689655172413793103448275862069
Lab._C4 = Math.pow(6.0, 2.0) / Math.pow(29.0, 2.0) * 3.0;  // 3*(6/29)^2 = 0.12841854934601664684898929845422

/**
 * D50 tristimulus value
 * Reference: http://www.babelcolor.com/download/A%20review%20of%20RGB%20color%20spaces.pdf
 */
Lab.D50_xyz = [0.34567, 0.35850, 0.29583];
Lab.D50_XYZ = [Lab.D50_xyz[0] / Lab.D50_xyz[1], 1.0, Lab.D50_xyz[2] / Lab.D50_xyz[1]];

/**
 * D65 tristimulus value
 * Reference: http://www.babelcolor.com/download/A%20review%20of%20RGB%20color%20spaces.pdf
 */
Lab.D65_xyz = [0.31273, 0.32902, 0.35825];
Lab.D65_XYZ = [Lab.D65_xyz[0] / Lab.D65_xyz[1], 1.0, Lab.D65_xyz[2] / Lab.D65_xyz[1]];

/**
 * XYZ tristimulus value
 */
Lab.XYZ_TRISTIMULUS_VALUES = Lab.D65_XYZ;
