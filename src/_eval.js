/**
 *
 * Evaluation Methods
 *
 * @author Takuto Yanagida
 * @version 2019-10-14
 *
 */


class Evaluation {


	// Calculation of the conspicuity degree -----------------------------------


	/**
	 * Calculate the conspicuity degree.
	 * Reference: Effective use of color conspicuity for Re-Coloring system,
	 * Correspondences on Human interface Vol. 12, No. 1, SIG-DE-01, 2010.
	 * @param ls L* of CIELAB color
	 * @param as a* of CIELAB color
	 * @param bs b* of CIELAB color
	 * @return Conspicuity degree [0, 180]
	 * TODO Consider chroma (ab radius of LAB)
	 */
	static conspicuityOfLab(ls, as, bs) {
		const rad = (bs > 0) ? Math.atan2(bs, as) : (Math.atan2(-bs, -as) + Math.PI);
		const H = rad / (Math.PI * 2) * 360.0;
		const a = 35;  // Constant
		if (H < a) return Math.abs(180 - (360 + H - a));
		else return Math.abs(180 - (H - a));
	}


	// Calculation of the color difference -------------------------------------


	/**
	 * Color difference calculation method by CIE 76
	 * @param ls1 L* of CIELAB color 1
	 * @param as1 a* of CIELAB color 1
	 * @param bs1 b* of CIELAB color 1
	 * @param ls2 L* of CIELAB color 2
	 * @param as2 a* of CIELAB color 2
	 * @param bs2 b* of CIELAB color 2
	 * @return Color difference
	 */
	static CIE76(ls1, as1, bs1, ls2, as2, bs2) {
		return Math.sqrt((ls1 - ls2) * (ls1 - ls2) + (as1 - as2) * (as1 - as2) + (bs1 - bs2) * (bs1 - bs2));
	}

