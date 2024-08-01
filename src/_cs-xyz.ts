/**
 * This class converts the CIE 1931 XYZ color system.
 *
 * @author Takuto Yanagida
 * @version 2024-08-01
 */

import { Triplet } from './_type';
import { LRGB } from './_cs-lrgb';
import { Yxy } from './_cs-yxy';
import { Lab } from './_cs-lab';
import { LMS } from './_cs-lms';
import { Munsell } from './_cs-munsell';

export class XYZ {


	// Inverse Conversion Functions --------------------------------------------


	/**
	 * Convert CIE 1931 XYZ to Linear RGB.
	 * @param {Triplet} xyz XYZ color
	 * @return Linear RGB color
	 */
	static toLRGB(xyz: Triplet): Triplet {
		return LRGB.fromXYZ(xyz);
	}

	/**
	 * Convert Linear RGB to CIE 1931 XYZ.
	 * @param {Triplet} lrgb Linear RGB color
	 * @return {Triplet} XYZ color
	 */
	static fromLRGB(lrgb: Triplet): Triplet {
		return LRGB.toXYZ(lrgb);
	}

	/**
	 * Convert CIE 1931 XYZ to Yxy.
	 * @param {Triplet} xyz XYZ color
	 * @return {Triplet} Yxy color
	 */
	static toYxy(xyz: Triplet): Triplet {
		return Yxy.fromXYZ(xyz);
	}

	/**
	 * Convert Yxy to CIE 1931 XYZ.
	 * @param {Triplet} yxy Yxy color
	 * @return {Triplet} XYZ color
	 */
	static fromYxy(yxy: Triplet): Triplet {
		return Yxy.toXYZ(yxy);
	}

	/**
	 * Convert CIE 1931 XYZ to CIE 1976 (L*, a*, b*).
	 * @param {Triplet} xyz XYZ color
	 * @return {Triplet} CIELAB color
	 */
	static toLab(xyz: Triplet): Triplet {
		return Lab.fromXYZ(xyz);
	}

	/**
	 * Convert CIE 1976 (L*, a*, b*) to CIE 1931 XYZ.
	 * @param {Triplet} lab L*, a*, b* of CIELAB color
	 * @return {Triplet} XYZ color
	 */
	static fromLab(lab: Triplet): Triplet {
		return Lab.toXYZ(lab);
	}

	/**
	 * Convert CIE 1931 XYZ to LMS.
	 * @param {Triplet} xyz XYZ color
	 * @return {Triplet} LMS color
	 */
	static toLMS(xyz: Triplet): Triplet {
		return LMS.fromXYZ(xyz);
	}

	/**
	 * Convert LMS to CIE 1931 XYZ.
	 * @param {Triplet} lms LMS color
	 * @return {Triplet} XYZ color
	 */
	static fromLMS(lms: Triplet): Triplet {
		return LMS.toXYZ(lms);
	}

	/**
	 * Convert CIE 1931 XYZ to Munsell (HVC).
	 * @param {Triplet} xyz XYZ color (standard illuminant D65)
	 * @return {Triplet} Munsell color
	 */
	static toMunsell(xyz: Triplet): Triplet {
		return Munsell.fromXYZ(xyz);
	}

	/**
	 * Convert Munsell (HVC) to CIE 1931 XYZ.
	 * @param {Triplet} hvc Hue, value, chroma of Munsell color
	 * @return {Triplet} XYZ color
	 */
	static fromMunsell(hvc: Triplet): Triplet {
		return Munsell.toXYZ(hvc);
	}


	// Conversion of Standard Illuminant ---------------------------------------


	/**
	 * Convert CIE 1931 XYZ of standard illuminant C to CIE 1931 XYZ of standard illuminant D65.
	 * Reference: http://www.brucelindbloom.com/index.html?MunsellCalculator.html (Von Kries method)
	 * @param {Triplet} xyz XYZ color (standard illuminant C)
	 * @return {Triplet} XYZ of standard illuminant D65
	 */
	static fromIlluminantC([x, y, z]: Triplet): Triplet {
		return [
			 0.9972812 * x + -0.0093756 * y + -0.0154171 * z,
			-0.0010298 * x +  1.0007636 * y +  0.0002084 * z,
			                                   0.9209267 * z,
		];
	}

	/**
	 * Convert CIE 1931 XYZ of standard illuminant D65 to CIE 1931 XYZ of standard illuminant C.
	 * Reference: http://www.brucelindbloom.com/index.html?MunsellCalculator.html (Von Kries method)
	 * @param {Triplet} xyz XYZ color (standard illuminant D65)
	 * @return {Triplet} XYZ of standard illuminant C
	 */
	static toIlluminantC([x, y, z]: Triplet): Triplet {
		return [
			1.0027359 * x +  0.0093941 * y +  0.0167846 * z,
			0.0010319 * x +  0.9992466 * y + -0.0002089 * z,
			                                  1.0858628 * z,
		];
	}
}
