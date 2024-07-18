/**
 * This class simulates color vision characteristics.
 *
 * @author Takuto Yanagida
 * @version 2024-07-17
 */

import { LMS } from './_cs-lms';
import { XYZ } from './_cs-xyz';
import { LRGB } from './_cs-lrgb';

export class ColorVisionSimulation {
	/*
	 * Reference: Brettel, H.; Viénot, F. & Mollon, J. D.,
	 * Computerized simulation of color appearance for dichromats,
	 * Journal of the Optical Society of America A, 1997, 14, 2647-2655.
	 */

	/**
	 * Simulate protanopia
	 * @param {number[]} lms LMS color
	 * @return {number[]} LMS color in protanopia
	 */
	static brettelP([l, m, s]: [number, number, number]): [number, number, number] {
		return [
			0.0 * l + 2.02344 * m + -2.52581 * s,
			0.0 * l + 1.0     * m +  0.0     * s,
			0.0 * l + 0.0     * m +  1.0     * s,
		];
	}

	/**
	 * Simulate deuteranopia
	 * @param {number[]} lms LMS color
	 * @return {number[]} LMS color in deuteranopia
	 */
	static brettelD([l, m, s]: [number, number, number]): [number, number, number] {
		return [
			1.0      * l + 0.0 * m + 0.0     * s,
			0.494207 * l + 0.0 * m + 1.24827 * s,
			0.0      * l + 0.0 * m + 1.0     * s,
		];
	}

	/*
	 * Reference: Katsunori Okajima, Syuu Kanbe,
	 * A Real-time Color Simulation of Dichromats,
	 * IEICE technical report 107(117), 107-110, 2007-06-21.
	 */

	/**
	 * Correct simulation of protanopia
	 * @param {number} m Original M of LMS color
	 * @param {number[]} lms LMS color of protanopia simulation
	 * @param {number[]} base Base LMS color
	 * @return {number[]} LMS color in protanopia
	 */
	static okajimaCorrectionP(m: number, [l2, m2, s2]: [number, number, number], base: [number, number, number]): [number, number, number] {
		const sp1 = m / base[1];
		const dp0 = l2 / base[0];
		const dp1 = m2 / base[1];
		const dp2 = s2 / base[2];
		const k = ColorVisionSimulation.BETA * sp1 / (ColorVisionSimulation.ALPHA * dp0 + ColorVisionSimulation.BETA * dp1);
		return [
			(k * dp0) * base[0],
			(k * dp1) * base[1],
			(k * dp2) * base[2]
		];
	}

	/**
	 * Correct simulation of deuteranopia
	 * @param {number} l Original L of LMS color
	 * @param {number[]} lms LMS color of deuteranopia simulation
	 * @param {number[]} base Base LMS color
	 * @return {number[]} LMS color in deuteranopia
	 */
	static okajimaCorrectionD(l: number, [l2, m2, s2]: [number, number, number], base: [number, number, number]): [number, number, number] {
		const sp0 = l / base[0];
		const dp0 = l2 / base[0];
		const dp1 = m2 / base[1];
		const dp2 = s2 / base[2];
		const k = ColorVisionSimulation.ALPHA * sp0 / (ColorVisionSimulation.ALPHA * dp0 + ColorVisionSimulation.BETA * dp1);
		return [
			(k * dp0) * base[0],
			(k * dp1) * base[1],
			(k * dp2) * base[2]
		];
	}


	// -------------------------------------------------------------------------


	/**
	 * Convert LMS to LMS in protanopia (Method 1).
	 * @param {number[]} lms LMS color
	 * @param {boolean} doCorrection
	 * @return {number[]} LMS color in protanopia
	 */
	static lmsToProtanopia(lms: [number, number, number], doCorrection = false): [number, number, number] {
		const ds = ColorVisionSimulation.brettelP(lms);
		if (!doCorrection) return ds;
		return ColorVisionSimulation.okajimaCorrectionP(lms[1], ds, ColorVisionSimulation.LMS_BASE);
	}

	/**
	 * Convert LMS to LMS in deuteranopia (Method 1).
	 * @param {number[]} lms LMS color
	 * @param {boolean} doCorrection
	 * @return {number[]} LMS color in deuteranopia
	 */
	static lmsToDeuteranopia(lms: [number, number, number], doCorrection = false): [number, number, number] {
		const ds = ColorVisionSimulation.brettelD(lms);
		if (!doCorrection) return ds;
		return ColorVisionSimulation.okajimaCorrectionD(lms[0], ds, ColorVisionSimulation.LMS_BASE);
	}


	// -------------------------------------------------------------------------


	/**
	 * Convert Linear RGB to LMS in protanopia (Method 2).
	 * @param {number[]} lrgb Linear RGB color
	 * @param {boolean} doCorrection
	 * @return {number[]} LMS color in protanopia
	 */
	static lrgbToProtanopia([lr, lg, lb]: [number, number, number], doCorrection = false): [number, number, number] {
		const lrgb2: [number, number, number] = [
			0.992052 * lr + 0.003974,
			0.992052 * lg + 0.003974,
			0.992052 * lb + 0.003974,
		];
		const lms = LMS.fromXYZ(XYZ.fromLRGB(lrgb2));
		const lms2 = ColorVisionSimulation.brettelP(lms);

		let lms3;
		if (doCorrection) {
			lms3 = ColorVisionSimulation.okajimaCorrectionP(lms[1], lms2, ColorVisionSimulation.LMS_BASE2);
		} else {
			lms3 = lms2;
		}
		return LRGB.fromXYZ(XYZ.fromLMS(lms3));
	}

	/**
	 * Convert Linear RGB to LMS in deuteranopia (Method 2).
	 * @param {number[]} lrgb Linear RGB color
	 * @param {boolean} doCorrection
	 * @return {number[]} LMS color in deuteranopia
	 */
	static lrgbToDeuteranopia([lr, lg, lb]: [number, number, number], doCorrection = false): [number, number, number] {
		const lrgb2: [number, number, number] = [
			0.957237 * lr + 0.0213814,
			0.957237 * lg + 0.0213814,
			0.957237 * lb + 0.0213814,
		];
		const lms = LMS.fromXYZ(XYZ.fromLRGB(lrgb2));
		const lms2 = ColorVisionSimulation.brettelD(lms);

		let lms3;
		if (doCorrection) {
			lms3 = ColorVisionSimulation.okajimaCorrectionD(lms[0], lms2, ColorVisionSimulation.LMS_BASE2);
		} else {
			lms3 = lms2;
		}
		return LRGB.fromXYZ(XYZ.fromLMS(lms3));
	}

	static LMS_BASE  = LMS.fromXYZ([1, 1, 1]);
	static LMS_BASE2 = LMS.fromXYZ(XYZ.fromLRGB([1, 1, 1]));

	static ALPHA = 1;
	static BETA  = 1;
}
