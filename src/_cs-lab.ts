/**
 * This class converts the CIELAB (L*a*b*) color system.
 * By default, D65 is used as tristimulus value.
 * Reference: http://en.wikipedia.org/wiki/Lab_color_space
 *
 * @author Takuto Yanagida
 * @version 2024-08-01
 */

import { Triplet } from './_type';
import { Evaluation } from './_eval';

export class Lab {
	// Conversion function
	private static _func(v: number): number {
		return (v > Lab._C1) ? Math.pow(v, 1 / 3) : (v / Lab._C2 + 4 / 29);
	}

	// Inverse conversion function
	private static _invFunc(v: number): number {
		return (v > Lab._C3) ? Math.pow(v, 3) : ((v - 4 / 29) * Lab._C2);
	}

	/**
	 * Convert CIE 1931 XYZ to CIE 1976 (L*, a*, b*).
	 * @param {Triplet} xyz XYZ color
	 * @return {Triplet} CIELAB color
	 */
	static fromXYZ([x, y, z]: Triplet): Triplet {
		const fx = Lab._func(x / Lab.XYZ_TRISTIMULUS_VALUES[0]);
		const fy = Lab._func(y / Lab.XYZ_TRISTIMULUS_VALUES[1]);
		const fz = Lab._func(z / Lab.XYZ_TRISTIMULUS_VALUES[2]);
		return [
			116 * fy - 16,
			500 * (fx - fy),
			200 * (fy - fz),
		];
	}

	/**
	 * Convert CIE 1931 XYZ to L* of CIE 1976 (L*, a*, b*).
	 * @param {Triplet} xyz XYZ color
	 * @return {number} L*
	 */
	static lightnessFromXYZ([, y,]: Triplet): number {
		const fy = Lab._func(y / Lab.XYZ_TRISTIMULUS_VALUES[1]);
		return 116 * fy - 16;
	}

	/**
	 * Convert CIE 1976 (L*, a*, b*) to CIE 1931 XYZ.
	 * @param {Triplet} lab L*, a*, b* of CIELAB color
	 * @return {Triplet} XYZ color
	 */
	static toXYZ([ls, as, bs]: Triplet): Triplet {
		const fy = (ls + 16) / 116;
		const fx = fy + as / 500;
		const fz = fy - bs / 200;
		return [
			Lab._invFunc(fx) * Lab.XYZ_TRISTIMULUS_VALUES[0],
			Lab._invFunc(fy) * Lab.XYZ_TRISTIMULUS_VALUES[1],
			Lab._invFunc(fz) * Lab.XYZ_TRISTIMULUS_VALUES[2],
		];
	}


	// Evaluation Functions ----------------------------------------------------


	/**
	 * Calculate the conspicuity degree.
	 * Reference: Effective use of color conspicuity for Re-Coloring system,
	 * Correspondences on Human interface Vol. 12, No. 1, SIG-DE-01, 2010.
	 * @param {Triplet} lab L*, a*, b* of CIELAB color
	 * @return {number} Conspicuity degree [0, 180]
	 * TODO Consider chroma (ab radius of LAB)
	 */
	static conspicuityOf(lab: Triplet): number {
		return Evaluation.conspicuityOfLab(lab);
	}

	/**
	 * Calculate the color difference between the two colors.
	 * @param {Triplet} lab1 L*, a*, b* of CIELAB color 1
	 * @param {Triplet} lab2 L*, a*, b* of CIELAB color 2
	 * @return {number} Color difference
	 */
	static differenceBetween(lab1: Triplet, lab2: Triplet): number {
		return Evaluation.differenceBetweenLab(lab1, lab2);
	}


	// Conversion Functions ----------------------------------------------------


	/**
	 * Convert CIELAB (L*a*b*) from rectangular coordinate format to polar coordinate format.
	 * @param {Triplet} lab L*, a*, b* of rectangular coordinate format (CIELAB)
	 * @return {Triplet} Color in polar format
	 */
	static toPolarCoordinate([ls, as, bs]: Triplet): Triplet {
		const rad = (bs > 0) ? Math.atan2(bs, as) : (Math.atan2(-bs, -as) + Math.PI);
		const cs = Math.sqrt(as * as + bs * bs);
		const h = rad * 360 / (Math.PI * 2);
		return [ls, cs, h];
	}

	/**
	 * Convert CIELAB (L*a*b*) from polar coordinate format to rectangular coordinate format.
	 * @param {Triplet} lab L*, C*, h of polar format (CIELAB)
	 * @return {Triplet} Color in rectangular coordinate format
	 */
	static toOrthogonalCoordinate([ls, cs, h]: Triplet): Triplet {
		const rad = h * (Math.PI * 2) / 360;
		const as = Math.cos(rad) * cs;
		const bs = Math.sin(rad) * cs;
		return [ls, as, bs];
	}

	// Constants for simplification of calculation
	private static _C1 = Math.pow(6, 3) / Math.pow(29, 3);      // (6/29)^3 = 0.0088564516790356308171716757554635
	private static _C2 = 3 * Math.pow(6, 2) / Math.pow(29, 2);  // 3*(6/29)^2 = 0.12841854934601664684898929845422
	private static _C3 = 6 / 29;                                // 6/29 = 0.20689655172413793103448275862069

	/**
	 * D50 tristimulus value
	 * Reference: http://www.babelcolor.com/download/A%20review%20of%20RGB%20color%20spaces.pdf
	 */
	static D50_xyz: Triplet = [0.34567, 0.35850, 0.29583];
	static D50_XYZ: Triplet = [Lab.D50_xyz[0] / Lab.D50_xyz[1], 1, Lab.D50_xyz[2] / Lab.D50_xyz[1]];

	/**
	 * D65 tristimulus value
	 * Reference: http://www.babelcolor.com/download/A%20review%20of%20RGB%20color%20spaces.pdf
	 */
	static D65_xyz: Triplet = [0.31273, 0.32902, 0.35825];
	static D65_XYZ: Triplet = [Lab.D65_xyz[0] / Lab.D65_xyz[1], 1, Lab.D65_xyz[2] / Lab.D65_xyz[1]];

	/**
	 * XYZ tristimulus value
	 */
	static XYZ_TRISTIMULUS_VALUES = Lab.D65_XYZ;
}
