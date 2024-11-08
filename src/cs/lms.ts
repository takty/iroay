/**
 * This class converts the LMS color system.
 *
 * @author Takuto Yanagida
 * @version 2024-11-08
 */

import { Triplet } from '../type';

/*
 * Reference: F. Vienot, H. Brettel, and J.D. Mollon,
 * Digital video colourmaps for checking the legibility of displays by dichromats,
 * COLOR research and application, vol.24, no.4, pp.243-252, Aug. 1999.
 */
export const SMITH_POKORNY: Triplet[] = [
	[ 0.15514, 0.54312, -0.03286],
	[-0.15514, 0.45684,  0.03286],
	[ 0.0,     0.0,      0.01608]
];

export const SMITH_POKORNY_INV: Triplet[] = [
	[2.944812906606763, -3.500977991936487, 13.17218214714747],
	[1.000040001600064,  1.000040001600064,  0.0             ],
	[0.0,                0.0,               62.18905472636816]
];

export const BRADFORD: Triplet[] = [
	[ 0.8951000,  0.2664000, -0.1614000],
	[-0.7502000,  1.7135000,  0.0367000],
	[ 0.0389000, -0.0685000,  1.0296000]
];

export const BRADFORD_INV: Triplet[] = [
	[ 0.9869929, -0.1470543,  0.1599627],
	[ 0.4323053,  0.5183603,  0.0492912],
	[-0.0085287,  0.0400428,  0.9684867]
];

export const VON_KRIES: Triplet[] = [
	[ 0.4002400, 0.7076000, -0.0808100],
	[-0.2263000, 1.1653200,  0.0457000],
	[ 0.0000000, 0.0000000,  0.9182200]
];

export const VON_KRIES_INV: Triplet[] = [
	[1.8599364, -1.1293816,  0.2198974],
	[0.3611914,  0.6388125, -0.0000064],
	[0.0000000,  0.0000000,  1.0890636]
];

export const ConversionMethod = Object.freeze({
	SMITH_POKORNY: { direct: SMITH_POKORNY, inverse: SMITH_POKORNY_INV },
	BRADFORD: { direct: BRADFORD, inverse: BRADFORD_INV },
	VON_KRIES: { direct: VON_KRIES, inverse: VON_KRIES_INV },
});

export function setConversionMethod(cm: { direct: Triplet[]; inverse: Triplet[] }) {
	conversionMethod = cm;
}

let conversionMethod = ConversionMethod.SMITH_POKORNY;


// XYZ ---------------------------------------------------------------------


/**
 * Convert CIE 1931 XYZ to LMS.
 * @param {Triplet} xyz XYZ color.
 * @param {Triplet} dest dest An array where the result will be stored. If not provided, a new array will be created and returned.
 * @return {Triplet} LMS color.
 */
export function fromXyz([x, y, z]: Triplet, dest: Triplet = [0, 0, 0]): Triplet {
	const cm: Triplet[] = conversionMethod.direct;
	dest[0] = cm[0][0] * x + cm[0][1] * y + cm[0][2] * z;
	dest[1] = cm[1][0] * x + cm[1][1] * y + cm[1][2] * z;
	dest[2] = cm[2][0] * x + cm[2][1] * y + cm[2][2] * z;
	return dest;
}

/**
 * Convert LMS to CIE 1931 XYZ.
 * @param {Triplet} lms LMS color.
 * @param {Triplet} dest dest An array where the result will be stored. If not provided, a new array will be created and returned.
 * @return {Triplet} XYZ color.
 */
export function toXyz([l, m, s]: Triplet, dest: Triplet = [0, 0, 0]): Triplet {
	const cm: Triplet[] = conversionMethod.inverse;
	dest[0] = cm[0][0] * l + cm[0][1] * m + cm[0][2] * s;
	dest[1] = cm[1][0] * l + cm[1][1] * m + cm[1][2] * s;
	dest[2] = cm[2][0] * l + cm[2][1] * m + cm[2][2] * s;
	return dest;
}
