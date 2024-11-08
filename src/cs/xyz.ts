/**
 * This class converts the CIE 1931 XYZ color system.
 *
 * @author Takuto Yanagida
 * @version 2024-11-08
 */

import { Triplet } from '../type';

export { toXyz as fromLrgb, fromXyz as toLrgb } from './lrgb';
export { toXyz as fromXyy, fromXyz as toXyy } from './xyy';
export { toXyz as fromLab, fromXyz as toLab } from './lab';
export { toXyz as fromLms, fromXyz as toLms } from './lms';
export { toXyz as fromMunsell, fromXyz as toMunsell } from './munsell';


// Conversion of Standard Illuminant ---------------------------------------


/**
 * Convert CIE 1931 XYZ of standard illuminant C to CIE 1931 XYZ of standard illuminant D65.
 * Reference: http://www.brucelindbloom.com/index.html?MunsellCalculator.html (Von Kries method)
 * @param {Triplet} xyz XYZ color (standard illuminant C).
 * @param {Triplet} dest dest An array where the result will be stored. If not provided, a new array will be created and returned.
 * @return {Triplet} XYZ of standard illuminant D65.
 */
export function fromIlluminantC([x, y, z]: Triplet, dest: Triplet = [0, 0, 0]): Triplet {
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
export function toIlluminantC([x, y, z]: Triplet, dest: Triplet = [0, 0, 0]): Triplet {
	dest[0] = 1.0027359 * x +  0.0093941 * y +  0.0167846 * z;
	dest[1] = 0.0010319 * x +  0.9992466 * y + -0.0002089 * z;
	dest[2] =                                   1.0858628 * z;
	return dest;
}
