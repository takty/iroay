/**
 * Evaluation Methods
 *
 * @author Takuto Yanagida
 * @version 2024-08-14
 */

import { CC_TABLE } from './table/_cc-min';
import { Triplet } from './_type';
import { DEG_RAD, RAD_DEG, PI2 } from './_const';

export class Evaluation {

	// Calculation of the conspicuity degree -----------------------------------


	/**
	 * Calculate the conspicuity degree.
	 * Reference: Effective use of color conspicuity for Re-Coloring system,
	 * Correspondences on Human interface Vol. 12, No. 1, SIG-DE-01, 2010.
	 * @param {Triplet} lab L*, a*, b* of CIELAB color
	 * @return {number} Conspicuity degree [0, 180]
	 * TODO Consider chroma (ab radius of LAB)
	 */
	static conspicuityOfLab([, as, bs]: Triplet): number {
		const rad = Math.atan2(bs, as) + (bs < 0 ? PI2 : 0);
		const h = rad * RAD_DEG;
		const a = 35;  // Constant
		if (h < a) return Math.abs(180 - (360 + h - a));
		else return Math.abs(180 - (h - a));
	}


	// Calculation of the color difference -------------------------------------


	/**
	 * Calculate distance of two vectors
	 * @param {Triplet} vs1 vector 1
	 * @param {Triplet} vs2 vector 2
	 * @return {number} Distance
	 */
	static distance([v11, v12, v13]: Triplet, [v21, v22, v23]: Triplet): number {
		return Math.sqrt((v11 - v21) * (v11 - v21) + (v12 - v22) * (v12 - v22) + (v13 - v23) * (v13 - v23));
	}

	/**
	 * Color difference calculation method by CIE 76
	 * @param {Triplet} lab1 L*, a*, b* of CIELAB color 1
	 * @param {Triplet} lab2 L*, a*, b* of CIELAB color 2
	 * @return {number} Color difference
	 */
	static CIE76([ls1, as1, bs1]: Triplet, [ls2, as2, bs2]: Triplet): number {
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
	static CIEDE2000([ls1, as1, bs1]: Triplet, [ls2, as2, bs2]: Triplet): number {
		const C1 = Math.sqrt(as1 * as1 + bs1 * bs1), C2 = Math.sqrt(as2 * as2 + bs2 * bs2);
		const Cb = (C1 + C2) / 2;
		const G = 0.5 * (1 - Math.sqrt(Math.pow(Cb, 7) / (Math.pow(Cb, 7) + Math.pow(25, 7))));
		const ap1 = (1 + G) * as1, ap2 = (1 + G) * as2;
		const Cp1 = Math.sqrt(ap1 * ap1 + bs1 * bs1), Cp2 = Math.sqrt(ap2 * ap2 + bs2 * bs2);
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

		function sq(v: number) { return v * v; }
		function atan(y: number, x: number) { const v = Math.atan2(y, x) * RAD_DEG; return (v < 0) ? (v + 360) : v; }
		function sin(deg: number) { return Math.sin(deg * DEG_RAD); }
		function cos(deg: number) { return Math.cos(deg * DEG_RAD); }
	}

	/**
	 * Calculate the color difference between the two colors.
	 * @param {Triplet} lab1 L*, a*, b* of CIELAB color 1
	 * @param {Triplet} lab2 L*, a*, b* of CIELAB color 2
	 * @param {string} method Method of calculation
	 * @return {number} Color difference
	 */
	static differenceBetweenLab(lab1: Triplet, lab2: Triplet, method: string = 'cie76'): number {
		if (method === 'cie76') {
			return Evaluation.CIE76(lab1, lab2);
		} else {
			return Evaluation.CIEDE2000(lab1, lab2);
		}
	}


	// Determination of the basic categorical color ----------------------------


	/**
	 * Find the basic categorical color of the specified color.
	 * @param {Triplet} yxy Yxy color
	 * @return {string} Basic categorical color
	 */
	static categoryOfYxy([y, sx, sy]: Triplet): string {
		const lum = Math.pow(y * Evaluation._Y_TO_LUM, 0.9);  // magic number

		let diff = Number.MAX_VALUE;
		let clu = 0;
		for (let l of Evaluation._LUM_TABLE) {
			const d = Math.abs(lum - l);
			if (d < diff) {
				diff = d;
				clu = l;
			}
		}
		const t: string = Evaluation._CC_TABLE[clu as 2|5|10|20|30|40] as string;
		sx *= 1000;
		sy *= 1000;
		let dis = Number.MAX_VALUE;
		let cc: number|string = 1;
		for (let i = 0; i < 18 * 21; i += 1) {
			if (t[i] === '.') continue;
			const x = (i % 18) * 25 + 150;
			const y = ((i / 18) | 0) * 25 + 75;
			const d = Math.sqrt((sx - x) * (sx - x) + (sy - y) * (sy - y));
			if (d < dis) {
				dis = d;
				cc = t[i];
			}
		}
		const ci = (cc === 'a') ? 10 : parseInt(cc as string);
		return Evaluation.CATEGORICAL_COLORS[ci];
	}

	/**
	 * They are sensual expressions of color difference by NBS unit.
	 * The values represent the lower limit of each range.
	 */
	static NBS_TRACE       = 0.0;
	static NBS_SLIGHT      = 0.5;
	static NBS_NOTICEABLE  = 1.5;
	static NBS_APPRECIABLE = 3.0;
	static NBS_MUCH        = 6.0;
	static NBS_VERY_MUCH   = 12.0;

	/**
	 * Dental Materials J. 27(1), 139-144 (2008)
	 */
	static DE_TO_NBS = 0.92;

	/**
	 * Basic Categorical Colors
	 */
	static CATEGORICAL_COLORS = [
		'white', 'black', 'red', 'green',
		'yellow', 'blue', 'brown', 'purple',
		'pink', 'orange', 'gray',
	];
	private static _Y_TO_LUM = 60;
	private static _LUM_TABLE = [2, 5, 10, 20, 30, 40];

	private static _CC_TABLE = CC_TABLE;

}
