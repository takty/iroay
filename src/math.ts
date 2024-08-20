/**
 * Color-related math.
 *
 * @author Takuto Yanagida
 * @version 2024-08-19
 */

/**
 * Conversion factor from degrees to radians.
 */
export const DEG_RAD: number = Math.PI / 180;

/**
 * Conversion factor from radians to degrees.
 */
export const RAD_DEG: number = 180 / Math.PI;

/**
 * Twice PI.
 */
export const PI2: number = Math.PI * 2;

/**
 * Calculates the angle in radians from the given two numbers `as` and `bs`.
 * This function uses the standard `atan2` function and adds 2π if `bs` is negative.
 * @param {number} as The number to be used as the x-coordinate.
 * @param {number} bs The number to be used as the y-coordinate.
 * @returns {number} The calculated angle in radians.
 */
export function atan2rad(bs: number, as: number): number {
	return Math.atan2(bs, as) + (bs < 0 ? PI2 : 0);
}

/**
 * Calculates the magnitude (length) of the vector from the origin to the point (a, b).
 * @param {number} a The x-coordinate of the point.
 * @param {number} b The y-coordinate of the point.
 * @returns {number} The Euclidean distance from the origin to (a, b).
 */
export function mag(a: number, b: number): number {
	return Math.sqrt(a * a + b * b);
}
