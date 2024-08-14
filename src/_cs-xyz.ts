/**
 * This class converts the CIE 1931 XYZ color system.
 *
 * @author Takuto Yanagida
 * @version 2024-08-14
 */

import { Triplet } from './_type';
import { LRGB } from './_cs-lrgb';
import { Yxy } from './_cs-yxy';
import { Lab } from './_cs-lab';
import { LMS } from './_cs-lms';
import { Munsell } from './_cs-munsell';

export class XYZ {

	// LRGB --------------------------------------------------------------------


	/**
	 * Convert Linear RGB to CIE 1931 XYZ.
	 * @param {Triplet} lrgb Linear RGB color.
	 * @param {Triplet} dest dest An array where the result will be stored. If not provided, a new array will be created and returned.
	 * @return {Triplet} XYZ color.
	 */
	static fromLRGB(lrgb: Triplet, dest: Triplet = [0, 0, 0]): Triplet {
		return LRGB.toXYZ(lrgb, dest);
	}

	/**
	 * Convert CIE 1931 XYZ to Linear RGB.
	 * @param {Triplet} xyz XYZ color.
	 * @param {Triplet} dest dest An array where the result will be stored. If not provided, a new array will be created and returned.
	 * @return Linear RGB color.
	 */
	static toLRGB(xyz: Triplet, dest: Triplet = [0, 0, 0]): Triplet {
		return LRGB.fromXYZ(xyz, dest);
	}


	// Yxy ---------------------------------------------------------------------


	/**
	 * Convert Yxy to CIE 1931 XYZ.
	 * @param {Triplet} yxy Yxy color.
	 * @param {Triplet} dest dest An array where the result will be stored. If not provided, a new array will be created and returned.
	 * @return {Triplet} XYZ color.
	 */
	static fromYxy(yxy: Triplet, dest: Triplet = [0, 0, 0]): Triplet {
		return Yxy.toXYZ(yxy, dest);
	}

	/**
	 * Convert CIE 1931 XYZ to Yxy.
	 * @param {Triplet} xyz XYZ color.
	 * @param {Triplet} dest dest An array where the result will be stored. If not provided, a new array will be created and returned.
	 * @return {Triplet} Yxy color.
	 */
	static toYxy(xyz: Triplet, dest: Triplet = [0, 0, 0]): Triplet {
		return Yxy.fromXYZ(xyz, dest);
	}


	// Lab ---------------------------------------------------------------------


	/**
	 * Convert CIE 1976 (L*, a*, b*) to CIE 1931 XYZ.
	 * @param {Triplet} lab L*, a*, b* of CIELAB color.
	 * @param {Triplet} dest dest An array where the result will be stored. If not provided, a new array will be created and returned.
	 * @return {Triplet} XYZ color.
	 */
	static fromLab(lab: Triplet, dest: Triplet = [0, 0, 0]): Triplet {
		return Lab.toXYZ(lab, dest);
	}

	/**
	 * Convert CIE 1931 XYZ to CIE 1976 (L*, a*, b*).
	 * @param {Triplet} xyz XYZ color.
	 * @param {Triplet} dest dest An array where the result will be stored. If not provided, a new array will be created and returned.
	 * @return {Triplet} CIELAB color.
	 */
	static toLab(xyz: Triplet, dest: Triplet = [0, 0, 0]): Triplet {
		return Lab.fromXYZ(xyz, dest);
	}


	// LMS ---------------------------------------------------------------------


	/**
	 * Convert LMS to CIE 1931 XYZ.
	 * @param {Triplet} lms LMS color.
	 * @param {Triplet} dest dest An array where the result will be stored. If not provided, a new array will be created and returned.
	 * @return {Triplet} XYZ color.
	 */
	static fromLMS(lms: Triplet, dest: Triplet = [0, 0, 0]): Triplet {
		return LMS.toXYZ(lms, dest);
	}

	/**
	 * Convert CIE 1931 XYZ to LMS.
	 * @param {Triplet} xyz XYZ color.
	 * @param {Triplet} dest dest An array where the result will be stored. If not provided, a new array will be created and returned.
	 * @return {Triplet} LMS color.
	 */
	static toLMS(xyz: Triplet, dest: Triplet = [0, 0, 0]): Triplet {
		return LMS.fromXYZ(xyz, dest);
	}


	// Munsell -----------------------------------------------------------------


	/**
	 * Convert Munsell (HVC) to CIE 1931 XYZ.
	 * @param {Triplet} hvc Hue, value, chroma of Munsell color.
	 * @param {Triplet} dest dest An array where the result will be stored. If not provided, a new array will be created and returned.
	 * @return {Triplet} XYZ color.
	 */
	static fromMunsell(hvc: Triplet, dest: Triplet = [0, 0, 0]): Triplet {
		return Munsell.toXYZ(hvc, dest);
	}

	/**
	 * Convert CIE 1931 XYZ to Munsell (HVC).
	 * @param {Triplet} xyz XYZ color (standard illuminant D65).
	 * @param {Triplet} dest dest An array where the result will be stored. If not provided, a new array will be created and returned.
	 * @return {Triplet} Munsell color.
	 */
	static toMunsell(xyz: Triplet, dest: Triplet = [0, 0, 0]): Triplet {
		return Munsell.fromXYZ(xyz, dest);
	}


	// Conversion of Standard Illuminant ---------------------------------------


	/**
	 * Convert CIE 1931 XYZ of standard illuminant C to CIE 1931 XYZ of standard illuminant D65.
	 * Reference: http://www.brucelindbloom.com/index.html?MunsellCalculator.html (Von Kries method)
	 * @param {Triplet} xyz XYZ color (standard illuminant C).
	 * @param {Triplet} dest dest An array where the result will be stored. If not provided, a new array will be created and returned.
	 * @return {Triplet} XYZ of standard illuminant D65.
	 */
	static fromIlluminantC([x, y, z]: Triplet, dest: Triplet = [0, 0, 0]): Triplet {
		dest[0] =  0.9972812 * x + -0.0093756 * y + -0.0154171 * z;
		dest[1] = -0.0010298 * x +  1.0007636 * y +  0.0002084 * z;
		dest[2] =                                    0.9209267 * z;
		return dest;
	}

	/**
	 * Convert CIE 1931 XYZ of standard illuminant D65 to CIE 1931 XYZ of standard illuminant C.
	 * Reference: http://www.brucelindbloom.com/index.html?MunsellCalculator.html (Von Kries method)
	 * @param {Triplet} xyz XYZ color (standard illuminant D65).
	 * @param {Triplet} dest dest An array where the result will be stored. If not provided, a new array will be created and returned.
	 * @return {Triplet} XYZ of standard illuminant C.
	 */
	static toIlluminantC([x, y, z]: Triplet, dest: Triplet = [0, 0, 0]): Triplet {
		dest[0] = 1.0027359 * x +  0.0093941 * y +  0.0167846 * z;
		dest[1] = 0.0010319 * x +  0.9992466 * y + -0.0002089 * z;
		dest[2] =                                   1.0858628 * z;
		return dest;
	}

}
