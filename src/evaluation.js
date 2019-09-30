/**
 *
 * Utility class of the evaluation methods.
 *
 * @author Takuto Yanagida
 * @version 2019-09-29
 *
 */


class Evaluation {

	// Calculation of the conspicuity degree -----------------------------------


	/**
	 * Calculate the conspicuity degree.
	 * Reference: Effective use of color conspicuity for Re-Coloring system,
	 * Correspondences on Human interface Vol. 12, No. 1, SIG-DE-01, 2010.
	 * @param lab CIELAB color
	 * @return Conspicuity degree [0, 180]
	 * TODO Consider chroma (ab radius of LAB)
	 */
	static conspicuityOfLab(lab) {
		const rad = (lab[2] > 0) ? Math.atan2(lab[2], lab[1]) : (Math.atan2(-lab[2], -lab[1]) + Math.PI);
		const H = rad / (Math.PI * 2) * 360.0;
		const a = 35;  // Constant
		if (H < a) return Math.abs(180 - (360 + H - a));
		else return Math.abs(180 - (H - a));
	}


	// Calculation of the color difference -------------------------------------


	static CIE76(v1, v2) {
		return Math.sqrt((v1[0] - v2[0]) * (v1[0] - v2[0]) + (v1[1] - v2[1]) * (v1[1] - v2[1]) + (v1[2] - v2[2]) * (v1[2] - v2[2]));
	}

	static CIEDE2000(v1, v2) {
		const L1 = v1[0], a1 = v1[1], b1 = v1[2];
		const L2 = v2[0], a2 = v2[1], b2 = v2[2];

		const C1 = Math.sqrt(a1 * a1 + b1 * b1), C2 = Math.sqrt(a2 * a2 + b2 * b2);
		const Cb = (C1 + C2) / 2.0;
		const G = 0.5 * (1.0 - Math.sqrt(Math.pow(Cb, 7) / (Math.pow(Cb, 7) + Math.pow(25.0, 7.0))));
		const ap1 = (1.0 + G) * a1, ap2 = (1.0 + G) * a2;
		const Cp1 = Math.sqrt(ap1 * ap1 + b1 * b1), Cp2 = Math.sqrt(ap2 * ap2 + b2 * b2);
		const hp1 = (b1 == 0.0 && ap1 == 0.0) ? 0.0 : atan(b1, ap1), hp2 = (b2 == 0.0 && ap2 == 0.0) ? 0.0 : atan(b2, ap2);

		const DLp = L2 - L1;
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

		const Lbp = (L1 + L2) / 2.0;
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
	 * @param v1 CIELAB color 1
	 * @param v2 CIELAB color 2
	 * @return Color difference
	 */
	static differenceBetweenLab(v1, v2) {
		return Evaluation.colorDifferenceMethod.differenceBetween(v1, v2);
	}


	// Calculation of simple distance of color vector --------------------------


	/**
	 * Calculate the distance between two color vectors.
	 * @param v1 Color 1
	 * @param v2 Color 2
	 * @return Distance
	 */
	static distance(v1, v2) {
		return Math.sqrt((v1[0] - v2[0]) * (v1[0] - v2[0]) + (v1[1] - v2[1]) * (v1[1] - v2[1]) + (v1[2] - v2[2]) * (v1[2] - v2[2]));
	}

	/**
	 * Calculate the square distance between two color vectors.
	 * @param v1 Color 1
	 * @param v2 Color 2
	 * @return Distance
	 */
	static squaredDistance(v1, v2) {
		return (v1[0] - v2[0]) * (v1[0] - v2[0]) + (v1[1] - v2[1]) * (v1[1] - v2[1]) + (v1[2] - v2[2]) * (v1[2] - v2[2]);
	}


	// Determination of the basic categorical color ----------------------------


	/**
	 * Find the Basic categorical color of the specified color.
	 * @param yxy Yxy color
	 * @return Basic categorical color
	 */
	static categoryOfYxy(yxy) {
		let lum = yxy[0] * Evaluation.Y_TO_LUM;
		lum = Math.pow(lum, 0.9);  // magic number
		return BasicCategoricalColorTable.categoricalColor(lum, yxy[1], yxy[2]);
	}

}

/**
 * Represents the currently selected color difference calculation method.
 */
Evaluation.colorDifferenceMethod = Evaluation.ColorDifferenceMethod.CIEDE2000;

/**
 * Enum type for color difference calculation method.
 */
Evaluation.ColorDifferenceMethod = Object.freeze({

	/**
	 * Color difference calculation method by CIE 76
	 */
	CIE76: {
		differenceBetween(v1, v2) { return CIE76(v1, v2); }
	},

	/**
	* Color difference calculation method by CIEDE2000
	* Reference: http://www.ece.rochester.edu/~gsharma/ciede2000/ciede2000noteCRNA.pdf
	* http://d.hatena.ne.jp/yoneh/20071227/1198758604
	*/
	CIEDE2000: {
		differenceBetween(v1, v2) { return CIEDE2000(v1, v2); }
	}

});

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

Evaluation.DE_TO_NBS = 0.92;

/**
 * Enum type for the basic categorical color.
 */
Evaluation.BasicCategoricalColor = Object.freeze({
	WHITE  : 0,
	BLACK  : 1,
	RED    : 2,
	GREEN  : 3,
	YELLOW : 4,
	BLUE   : 5,
	BROWN  : 6,
	PURPLE : 7,
	PINK   : 8,
	ORANGE : 9,
	GRAY   : 10,
	valuses: () => {
		return [
			Evaluation.BasicCategoricalColor.WHITE,
			Evaluation.BasicCategoricalColor.BLACK,
			Evaluation.BasicCategoricalColor.RED,
			Evaluation.BasicCategoricalColor.GREEN,
			Evaluation.BasicCategoricalColor.YELLOW,
			Evaluation.BasicCategoricalColor.BLUE,
			Evaluation.BasicCategoricalColor.BROWN,
			Evaluation.BasicCategoricalColor.PURPLE,
			Evaluation.BasicCategoricalColor.PINK,
			Evaluation.BasicCategoricalColor.ORANGE,
			Evaluation.BasicCategoricalColor.GRAY,
		];
	}
});

Evaluation.Y_TO_LUM = 60.0;
