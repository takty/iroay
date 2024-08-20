/**
 * Color-related constants.
 *
 * @author Takuto Yanagida
 * @version 2024-08-19
 */

import { Triplet } from './type';

/**
 * D50 tristimulus value
 * Reference: http://www.babelcolor.com/download/A%20review%20of%20RGB%20color%20spaces.pdf
 */
export const D50_xyz: Triplet = [0.34567, 0.35850, 0.29583];
export const D50_XYZ: Triplet = [D50_xyz[0] / D50_xyz[1], 1, D50_xyz[2] / D50_xyz[1]];

/**
 * D65 tristimulus value
 * Reference: http://www.babelcolor.com/download/A%20review%20of%20RGB%20color%20spaces.pdf
 */
export const D65_xyz: Triplet = [0.31273, 0.32902, 0.35825];
export const D65_XYZ: Triplet = [D65_xyz[0] / D65_xyz[1], 1, D65_xyz[2] / D65_xyz[1]];
