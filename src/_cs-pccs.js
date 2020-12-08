/**
 *
 * This class converts the PCCS color system.
 * Colors where h is -1 are handled especially as an achromatic color (n).
 * Reference: KOBAYASHI Mituo and YOSIKI Kayoko,
 * Mathematical Relation among PCCS Tones, PCCS Color Attributes and Munsell Color Attributes,
 * Journal of the Color Science Association of Japan 25(4), 249-261, 2001.
 *
 * @author Takuto Yanagida
 * @version 2020-12-08
 *
 */


class PCCS {


	// Calculation of PCCS value (accurate) ------------------------------------


	static _calcPccsH(H) {
		let h1 = -1, h2 = -1;
		for (let i = 1; i < PCCS._MUNSELL_H.length; ++i) {
			if (PCCS._MUNSELL_H[i] <= H) h1 = i;
			if (H < PCCS._MUNSELL_H[i]) {
				h2 = i;
				break;
			}
		}
		if (h1 == -1) console.error("h1 is -1, H = " + H);
		if (h2 == -1) console.error("h2 is -1, H = " + H);
		return h1 + (h2 - h1) * (H - PCCS._MUNSELL_H[h1]) / (PCCS._MUNSELL_H[h2] - PCCS._MUNSELL_H[h1]);
	}

	static _calcPccsS(V, C, h) {
		const a = PCCS._calcInterpolatedCoefficients(h);
		const g = 0.81 - 0.24 * Math.sin((h - 2.6) / 12 * Math.PI);
		const a0 = -C / (1 - Math.exp(-g * V));
		return PCCS._solveEquation(PCCS._simplyCalcPccsS(V, C, h), a[3], a[2], a[1], a0);
	}

	static _calcInterpolatedCoefficients(h) {
		if (PCCS._MAX_HUE < h) h -= PCCS._MAX_HUE;
		let hf = 0 | Math.floor(h);
		if (hf % 2 != 0) --hf;
		let hc = hf + 2;
		if (PCCS._MAX_HUE < hc) hc -= PCCS._MAX_HUE;

		const af = PCCS._COEFFICIENTS[hf / 2], ac = PCCS._COEFFICIENTS[hc / 2], a = [0, 0, 0, 0];
		for (let i = 0; i < 3; ++i) {
			a[i + 1] = (h - hf) / (hc - hf) * (ac[i]- af[i]) + af[i];
		}
		return a;
	}

	static _solveEquation(x0, a3, a2, a1, a0) {
		let x = x0;
		while (true) {
			const y = a3 * x * x * x + a2 * x * x + a1 * x + a0;
			const yp = 3 * a3 * x * x + 2 * a2 * x + a1;
			const x1 = -y / yp + x;
			if (Math.abs(x1 - x) < 0.001) break;
			x = x1;
		}
		return x;
	}


	// Calculation of Munsell value (accurate) ---------------------------------


	static _calcMunsellH(h) {
		const h1 = 0 | Math.floor(h), h2 = h1 + 1;
		let H1 = PCCS._MUNSELL_H[h1], H2 = PCCS._MUNSELL_H[h2];
		if (H1 > H2) H2 = 100;
		return H1 + (H2 - H1) * (h - h1) / (h2 - h1);
	}

	static _calcMunsellC(h, l, s) {
		const a = PCCS._calcInterpolatedCoefficients(h);
		const g = 0.81 - 0.24 * Math.sin((h - 2.6) / 12 * Math.PI);
		return (a[3] * s * s * s + a[2] * s * s + a[1] * s) * (1 - Math.exp(-g * l));
	}


	// Calculation of PCCS value (concise) -------------------------------------


	static _simplyCalcPccsH(H) {
		const y = H * Math.PI / 50;
		return 24 * y / (2 * Math.PI) + 1.24
				+ 0.02 * Math.cos(y) - 0.1 * Math.cos(2 * y) - 0.11  * Math.cos(3 * y)
				+ 0.68 * Math.sin(y) - 0.3 * Math.sin(2 * y) + 0.013 * Math.sin(3 * y);
	}

	static _simplyCalcPccsS(V, C, h) {
		const Ct = 12 + 1.7 * Math.sin((h + 2.2) * Math.PI / 12);
		const gt = 0.81 - 0.24 * Math.sin((h - 2.6) * Math.PI / 12);
		const e2 = 0.004, e1 = 0.077, e0 = -C / (Ct * (1 - Math.exp(-gt * V)));
		return (-e1 + Math.sqrt(e1 * e1 - 4 * e2 * e0)) / (2 * e2);
	}


	// Calculation of Munsell value (concise) ----------------------------------


	static _simplyCalcMunsellH(h) {
		const x = (h - 1) * Math.PI / 12;
		return 100 * x / (2 * Math.PI) - 1
				+ 0.12 * Math.cos(x) + 0.34 * Math.cos(2 * x) + 0.4 * Math.cos(3 * x)
				- 2.7  * Math.sin(x) + 1.5  * Math.sin(2 * x) - 0.4 * Math.sin(3 * x);
	}

