/**
 *
 * This class converts the PCCS color system.
 * Colors where h is -1.0 are handled especially as an achromatic color (n).
 * Reference: KOBAYASHI Mituo and YOSIKI Kayoko,
 * Mathematical Relation among PCCS Tones, PCCS Color Attributes and Munsell Color Attributes,
 * Journal of the Color Science Association of Japan 25(4), 249-261, 2001.
 *
 * @author Takuto Yanagida
 * @version 2019-09-29
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
		const g = 0.81 - 0.24 * Math.sin((h - 2.6) / 12.0 * Math.PI);
		const a0 = -C / (1.0 - Math.exp(-g * V));
		return PCCS._solveEquation(PCCS._simplyCalcPccsS(V, C, h), a[3], a[2], a[1], a0);
	}

	static _calcInterpolatedCoefficients(h) {
		if (PCCS.MAX_HUE < h) h -= PCCS.MAX_HUE;
		let hf = 0 | Math.floor(h);
		if (hf % 2 != 0) --hf;
		let hc = hf + 2;
		if (PCCS.MAX_HUE < hc) hc -= PCCS.MAX_HUE;

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
			const yp = 3.0 * a3 * x * x + 2.0 * a2 * x + a1;
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
		if (H1 > H2) H2 = 100.0;
		return H1 + (H2 - H1) * (h - h1) / (h2 - h1);
	}

	static _calcMunsellS(h, l, s) {
		const a = PCCS._calcInterpolatedCoefficients(h);
		const g = 0.81 - 0.24 * Math.sin((h - 2.6) / 12.0 * Math.PI);
		return (a[3] * s * s * s + a[2] * s * s + a[1] * s) * (1.0 - Math.exp(-g * l));
	}


	// Calculation of PCCS value (concise) -------------------------------------


	static _simplyCalcPccsH(H) {
		const y = H * Math.PI / 50.0;
		return 24.0 * y / (2.0 * Math.PI) + 1.24
				+ 0.02 * Math.cos(y) - 0.10 * Math.cos(2.0 * y) - 0.11 * Math.cos(3.0 * y)
				+ 0.68 * Math.sin(y) - 0.30 * Math.sin(2.0 * y) + 0.013 * Math.sin(3.0 * y);
	}

	static _simplyCalcPccsS(V, C, h) {
		const Ct = 12.0 + 1.7 * Math.sin((h + 2.2) * Math.PI / 12.0);
		const gt = 0.81 - 0.24 * Math.sin((h - 2.6) * Math.PI / 12.0);
		const e2 = 0.0040, e1 = 0.077, e0 = -C / (Ct * (1.0 - Math.exp(-gt * V)));
		return (-e1 + Math.sqrt(e1 * e1 - 4.0 * e2 * e0)) / (2.0 * e2);
	}


	// Calculation of Munsell value (concise) ----------------------------------


	static _simplyCalcMunsellH(h) {
		const x = (h - 1.0) * Math.PI / 12.0;
		return 100.0 * x / (2.0 * Math.PI) - 1.0
				+ 0.12 * Math.cos(x) + 0.34 * Math.cos(2.0 * x) + 0.40 * Math.cos(3.0 * x)
				- 2.7 * Math.sin(x) + 1.5 * Math.sin(2.0 * x) - 0.4 * Math.sin(3.0 * x);
	}

	static _simplyCalcMunsellS(h, l, s) {
		const Ct = 12.0 + 1.7 * Math.sin((h + 2.2) * Math.PI / 12.0);
		const gt = 0.81 - 0.24 * Math.sin((h - 2.6) * Math.PI / 12.0);
		return Ct * (0.077 * s + 0.0040 * s * s) * (1.0 - Math.exp(-gt * l));
	}

	/**
	 * Convert Munsell (HVC) to PCCS (hls).
	 * @param src Munsell color
	 * @return PCCS color
	 */
	static fromMunsell(src) {
		let H = src[0], V = src[1], C = src[2];
		if (Munsell.MAX_HUE <= H) H -= Munsell.MAX_HUE;
		let h = 0.0, l = V, s = 0.0;

		if (C < Munsell.MONO_LIMIT_C) {
			switch (PCCS.conversionMethod) {
				case PCCS.ConversionMethod.CONCISE:  h = PCCS._simplyCalcPccsH(H); break;
				case PCCS.ConversionMethod.ACCURATE: h = PCCS._calcPccsH(H); break;
			}
		} else {
			switch (PCCS.conversionMethod) {
				case PCCS.ConversionMethod.CONCISE:
					h = PCCS._simplyCalcPccsH(H);        // Hue
					s = PCCS._simplyCalcPccsS(V, C, h);  // Saturation
					break;
				case PCCS.ConversionMethod.ACCURATE:
					h = PCCS._calcPccsH(H);        // Hue
					s = PCCS._calcPccsS(V, C, h);  // Saturation
					break;
			}
		}
		if (PCCS.MAX_HUE <= h) h -= PCCS.MAX_HUE;
		return [h, l, s];
	}

	/**
	 * Convert PCCS (hls) to Munsell (HVC).
	 * @param src PCCS color
	 * @return Munsell color
	 */
	static toMunsell(src) {
		const h = src[0], l = src[1], s = src[2];
		let H = 0.0, V = l, C = 0.0;

		if (s < PCCS.MONO_LIMIT_S) {
			switch (PCCS.conversionMethod) {
				case PCCS.ConversionMethod.CONCISE:  H = PCCS._simplyCalcMunsellH(h); break;
				case PCCS.ConversionMethod.ACCURATE: H = PCCS._calcMunsellH(h); break;
			}
		} else {
			switch (PCCS.conversionMethod) {
				case PCCS.ConversionMethod.CONCISE:
					H = PCCS._simplyCalcMunsellH(h);
					C = PCCS._simplyCalcMunsellS(h, l, s);
					break;
				case PCCS.ConversionMethod.ACCURATE:
					H = PCCS._calcMunsellH(h);
					C = PCCS._calcMunsellS(h, l, s);
					break;
			}
		}
		if (H < 0.0) H += Munsell.MAX_HUE;
		if (Munsell.MAX_HUE <= H) H -= Munsell.MAX_HUE;
		return [H, V, C];
	}

	/**
	 * Calculate tone.
	 * @param hls PCCS color
	 * @return Tone
	 */
	tone(hls) {
		const t = PCCS.relativeLightness(hls), s = hls[2];
		const tu = s * -3.0 / 10.0 + 8.5, td = s * 3.0 / 10.0 + 2.5;

		if (s < 1.0) {
			return PCCS.Tone.none;
		} else if (1.0 <= s && s < 4.0) {
			if (t < td)  return PCCS.Tone.dkg;
			if (t < 5.5) return PCCS.Tone.g;
			if (t < tu)  return PCCS.Tone.ltg;
			if (s < 2.5) return PCCS.Tone.p;
			return PCCS.Tone.p_p;
		} else if (4.0 <= s && s < 7.0) {
			if (t < td)  return PCCS.Tone.dk;
			if (t < 5.5) return PCCS.Tone.d;
			if (t < tu)  return PCCS.Tone.sf;
			if (s < 5.5) return PCCS.Tone.lt;
			return PCCS.Tone.lt_p;
		} else if (7.0 <= s && s < 8.5) {
			if (t < td) return PCCS.Tone.dp;
			if (t < tu) return PCCS.Tone.s;
			return PCCS.Tone.b;
		} else {
			return PCCS.Tone.v;
		}
	}

	/**
	 * Return relative lightness (lightness in tone coordinate system).
	 * @param hls PCCS color
	 * @return Relative lightness l
	 */
	relativeLightness(hls) {
		return hls[1] - (0.25 - 0.34 * Math.sqrt(1.0 - Math.sin((hls[0] - 2.0) * Math.PI / 12.0))) * hls[2];
	}

	/**
	 * Return absolute lightness (lightness in PCCS).
	 * @param hLs Tone coordinate color
	 * @return Absolute lightnes l
	 */
	absoluteLightness(hLs) {
		return hLs[1] + (0.25 - 0.34 * Math.sqrt(1.0 - Math.sin((hLs[0] - 2.0) * Math.PI / 12.0))) * hLs[2];
	}

	/**
	 * Convert PCCS color to tone coordinate color.
	 * @param src PCCS color
	 * @return Tone coordinate color
	 */
	static toToneCoordinate(src) {
		return [
			src[0],  // h
			relativeLightness(src),
			src[2],  // s
		];
	}

	/**
	 * Convert tone coordinate color to PCCS color.
	 * @param src Tone coordinate color
	 * @return PCCS color
	 */
	static toNormalCoordinate(src) {
		return [
			src[0],  // h
			absoluteLightness(src),
			src[2],  // s
		];
	}

	/**
	 * Returns the string representation of PCCS numerical representation.
	 * @param hlc PCCS color
	 * @return String representation
	 */
	toString(hlc) {
		if (hlc[2] < PCCS.MONO_LIMIT_S) {
			if (9.5 <= hlc[1]) return String.format("W N-%.1f", hlc[1]);
			if (hlc[1] <= 1.5) return String.format("Bk N-%.1f", hlc[1]);
			return String.format("Gy-%.1f N-%.1f", hlc[1], hlc[1]);
		} else {
			const t = PCCS.tone(hlc);
			let tn = Math.round(hlc[0]);
			if (tn <= 0) tn = PCCS.MAX_HUE;
			if (PCCS.MAX_HUE < tn) tn -= PCCS.MAX_HUE;
			if (t == PCCS.Tone.none) {
				return String.format("%.1f:%s-%.1f-%.1fs", hlc[0], PCCS._HUE_NAMES[tn], hlc[1], hlc[2]);
			} else {
				return String.format("%s%.1f %.1f:%s-%.1f-%.1fs", PCCS._TONE_NAMES[t.ordinal()], hlc[0], hlc[0], PCCS._HUE_NAMES[tn], hlc[1], hlc[2]);
			}
		}
	}

	toHueString(hlc) {
		if (hlc[2] < PCCS.MONO_LIMIT_S) {
			return 'N';
		} else {
			let tn = Math.round(hlc[0]);
			if (tn <= 0) tn = PCCS.MAX_HUE;
			if (PCCS.MAX_HUE < tn) tn -= PCCS.MAX_HUE;
			return PCCS._HUE_NAMES[tn];
		}
	}

	toToneString(hlc) {
		if (hlc[2] < PCCS.MONO_LIMIT_S) {
			if (9.5 <= hlc[1]) return 'W';
			if (hlc[1] <= 1.5) return 'Bk';
			return 'Gy';
		} else {
			const t = PCCS.tone(hlc);
			return PCCS._TONE_NAMES[t.ordinal()];
		}
	}

}

// Hue [0.0, 24.0), 24.0 is also acceptable
PCCS.MIN_HUE = 0.0;
PCCS.MAX_HUE = 24.0;  // same as MIN_HUE

PCCS.MONO_LIMIT_S = 0.01;

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
	CONCISE: 0,

	/**
	 * Accurate conversion
	 */
	ACCURATE: 1
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
