/**
 *
 * This class converts the Linear RGB color system.
 * It is targeted for Linear RGB which converted sRGB (D65).
 * Reference: http://www.brucelindbloom.com/index.html?Eqn_RGB_XYZ_Matrix.html
 *
 * @author Takuto Yanagida
 * @version 2019-10-13
 *
 */


class LRGB {

	/**
	 * Convert Linear RGB to CIE 1931 XYZ.
	 * @param lr R of Linear RGB color
	 * @param lg G of Linear RGB color
	 * @param lb B of Linear RGB color
	 * @return XYZ color
	 */
	static toXYZ(lr, lg, lb) {
		return [
			0.4124564 * lr + 0.3575761 * lg + 0.1804375 * lb,
			0.2126729 * lr + 0.7151522 * lg + 0.0721750 * lb,
			0.0193339 * lr + 0.1191920 * lg + 0.9503041 * lb,
		];
	}

	/**
	 * Convert CIE 1931 XYZ to Linear RGB.
	 * @param x X of XYZ color
	 * @param y Y of XYZ color
	 * @param z Z of XYZ color
	 * @return Linear RGB color
	 */
	static fromXYZ(x, y, z) {
		return [
			 3.2404542 * x + -1.5371385 * y + -0.4985314 * z,
			-0.9692660 * x +  1.8760108 * y +  0.0415560 * z,
			 0.0556434 * x + -0.2040259 * y +  1.0572252 * z,
		];
	}


	// Inverse Conversion Functions --------------------------------------------


	/**
	 * Convert Linear RGB to sRGB (Gamma 2.2).
	 * @param lr R of Linear RGB color
	 * @param lg G of Linear RGB color
	 * @param lb B of Linear RGB color
	 * @return sRGB color
	 */
	static toRGB(lr, lg, lb) {
		return RGB.fromLRGB(lr, lg, lb);
	}

	/**
	 * Convert sRGB to Linear RGB (Gamma 2.2).
	 * @param r R of sRGB color
	 * @param g G of sRGB color
	 * @param b B of sRGB color
	 * @return sRGB color
	 */
	static fromRGB(r, g, b) {
		return RGB.toLRGB(r, g, b);
	}

	/**
	 * Convert Linear RGB to YIQ.
	 * @param lr R of Linear RGB color
	 * @param lg G of Linear RGB color
	 * @param lb B of Linear RGB color
	 * @return YIQ color
	 */
	static toYIQ(lr, lg, lb) {
		return YIQ.fromLRGB(lr, lg, lb);
	}

	/**
	 * Convert YIQ to Linear RGB.
	 * @param y Y of YIQ color
	 * @param i I of YIQ color
	 * @param q Q of YIQ color
	 * @return Linear RGB color
	 */
	static fromYIQ(y, i, q) {
		return YIQ.toLRGB(y, i, q);
	}

}