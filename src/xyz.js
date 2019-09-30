/**
 *
 * This class converts the CIE 1931 XYZ color system.
 *
 * @author Takuto Yanagida
 * @version 2019-09-29
 *
 */


class XYZ extends ColorSpace {


	// Inverse Conversion Functions --------------------------------------------


	/**
	 * Convert CIE 1931 XYZ to Linear RGB.
	 * @param src XYZ color
	 * @return Linear RGB color
	 */
	static toLRGB(src) {
		return LRGB.fromXYZ(src);
	}

	/**
	 * Convert Linear RGB to CIE 1931 XYZ.
	 * @param src Linear RGB color
	 * @return XYZ color
	 */
	static fromLRGB(src) {
		return LRGB.toXYZ(src);
	}

	/**
	 * Convert CIE 1931 XYZ to Yxy.
	 * @param src XYZ color
	 * @return Yxy color
	 */
	static toYxy(src) {
		return Yxy.fromXYZ(src);
	}

	/**
	 * Convert Yxy to CIE 1931 XYZ.
	 * @param src Yxy color
	 * @return XYZ color
	 */
	static fromYxy(src) {
		return Yxy.toXYZ(src);
	}

	/**
	 * Convert CIE 1931 XYZ to CIE 1976 (L*, a*, b*).
	 * @param src XYZ color
	 * @return CIELAB color
	 */
	static toLab(src) {
		return Lab.fromXYZ(src);
	}

	/**
	 * Convert CIE 1976 (L*, a*, b*) to CIE 1931 XYZ.
	 * @param src CIELAB color
	 * @return XYZ color
	 */
	static fromLab(src) {
		return Lab.toXYZ(src);
	}

	/**
	 * Convert CIE 1931 XYZ to LMS.
	 * @param src XYZ color
	 * @return LMS color
	 */
	static toLMS(src) {
		return LMS.fromXYZ(src);
	}

	/**
	 * Convert LMS to CIE 1931 XYZ.
	 * @param src LMS color
	 * @return XYZ color
	 */
	static fromLMS(src) {
		return LMS.toXYZ(src);
	}


	// Conversion of Standard Illuminant ---------------------------------------


	/**
	 * Convert CIE 1931 XYZ of standard illuminant C to CIE 1931 XYZ of standard illuminant D65.
	 * Reference: http://www.brucelindbloom.com/index.html?MunsellCalculator.html (Von Kries method)
	 * @param src XYZ of standard illuminant C
	 * @return XYZ of standard illuminant D65
	 */
	static fromIlluminantC(src) {
		return [
			 0.9972812 * src[0] + -0.0093756 * src[1] + -0.0154171 * src[2],
			-0.0010298 * src[0] +  1.0007636 * src[1] +  0.0002084 * src[2],
			                                             0.9209267 * src[2],
		];
	}

	/**
	 * Convert CIE 1931 XYZ of standard illuminant D65 to CIE 1931 XYZ of standard illuminant C.
	 * Reference: http://www.brucelindbloom.com/index.html?MunsellCalculator.html (Von Kries method)
	 * @param src XYZ of standard illuminant D65
	 * @return XYZ of standard illuminant C
	 */
	static toIlluminantC(src) {
		return [
			1.0027359 * src[0] +  0.0093941 * src[1] +  0.0167846 * src[2],
			0.0010319 * src[0] +  0.9992466 * src[1] + -0.0002089 * src[2],
			                                            1.0858628 * src[2],
		];
	}

}
