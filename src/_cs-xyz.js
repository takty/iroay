/**
 *
 * This class converts the CIE 1931 XYZ color system.
 *
 * @author Takuto Yanagida
 * @version 2020-12-07
 *
 */


class XYZ {


	// Inverse Conversion Functions --------------------------------------------


	/**
	 * Convert CIE 1931 XYZ to Linear RGB.
	 * @param {number[]} xyz XYZ color
	 * @return Linear RGB color
	 */
	static toLRGB(x, y, z) {
		return LRGB.fromXYZ(x, y, z);
	}

	/**
	 * Convert Linear RGB to CIE 1931 XYZ.
	 * @param {number[]} lrgb Linear RGB color
	 * @return {number[]} XYZ color
	 */
	static fromLRGB(lrgb) {
		return LRGB.toXYZ(lrgb);
	}

	/**
	 * Convert CIE 1931 XYZ to Yxy.
	 * @param {number[]} xyz XYZ color
	 * @return {number[]} Yxy color
	 */
	static toYxy(xyz) {
		return Yxy.fromXYZ(xyz);
	}

	/**
	 * Convert Yxy to CIE 1931 XYZ.
	 * @param {number[]} yxy Yxy color
	 * @return {number[]} XYZ color
	 */
	static fromYxy(yxy) {
		return Yxy.toXYZ(yxy);
	}

	/**
	 * Convert CIE 1931 XYZ to CIE 1976 (L*, a*, b*).
	 * @param {number[]} xyz XYZ color
	 * @return {number[]} CIELAB color
	 */
	static toLab(xyz) {
		return Lab.fromXYZ(xyz);
	}

	/**
	 * Convert CIE 1976 (L*, a*, b*) to CIE 1931 XYZ.
	 * @param {number[]} lab L*, a*, b* of CIELAB color
	 * @return {number[]} XYZ color
	 */
	static fromLab(lab) {
		return Lab.toXYZ(lab);
	}

	/**
	 * Convert CIE 1931 XYZ to LMS.
	 * @param {number[]} xyz XYZ color
	 * @return {number[]} LMS color
	 */
	static toLMS(xyz) {
		return LMS.fromXYZ(xyz);
	}

	/**
	 * Convert LMS to CIE 1931 XYZ.
	 * @param {number[]} lms LMS color
	 * @return {number[]} XYZ color
	 */
	static fromLMS(lms) {
		return LMS.toXYZ(lms);
	}

	/**
	 * Convert CIE 1931 XYZ to Munsell (HVC).
	 * @param {number[]} xyz XYZ color (standard illuminant D65)
	 * @return {number[]} Munsell color
	 */
	static toMunsell(xyz) {
		return Munsell.fromXYZ(xyz);
	}

	/**
	 * Convert Munsell (HVC) to CIE 1931 XYZ.
	 * @param {number[]} hvc Hue, value, chroma of Munsell color
	 * @return {number[]} XYZ color
	 */
	static fromMunsell(hvc) {
		return Munsell.toXYZ(hvc);
	}


	// Conversion of Standard Illuminant ---------------------------------------


	/**
	 * Convert CIE 1931 XYZ of standard illuminant C to CIE 1931 XYZ of standard illuminant D65.
	 * Reference: http://www.brucelindbloom.com/index.html?MunsellCalculator.html (Von Kries method)
	 * @param {number[]} xyz XYZ color (standard illuminant C)
	 * @return {number[]} XYZ of standard illuminant D65
	 */
	static fromIlluminantC([x, y, z]) {
		return [
			 0.9972812 * x + -0.0093756 * y + -0.0154171 * z,
			-0.0010298 * x +  1.0007636 * y +  0.0002084 * z,
			                                   0.9209267 * z,
		];
	}

	/**
	 * Convert CIE 1931 XYZ of standard illuminant D65 to CIE 1931 XYZ of standard illuminant C.
	 * Reference: http://www.brucelindbloom.com/index.html?MunsellCalculator.html (Von Kries method)
	 * @param {number[]} xyz XYZ color (standard illuminant D65)
	 * @return {number[]} XYZ of standard illuminant C
	 */
	static toIlluminantC([x, y, z]) {
		return [
			1.0027359 * x +  0.0093941 * y +  0.0167846 * z,
			0.0010319 * x +  0.9992466 * y + -0.0002089 * z,
			                                  1.0858628 * z,
		];
	}

}