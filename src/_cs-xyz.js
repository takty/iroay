/**
 *
 * This class converts the CIE 1931 XYZ color system.
 *
 * @author Takuto Yanagida
 * @version 2020-11-26
 *
 */


class XYZ {


	// Inverse Conversion Functions --------------------------------------------


	/**
	 * Convert CIE 1931 XYZ to Linear RGB.
	 * @param x X of XYZ color
	 * @param y Y of XYZ color
	 * @param z Z of XYZ color
	 * @return Linear RGB color
	 */
	static toLRGB(x, y, z) {
		return LRGB.fromXYZ(x, y, z);
	}

	/**
	 * Convert Linear RGB to CIE 1931 XYZ.
	 * @param lr R of Linear RGB color
	 * @param lg G of Linear RGB color
	 * @param lb B of Linear RGB color
	 * @return XYZ color
	 */
	static fromLRGB(lr, lg, lb) {
		return LRGB.toXYZ(lr, lg, lb);
	}

	/**
	 * Convert CIE 1931 XYZ to Yxy.
	 * @param x X of XYZ color
	 * @param y Y of XYZ color
	 * @param z Z of XYZ color
	 * @return Yxy color
	 */
	static toYxy(x, y, z) {
		return Yxy.fromXYZ(x, y, z);
	}

	/**
	 * Convert Yxy to CIE 1931 XYZ.
	 * @param y Y of Yxy color
	 * @param sx Small x of Yxy color
	 * @param sy Small y of Yxy color
	 * @return XYZ color
	 */
	static fromYxy(y, sx, sy) {
		return Yxy.toXYZ(y, sx, sy);
	}

	/**
	 * Convert CIE 1931 XYZ to CIE 1976 (L*, a*, b*).
	 * @param x X of XYZ color
	 * @param y Y of XYZ color
	 * @param z Z of XYZ color
	 * @return CIELAB color
	 */
	static toLab(x, y, z) {
		return Lab.fromXYZ(x, y, z);
	}

	/**
	 * Convert CIE 1976 (L*, a*, b*) to CIE 1931 XYZ.
	 * @param ls L* of CIELAB color
	 * @param as a* of CIELAB color
	 * @param bs b* of CIELAB color
	 * @return XYZ color
	 */
	static fromLab(ls, as, bs) {
		return Lab.toXYZ(ls, as, bs);
	}

	/**
	 * Convert CIE 1931 XYZ to LMS.
	 * @param x X of XYZ color
	 * @param y Y of XYZ color
	 * @param z Z of XYZ color
	 * @return LMS color
	 */
	static toLMS(x, y, z) {
		return LMS.fromXYZ(x, y, z);
	}

	/**
	 * Convert LMS to CIE 1931 XYZ.
	 * @param l L of LMS color
	 * @param m M of LMS color
	 * @param s S of LMS color
	 * @return XYZ color
	 */
	static fromLMS(l, m, s) {
		return LMS.toXYZ(l, m, s);
	}

	/**
	 * Convert CIE 1931 XYZ to Munsell (HVC).
	 * @param x X of XYZ color (standard illuminant D65)
	 * @param y Y of XYZ color (standard illuminant D65)
	 * @param z Z of XYZ color (standard illuminant D65)
	 * @return Munsell color
	 */
	static toMunsell(x, y, z) {
		return Munsell.fromXYZ(x, y, z);
	}

	/**
	 * Convert Munsell (HVC) to CIE 1931 XYZ.
	 * @param h Hue of Munsell color
	 * @param v Value of Munsell color
	 * @param c Chroma of Munsell color
	 * @return XYZ color
	 */
	static fromMunsell(h, v, c) {
		return Munsell.toXYZ(h, v, c);
	}


	// Conversion of Standard Illuminant ---------------------------------------


	/**
	 * Convert CIE 1931 XYZ of standard illuminant C to CIE 1931 XYZ of standard illuminant D65.
	 * Reference: http://www.brucelindbloom.com/index.html?MunsellCalculator.html (Von Kries method)
	 * @param x X of XYZ color (standard illuminant C)
	 * @param y Y of XYZ color (standard illuminant C)
	 * @param z Z of XYZ color (standard illuminant C)
	 * @return XYZ of standard illuminant D65
	 */
	static fromIlluminantC(x, y, z) {
		return [
			 0.9972812 * x + -0.0093756 * y + -0.0154171 * z,
			-0.0010298 * x +  1.0007636 * y +  0.0002084 * z,
			                                   0.9209267 * z,
		];
	}

	/**
	 * Convert CIE 1931 XYZ of standard illuminant D65 to CIE 1931 XYZ of standard illuminant C.
	 * Reference: http://www.brucelindbloom.com/index.html?MunsellCalculator.html (Von Kries method)
	 * @param x X of XYZ color (standard illuminant D65)
	 * @param y Y of XYZ color (standard illuminant D65)
	 * @param z Z of XYZ color (standard illuminant D65)
	 * @return XYZ of standard illuminant C
	 */
	static toIlluminantC(x, y, z) {
		return [
			1.0027359 * x +  0.0093941 * y +  0.0167846 * z,
			0.0010319 * x +  0.9992466 * y + -0.0002089 * z,
			                                  1.0858628 * z,
		];
	}

}