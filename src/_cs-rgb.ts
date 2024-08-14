/**
 * This class converts the sRGB color system.
 * Reference: http://www.w3.org/Graphics/Color/sRGB.html
 *
 * @author Takuto Yanagida
 * @version 2024-08-14
 */

import { Triplet } from './_type';

export class RGB {

	static readonly MIN: number = 0;
	static readonly MAX: number = 255;
	static readonly INV_MAX: number = 1 / RGB.MAX;

	static isSaturated: boolean = false;

	private static _checkRange(vs: Triplet, min: number, max: number): boolean {
		let isSaturated: boolean = false;
		for (let i = 0; i < 3; ++i) {
			if (vs[i] > max) { vs[i] = max; isSaturated = true; }
			else if (vs[i] < min) { vs[i] = min; isSaturated = true; }
		}
		return isSaturated;
	}

	// Convert sRGB to Linear RGB (gamma correction).
	private static _fn(v: number): number {
		return (v < 0.03928) ? (v / 12.92) : Math.pow((v + 0.055) / 1.055, 2.4);
	}

	// Convert Linear RGB to sRGB (inverse gamma correction).
	private static _ifn(v: number): number {
		return (v > 0.00304) ? (Math.pow(v, 1 / 2.4) * 1.055 - 0.055) : (v * 12.92);
	}


	// LRGB --------------------------------------------------------------------


	/**
	 * Convert Linear RGB to sRGB (Gamma 2.2).
	 * @param {Triplet} lrgb Linear RGB color.
	 * @param {Triplet} dest dest An array where the result will be stored. If not provided, a new array will be created and returned.
	 * @return {Triplet} sRGB color.
	 */
	static fromLRGB([lr, lg, lb]: Triplet, dest: Triplet = [0, 0, 0]): Triplet {
		dest[0] = RGB._ifn(lr) * RGB.MAX | 0;
		dest[1] = RGB._ifn(lg) * RGB.MAX | 0;
		dest[2] = RGB._ifn(lb) * RGB.MAX | 0;
		RGB.isSaturated = RGB._checkRange(dest, RGB.MIN, RGB.MAX);
		return dest;
	}

	/**
	 * Convert sRGB (Gamma 2.2) to Linear RGB.
	 * @param {Triplet} rgb sRGB color.
	 * @param {Triplet} dest dest An array where the result will be stored. If not provided, a new array will be created and returned.
	 * @return {Triplet} Linear RGB color.
	 */
	static toLRGB([r, g, b]: Triplet, dest: Triplet = [0, 0, 0]): Triplet {
		dest[0] = RGB._fn(r * RGB.INV_MAX);
		dest[1] = RGB._fn(g * RGB.INV_MAX);
		dest[2] = RGB._fn(b * RGB.INV_MAX);
		return dest;
	}


	// Utilities ---------------------------------------------------------------


	/**
	 * Convert color integer to sRGB.
	 * @param {number} v Color integer.
	 * @param {Triplet} dest dest An array where the result will be stored. If not provided, a new array will be created and returned.
	 * @return {Triplet} sRGB color.
	 */
	static fromColorInteger(v: number, dest: Triplet = [0, 0, 0]): Triplet {
		dest[0] = (v >> 16) & 0xFF;
		dest[1] = (v >>  8) & 0xFF;
		dest[2] = (v      ) & 0xFF;
		return dest;
	}

	/**
	 * Convert sRGB to color integer.
	 * @param {Triplet} rgb sRGB color.
	 * @return {number} Color integer.
	 */
	static toColorInteger([r, g, b]: Triplet): number {
		return (r << 16) | (g << 8) | b | 0xff000000;
	}

}
