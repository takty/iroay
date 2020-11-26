/**
 *
 * This class converts the sRGB color system.
 * Reference: http://www.w3.org/Graphics/Color/sRGB.html
 *
 * @author Takuto Yanagida
 * @version 2020-11-27
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
	 * @param r R of sRGB color
	 * @param g G of sRGB color
	 * @param b B of sRGB color
	 * @return Linear RGB color
	 */
	static toLRGB(r, g, b) {
		return [
			RGB._func(r / 255),
			RGB._func(g / 255),
			RGB._func(b / 255),
		];
	}

	/**
	 * Convert Linear RGB to sRGB (Gamma 2.2).
	 * @param lr R of Linear RGB color
	 * @param lg G of Linear RGB color
	 * @param lb B of Linear RGB color
	 * @return sRGB color
	 */
	static fromLRGB(lr, lg, lb) {
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
	 * @param src Color integer
	 * @return Color vector
	 */
	static fromColorInteger(src) {
		return [
			(src >> 16) & 0xFF,
			(src >>  8) & 0xFF,
			(src      ) & 0xFF,
		];
	}

	/**
	 * Convert sRGB to color integer.
	 * @param r Red
	 * @param g Green
	 * @param b Blue
	 * @return Color integer
	 */
	static toColorInteger(r, g, b) {
		return (r << 16) | (g << 8) | b | 0xff000000;
	}


	// Inverse Conversion Functions --------------------------------------------


	/**
	 * Convert sRGB (Gamma 2.2) to CIELAB (L*a*b*).
	 * @param r R of sRGB color
	 * @param g G of sRGB color
	 * @param b B of sRGB color
	 * @return CIELAB color
	 */
	static toLab(r, g, b) {
		return Lab.fromXYZ(...XYZ.fromLRGB(...LRGB.fromRGB(r, g, b)));
	}

	/**
	 * Convert CIELAB (L*a*b*) to sRGB (Gamma 2.2).
	 * @param ls L* of CIELAB color
	 * @param as a* of CIELAB color
	 * @param bs b* of CIELAB color
	 * @return sRGB color
	 */
	static fromLab(ls, as, bs) {
		return RGB.fromLRGB(...LRGB.fromXYZ(...XYZ.fromLab(ls, as, bs)));
	}

	/**
	 * Convert sRGB to CIE 1931 XYZ.
	 * @param r R of sRGB color
	 * @param g G of sRGB color
	 * @param b B of sRGB color
	 * @return XYZ color
	 */
	static toXYZ(r, g, b) {
		return LRGB.toXYZ(...LRGB.fromRGB(r, g, b));
	}

	/**
	 * Convert CIE 1931 XYZ to sRGB.
	 * @param x X of XYZ color
	 * @param y Y of XYZ color
	 * @param z Z of XYZ color
	 * @return sRGB color
	 */
	static fromXYZ(x, y, z) {
		return RGB.fromLRGB(...LRGB.fromXYZ(x, y, z));
	}

	/**
	 * Convert sRGB (Gamma 2.2) to Yxy.
	 * @param r R of sRGB color
	 * @param g G of sRGB color
	 * @param b B of sRGB color
	 * @return Yxy color
	 */
	static toYxy(r, g, b) {
		return Yxy.fromXYZ(...XYZ.fromLRGB(...LRGB.fromRGB(r, g, b)));
	}

	/**
	 * Convert Yxy to sRGB (Gamma 2.2).
	 * @param y Y of Yxy color
	 * @param sx Small x of Yxy color
	 * @param sy Small y of Yxy color
	 * @return sRGB color
	 */
	static fromYxy(y, sx, sy) {
		return RGB.fromLRGB(...LRGB.fromXYZ(...XYZ.fromYxy(y, sx, sy)));
	}


	// Color Vision Characteristics Conversion ---------------------------------


	/**
	 * Convert sRGB to Lightness-only sRGB.
	 * @param r R of sRGB color
	 * @param g G of sRGB color
	 * @param b B of sRGB color
	 * @return Lightness-only sRGB color
	 */
	static toLightness(r, g, b) {
		const l = Lab.lightnessFromXYZ(...XYZ.fromLRGB(...LRGB.fromRGB(r, g, b)));
		return RGB.fromLRGB(...LRGB.fromXYZ(...XYZ.fromLab(l, 0, 0)));
	}

}

RGB.isSaturated = false;