	/**
	* Color difference calculation method by CIEDE2000
	* Reference: http://www.ece.rochester.edu/~gsharma/ciede2000/ciede2000noteCRNA.pdf
	* http://d.hatena.ne.jp/yoneh/20071227/1198758604
	 * @param ls1 L* of CIELAB color 1
	 * @param as1 a* of CIELAB color 1
	 * @param bs1 b* of CIELAB color 1
	 * @param ls2 L* of CIELAB color 2
	 * @param as2 a* of CIELAB color 2
	 * @param bs2 b* of CIELAB color 2
	 * @return Color difference
	*/
	static CIEDE2000(ls1, as1, bs1, ls2, as2, bs2) {
		const C1 = Math.sqrt(as1 * as1 + bs1 * bs1), C2 = Math.sqrt(as2 * as2 + bs2 * bs2);
		const Cb = (C1 + C2) / 2.0;
		const G = 0.5 * (1.0 - Math.sqrt(Math.pow(Cb, 7) / (Math.pow(Cb, 7) + Math.pow(25.0, 7.0))));
		const ap1 = (1.0 + G) * as1, ap2 = (1.0 + G) * as2;
		const Cp1 = Math.sqrt(ap1 * ap1 + bs1 * bs1), Cp2 = Math.sqrt(ap2 * ap2 + bs2 * bs2);
		const hp1 = (bs1 == 0.0 && ap1 == 0.0) ? 0.0 : atan(bs1, ap1), hp2 = (bs2 == 0.0 && ap2 == 0.0) ? 0.0 : atan(bs2, ap2);

		const DLp = ls2 - ls1;
		const DCp = Cp2 - Cp1;
		const Dhp = 0.0;
		if (Cp1 * Cp2 == 0) {
			Dhp = 0.0;
		} else if (Math.abs(hp2 - hp1) <= 180.0) {
			Dhp = hp2 - hp1;
		} else if (hp2 - hp1 > 180.0) {
			Dhp = (hp2 - hp1) - 360.0;
		} else if (hp2 - hp1 < -180.0) {
			Dhp = (hp2 - hp1) + 360.0;
		}
		const DHp = 2.0 * Math.sqrt(Cp1 * Cp2) * sin(Dhp / 2.0);

		const Lbp = (ls1 + ls2) / 2.0;
		const Cbp = (Cp1 + Cp2) / 2.0;
		const hbp = 0.0;
		if (Cp1 * Cp2 == 0) {
			hbp = hp1 + hp2;
		} else if (Math.abs(hp2 - hp1) <= 180.0) {
			hbp = (hp1 + hp2) / 2.0;
		} else if (Math.abs(hp2 - hp1) > 180.0 && hp1 + hp2 < 360.0) {
			hbp = (hp1 + hp2 + 360.0) / 2.0;
		} else if (Math.abs(hp2 - hp1) > 180.0 && hp1 + hp2 >= 360.0) {
			hbp = (hp1 + hp2 - 360.0) / 2.0;
		}
		const T = 1.0 - 0.17 * cos(hbp - 30.0) + 0.24 * cos(2.0 * hbp) + 0.32 * cos(3.0 * hbp + 6.0) - 0.2 * cos(4.0 * hbp - 63.0);
		const Dth = 30.0 * Math.exp(-sq((hbp - 275.0) / 25.0));
		const RC = 2.0 * Math.sqrt(Math.pow(Cbp, 7) / (Math.pow(Cbp, 7) + Math.pow(25.0, 7.0)));
		const SL = 1.0 + 0.015 * sq(Lbp - 50.0) / Math.sqrt(20.0 + sq(Lbp - 50.0));
		const SC = 1.0 + 0.045 * Cbp;
		const SH = 1.0 + 0.015 * Cbp * T;
		const RT = -sin(2.0 * Dth) * RC;

		const kL = 1.0, kC = 1.0, kH = 1.0;
		const DE = Math.sqrt(sq(DLp / (kL * SL)) + sq(DCp / (kC * SC)) + sq(DHp / (kH * SH)) + RT * (DCp / (kC * SC)) * (DHp / (kH * SH)));
		return DE;

		function sq(v) { return v * v; }
		function atan(y, x) { const v = Math.toDegrees(Math.atan2(y, x)); return (v < 0.0) ? (v + 360.0) : v; }
		function sin(deg) { return Math.sin(Math.toRadians(deg)); }
		function cos(deg) { return Math.cos(Math.toRadians(deg)); }
	}

	/**
	 * Calculate the color difference between the two colors.
	 * @param ls1 L* of CIELAB color 1
	 * @param as1 a* of CIELAB color 1
	 * @param bs1 b* of CIELAB color 1
	 * @param ls2 L* of CIELAB color 2
	 * @param as2 a* of CIELAB color 2
	 * @param bs2 b* of CIELAB color 2
	 * @param method Method of calculation
	 * @return Color difference
	 */
	static differenceBetweenLab(ls1, as1, bs1, ls2, as2, bs2, method = 'cie76') {
		if (method === 'cie76') {
			return this.CIE76(ls1, as1, bs1, ls2, as2, bs2);
		} else {
			return this.CIEDE2000(ls1, as1, bs1, ls2, as2, bs2);
		}
	}


	// Determination of the basic categorical color ----------------------------


	/**
	 * Find the Basic categorical color of the specified color.
	 * @param y Y of Yxy color
	 * @param sx Small x of Yxy color
	 * @param sy Small y of Yxy color
	 * @return Basic categorical color
	 */
	static categoryOfYxy(y, sx, sy) {
		return BasicCategoricalColor.categoricalColor(y, sx, sy);
	}

}

/**
 * They are sensual expressions of color difference by NBS unit.
 * The values represent the lower limit of each range.
 */
Evaluation.NBS_TRACE       = 0.0;
Evaluation.NBS_SLIGHT      = 0.5;
Evaluation.NBS_NOTICEABLE  = 1.5;
Evaluation.NBS_APPRECIABLE = 3.0;
Evaluation.NBS_MUCH        = 6.0;
Evaluation.NBS_VERY_MUCH   = 12.0;

/**
 * Dental Materials J. 27(1), 139-144 (2008)
 */
Evaluation.DE_TO_NBS = 0.92;