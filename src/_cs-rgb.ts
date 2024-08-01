/**
 * This class converts the sRGB color system.
 * Reference: http://www.w3.org/Graphics/Color/sRGB.html
 *
 * @author Takuto Yanagida
 * @version 2024-08-01
 */

import { Triplet } from './_type';
import { Lab } from './_cs-lab';
import { XYZ } from './_cs-xyz';
import { LRGB } from './_cs-lrgb';
import { Yxy } from './_cs-yxy';

export class RGB {
	static isSaturated = false;

	private static _checkRange(vs: Triplet, min: number, max: number): boolean {
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
	private static _func(x: number): number {
		return (x < 0.03928) ? (x / 12.92) : Math.pow((x + 0.055) / 1.055, 2.4);
	}

	// Convert Linear RGB to sRGB (inverse gamma correction).
	private static _invFunc(x: number): number {
		x = (x > 0.00304) ? (Math.pow(x, 1 / 2.4) * 1.055 - 0.055) : (x * 12.92);
		return x;
	}

	/**
	 * Convert sRGB (Gamma 2.2) to Linear RGB.
	 * @param {Triplet} rgb sRGB color
	 * @return {Triplet} Linear RGB color
	 */
	static toLRGB([r, g, b]: Triplet): Triplet {
		return [
			RGB._func(r / 255),
			RGB._func(g / 255),
			RGB._func(b / 255),
		];
	}

	/**
	 * Convert Linear RGB to sRGB (Gamma 2.2).
	 * @param {Triplet} lrgb Linear RGB color
	 * @return {Triplet} sRGB color
	 */
	static fromLRGB([lr, lg, lb]: Triplet): Triplet {
		const dest: Triplet = [
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
	 * @return {Triplet} Color vector
	 */
	static fromColorInteger(v: number): Triplet {
		return [
			(v >> 16) & 0xFF,
			(v >>  8) & 0xFF,
			(v      ) & 0xFF,
		];
	}

	/**
	 * Convert sRGB to color integer.
	 * @param {Triplet} rgb RGB
	 * @return {number} Color integer
	 */
	static toColorInteger([r, g, b]: Triplet): number {
		return (r << 16) | (g << 8) | b | 0xff000000;
	}


	// Inverse Conversion Functions --------------------------------------------


	/**
	 * Convert sRGB (Gamma 2.2) to CIELAB (L*a*b*).
	 * @param {Triplet} rgb sRGB color
	 * @return {Triplet} CIELAB color
	 */
	static toLab(rgb: Triplet): Triplet {
		return Lab.fromXYZ(XYZ.fromLRGB(LRGB.fromRGB(rgb)));
	}

	/**
	 * Convert CIELAB (L*a*b*) to sRGB (Gamma 2.2).
	 * @param {Triplet} lab L*, a*, b* of CIELAB color
	 * @return {Triplet} sRGB color
	 */
	static fromLab(lab: Triplet): Triplet {
		return RGB.fromLRGB(LRGB.fromXYZ(XYZ.fromLab(lab)));
	}

	/**
	 * Convert sRGB to CIE 1931 XYZ.
	 * @param {Triplet} rgb sRGB color
	 * @return {Triplet} XYZ color
	 */
	static toXYZ(rgb: Triplet): Triplet {
		return LRGB.toXYZ(LRGB.fromRGB(rgb));
	}

	/**
	 * Convert CIE 1931 XYZ to sRGB.
	 * @param {Triplet} xyz XYZ color
	 * @return {Triplet} sRGB color
	 */
	static fromXYZ(xyz: Triplet): Triplet {
		return RGB.fromLRGB(LRGB.fromXYZ(xyz));
	}

	/**
	 * Convert sRGB (Gamma 2.2) to Yxy.
	 * @param {Triplet} rgb sRGB color
	 * @return {Triplet} Yxy color
	 */
	static toYxy(rgb: Triplet): Triplet {
		return Yxy.fromXYZ(XYZ.fromLRGB(LRGB.fromRGB(rgb)));
	}

	/**
	 * Convert Yxy to sRGB (Gamma 2.2).
	 * @param {Triplet} yxy Yxy color
	 * @return {Triplet} sRGB color
	 */
	static fromYxy(yxy: Triplet): Triplet {
		return RGB.fromLRGB(LRGB.fromXYZ(XYZ.fromYxy(yxy)));
	}


	// Color Vision Characteristics Conversion ---------------------------------


	/**
	 * Convert sRGB to Lightness-only sRGB.
	 * @param {Triplet} rgb sRGB color
	 * @return {Triplet} Lightness-only sRGB color
	 */
	static toLightness(rgb: Triplet): Triplet {
		const l = Lab.lightnessFromXYZ(XYZ.fromLRGB(LRGB.fromRGB(rgb)));
		return RGB.fromLRGB(LRGB.fromXYZ(XYZ.fromLab([l, 0, 0])));
	}
}