	static _simplyCalcMunsellC(h, l, s) {
		const Ct = 12 + 1.7 * Math.sin((h + 2.2) * Math.PI / 12);
		const gt = 0.81 - 0.24 * Math.sin((h - 2.6) * Math.PI / 12);
		return Ct * (0.077 * s + 0.0040 * s * s) * (1 - Math.exp(-gt * l));
	}

	/**
	 * Convert Munsell (HVC) to PCCS (hls).
	 * @param {number[]} hvc Hue, value, chroma of Munsell color
	 * @return {number[]} PCCS color
	 */
	static fromMunsell([H, V, C]) {
		if (Munsell.MAX_HUE <= H) H -= Munsell.MAX_HUE;
		let h = 0, l = V, s = 0;

		h = PCCS.conversionMethod._calcPccsH(H);
		if (Munsell.MONO_LIMIT_C <= C) {
			s = PCCS.conversionMethod._calcPccsS(V, C, h);
		}
		if (PCCS._MAX_HUE <= h) h -= PCCS._MAX_HUE;
		return [h, l, s];
	}

	/**
	 * Convert PCCS (hls) to Munsell (HVC).
	 * @param {number[]} hls Hue, lightness, saturation of PCCS color
	 * @return {number[]} Munsell color
	 */
	static toMunsell([h, l, s]) {
		let H = 0, V = l, C = 0;

		H = PCCS.conversionMethod._calcMunsellH(h);
		if (PCCS._MONO_LIMIT_S <= s) {
			C = PCCS.conversionMethod._calcMunsellC(h, l, s);
		}
		if (H < 0) H += Munsell.MAX_HUE;
		if (Munsell.MAX_HUE <= H) H -= Munsell.MAX_HUE;
		return [H, V, C];
	}

	/**
	 * Calculate tone.
	 * @param {number[]} hls Hue, lightness, saturation of PCCS color
	 * @return {number} Tone
	 */
	static tone(hls) {
		const s = hls[2];
		const t = PCCS.relativeLightness(hls);
		const tu = s * -3 / 10 + 8.5, td = s * 3 / 10 + 2.5;

		if (s < 1) {
			return PCCS.Tone.none;
		} else if (1 <= s && s < 4) {
			if (t < td)  return PCCS.Tone.dkg;
			if (t < 5.5) return PCCS.Tone.g;
			if (t < tu)  return PCCS.Tone.ltg;
			if (s < 2.5) return PCCS.Tone.p;
			return PCCS.Tone.p_p;
		} else if (4 <= s && s < 7) {
			if (t < td)  return PCCS.Tone.dk;
			if (t < 5.5) return PCCS.Tone.d;
			if (t < tu)  return PCCS.Tone.sf;
			if (s < 5.5) return PCCS.Tone.lt;
			return PCCS.Tone.lt_p;
		} else if (7 <= s && s < 8.5) {
			if (t < td) return PCCS.Tone.dp;
			if (t < tu) return PCCS.Tone.s;
			return PCCS.Tone.b;
		} else {
			return PCCS.Tone.v;
		}
	}

	/**
	 * Return relative lightness (lightness in tone coordinate system).
	 * @param {number[]} hls Hue, lightness, saturation of PCCS color
	 * @return {number[]} Relative lightness L
	 */
	static relativeLightness([h, l, s]) {
		return l - (0.25 - 0.34 * Math.sqrt(1 - Math.sin((h - 2) * Math.PI / 12))) * s;
	}

	/**
	 * Return absolute lightness (lightness in PCCS).
	 * @param {number[]} hLs Tone coordinate color
	 * @return {number[]} Absolute lightness l
	 */
	static absoluteLightness([h, L, s]) {
		return L + (0.25 - 0.34 * Math.sqrt(1 - Math.sin((h - 2) * Math.PI / 12))) * s;
	}

	/**
	 * Convert PCCS color to tone coordinate color.
	 * @param {number[]} hls Hue, lightness, saturation of PCCS color
	 * @return {number[]} Tone coordinate color
	 */
	static toToneCoordinate(hls) {
		return [hls[0], relativeLightness(hls), hls[2]];
	}

	/**
	 * Convert tone coordinate color to PCCS color.
	 * @param {number[]} hLs Tone coordinate color
	 * @return {number[]} PCCS color
	 */
	static toNormalCoordinate(hLs) {
		return [hLs[0], absoluteLightness(hLs), hLs[2]];
	}

