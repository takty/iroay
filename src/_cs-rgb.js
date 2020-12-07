/**
 *
 * This class converts the sRGB color system.
 * Reference: http://www.w3.org/Graphics/Color/sRGB.html
 *
 * @author Takuto Yanagida
 * @version 2020-12-07
 *
 */


class RGB {

	static _checkRange(vs, min, max) {
		let isSaturated = false;
		if (vs[0] > max) { vs[0] = max; isSaturated = true; }
		if (vs[0] < min) { vs[0] = min; isSaturated = true; }
		if (vs[1] > max) { vs[1] = max; isSaturated = true; }
		if (vs[1] < min) { vs[1] = min; isSaturated = true; }
		if (vs[2] > max) { vs[2] = max; isSaturated = true; }
		if (vs[2] < min) { vs[2] = min; isSaturated = true; }
		return isSaturated;
	}

	// Convert sRGB to Linear RGB (gamma correction).
	static _func(x) {
		return (x < 0.03928) ? (x / 12.92) : Math.pow((x + 0.055) / 1.055, 2.4);
	}

	// Convert Linear RGB to sRGB (inverse gamma correction).
	static _invFunc(x) {
		x = (x > 0.00304) ? (Math.pow(x, 1 / 2.4) * 1.055 - 0.055) : (x * 12.92);
		return x;
	}

	/**
	 * Convert sRGB (Gamma 2.2) to Linear RGB.
	 * @param {number[]} rgb sRGB color
	 * @return {number[]} Linear RGB color
	 */
	static toLRGB([r, g, b]) {
		return [
			RGB._func(r / 255),
			RGB._func(g / 255),
			RGB._func(b / 255),
		];
	}

	/**
	 * Convert Linear RGB to sRGB (Gamma 2.2).
	 * @param {number[]} lrgb Linear RGB color
	 * @return {number[]} sRGB color
	 */
	static fromLRGB([lr, lg, lb]) {
		const dest = [
			RGB._invFunc(lr) * 255 | 0,
			RGB._invFunc(lg) * 255 | 0,
			RGB._invFunc(lb) * 255 | 0,
		];
		RGB.isSaturated = RGB._checkRange(dest, 0, 255);
		return dest;
	}


	// Utilities ---------------------------------------------------------------


	/**
	 * Convert color integer to sRGB.
	 * @param {number} v Color integer
	 * @return {number[]} Color vector
	 */
	static fromColorInteger(v) {
		return [
			(v >> 16) & 0xFF,
			(v >>  8) & 0xFF,
			(v      ) & 0xFF,
		];
	}

	/**
	 * Convert sRGB to color integer.
	 * @param {number[]} rgb RGB
	 * @return {number} Color integer
	 */
	static toColorInteger([r, g, b]) {
		return (r << 16) | (g << 8) | b | 0xff000000;
	}


	// Inverse Conversion Functions --------------------------------------------


	/**
	 * Convert sRGB (Gamma 2.2) to CIELAB (L*a*b*).
	 * @param {number[]} rgb sRGB color
	 * @return {number[]} CIELAB color
	 */
	static toLab(rgb) {
		return Lab.fromXYZ(XYZ.fromLRGB(LRGB.fromRGB(rgb)));
	}

	/**
	 * Convert CIELAB (L*a*b*) to sRGB (Gamma 2.2).
	 * @param {number[]} lab L*, a*, b* of CIELAB color
	 * @return {number[]} sRGB color
	 */
	static fromLab(lab) {
		return RGB.fromLRGB(LRGB.fromXYZ(XYZ.fromLab(lab)));
	}

	/**
	 * Convert sRGB to CIE 1931 XYZ.
	 * @param {number[]} rgb sRGB color
	 * @return {number[]} XYZ color
	 */
	static toXYZ(rgb) {
		return LRGB.toXYZ(LRGB.fromRGB(rgb));
	}

	/**
	 * Convert CIE 1931 XYZ to sRGB.
	 * @param {number[]} xyz XYZ color
	 * @return {number[]} sRGB color
	 */
	static fromXYZ(xyz) {
		return RGB.fromLRGB(LRGB.fromXYZ(xyz));
	}

	/**
	 * Convert sRGB (Gamma 2.2) to Yxy.
	 * @param {number[]} rgb sRGB color
	 * @return {number[]} Yxy color
	 */
	static toYxy(rgb) {
		return Yxy.fromXYZ(XYZ.fromLRGB(LRGB.fromRGB(rgb)));
	}

	/**
	 * Convert Yxy to sRGB (Gamma 2.2).
	 * @param {number[]} yxy Yxy color
	 * @return {number[]} sRGB color
	 */
	static fromYxy(yxy) {
		return RGB.fromLRGB(LRGB.fromXYZ(XYZ.fromYxy(yxy)));
	}


	// Color Vision Characteristics Conversion ---------------------------------


	/**
	 * Convert sRGB to Lightness-only sRGB.
	 * @param {number[]} rgb sRGB color
	 * @return {number[]} Lightness-only sRGB color
	 */
	static toLightness(rgb) {
		const l = Lab.lightnessFromXYZ(XYZ.fromLRGB(LRGB.fromRGB(rgb)));
		return RGB.fromLRGB(LRGB.fromXYZ(XYZ.fromLab([l, 0, 0])));
	}

}

RGB.isSaturated = false;