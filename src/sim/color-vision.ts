/**
 * Color vision simulation.
 *
 * @author Takuto Yanagida
 * @version 2024-08-18
 */

import { Triplet } from '../type';

import { fromXYZ as xyz2lms } from '../cs/lms';
import { fromLRGB as lrgb2xyz } from '../cs/xyz';

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
export function brettelP([l, m, s]: Triplet, dest: Triplet = [0, 0, 0]): Triplet {
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
export function brettelD([l, m, s]: Triplet, dest: Triplet = [0, 0, 0]): Triplet {
	dest[0] = 1.0      * l + 0.0 * m + 0.0     * s;
	dest[1] = 0.494207 * l + 0.0 * m + 1.24827 * s;
	dest[2] = 0.0      * l + 0.0 * m + 1.0     * s;
	return dest;
}


// -----------------------------------------------------------------------------


/*
 * Reference: Katsunori Okajima, Syuu Kanbe,
 * A Real-time Color Simulation of Dichromats,
 * IEICE technical report 107(117), 107-110, 2007-06-21.
 */

const OC_LMS_BASE: Triplet  = xyz2lms([1, 1, 1]);
const OC_LMS_BASE2: Triplet = xyz2lms(lrgb2xyz([1, 1, 1]));

let doOc: boolean = false;
let ocAlpha: number = 1;
let ocBeta: number = 1;

/**
 * Set the options for Okajima correction.
 *
 * @param {boolean} doCorrection - Whether to apply the Okajima correction.
 * @param {number} [alpha=1] - The alpha parameter for the correction.
 * @param {number} [beta=1] - The beta parameter for the correction.
 * @return {void}
 */
export function setOkajimaCorrectionOption(doCorrection: boolean, alpha: number = 1, beta: number = 1): void {
	doOc = doCorrection;
	ocAlpha = alpha;
	ocBeta = beta;
}

/**
 * Correct simulation of protanopia
 * @param {number} m Original M of LMS color.
 * @param {Triplet} lms LMS color of protanopia simulation.
 * @param {Triplet} base Base LMS color.
 * @param {Triplet} dest dest An array where the result will be stored. If not provided, a new array will be created and returned.
 * @return {Triplet} LMS color in protanopia.
 */
export function okajimaCorrectionP(m: number, [l2, m2, s2]: Triplet, base: Triplet, dest: Triplet = [0, 0, 0]): Triplet {
	const sp1 = m / base[1];
	const dp0 = l2 / base[0];
	const dp1 = m2 / base[1];
	const dp2 = s2 / base[2];
	const k = ocBeta * sp1 / (ocAlpha * dp0 + ocBeta * dp1);
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
export function okajimaCorrectionD(l: number, [l2, m2, s2]: Triplet, base: Triplet, dest: Triplet = [0, 0, 0]): Triplet {
	const sp0 = l / base[0];
	const dp0 = l2 / base[0];
	const dp1 = m2 / base[1];
	const dp2 = s2 / base[2];
	const k = ocAlpha * sp0 / (ocAlpha * dp0 + ocBeta * dp1);
	dest[0] = (k * dp0) * base[0];
	dest[1] = (k * dp1) * base[1];
	dest[2] = (k * dp2) * base[2];
	return dest;
}


// -----------------------------------------------------------------------------


/**
 * Convert LMS to LMS in protanopia (Method 1).
 * @param {Triplet} lms LMS color
 * @param {Triplet} dest dest An array where the result will be stored. If not provided, a new array will be created and returned.
 * @return {Triplet} LMS color in protanopia
 */
export function lmsToProtanopia(lms: Triplet, dest: Triplet = [0, 0, 0]): Triplet {
	brettelP(lms, dest);
	if (doOc) {
		okajimaCorrectionP(lms[1], dest, OC_LMS_BASE, dest);
	}
	return dest;
}

/**
 * Convert LMS to LMS in deuteranopia (Method 1).
 * @param {Triplet} lms LMS color
 * @param {Triplet} dest dest An array where the result will be stored. If not provided, a new array will be created and returned.
 * @return {Triplet} LMS color in deuteranopia
 */
export function lmsToDeuteranopia(lms: Triplet, dest: Triplet = [0, 0, 0]): Triplet {
	brettelD(lms, dest);
	if (doOc) {
		okajimaCorrectionD(lms[0], dest, OC_LMS_BASE, dest);
	}
	return dest;
}


// -----------------------------------------------------------------------------


/**
 * Convert Linear RGB to LMS in protanopia (Method 2).
 * @param {Triplet} lrgb Linear RGB color
 * @param {Triplet} dest dest An array where the result will be stored. If not provided, a new array will be created and returned.
 * @return {Triplet} LMS color in protanopia
 */
export function lrgbToProtanopia([lr, lg, lb]: Triplet, dest: Triplet = [0, 0, 0]): Triplet {
	const lrgb2: Triplet = [
		0.992052 * lr + 0.003974,
		0.992052 * lg + 0.003974,
		0.992052 * lb + 0.003974,
	];
	const lms = xyz2lms(lrgb2xyz(lrgb2));
	brettelP(lms, dest);

	if (doOc) {
		okajimaCorrectionP(lms[1], dest, OC_LMS_BASE2, dest);
	}
	return dest;
}

/**
 * Convert Linear RGB to LMS in deuteranopia (Method 2).
 * @param {Triplet} lrgb Linear RGB color
 * @param {Triplet} dest dest An array where the result will be stored. If not provided, a new array will be created and returned.
 * @return {Triplet} LMS color in deuteranopia
 */
export function lrgbToDeuteranopia([lr, lg, lb]: Triplet, dest: Triplet = [0, 0, 0]): Triplet {
	const lrgb2: Triplet = [
		0.957237 * lr + 0.0213814,
		0.957237 * lg + 0.0213814,
		0.957237 * lb + 0.0213814,
	];
	const lms = xyz2lms(lrgb2xyz(lrgb2));
	brettelD(lms, dest);

	if (doOc) {
		okajimaCorrectionD(lms[0], dest, OC_LMS_BASE2, dest);
	}
	return dest;
}
