/**
 *
 * This class converts the CIELAB (L*a*b*) color system.
 * By default, D65 is used as tristimulus value.
 * Reference: http://en.wikipedia.org/wiki/Lab_color_space
 *
 * @author Takuto Yanagida
 * @version 2020-11-27
 *
 */


class Lab {

	// Conversion function
	static _func(x) {
		return (x > Lab._C1) ? Math.pow(x, 1 / 3) : (Lab._C2 * x + 16 / 116);
	}

	// Inverse conversion function
	static _invFunc(x) {
		return (x > Lab._C3) ? Math.pow(x, 3) : ((x - 16 / 116) * Lab._C4);
	}

	/**
	 * Convert CIE 1931 XYZ to CIE 1976 (L*, a*, b*).
	 * @param x X of XYZ color
	 * @param y Y of XYZ color
	 * @param z Z of XYZ color
	 * @return CIELAB color
	 */
	static fromXYZ(x, y, z) {
		const fy = Lab._func(y / Lab.XYZ_TRISTIMULUS_VALUES[1]);
		return [
			116 * fy - 16,
			500 * (Lab._func(x / Lab.XYZ_TRISTIMULUS_VALUES[0]) - fy),
			200 * (fy - Lab._func(z / Lab.XYZ_TRISTIMULUS_VALUES[2])),
		];
	}

	/**
	 * Convert CIE 1931 XYZ to L* of CIE 1976 (L*, a*, b*).
	 * @param x X of XYZ color
	 * @param y Y of XYZ color
	 * @param z Z of XYZ color
	 * @return L*
	 */
	static lightnessFromXYZ(x, y, z) {
		const fy = Lab._func(y / Lab.XYZ_TRISTIMULUS_VALUES[1]);
		return 116 * fy - 16;
	}

	/**
	 * Convert CIE 1976 (L*, a*, b*) to CIE 1931 XYZ.
	 * @param ls L* of CIELAB color
	 * @param as a* of CIELAB color
	 * @param bs b* of CIELAB color
	 * @return XYZ color
	 */
	static toXYZ(ls, as, bs) {
		const fy = (ls + 16) / 116;
		return [
			Lab._invFunc(fy + as / 500) * Lab.XYZ_TRISTIMULUS_VALUES[0],
			Lab._invFunc(fy) * Lab.XYZ_TRISTIMULUS_VALUES[1],
			Lab._invFunc(fy - bs / 200) * Lab.XYZ_TRISTIMULUS_VALUES[2],
		];
	}


	// Evaluation Functions ----------------------------------------------------


	/**
	 * Calculate the conspicuity degree.
	 * Reference: Effective use of color conspicuity for Re-Coloring system,
	 * Correspondences on Human interface Vol. 12, No. 1, SIG-DE-01, 2010.
	 * @param ls L* of CIELAB color
	 * @param as a* of CIELAB color
	 * @param bs b* of CIELAB color
	 * @return Conspicuity degree [0, 180]
	 * TODO Consider chroma (ab radius of LAB)
	 */
	static conspicuityOf(ls, as, bs) {
		return Evaluation.conspicuityOfLab(ls, as, bs);
	}

	/**
	 * Calculate the color difference between the two colors.
	 * @param ls1 L* of CIELAB color 1
	 * @param as1 a* of CIELAB color 1
	 * @param bs1 b* of CIELAB color 1
	 * @param ls2 L* of CIELAB color 2
	 * @param as2 a* of CIELAB color 2
	 * @param bs2 b* of CIELAB color 2
	 * @return Color difference
	 */
	static differenceBetween(ls1, as1, bs1, ls2, as2, bs2) {
		return Evaluation.differenceBetweenLab(ls1, as1, bs1, ls2, as2, bs2);
	}


	// Conversion Functions ----------------------------------------------------


	/**
	 * Convert CIELAB (L*a*b*) to sRGB (Gamma 2.2).
	 * @param ls L* of CIELAB color
	 * @param as a* of CIELAB color
	 * @param bs b* of CIELAB color
	 * @return sRGB color
	 */
	static toRGB(ls, as, bs) {
		return RGB.fromLRGB(LRGB.fromXYZ(XYZ.fromLab(ls, as, bs)));
	}

	/**
	 * Convert sRGB (Gamma 2.2) to CIELAB (L*a*b*).
	 * @param r R of sRGB color
	 * @param g G of sRGB color
	 * @param b B of sRGB color
	 * @return CIELAB color
	 */
	static fromRGB(r, g, b) {
		return Lab.fromXYZ(XYZ.fromLRGB(LRGB.fromRGB(r, g, b)));
	}

	/**
	 * Convert CIELAB (L*a*b*) from rectangular coordinate format to polar coordinate format.
	 * @param ls L* of rectangular coordinate format (CIELAB)
	 * @param as a* of rectangular coordinate format (CIELAB)
	 * @param bs b* of rectangular coordinate format (CIELAB)
	 * @return  Color in polar format
	 */
	static toPolarCoordinate(ls, as, bs) {
		const rad = (bs > 0) ? Math.atan2(bs, as) : (Math.atan2(-bs, -as) + Math.PI);
		const cs = Math.sqrt(as * as + bs * bs);
		const h = rad * 360 / (Math.PI * 2);
		return [ls, cs, h];
	}

	/**
	 * Convert CIELAB (L*a*b*) from polar coordinate format to rectangular coordinate format.
	 * @param ls L* of polar format (CIELAB)
	 * @param cs C* of polar format (CIELAB)
	 * @param h h of polar format (CIELAB)
	 * @return Color in rectangular coordinate format
	 */
	static toOrthogonalCoordinate(ls, cs, h) {
		const rad = h * (Math.PI * 2) / 360;
		const as = Math.cos(rad) * cs;
		const bs = Math.sin(rad) * cs;
		return [ls, as, bs];
	}

}

// Constants for simplification of calculation
Lab._C1 = Math.pow(6, 3) / Math.pow(29, 3);      // (6/29)^3 = 0.0088564516790356308171716757554635
Lab._C2 = Math.pow(29, 2) / Math.pow(6, 2) / 3;  // (1/3)*(29/6)^2 = 7.787037037037037037037037037037
Lab._C3 = 6 / 29;                                // 6/29 = 0.20689655172413793103448275862069
Lab._C4 = Math.pow(6, 2) / Math.pow(29, 2) * 3;  // 3*(6/29)^2 = 0.12841854934601664684898929845422

/**
 * D50 tristimulus value
 * Reference: http://www.babelcolor.com/download/A%20review%20of%20RGB%20color%20spaces.pdf
 */
Lab.D50_xyz = [0.34567, 0.35850, 0.29583];
Lab.D50_XYZ = [Lab.D50_xyz[0] / Lab.D50_xyz[1], 1, Lab.D50_xyz[2] / Lab.D50_xyz[1]];

/**
 * D65 tristimulus value
 * Reference: http://www.babelcolor.com/download/A%20review%20of%20RGB%20color%20spaces.pdf
 */
Lab.D65_xyz = [0.31273, 0.32902, 0.35825];
Lab.D65_XYZ = [Lab.D65_xyz[0] / Lab.D65_xyz[1], 1, Lab.D65_xyz[2] / Lab.D65_xyz[1]];

/**
 * XYZ tristimulus value
 */
Lab.XYZ_TRISTIMULUS_VALUES = Lab.D65_XYZ;