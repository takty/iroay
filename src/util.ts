/**
 * Functions for Color Space Conversion
 *
 * @author Takuto Yanagida
 * @version 2025-03-01
 */

import { Triplet } from './type';

import * as Lab from './cs/lab';
import * as Lrgb from './cs/lrgb';
import * as Rgb from './cs/rgb';
import * as Xyz from './cs/xyz';

/**
 * Convert sRGB to Lightness-only sRGB.
 * @param {Triplet} rgb sRGB color
 * @return {Triplet} Lightness-only sRGB color
 */
export function toMonochromeRgb(rgb: Triplet): Triplet {
	const l: number = Lab.lightnessFromXyz(Xyz.fromLrgb(Lrgb.fromRgb(rgb)));
	return Rgb.fromLrgb(Lrgb.fromXyz(Xyz.fromLab([l, 0, 0])));
}


// -----------------------------------------------------------------------------


/**
 * Convert color integer to sRGB.
 * @param {number} v Color integer.
 * @param {Triplet} dest dest An array where the result will be stored. If not provided, a new array will be created and returned.
 * @return {Triplet} sRGB color.
 */
export function fromInteger(v: number, dest: Triplet = [0, 0, 0]): Triplet {
	dest[0] = (v >> 16) & 0xFF;
	dest[1] = (v >>  8) & 0xFF;
	dest[2] = (v      ) & 0xFF;
	return dest;
}

/**
 * Convert sRGB to color integer.
 * @param {Triplet} rgb sRGB color.
 * @return {number} Color integer.
 */
export function toInteger([r, g, b]: Triplet): number {
	return (r << 16) | (g << 8) | b | 0xff000000;
}


// -----------------------------------------------------------------------------


/**
 * Parse a CSS RGB or RGBA color string in various formats and return an array of R, G, B, and A values as numbers.
 * @param {string} str - CSS RGB or RGBA color string (e.g., "rgb(255, 0, 128)", "rgb(100% 0% 50%)", "rgba(255, 0, 128, 0.5)", "rgb(255 0 128 / 50%)").
 * @return {number[]} Array of [R, G, B, A] as numbers.
 */
export function parseRgb(str: string): number[] | null {
	const re = /rgba?\(\s*([\d.]+%?)\s*[,\s]\s*([\d.]+%?)\s*[,\s]\s*([\d.]+%?)\s*(?:\/\s*([\d.]+%?))?\s*\)/i;
	const m: RegExpMatchArray | null = str.match(re);

	if (m) {
		const r: number = m[1].endsWith('%') ? parseFloat(m[1]) * 2.55 : parseFloat(m[1]);
		const g: number = m[2].endsWith('%') ? parseFloat(m[2]) * 2.55 : parseFloat(m[2]);
		const b: number = m[3].endsWith('%') ? parseFloat(m[3]) * 2.55 : parseFloat(m[3]);

		let a: number = 1;
		if (m[4] !== undefined) {
			a = m[4].endsWith('%') ? parseFloat(m[4]) / 100 : parseFloat(m[4]);
		}
		return [Math.round(r), Math.round(g), Math.round(b), a];
	}
	return null;
}

/**
 * Parse a hex color string and return an array of R, G, B, and A values as numbers.
 * @param {string} str - CSS hex color string (e.g., "#ff5733", "#f53", "#ff573380", "#f538").
 * @return {number[]} Array of [R, G, B, A] as numbers.
 */
export function parseHex(str: string): number[] | null {
	const re = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})?$|^#?([a-f\d])([a-f\d])([a-f\d])([a-f\d])?$/i;
	const m: RegExpMatchArray | null = str.match(re);

	if (m) {
		if (m[1]) {
			const r: number = parseInt(m[1], 16);
			const g: number = parseInt(m[2], 16);
			const b: number = parseInt(m[3], 16);
			const a: number = m[4] ? parseInt(m[4], 16) / 255 : 1;
			return [r, g, b, a];
		}
		if (m[5]) {
			const r: number = parseInt(m[5] + m[5], 16);
			const g: number = parseInt(m[6] + m[6], 16);
			const b: number = parseInt(m[7] + m[7], 16);
			const a: number = m[8] ? parseInt(m[8] + m[8], 16) / 255 : 1;
			return [r, g, b, a];
		}
	}
	return null;
}

/**
 * Parse a CSS HSL or HSLA color string in various formats and return an array of H, S, L, and A values as numbers.
 * @param {string} str - CSS HSL or HSLA color string (e.g., "hsl(50 80% 40%)", "hsl(0 80% 50% / 25%)", "hsl(0, 80%, 50%)").
 * @return {number[]} Array of [H, S, L, A] as numbers.
 */
export function parseHsl(str: string): number[] | null {
	const re = /hsla?\(\s*([\d.]+)(?:deg)?\s*[,\s]\s*([\d.]+)%\s*[,\s]\s*([\d.]+)%\s*(?:\/\s*([\d.]+%?))?\s*\)/i;
	const m: RegExpMatchArray | null = str.match(re);

	if (m) {
		const h: number = parseFloat(m[1]);
		const s: number = parseFloat(m[2]);
		const l: number = parseFloat(m[3]);

		let a: number = 1;
		if (m[4] !== undefined) {
			a = m[4].endsWith('%') ? parseFloat(m[4]) / 100 : parseFloat(m[4]);
		}
		return [h, s, l, a];
	}
	return null;
}