	/**
	 * Returns the string representation of PCCS numerical representation.
	 * @param {number[]} hls Hue, lightness, saturation of PCCS color
	 * @return {string} String representation
	 */
	static toString(hls) {
		const lstr = Math.round(hls[1] * 10) / 10;
		if (hls[2] < PCCS._MONO_LIMIT_S) {
			if (9.5 <= hls[1]) return `W N-${lstr}`;
			if (hls[1] <= 1.5) return `Bk N-${lstr}`;
			return `Gy-${lstr} N-${lstr}`;
		} else {
			const hstr = Math.round(hls[0] * 10) / 10;
			const sstr = Math.round(hls[2] * 10) / 10;

			let tn = Math.round(hls[0]);
			if (tn <= 0) tn = PCCS._MAX_HUE;
			if (PCCS._MAX_HUE < tn) tn -= PCCS._MAX_HUE;
			const hue = PCCS._HUE_NAMES[tn];
			const tone = PCCS._TONE_NAMES[PCCS.tone(hls)];

			if (tone == 'none') return `${hstr}:${hue}-${lstr}-${sstr}s`;
			return `${tone}${hstr} ${hstr}:${hue}-${lstr}-${sstr}s`;
		}
	}

	/**
	 * Returns the string representation of PCCS hues.
	 * @param {number[]} hls Hue, lightness, saturation of PCCS color
	 * @return {string} String representation of hues
	 */
	static toHueString([h, l, s]) {
		if (s < PCCS._MONO_LIMIT_S) {
			return 'N';
		} else {
			let tn = Math.round(h);
			if (tn <= 0) tn = PCCS._MAX_HUE;
			if (PCCS._MAX_HUE < tn) tn -= PCCS._MAX_HUE;
			return PCCS._HUE_NAMES[tn];
		}
	}

	/**
	 * Returns the string representation of PCCS tones.
	 * @param {number[]} hls Hue, lightness, saturation of PCCS color
	 * @return {string} String representation of tones
	 */
	static toToneString(hls) {
		if (hls[2] < PCCS._MONO_LIMIT_S) {
			if (9.5 <= hls[1]) return 'W';
			if (hls[1] <= 1.5) return 'Bk';
			return 'Gy';
		} else {
			return PCCS._TONE_NAMES[PCCS.tone(hls)];
		}
	}

}

// Hue [0, 24), 24 is also acceptable
PCCS._MIN_HUE = 0;
PCCS._MAX_HUE = 24;  // same as MIN_HUE
PCCS._MONO_LIMIT_S = 0.01;
PCCS._HUE_NAMES  = ['', 'pR', 'R', 'yR', 'rO', 'O', 'yO', 'rY', 'Y', 'gY', 'YG', 'yG', 'G', 'bG', 'GB', 'GB', 'gB', 'B', 'B', 'pB', 'V', 'bP', 'P', 'rP', 'RP'];
PCCS._TONE_NAMES = ['p', 'p+', 'ltg', 'g', 'dkg', 'lt', 'lt+', 'sf', 'd', 'dk', 'b', 's', 'dp', 'v', 'none'];
PCCS._MUNSELL_H = [
	96,  // Dummy
	0,  4,  7, 10, 14, 18, 22, 25, 28, 33, 38, 43,
	49, 55, 60, 65, 70, 73, 76, 79, 83, 87, 91, 96, 100
];
PCCS._COEFFICIENTS = [
	[0.853642,  0.084379, -0.002798],  // 0 == 24
	[1.042805,  0.046437,  0.001607],  // 2
	[1.079160,  0.025470,  0.003052],  // 4
	[1.039472,  0.054749, -0.000511],  // 6
	[0.925185,  0.050245,  0.000953],  // 8
	[0.968557,  0.012537,  0.003375],  // 10
	[1.070433, -0.047359,  0.007385],  // 12
	[1.087030, -0.051075,  0.006526],  // 14
	[1.089652, -0.050206,  0.006056],  // 16
	[0.880861,  0.060300, -0.001280],  // 18
	[0.897326,  0.053912, -0.000860],  // 20
	[0.887834,  0.055086, -0.000847],  // 22
	[0.853642,  0.084379, -0.002798],  // 24
];

/**
 * Enum type for conversion methods.
 */
PCCS.ConversionMethod = Object.freeze({
	/**
	 * Concise conversion
	 */
	CONCISE: {
		_calcMunsellH: PCCS._simplyCalcMunsellH,
		_calcMunsellS: PCCS._simplyCalcMunsellC,
		_calcPccsH: PCCS._simplyCalcPccsH,
		_calcPccsS: PCCS._simplyCalcPccsS,
	},

	/**
	 * Accurate conversion
	 */
	ACCURATE: {
		_calcMunsellH: PCCS._calcMunsellH,
		_calcMunsellC: PCCS._calcMunsellC,
		_calcPccsH: PCCS._calcPccsH,
		_calcPccsS: PCCS._calcPccsS,
	}
});

/**
 * Indicates the currently selected color vision characteristic conversion method.
 */
PCCS.conversionMethod = PCCS.ConversionMethod.ACCURATE;

/**
 * Enum type for Tone.
 */
PCCS.Tone = Object.freeze({
	p   : 0,
	p_p : 1,
	ltg : 2,
	g   : 3,
	dkg : 4,
	lt  : 5,
	lt_p: 6,
	sf  : 7,
	d   : 8,
	dk  : 9,
	b   : 10,
	s   : 11,
	dp  : 12,
	v   : 13,
	none: 14
});