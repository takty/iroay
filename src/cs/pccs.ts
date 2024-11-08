/**
 * This class converts the PCCS color system.
 * Colors where h is -1 are handled especially as an achromatic color (n).
 * Reference: KOBAYASHI Mituo and YOSIKI Kayoko,
 * Mathematical Relation among PCCS Tones, PCCS Color Attributes and Munsell Color Attributes,
 * Journal of the Color Science Association of Japan 25(4), 249-261, 2001.
 *
 * @author Takuto Yanagida
 * @version 2024-11-08
 */

import { Triplet, Quartet } from '../type';
import { PI2 } from '../math';

import * as Munsell from './munsell';

// Hue [0, 24), 24 is also acceptable
export const MIN_HUE: number = 0;
export const MAX_HUE: number = 24;
export const MONO_LIMIT_S: number = 0.01;

const HUE_NAMES: string[]  = ['', 'pR', 'R', 'yR', 'rO', 'O', 'yO', 'rY', 'Y', 'gY', 'YG', 'yG', 'G', 'bG', 'GB', 'GB', 'gB', 'B', 'B', 'pB', 'V', 'bP', 'P', 'rP', 'RP'];
const TONE_NAMES: string[] = ['p', 'p+', 'ltg', 'g', 'dkg', 'lt', 'lt+', 'sf', 'd', 'dk', 'b', 's', 'dp', 'v', 'none'];
const MUNSELL_H: number[] = [
	96,  // Dummy
	0,  4,  7, 10, 14, 18, 22, 25, 28, 33, 38, 43,
	49, 55, 60, 65, 70, 73, 76, 79, 83, 87, 91, 96, 100
];
const COEFFICIENTS: Triplet[] = [
	[0.853642,  0.084379, -0.002798],  // 0 === 24
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
export const ConversionMethod = Object.freeze({
	/**
	 * Concise conversion
	 */
	CONCISE: {
		calcMunsellH: simplyCalcMunsellH,
		calcMunsellS: simplyCalcMunsellC,
		calcPccsH: simplyCalcPccsH,
		calcPccsS: simplyCalcPccsS,
	},

	/**
	 * Accurate conversion
	 */
	ACCURATE: {
		calcMunsellH: calcMunsellH,
		calcMunsellC: calcMunsellC,
		calcPccsH: calcPccsH,
		calcPccsS: calcPccsS,
	}
});

export function setConversionMethod(cm: { calcMunsellH: (h: number) => number; calcMunsellC: (h: number, l: number, s: number) => number; calcPccsH: (h: number) => number; calcPccsS: (V: number, C: number, h: number) => number } ) {
	conversionMethod = cm;
}

/**
 * Indicates the currently selected color vision characteristic conversion method.
 */
export let conversionMethod = ConversionMethod.ACCURATE;

/**
 * Enum type for Tone.
 */
export enum Tone {
	p,
	p_p,
	ltg,
	g,
	dkg,
	lt,
	lt_p,
	sf,
	d,
	dk,
	b,
	s,
	dp,
	v,
	none,
};


// Calculation of PCCS value (accurate) ----------------------------------------


function calcPccsH(H: number): number {
	let h1: number = -1;
	let h2: number = -1;
	for (let i: number = 1; i < MUNSELL_H.length; ++i) {
		if (MUNSELL_H[i] <= H) h1 = i;
		if (H < MUNSELL_H[i]) {
			h2 = i;
			break;
		}
	}
	if (h1 === -1) console.error("h1 is -1, H = " + H);
	if (h2 === -1) console.error("h2 is -1, H = " + H);
	return h1 + (h2 - h1) * (H - MUNSELL_H[h1]) / (MUNSELL_H[h2] - MUNSELL_H[h1]);
}

function calcPccsS(V: number, C: number, h: number): number {
	const a: Quartet = calcInterpolatedCoefficients(h);
	const g: number = 0.81 - 0.24 * Math.sin((h - 2.6) / 12 * Math.PI);
	const a0: number = -C / (1 - Math.exp(-g * V));
	return solveEquation(simplyCalcPccsS(V, C, h), a[3], a[2], a[1], a0);
}

function calcInterpolatedCoefficients(h: number): Quartet {
	if (MAX_HUE < h) h -= MAX_HUE;
	let hf: number = 0 | Math.floor(h);
	if (hf % 2 !== 0) --hf;
	let hc: number = hf + 2;
	if (MAX_HUE < hc) hc -= MAX_HUE;

	const af: Triplet = COEFFICIENTS[hf / 2], ac: Triplet = COEFFICIENTS[hc / 2], a: Quartet = [0, 0, 0, 0];
	for (let i: number = 0; i < 3; ++i) {
		a[i + 1] = (h - hf) / (hc - hf) * (ac[i]- af[i]) + af[i];
	}
	return a;
}

function solveEquation(x0: number, a3: number, a2: number, a1: number, a0: number): number {
	let x: number = x0;
	while (true) {
		const y: number = a3 * x * x * x + a2 * x * x + a1 * x + a0;
		const yp: number = 3 * a3 * x * x + 2 * a2 * x + a1;
		const x1: number = -y / yp + x;
		if (Math.abs(x1 - x) < 0.001) break;
		x = x1;
	}
	return x;
}


// Calculation of Munsell value (accurate) -------------------------------------


function calcMunsellH(h: number): number {
	const h1: number = 0 | Math.floor(h);
	const h2: number = h1 + 1;
	let H1: number = MUNSELL_H[h1];
	let H2: number = MUNSELL_H[h2];
	if (H1 > H2) H2 = 100;
	return H1 + (H2 - H1) * (h - h1) / (h2 - h1);
}

function calcMunsellC(h: number, l: number, s: number): number {
	const a: Quartet = calcInterpolatedCoefficients(h);
	const g: number = 0.81 - 0.24 * Math.sin((h - 2.6) / 12 * Math.PI);
	return (a[3] * s * s * s + a[2] * s * s + a[1] * s) * (1 - Math.exp(-g * l));
}


// Calculation of PCCS value (concise) -----------------------------------------


function simplyCalcPccsH(H: number): number {
	const y: number = H * Math.PI / 50;
	return 24 * y / PI2 + 1.24
			+ 0.02 * Math.cos(y) - 0.1 * Math.cos(2 * y) - 0.11  * Math.cos(3 * y)
			+ 0.68 * Math.sin(y) - 0.3 * Math.sin(2 * y) + 0.013 * Math.sin(3 * y);
}

function simplyCalcPccsS(V: number, C: number, h: number): number {
	const Ct: number = 12 + 1.7 * Math.sin((h + 2.2) * Math.PI / 12);
	const gt: number = 0.81 - 0.24 * Math.sin((h - 2.6) * Math.PI / 12);
	const e2 = 0.004, e1 = 0.077, e0: number = -C / (Ct * (1 - Math.exp(-gt * V)));
	return (-e1 + Math.sqrt(e1 * e1 - 4 * e2 * e0)) / (2 * e2);
}


// Calculation of Munsell value (concise) --------------------------------------


function simplyCalcMunsellH(h: number): number {
	const x: number = (h - 1) * Math.PI / 12;
	return 100 * x / PI2 - 1
			+ 0.12 * Math.cos(x) + 0.34 * Math.cos(2 * x) + 0.4 * Math.cos(3 * x)
			- 2.7  * Math.sin(x) + 1.5  * Math.sin(2 * x) - 0.4 * Math.sin(3 * x);
}

function simplyCalcMunsellC(h: number, l: number, s: number): number {
	const Ct: number = 12 + 1.7 * Math.sin((h + 2.2) * Math.PI / 12);
	const gt: number = 0.81 - 0.24 * Math.sin((h - 2.6) * Math.PI / 12);
	return Ct * (0.077 * s + 0.0040 * s * s) * (1 - Math.exp(-gt * l));
}


// Munsell ---------------------------------------------------------------------


/**
 * Convert Munsell (HVC) to PCCS (hls).
 * @param {Triplet} hvc Hue, value, chroma of Munsell color.
 * @param {Triplet} dest dest An array where the result will be stored. If not provided, a new array will be created and returned.
 * @return {Triplet} PCCS color.
 */
export function fromMunsell([H, V, C]: Triplet, dest: Triplet = [0, 0, 0]): Triplet {
	let h: number = 0;
	let s: number = 0;

	if (Munsell.MAX_HUE <= H) H -= Munsell.MAX_HUE;
	h = conversionMethod.calcPccsH(H);
	if (Munsell.MONO_LIMIT_C <= C) {
		s = conversionMethod.calcPccsS(V, C, h);
	}
	if (MAX_HUE <= h) h -= MAX_HUE;

	dest[0] = h;
	dest[1] = V;
	dest[2] = s;
	return dest;
}

/**
 * Convert PCCS (hls) to Munsell (HVC).
 * @param {Triplet} hls Hue, lightness, saturation of PCCS color.
 * @param {Triplet} dest dest An array where the result will be stored. If not provided, a new array will be created and returned.
 * @return {Triplet} Munsell color.
 */
export function toMunsell([h, l, s]: Triplet, dest: Triplet = [0, 0, 0]): Triplet {
	let H: number = 0;
	let C: number = 0;

	H = conversionMethod.calcMunsellH(h);
	if (MONO_LIMIT_S <= s) {
		C = conversionMethod.calcMunsellC(h, l, s);
	}
	if (H < 0) H += Munsell.MAX_HUE;
	if (Munsell.MAX_HUE <= H) H -= Munsell.MAX_HUE;

	dest[0] = H;
	dest[1] = l;
	dest[2] = C;
	return dest;
}


// -----------------------------------------------------------------------------


/**
 * Calculate tone.
 * @param {Triplet} hls Hue, lightness, saturation of PCCS color
 * @return {number} Tone
 */
export function tone(hls: Triplet): number {
	const s: number = hls[2];
	const t: number = relativeLightness(hls);
	const tu: number = s * -3 / 10 + 8.5;
	const td: number = s * 3 / 10 + 2.5;

	if (s < 1) {
		return Tone.none;
	} else if (1 <= s && s < 4) {
		if (t < td)  return Tone.dkg;
		if (t < 5.5) return Tone.g;
		if (t < tu)  return Tone.ltg;
		if (s < 2.5) return Tone.p;
		return Tone.p_p;
	} else if (4 <= s && s < 7) {
		if (t < td)  return Tone.dk;
		if (t < 5.5) return Tone.d;
		if (t < tu)  return Tone.sf;
		if (s < 5.5) return Tone.lt;
		return Tone.lt_p;
	} else if (7 <= s && s < 8.5) {
		if (t < td) return Tone.dp;
		if (t < tu) return Tone.s;
		return Tone.b;
	} else {
		return Tone.v;
	}
}

/**
 * Return relative lightness (lightness in tone coordinate system).
 * @param {Triplet} hls Hue, lightness, saturation of PCCS color
 * @return {Triplet} Relative lightness L
 */
export function relativeLightness([h, l, s]: Triplet): number {
	return l - (0.25 - 0.34 * Math.sqrt(1 - Math.sin((h - 2) * Math.PI / 12))) * s;
}

/**
 * Return absolute lightness (lightness in PCCS).
 * @param {Triplet} hLs Tone coordinate color
 * @return {Triplet} Absolute lightness l
 */
export function absoluteLightness([h, L, s]: Triplet): number {
	return L + (0.25 - 0.34 * Math.sqrt(1 - Math.sin((h - 2) * Math.PI / 12))) * s;
}

/**
 * Convert PCCS color to tone coordinate color.
 * @param {Triplet} hls Hue, lightness, saturation of PCCS color.
 * @param {Triplet} dest dest An array where the result will be stored. If not provided, a new array will be created and returned.
 * @return {Triplet} Tone coordinate color.
 */
export function toToneCoordinate(hls: Triplet, dest: Triplet = [0, 0, 0]): Triplet {
	dest[0] = hls[0];
	dest[1] = relativeLightness(hls);
	dest[2] = hls[2];
	return dest;
}

/**
 * Convert tone coordinate color to PCCS color.
 * @param {Triplet} hLs Tone coordinate color.
 * @param {Triplet} dest dest An array where the result will be stored. If not provided, a new array will be created and returned.
 * @return {Triplet} PCCS color.
 */
export function toNormalCoordinate(hLs: Triplet, dest: Triplet = [0, 0, 0]): Triplet {
	dest[0] = hLs[0];
	dest[1] = absoluteLightness(hLs);
	dest[2] = hLs[2];
	return dest;
}

/**
 * Returns the string representation of PCCS numerical representation.
 * @param {Triplet} hls Hue, lightness, saturation of PCCS color
 * @return {string} String representation
 */
export function toString(hls: Triplet): string {
	const str_l: number = Math.round(hls[1] * 10) / 10;
	if (hls[2] < MONO_LIMIT_S) {
		if (9.5 <= hls[1]) return `W N-${str_l}`;
		if (hls[1] <= 1.5) return `Bk N-${str_l}`;
		return `Gy-${str_l} N-${str_l}`;
	} else {
		const str_h: number = Math.round(hls[0] * 10) / 10;
		const str_s: number = Math.round(hls[2] * 10) / 10;

		let tn: number = Math.round(hls[0]);
		if (tn <= 0) tn = MAX_HUE;
		if (MAX_HUE < tn) tn -= MAX_HUE;
		const hue: string = HUE_NAMES[tn];
		const t: string = TONE_NAMES[tone(hls)];

		if (t === 'none') return `${str_h}:${hue}-${str_l}-${str_s}s`;
		return `${t}${str_h} ${str_h}:${hue}-${str_l}-${str_s}s`;
	}
}

/**
 * Returns the string representation of PCCS hues.
 * @param {Triplet} hls Hue, lightness, saturation of PCCS color
 * @return {string} String representation of hues
 */
export function toHueString([h,, s]: Triplet): string {
	if (s < MONO_LIMIT_S) {
		return 'N';
	} else {
		let tn: number = Math.round(h);
		if (tn <= 0) tn = MAX_HUE;
		if (MAX_HUE < tn) tn -= MAX_HUE;
		return HUE_NAMES[tn];
	}
}

/**
 * Returns the string representation of PCCS tones.
 * @param {Triplet} hls Hue, lightness, saturation of PCCS color
 * @return {string} String representation of tones
 */
export function toToneString(hls: Triplet): string {
	if (hls[2] < MONO_LIMIT_S) {
		if (9.5 <= hls[1]) return 'W';
		if (hls[1] <= 1.5) return 'Bk';
		return 'Gy';
	} else {
		return TONE_NAMES[tone(hls)];
	}
}
