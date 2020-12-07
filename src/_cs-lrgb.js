/**
 *
 * This class converts the Linear RGB color system.
 * It is targeted for Linear RGB which converted sRGB (D65).
 * Reference: http://www.brucelindbloom.com/index.html?Eqn_RGB_XYZ_Matrix.html
 *
 * @author Takuto Yanagida
 * @version 2020-12-07
 *
 */


class LRGB {

	/**
	 * Convert Linear RGB to CIE 1931 XYZ.
	 * @param {number[]} lrgb Linear RGB color
	 * @return {number[]} XYZ color
	 */
	static toXYZ([lr, lg, lb]) {
		return [
			0.4124564 * lr + 0.3575761 * lg + 0.1804375 * lb,
			0.2126729 * lr + 0.7151522 * lg + 0.0721750 * lb,
			0.0193339 * lr + 0.1191920 * lg + 0.9503041 * lb,
		];
	}

	/**
	 * Convert CIE 1931 XYZ to Linear RGB.
	 * @param {number[]} xyz XYZ color
	 * @return {number[]} Linear RGB color
	 */
	static fromXYZ([x, y, z]) {
		return [
			 3.2404542 * x + -1.5371385 * y + -0.4985314 * z,
			-0.9692660 * x +  1.8760108 * y +  0.0415560 * z,
			 0.0556434 * x + -0.2040259 * y +  1.0572252 * z,
		];
	}


	// Inverse Conversion Functions --------------------------------------------


	/**
	 * Convert Linear RGB to sRGB (Gamma 2.2).
	 * @param {number[]} lrgb Linear RGB color
	 * @return {number[]} sRGB color
	 */
	static toRGB(lrgb) {
		return RGB.fromLRGB(lrgb);
	}

	/**
	 * Convert sRGB to Linear RGB (Gamma 2.2).
	 * @param {number[]} rgb sRGB color
	 * @return {number[]} sRGB color
	 */
	static fromRGB(rgb) {
		return RGB.toLRGB(rgb);
	}

	/**
	 * Convert Linear RGB to YIQ.
	 * @param {number[]} lrgb Linear RGB color
	 * @return {number[]} YIQ color
	 */
	static toYIQ(lrgb) {
		return YIQ.fromLRGB(lrgb);
	}

	/**
	 * Convert YIQ to Linear RGB.
	 * @param {number[]} yiq YIQ color
	 * @return {number[]} Linear RGB color
	 */
	static fromYIQ(yiq) {
		return YIQ.toLRGB(yiq);
	}

}