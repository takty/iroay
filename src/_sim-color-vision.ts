/**
 * This class simulates color vision characteristics.
 *
 * @author Takuto Yanagida
 * @version 2024-08-14
 */

import { Triplet } from './_type';
import { LMS } from './_cs-lms';
import { XYZ } from './_cs-xyz';

export class ColorVisionSimulation {

	private static readonly LMS_BASE: Triplet  = LMS.fromXYZ([1, 1, 1]);
	private static readonly LMS_BASE2: Triplet = LMS.fromXYZ(XYZ.fromLRGB([1, 1, 1]));

	static ALPHA: number = 1;
	static BETA: number  = 1;

	static doCorrection: boolean = false;

	/*
	 * Reference: Brettel, H.; Viénot, F. & Mollon, J. D.,
	 * Computerized simulation of color appearance for dichromats,
	 * Journal of the Optical Society of America A, 1997, 14, 2647-2655.
	 */

	/**
	 * Simulate protanopia
	 * @param {Triplet} lms LMS color.
	 * @param {Triplet} dest dest An array where the result will be stored. If not provided, a new array will be created and returned.
	 * @return {Triplet} LMS color in protanopia.
	 */
	static brettelP([l, m, s]: Triplet, dest: Triplet = [0, 0, 0]): Triplet {
		dest[0] = 0.0 * l + 2.02344 * m + -2.52581 * s;
		dest[1] = 0.0 * l + 1.0     * m +  0.0     * s;
		dest[2] = 0.0 * l + 0.0     * m +  1.0     * s;
		return dest;
	}

	/**
	 * Simulate deuteranopia
	 * @param {Triplet} lms LMS color.
	 * @param {Triplet} dest dest An array where the result will be stored. If not provided, a new array will be created and returned.
	 * @return {Triplet} LMS color in deuteranopia.
	 */
	static brettelD([l, m, s]: Triplet, dest: Triplet = [0, 0, 0]): Triplet {
		dest[0] = 1.0      * l + 0.0 * m + 0.0     * s;
		dest[1] = 0.494207 * l + 0.0 * m + 1.24827 * s;
		dest[2] = 0.0      * l + 0.0 * m + 1.0     * s;
		return dest;
	}

	/*
	 * Reference: Katsunori Okajima, Syuu Kanbe,
	 * A Real-time Color Simulation of Dichromats,
	 * IEICE technical report 107(117), 107-110, 2007-06-21.
	 */

	/**
	 * Correct simulation of protanopia
	 * @param {number} m Original M of LMS color.
	 * @param {Triplet} lms LMS color of protanopia simulation.
	 * @param {Triplet} base Base LMS color.
	 * @param {Triplet} dest dest An array where the result will be stored. If not provided, a new array will be created and returned.
	 * @return {Triplet} LMS color in protanopia.
	 */
	static okajimaCorrectionP(m: number, [l2, m2, s2]: Triplet, base: Triplet, dest: Triplet = [0, 0, 0]): Triplet {
		const sp1 = m / base[1];
		const dp0 = l2 / base[0];
		const dp1 = m2 / base[1];
		const dp2 = s2 / base[2];
		const k = ColorVisionSimulation.BETA * sp1 / (ColorVisionSimulation.ALPHA * dp0 + ColorVisionSimulation.BETA * dp1);
		dest[0] = (k * dp0) * base[0];
		dest[1] = (k * dp1) * base[1];
		dest[2] = (k * dp2) * base[2];
		return dest;
	}

