/**
 * This class converts the Linear RGB color system.
 * It is targeted for Linear RGB which converted sRGB (D65).
 * Reference: http://www.brucelindbloom.com/index.html?Eqn_RGB_XYZ_Matrix.html
 *
 * @author Takuto Yanagida
 * @version 2024-11-08
 */

import { Triplet } from '../type';

export { toLrgb as fromRgb, fromLrgb as toRgb } from './rgb';
export { toLrgb as fromYiq, fromLrgb as toYiq } from './yiq';


// XYZ -------------------------------------------------------------------------


/**
 * Convert CIE 1931 XYZ to Linear RGB.
 * @param {Triplet} xyz XYZ color.
 * @param {Triplet} dest dest An array where the result will be stored. If not provided, a new array will be created and returned.
 * @return {Triplet} Linear RGB color.
 */
export function fromXyz([x, y, z]: Triplet, dest: Triplet = [0, 0, 0]): Triplet {
	dest[0] =  3.2404542 * x + -1.5371385 * y + -0.4985314 * z;
	dest[1] = -0.9692660 * x +  1.8760108 * y +  0.0415560 * z;
	dest[2] =  0.0556434 * x + -0.2040259 * y +  1.0572252 * z;
	return dest;
}

/**
 * Convert Linear RGB to CIE 1931 XYZ.
 * @param {Triplet} lrgb Linear RGB color.
 * @param {Triplet} dest dest An array where the result will be stored. If not provided, a new array will be created and returned.
 * @return {Triplet} XYZ color.
 */
export function toXyz([lr, lg, lb]: Triplet, dest: Triplet = [0, 0, 0]): Triplet {
	dest[0] = 0.4124564 * lr + 0.3575761 * lg + 0.1804375 * lb;
	dest[1] = 0.2126729 * lr + 0.7151522 * lg + 0.0721750 * lb;
	dest[2] = 0.0193339 * lr + 0.1191920 * lg + 0.9503041 * lb;
	return dest;
}
