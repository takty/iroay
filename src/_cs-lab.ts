/**
 * This class converts the CIELAB (L*a*b*) color system.
 * By default, D65 is used as tristimulus value.
 * Reference: http://en.wikipedia.org/wiki/Lab_color_space
 *
 * @author Takuto Yanagida
 * @version 2024-08-14
 */

import { Triplet } from './_type';
import { D65_XYZ } from './_constant';
import { LCh } from './_cs-lch';

export class Lab {

	// Constants for simplification of calculation
	private static readonly _C1 = Math.pow(6, 3) / Math.pow(29, 3);      // (6/29)^3 = 0.0088564516790356308171716757554635
	private static readonly _C2 = 3 * Math.pow(6, 2) / Math.pow(29, 2);  // 3*(6/29)^2 = 0.12841854934601664684898929845422
	private static readonly _C3 = 6 / 29;                                // 6/29 = 0.20689655172413793103448275862069

	/**
	 * XYZ tristimulus value
	 */
	static XYZ_TRISTIMULUS_VALUES = D65_XYZ;

	// Conversion function
	private static _fn(v: number): number {
		return (v > Lab._C1) ? Math.pow(v, 1 / 3) : (v / Lab._C2 + 4 / 29);
	}

	// Inverse conversion function
	private static _ifn(v: number): number {
		return (v > Lab._C3) ? Math.pow(v, 3) : ((v - 4 / 29) * Lab._C2);
	}


	// XYZ ---------------------------------------------------------------------


	/**
	 * Convert CIE 1931 XYZ to CIE 1976 (L*, a*, b*).
	 * @param {Triplet} xyz XYZ color.
	 * @param {Triplet} dest dest An array where the result will be stored. If not provided, a new array will be created and returned.
	 * @return {Triplet} CIELAB color.
	 */
	static fromXYZ([x, y, z]: Triplet, dest: Triplet = [0, 0, 0]): Triplet {
		const fx = Lab._fn(x / Lab.XYZ_TRISTIMULUS_VALUES[0]);
		const fy = Lab._fn(y / Lab.XYZ_TRISTIMULUS_VALUES[1]);
		const fz = Lab._fn(z / Lab.XYZ_TRISTIMULUS_VALUES[2]);
		dest[0] = 116 * fy - 16;
		dest[1] = 500 * (fx - fy);
		dest[2] = 200 * (fy - fz);
		return dest;
	}

	/**
	 * Convert CIE 1976 (L*, a*, b*) to CIE 1931 XYZ.
	 * @param {Triplet} lab L*, a*, b* of CIELAB color.
	 * @param {Triplet} dest dest An array where the result will be stored. If not provided, a new array will be created and returned.
	 * @return {Triplet} XYZ color.
	 */
	static toXYZ([ls, as, bs]: Triplet, dest: Triplet = [0, 0, 0]): Triplet {
		const fy = (ls + 16) / 116;
		const fx = fy + as / 500;
		const fz = fy - bs / 200;
		dest[0] = Lab._ifn(fx) * Lab.XYZ_TRISTIMULUS_VALUES[0];
		dest[1] = Lab._ifn(fy) * Lab.XYZ_TRISTIMULUS_VALUES[1];
		dest[2] = Lab._ifn(fz) * Lab.XYZ_TRISTIMULUS_VALUES[2];
		return dest;
	}

	/**
	 * Convert CIE 1931 XYZ to L* of CIE 1976 (L*, a*, b*).
	 * @param {Triplet} xyz XYZ color.
	 * @return {number} L*
	 */
	static lightnessFromXYZ([, y,]: Triplet): number {
		const fy = Lab._fn(y / Lab.XYZ_TRISTIMULUS_VALUES[1]);
		return 116 * fy - 16;
	}


	// LCh ---------------------------------------------------------------------


	/**
	 * Convert LCh to CIELAB (L*a*b*).
	 * @param {Triplet} lch LCh color.
	 * @param {Triplet} dest dest An array where the result will be stored. If not provided, a new array will be created and returned.
	 * @return {Triplet} L*, a*, b* of CIELAB color.
	 */
	static fromLCh(lch: Triplet, dest: Triplet = [0, 0, 0]): Triplet {
		return LCh.toLab(lch, dest);
	}

	/**
	 * Convert CIELAB (L*a*b*) to LCh.
	 * @param {Triplet} lab L*, a*, b* of CIELAB color.
	 * @param {Triplet} dest dest An array where the result will be stored. If not provided, a new array will be created and returned.
	 * @return {Triplet} LCh color.
	 */
	static toLCh(lab: Triplet, dest: Triplet = [0, 0, 0]): Triplet {
		return LCh.fromLab(lab, dest);
	}

}