	/**
	 * Correct simulation of deuteranopia
	 * @param {number} l Original L of LMS color.
	 * @param {Triplet} lms LMS color of deuteranopia simulation.
	 * @param {Triplet} base Base LMS color.
	 * @param {Triplet} dest dest An array where the result will be stored. If not provided, a new array will be created and returned.
	 * @return {Triplet} LMS color in deuteranopia.
	 */
	static okajimaCorrectionD(l: number, [l2, m2, s2]: Triplet, base: Triplet, dest: Triplet = [0, 0, 0]): Triplet {
		const sp0 = l / base[0];
		const dp0 = l2 / base[0];
		const dp1 = m2 / base[1];
		const dp2 = s2 / base[2];
		const k = ColorVisionSimulation.ALPHA * sp0 / (ColorVisionSimulation.ALPHA * dp0 + ColorVisionSimulation.BETA * dp1);
		dest[0] = (k * dp0) * base[0];
		dest[1] = (k * dp1) * base[1];
		dest[2] = (k * dp2) * base[2];
		return dest;
	}


	// -------------------------------------------------------------------------


	/**
	 * Convert LMS to LMS in protanopia (Method 1).
	 * @param {Triplet} lms LMS color
	 * @param {Triplet} dest dest An array where the result will be stored. If not provided, a new array will be created and returned.
	 * @return {Triplet} LMS color in protanopia
	 */
	static lmsToProtanopia(lms: Triplet, dest: Triplet = [0, 0, 0]): Triplet {
		ColorVisionSimulation.brettelP(lms, dest);
		if (ColorVisionSimulation.doCorrection) {
			ColorVisionSimulation.okajimaCorrectionP(lms[1], dest, ColorVisionSimulation.LMS_BASE, dest);
		}
		return dest;
	}

	/**
	 * Convert LMS to LMS in deuteranopia (Method 1).
	 * @param {Triplet} lms LMS color
	 * @param {Triplet} dest dest An array where the result will be stored. If not provided, a new array will be created and returned.
	 * @return {Triplet} LMS color in deuteranopia
	 */
	static lmsToDeuteranopia(lms: Triplet, dest: Triplet = [0, 0, 0]): Triplet {
		ColorVisionSimulation.brettelD(lms, dest);
		if (ColorVisionSimulation.doCorrection) {
			ColorVisionSimulation.okajimaCorrectionD(lms[0], dest, ColorVisionSimulation.LMS_BASE, dest);
		}
		return dest;
	}


	// -------------------------------------------------------------------------


	/**
	 * Convert Linear RGB to LMS in protanopia (Method 2).
	 * @param {Triplet} lrgb Linear RGB color
	 * @param {Triplet} dest dest An array where the result will be stored. If not provided, a new array will be created and returned.
	 * @return {Triplet} LMS color in protanopia
	 */
	static lrgbToProtanopia([lr, lg, lb]: Triplet, dest: Triplet = [0, 0, 0]): Triplet {
		const lrgb2: Triplet = [
			0.992052 * lr + 0.003974,
			0.992052 * lg + 0.003974,
			0.992052 * lb + 0.003974,
		];
		const lms = LMS.fromXYZ(XYZ.fromLRGB(lrgb2));
		ColorVisionSimulation.brettelP(lms, dest);

		if (ColorVisionSimulation.doCorrection) {
			ColorVisionSimulation.okajimaCorrectionP(lms[1], dest, ColorVisionSimulation.LMS_BASE2, dest);
		}
		return dest;
	}

	/**
	 * Convert Linear RGB to LMS in deuteranopia (Method 2).
	 * @param {Triplet} lrgb Linear RGB color
	 * @param {Triplet} dest dest An array where the result will be stored. If not provided, a new array will be created and returned.
	 * @return {Triplet} LMS color in deuteranopia
	 */
	static lrgbToDeuteranopia([lr, lg, lb]: Triplet, dest: Triplet = [0, 0, 0]): Triplet {
		const lrgb2: Triplet = [
			0.957237 * lr + 0.0213814,
			0.957237 * lg + 0.0213814,
			0.957237 * lb + 0.0213814,
		];
		const lms = LMS.fromXYZ(XYZ.fromLRGB(lrgb2));
		ColorVisionSimulation.brettelD(lms, dest);

		if (ColorVisionSimulation.doCorrection) {
			ColorVisionSimulation.okajimaCorrectionD(lms[0], dest, ColorVisionSimulation.LMS_BASE2, dest);
		}
		return dest;
	}

}
