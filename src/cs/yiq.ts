/**
 * This class converts the YIQ color system.
 * Reference: http://en.wikipedia.org/wiki/YIQ
 *
 * @author Takuto Yanagida
 * @version 2024-08-18
 */

import { Triplet } from '../type';


// LRGB --------------------------------------------------------------------


/**
 * Convert Linear RGB to YIQ.
 * @param {Triplet} lrgb Linear RGB color.
 * @param {Triplet} dest dest An array where the result will be stored. If not provided, a new array will be created and returned.
 * @return {Triplet} YIQ color.
 */
export function fromLRGB([lr, lg, lb]: Triplet, dest: Triplet = [0, 0, 0]): Triplet {
	dest[0] = 0.2990   * lr +  0.5870   * lg +  0.1140   * lb;  // Y[0, 1]
	dest[1] = 0.595716 * lr + -0.274453 * lg + -0.321263 * lb;  // I[-0.5957, 0.5957]
	dest[2] = 0.211456 * lr + -0.522591 * lg +  0.311135 * lb;  // Q[-0.5226, 0.5226]
	return dest;
}

/**
 * Convert YIQ to Linear RGB.
 * @param {Triplet} yiq YIQ color.
 * @param {Triplet} dest dest An array where the result will be stored. If not provided, a new array will be created and returned.
 * @return {Triplet} Linear RGB color.
 */
export function toLRGB([y, i, q]: Triplet, dest: Triplet = [0, 0, 0]): Triplet {
	dest[0] = y +  0.9563 * i +  0.6210 * q;  // R[0, 1]
	dest[1] = y + -0.2721 * i + -0.6474 * q;  // G[0, 1]
	dest[2] = y + -1.1070 * i +  1.7046 * q;  // B[0, 1]
	return dest;
}
