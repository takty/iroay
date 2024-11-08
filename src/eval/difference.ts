/**
 * Calculation of the color difference.
 *
 * @author Takuto Yanagida
 * @version 2024-11-09
 */

import { Triplet } from '../type';
import { DEG_RAD, RAD_DEG, atan2rad, mag } from '../math';

/**
 * They are sensual expressions of color difference by NBS unit.
 * The values represent the lower limit of each range.
 */
export enum NBS {
	Trace       = 0.0,
	Slight      = 0.5,
	Noticeable  = 1.5,
	Appreciable = 3.0,
	Much        = 6.0,
	VeryMuch    = 12.0,
};

/**
 * Dental Materials J. 27(1), 139-144 (2008)
 */
export const DE_TO_NBS = 0.92;

/**
 * Calculate distance of two vectors
 * @param {Triplet} vs1 vector 1
 * @param {Triplet} vs2 vector 2
 * @return {number} Distance
 */
export function distance([v11, v12, v13]: Triplet, [v21, v22, v23]: Triplet): number {
	return Math.sqrt((v11 - v21) * (v11 - v21) + (v12 - v22) * (v12 - v22) + (v13 - v23) * (v13 - v23));
}

/**
 * Color difference calculation method by CIE 76
 * @param {Triplet} lab1 L*, a*, b* of CIELAB color 1
 * @param {Triplet} lab2 L*, a*, b* of CIELAB color 2
 * @return {number} Color difference
 */
export function CIE76([ls1, as1, bs1]: Triplet, [ls2, as2, bs2]: Triplet): number {
	return Math.sqrt((ls1 - ls2) * (ls1 - ls2) + (as1 - as2) * (as1 - as2) + (bs1 - bs2) * (bs1 - bs2));
}

/**
 * Color difference calculation method by CIEDE2000
 * Reference: http://www.ece.rochester.edu/~gsharma/ciede2000/ciede2000noteCRNA.pdf
 * http://d.hatena.ne.jp/yoneh/20071227/1198758604
 * @param {Triplet} lab1 L*, a*, b* of CIELAB color 1
 * @param {Triplet} lab2 L*, a*, b* of CIELAB color 2
 * @return {number} Color difference
 */
export function CIEDE2000([ls1, as1, bs1]: Triplet, [ls2, as2, bs2]: Triplet): number {
	const C1 = mag(as1, bs1), C2 = mag(as2, bs2);
	const Cb = (C1 + C2) / 2;
	const G = 0.5 * (1 - Math.sqrt(Math.pow(Cb, 7) / (Math.pow(Cb, 7) + Math.pow(25, 7))));
	const ap1 = (1 + G) * as1, ap2 = (1 + G) * as2;
	const Cp1 = mag(ap1, bs1), Cp2 = mag(ap2, bs2);
	const hp1 = (bs1 === 0 && ap1 === 0) ? 0 : atan(bs1, ap1), hp2 = (bs2 === 0 && ap2 === 0) ? 0 : atan(bs2, ap2);

	const DLp = ls2 - ls1;
	const DCp = Cp2 - Cp1;
	let Dhp = 0;
	if (Cp1 * Cp2 < 1e-10) {
		Dhp = 0;
	} else if (Math.abs(hp2 - hp1) <= 180) {
		Dhp = hp2 - hp1;
	} else if (hp2 - hp1 > 180) {
		Dhp = (hp2 - hp1) - 360;
	} else if (hp2 - hp1 < -180) {
		Dhp = (hp2 - hp1) + 360;
	}
	const DHp = 2 * Math.sqrt(Cp1 * Cp2) * sin(Dhp / 2);

	const Lbp = (ls1 + ls2) / 2;
	const Cbp = (Cp1 + Cp2) / 2;
	let hbp = 0;
	if (Cp1 * Cp2 < 1e-10) {
		hbp = hp1 + hp2;
	} else if (Math.abs(hp2 - hp1) <= 180) {
		hbp = (hp1 + hp2) / 2;
	} else if (Math.abs(hp2 - hp1) > 180 && hp1 + hp2 < 360) {
		hbp = (hp1 + hp2 + 360) / 2;
	} else if (Math.abs(hp2 - hp1) > 180 && hp1 + hp2 >= 360) {
		hbp = (hp1 + hp2 - 360) / 2;
	}
	const T = 1 - 0.17 * cos(hbp - 30) + 0.24 * cos(2 * hbp) + 0.32 * cos(3 * hbp + 6) - 0.2 * cos(4 * hbp - 63);
	const Dth = 30 * Math.exp(-sq((hbp - 275) / 25));
	const RC = 2 * Math.sqrt(Math.pow(Cbp, 7) / (Math.pow(Cbp, 7) + Math.pow(25, 7)));
	const SL = 1 + 0.015 * sq(Lbp - 50) / Math.sqrt(20 + sq(Lbp - 50));
	const SC = 1 + 0.045 * Cbp;
	const SH = 1 + 0.015 * Cbp * T;
	const RT = -sin(2 * Dth) * RC;

	const kL = 1, kC = 1, kH = 1;
	const DE = Math.sqrt(sq(DLp / (kL * SL)) + sq(DCp / (kC * SC)) + sq(DHp / (kH * SH)) + RT * (DCp / (kC * SC)) * (DHp / (kH * SH)));
	return DE;
}

function sq(v: number) { return v * v; }
function atan(y: number, x: number) { return atan2rad(y, x) * RAD_DEG; }
function sin(deg: number) { return Math.sin(deg * DEG_RAD); }
function cos(deg: number) { return Math.cos(deg * DEG_RAD); }