/**
 * Parse a CSS Lab color string and return an array of L, a, b, and A values as numbers.
 * @param {string} str - CSS Lab color string (e.g., "lab(50% 20 30)", "lab(50% 20 30 / 0.8)").
 * @return {number[]} Array of [L, a, b, A] as numbers.
 */
export function parseLab(str: string): number[] | null {
	const re = /lab\(\s*([\d.]+)%?\s+([\d.-]+)\s+([\d.-]+)\s*(?:\/\s*([\d.]+))?\s*\)/i;
	const m: RegExpMatchArray | null = str.match(re);

	if (m) {
		const l: number = parseFloat(m[1]);
		const a: number = parseFloat(m[2]);
		const b: number = parseFloat(m[3]);

		let al: number = 1;
		if (m[4] !== undefined) {
			al = parseFloat(m[4]);
		}
		return [l, a, b, al];
	}
	return null;
}

/**
 * Parse a CSS LCH color string and return an array of L, C, H, and A values as numbers.
 * @param {string} str - CSS LCH color string (e.g., "lch(50% 40 250deg)", "lch(50% 40 250deg / 0.8)").
 * @return {number[]} Array of [L, C, H, A] as numbers.
 */
export function parseLch(str: string): number[] | null {
	const re = /lch\(\s*([\d.]+)%?\s+([\d.]+)(%)?\s+([\d.]+)(?:deg)?\s*(?:\/\s*([\d.]+))?\s*\)/i;
	const m: RegExpMatchArray | null = str.match(re);

	if (m) {
		const l: number = parseFloat(m[1]);
		let   c: number = parseFloat(m[2]);
		const h: number = parseFloat(m[4]);

		if (m[3] === '%') {
			c = (c / 100) * 150;
		}
		let al: number = 1;
		if (m[5] !== undefined) {
			al = parseFloat(m[5]);
		}
		return [l, c, h, al];
	}
	return null;
}


// -----------------------------------------------------------------------------


/**
 * Convert an array of R, G, B, and A values to a CSS RGB or RGBA color string.
 * @param {Triplet | Quartet} rgb - Array of [R, G, B, A] as numbers.
 * @return {string} CSS RGB or RGBA color string.
 */
export function stringifyRgb([r, g, b, al = 1]: [number, number, number, number?], digits: number = 2): string {
	const sr: string = toFixed(r, digits);
	const sg: string = toFixed(g, digits);
	const sb: string = toFixed(b, digits);
	if (al !== 1) {
		return `rgb(${sr} ${sg} ${sb} / ${al})`;
	}
	return `rgb(${sr} ${sg} ${sb})`;
}

/**
 * Convert an array of R, G, B, and A values to a CSS hex color string.
 * @param {Triplet | Quartet} rgb - Array of [R, G, B, A] as numbers.
 * @return {string} CSS hex color string.
 */
export function stringifyHex([r, g, b, al = 1]: [number, number, number, number?]): string {
	const toHex: (n: number) => string = (n: number): string => n.toString(16).padStart(2, '0');

	const rgbH = `#${toHex(r)}${toHex(g)}${toHex(b)}`;
	if (al !== 1) {
		const alH: string = toHex(Math.round(al * 255));
		return `${rgbH}${alH}`;
	}
	return rgbH;
}

/**
 * Convert an array of H, S, L, and A values to a CSS HSL or HSLA color string.
 * @param {Triplet | Quartet} hsl - Array of [H, S, L, A] as numbers.
 * @return {string} CSS HSL or HSLA color string.
 */
export function stringifyHsl([h, s, l, al = 1]: [number, number, number, number?], digits: number = 1): string {
	const sh: string = toFixed(h, digits);
	const ss: string = toFixed(s, digits);
	const sl: string = toFixed(l, digits);
	if (al !== 1) {
		return `hsl(${sh} ${ss}% ${sl}% / ${al})`;
	}
	return `hsl(${sh} ${ss}% ${sl}%)`;
}

/**
 * Convert an array of L, a, b, and A values to a CSS Lab color string.
 * @param {Triplet | Quartet} lab - Array of [L, a, b, A] as numbers.
 * @return {string} CSS Lab color string.
 */
export function stringifyLab([l, a, b, al = 1]: [number, number, number, number?], digits: number = 4): string {
	const sl: string = toFixed(l, digits);
	const sa: string = toFixed(a, digits);
	const sb: string = toFixed(b, digits);
	if (al !== 1) {
		return `lab(${sl}% ${sa} ${sb} / ${al})`;
	}
	return `lab(${sl}% ${sa} ${sb})`;
}

/**
 * Convert an array of L, C, H, and A values to a CSS LCH color string.
 * @param {Triplet | Quartet} lch - Array of [L, C, H, A] as numbers.
 * @return {string} CSS LCH color string.
 */
export function stringifyLch([l, c, h, al = 1]: [number, number, number, number?], digits: number = 4): string {
	const sl: string = toFixed(l, digits);
	const sc: string = toFixed(c, digits);
	const sh: string = toFixed(h, digits);
	if (al !== 1) {
		return `lch(${sl}% ${sc} ${sh} / ${al})`;
	}
	return `lch(${sl}% ${sc} ${sh})`;
}

/**
 * Returns a string representation of a number with a fixed number of digits.
 * @param {number} num - Number to be converted.
 * @param {number} digits - Number of digits.
 * @return {string} String representation of the number.
 */
function toFixed(num: number, digits: number): string {
	return num.toFixed(digits).replace(/\.?0+$/, '');
}
