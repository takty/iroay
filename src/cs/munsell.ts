/**
 * This class converts the Munsell (HVC) color system.
 * D65 is used as tristimulus value.
 * Since conversion is performed by approximation based on the distance to the sample color, the conversion result is approximate value.
 * Also, when H is -1, it is regarded as an achromatic color (N) in particular.
 * Reference: http://www.cis.rit.edu/mcsl/online/munsell.php
 *
 * @author Takuto Yanagida
 * @version 2024-08-18
 */

import { TBL_SRC_MIN, TBL_V } from '../table/hc2xy-all-min';
import { Tree } from '../lib/kdt';
import { Pair, Triplet } from '../type';

import * as XYZ from './xyz';
import * as Yxy from './yxy';
export { toMunsell as fromPCCS, fromMunsell as toPCCS } from './pccs';

function _eq0(x: number): boolean {
	return Math.abs(x) < EP;
}

function _eq(x0: number, x1: number): boolean {
	return Math.abs(x0 - x1) < EP;
}

function _div(a: Pair, b: Pair, r: number): Pair {
	return [(b[0] - a[0]) * r + a[0], (b[1] - a[1]) * r + a[1]];
}

function _cross(ax: number, ay: number, bx: number, by: number): number {
	return ax * by - ay * bx;
}

// Whether a point (x, y) exists within the interior (including the boundary) of the clockwise triangle abc
// in the mathematical coordinate system (positive on the y axis is upward)
function _inside(p: Pair, a: Pair, b: Pair, c: Pair) {
	// If x, y are on the right side of ab, the point is outside the triangle
	if (_cross(p[0] - a[0], p[1] - a[1], b[0] - a[0], b[1] - a[1]) < 0) return false;
	// If x, y are on the right side of bc, the point is outside the triangle
	if (_cross(p[0] - b[0], p[1] - b[1], c[0] - b[0], c[1] - b[1]) < 0) return false;
	// If x, y are on the right side of ca, the point is outside the triangle
	if (_cross(p[0] - c[0], p[1] - c[1], a[0] - c[0], a[1] - c[1]) < 0) return false;
	return true;
}

const HUE_NAMES = ['R', 'YR', 'Y', 'GY', 'G', 'BG', 'B', 'PB', 'P', 'RP'];  // 1R = 1, 9RP = 99, 10RP = 0
const EP = 0.0000000000001;
const ILLUMINANT_C: Pair = [0.3101, 0.3162];  // Standard illuminant C, white point

let TBL_MAX_C: number[][];
let TBL: (Pair|null)[][][];  // [vi][10 * h / 25][c / 2] -> [x, y]
let TBL_TREES: Tree[] = [];

export const MIN_HUE = 0;
export const MAX_HUE = 100;  // Same as MIN_HUE
export const MONO_LIMIT_C = 0.05;

export let isSaturated = false;

initTable(TBL_V, TBL_SRC_MIN);

function initTable(tbl_v: number[], tbl_src_min: number[][][]): void {
	TBL       = new Array(tbl_v.length);  // [vi][10 * h / 25][c / 2] -> [x, y]
	TBL_MAX_C = new Array(tbl_v.length);
	TBL_TREES = new Array(tbl_v.length);

	for (let vi = 0; vi < tbl_v.length; vi += 1) {
		TBL[vi]       = new Array(1000 / 25);
		TBL_MAX_C[vi] = new Array(1000 / 25);
		TBL_MAX_C[vi].fill(0);

		for (let i = 0, n = 1000 / 25; i < n; i += 1) {
			TBL[vi][i] = new Array(50 / 2 + 2);  // 2 <= C <= 52
			TBL[vi][i].fill(null);
		}
		const data: [Pair, Pair][] = [];

		for (const cs of tbl_src_min[vi]) {
			const hi = cs.shift() as number;
			_integrate(cs);
			_integrate(cs);

			for (let i = 0; i < cs.length; i += 2) {
				const ci = i / 2 + 1;
				const x = cs[i + 0] / 1000;
				const y = cs[i + 1] / 1000;

				TBL[vi][hi][ci] = [x, y];
				data.push([[x, y], [hi * 25, ci * 2]]);
			}
			TBL_MAX_C[vi][hi] = cs.length - 2;
		}
		TBL_TREES[vi] = new Tree(data);
	}

	function _integrate(cs: number[]) {
		let x_ = 0;
		let y_ = 0;

		for (let i = 0; i < cs.length; i += 2) {
			x_ += cs[i];
			y_ += cs[i + 1];
			cs[i]     = x_;
			cs[i + 1] = y_;
		}
	}
}

function _getXy(vi: number, ht: number, c: number): Pair|null {
	if (c === 0) return ILLUMINANT_C;
	if (1000 <= ht) ht -= 1000;
	return TBL[vi][ht / 25][c / 2];
}

function _getMaxC(vi: number, ht: number): number {
	if (1000 <= ht) ht -= 1000;
	if (ht < 0) ht += 1000;
	return TBL_MAX_C[vi][ht / 25];
}

// Find Y of XYZ (C) from Munsell's V (JIS).
function _v2y(v: number) {
	if (v <= 1) return v * 0.0121;
	const v2 = v * v;
	const v3 = v2 * v;
	const y = 0.0467 * v3 + 0.5602 * v2 - 0.1753 * v + 0.8007;
	return y / 100;
}

// Munsell's V is obtained from Y of XYZ (C) (JIS, Newton's method).
function _y2v(y: number) {
	if (y <= 0.0121) return y / 0.0121;
	let v = 10;
	for (let i = 0; i < 1000; ++i) {  // Max iteration is 1000.
		const f = _v2y(v) - y;
		const fp =  (v <= 1) ? 0.0121 : ((3 * 0.0467 * (v * v) + 2 * 0.5602 * v - 0.1753) / 100);
		if (Math.abs(f) < 0.0001) break;
		v = v - f / fp;
	}
	return v;
}


// -------------------------------------------------------------------------


// Find the Munsell value from xyY (standard illuminant C).
function _yxy2mun([Y, x, y]: Triplet): Triplet {
	const v = _y2v(Y);  // Find Munsell lightness
	isSaturated = false;

	// When the lightness is maximum 10
	if (_eq(v, TBL_V.at(-1) as number)) {
		const [h, c] = _scanHC(x, y, TBL_V.length - 1);
		return [h, v, c];
	}
	// When the lightness is 0 or the lightness is larger than the maximum 10, or when it is an achromatic color (standard illuminant C)
	if (_eq0(v) || TBL_V.at(-1) as number < v || (_eq(x, ILLUMINANT_C[0]) && _eq(y, ILLUMINANT_C[1]))) {
		return [0, v, 0];
	}
	// Obtain lower side
	let vi_l = -1;
	while (TBL_V[vi_l + 1] <= v) ++vi_l;
	let hc_l = [0, 0] as Pair;  // Hue and chroma of the lower side
	if (vi_l !== -1) hc_l = _scanHC(x, y, vi_l);

	// Obtain upper side
	const vi_u = vi_l + 1;
	const hc_u = _scanHC(x, y, vi_u);

	// When the lightness on the lower side is the minimum 0, the hue is matched with the upper side, and the chroma is set to 0
	if (vi_l === -1) {
		hc_l[0] = hc_u[0];
		hc_l[1] = 0;
	}
	const v_l = ((vi_l === -1) ? 0 : TBL_V[vi_l]);
	const v_h = TBL_V[vi_u];
	const r = (v - v_l) / (v_h - v_l);

	const [h, c] = _calcIdpHc(hc_l, hc_u, r);
	return [h, v, c];
}

// Acquires the hue and chroma for the chromaticity coordinates (x, y) on the surface of the given lightness index.
// If not included, -1 is returned.
function _scanHC(x: number, y: number, vi: number): Pair {
	const p = [x, y] as Pair;
	const [[q, ],] = TBL_TREES[vi].neighbors(p, 1);
	let ht0 = q[0] - 125;
	let ht1 = q[0] + 125;

	if (ht0 < 0 && ht1 < ht0 + 1000) {
		ht0 += 1000;
		ht1 += 1000;
	}

	for (let ht_l = ht0; ht_l <= ht1; ht_l += 25) {  // h 0-975 step 25;
		inner:
		for (let c_l = 0; c_l <= 50; c_l += 2) {  // c 0-50 step 2;
			const [hc_r, state] = _scanOneHC(p, vi, ht_l, c_l);
			if (state === 'h') break inner;
			if (hc_r) {
				return [
					(25 * hc_r[0] + ht_l) / 10,
					2 * hc_r[1] + c_l
				];
			}
		}
	}
	const ps = TBL_TREES[vi].neighbors(p, 2);
	if (2 === ps.length) {
		isSaturated = true;
		let [[[ht0, c0], d0], [[ht1, c1], d1]] = ps;
		const r = d0 / (d0 + d1);
		return _calcIdpHc([ht0 / 10, c0], [ht1 / 10, c1], r);
	}
	return [0, 0];
}

function _scanOneHC(p: Pair, vi: number, ht_l: number, c_l: number): [Pair | null, string] {
	let hc_r: Pair | null = null;

	const wa = _getXy(vi, ht_l, c_l);
	const wb = _getXy(vi, ht_l + 25, c_l);
	let wc = _getXy(vi, ht_l + 25, c_l + 2);
	let wd = _getXy(vi, ht_l, c_l + 2);

	if (wa === null && wb === null) return [null, 'h'];

	if (c_l !== 0) {
		if (wa && wb && wc && !wd) {
			wd = [wa[0] + (wc[0] - wb[0]), wa[1] + (wc[1] - wb[1])]
		} else if (wa && wb && !wc && wd) {
			wc = [wb[0] + (wd[0] - wa[0]), wb[1] + (wd[1] - wa[1])]
		}
	}
	if (wa === null || wb === null || wc === null || wd === null) return [null, ''];

	if (c_l === 0) {
		if (_inside(p, wa, wc, wd)) {
			hc_r = interpolationR(p, wa, wd, wb, wc);
		}
	} else {
		if (_inside(p, wa, wc, wd) || _inside(p, wa, wb, wc)) {
			hc_r = interpolationR(p, wa, wd, wb, wc);
		}
	}
	return [hc_r, ''];

	/*
		* Calculate the proportion [h, v] of each point in the area surrounded by the points of the following placement (null if it is invalid).
		*  ^
		* y| B C      ↖H (Direction of rotation) ↗C (Radial direction)
		*  | A D
		*  ------> x
		*/
	function interpolationR(p: Pair, wa: Pair, wd: Pair, wb: Pair, wc: Pair): Pair|null {
		// Find the ratio in the vertical direction
		let v = -1;

		// Solve a v^2 + b v + c = 0
		const ea = (wa[0] - wd[0]) * (wa[1] + wc[1] - wb[1] - wd[1]) - (wa[0] + wc[0] - wb[0] - wd[0]) * (wa[1] - wd[1]);
		const eb = (p[0] - wa[0]) * (wa[1] + wc[1] - wb[1] - wd[1]) + (wa[0] - wd[0]) * (wb[1] - wa[1]) - (wa[0] + wc[0] - wb[0] - wd[0]) * (p[1] - wa[1]) - (wb[0] - wa[0]) * (wa[1] - wd[1]);
		const ec = (p[0] - wa[0]) * (wb[1] - wa[1]) - (p[1] - wa[1]) * (wb[0] - wa[0]);

		if (_eq0(ea)) {
			if (!_eq0(eb)) v = -ec / eb;
		} else {
			const rt = Math.sqrt(eb * eb - 4 * ea * ec);
			const v1 = (-eb + rt) / (2 * ea), v2 = (-eb - rt) / (2 * ea);

			if (wa[0] === wb[0] && wa[1] === wb[1]) {  // In this case, v1 is always 0, but this is not a solution.
				if (0 <= v2 && v2 <= 1) v = v2;
			} else {
				if      (0 <= v1 && v1 <= 1) v = v1;
				else if (0 <= v2 && v2 <= 1) v = v2;
			}
		}
		if (v < 0) return null;

		// Find the ratio in the horizontal direction
		let h = -1, h1 = -1, h2 = -1;
		const deX = (wa[0] - wd[0] - wb[0] + wc[0]) * v - wa[0] + wb[0];
		const deY = (wa[1] - wd[1] - wb[1] + wc[1]) * v - wa[1] + wb[1];

		if (!_eq0(deX)) h1 = ((wa[0] - wd[0]) * v + p[0] - wa[0]) / deX;
		if (!_eq0(deY)) h2 = ((wa[1] - wd[1]) * v + p[1] - wa[1]) / deY;

		if      (0 <= h1 && h1 <= 1) h = h1;
		else if (0 <= h2 && h2 <= 1) h = h2;

		if (h < 0) return null;

		return [h, v];
	}
}

function _calcIdpHc([h0, c0]: Pair, [h1, c1]: Pair, r: number): Pair {
	if (Math.abs(h1 - h0) > MAX_HUE * 0.5) {
		if (h0 < h1) h0 += MAX_HUE;
		else if (h0 > h1) h1 += MAX_HUE;
	}

	let h = (h1 - h0) * r + h0;
	if (MAX_HUE <= h) h -= MAX_HUE;
	let c = (c1 - c0) * r + c0;
	if (c < MONO_LIMIT_C) c = 0;
	return [h, c];
}


// -------------------------------------------------------------------------


function _mun2yxy([h, v, c]: Triplet): Triplet {
	if (MAX_HUE <= h) h -= MAX_HUE;
	const Y = _v2y(v);
	isSaturated = false;

	// When the lightness is 0 or achromatic (check this first)
	if (_eq0(v) || h < 0 || c < MONO_LIMIT_C) {
		isSaturated = _eq0(v) && 0 < c;
		return [Y, ...ILLUMINANT_C];
	}
	// When the lightness is the maximum value 10 or more
	const v_max = TBL_V.at(-1) as number;
	if (v_max <= v) {
		const xy = _scanXY(h, c, TBL_V.length - 1);
		isSaturated = (v_max < v);
		return [Y, xy[0], xy[1]];
	}
	let vi_l = -1;
	while (TBL_V[vi_l + 1] <= v) ++vi_l;
	const vi_u = vi_l + 1;

	// Obtain lower side
	let xy_l: [number, number, boolean];
	if (vi_l !== -1) {
		xy_l = _scanXY(h, c, vi_l);
	} else {  // When the lightness of the lower side is the minimum 0, use standard illuminant.
		xy_l = [...ILLUMINANT_C, false];
		isSaturated = true;
	}
	// Obtain upper side
	const xy_u = _scanXY(h, c, vi_u);

	const v_l = ((vi_l === -1) ? 0 : TBL_V[vi_l]);
	const v_u = TBL_V[vi_u];
	const r = (v - v_l) / (v_u - v_l);

	if (!xy_l[2] && !xy_u[2]) {
		isSaturated = true;
	} else if (!xy_l[2] || !xy_u[2]) {
		if (r < 0.5) {
			if (!xy_l[2]) isSaturated = true;
		} else {
			if (!xy_u[2]) isSaturated = true;
		}
	}
	const xy = _div(xy_l as unknown as Pair, xy_u as unknown as Pair, r);
	return [Y, ...xy];
}

// Obtain the hue and chroma for the chromaticity coordinates (h, c) on the surface of the given lightness index.
// Return false if it is out of the range of the table.
function _scanXY(h: number, c: number, vi: number): [number, number, boolean] {
	const ht = h * 10;
	const p = [ht, c] as Pair;

	const c_l = 0 | Math.floor(c / 2) * 2;
	const c_u = c_l + 2;

	let ht_l = 0 | Math.floor(ht / 25) * 25;
	let ht_u = ht_l + 25;
	let maxC_hl = 0;
	let maxC_hu = 0;

	for (; maxC_hl === 0; ht_l -= 25) {
		maxC_hl = _getMaxC(vi, ht_l);
		if (maxC_hl !== 0) break;
	}
	for (; maxC_hu === 0; ht_u += 25) {
		maxC_hu = _getMaxC(vi, ht_u);
		if (maxC_hu !== 0) break;
	}

	if (c < maxC_hl && maxC_hu <= c) {
		for (let c_c = maxC_hu; c_c <= maxC_hl - 2; c_c += 2) {
			if (_inside(p, [ht_u, maxC_hu], [ht_l, c_c], [ht_l, c_c + 2])) {
				const xy = interpolate3(vi, p, [ht_u, maxC_hu], [ht_l, c_c], [ht_l, c_c + 2]);
				return [...xy, true];
			}
		}
	}
	if (maxC_hl <= c && c < maxC_hu) {
		for (let c_c = maxC_hl; c_c <= maxC_hu - 2; c_c += 2) {
			if (_inside(p, [ht_l, maxC_hl], [ht_u, c_c + 2], [ht_u, c_c])) {
				const xy = interpolate3(vi, p, [ht_l, maxC_hl], [ht_u, c_c + 2], [ht_u, c_c]);
				return [...xy, true];
			}
		}
	}
	if (maxC_hl <= c || maxC_hu <= c) {
		const xy = interpolate2(vi, p, [ht_l, maxC_hl], [ht_u, maxC_hu]);
		return [...xy, false];
	}
	const xy = interpolate4(vi, p, [ht_l, c_l], [ht_u, c_l], [ht_u, c_u], [ht_l, c_u]);
	return [...xy, true];

	function interpolate2(vi: number, p: Pair, a: Pair, b: Pair): Pair {
		const rx = (p[0] - a[0]) / (b[0] - a[0]);

		const wa = _getXy(vi, ...a) as Pair;
		const wb = _getXy(vi, ...b) as Pair;

		return _div(wa, wb, rx);
	}

	function interpolate3(vi: number, p: Pair, a: Pair, b: Pair, c: Pair): Pair {
		// Barycentric coordinates for 2D interpolation
		const f = (b[1] - c[1]) * (a[0] - c[0]) + (c[0] - b[0]) * (a[1] - c[1]);
		const w1 = ((b[1] - c[1]) * (p[0] - c[0]) + (c[0] - b[0]) * (p[1] - c[1])) / f;
		const w2 = ((c[1] - a[1]) * (p[0] - c[0]) + (a[0] - c[0]) * (p[1] - c[1])) / f;
		const w3 = 1 - w1 - w2;

		const wa = _getXy(vi, ...a) as Pair;
		const wb = _getXy(vi, ...b) as Pair;
		const wc = _getXy(vi, ...c) as Pair;

		return [
			wa[0] * w1 + wb[0] * w2 + wc[0] * w3,
			wa[1] * w1 + wb[1] * w2 + wc[1] * w3,
		];
	}

	// d c
	// a b
	function interpolate4(vi: number, p: Pair, a: Pair, b: Pair, c: Pair, d: Pair): Pair {
		const rx = (p[0] - a[0]) / (b[0] - a[0]);
		const ry = (p[1] - a[1]) / (d[1] - a[1]);

		const wa = _getXy(vi, ...a) as Pair;
		const wb = _getXy(vi, ...b) as Pair;
		const wc = _getXy(vi, ...c) as Pair;
		const wd = _getXy(vi, ...d) as Pair;

		// Checking (wa === wb) in case both are ILLUMINANT_C.
		const wab = (wa === wb) ? wa : _div(wa, wb, rx);
		const wdc = _div(wd, wc, rx);

		return _div(wab, wdc, ry);
	}
}


// XYZ ---------------------------------------------------------------------


/**
 * Convert CIE 1931 XYZ to Munsell (HVC).
 * @param {Triplet} xyz XYZ color (standard illuminant D65).
 * @param {Triplet} dest dest An array where the result will be stored. If not provided, a new array will be created and returned.
 * @return {Triplet} Munsell color.
 */
export function fromXYZ(xyz: Triplet, dest: Triplet = [0, 0, 0]): Triplet {
	const r = _yxy2mun(Yxy.fromXYZ(XYZ.toIlluminantC(xyz, dest), dest));
	dest[0] = r[0];
	dest[1] = r[1];
	dest[2] = r[2];
	return dest;
}

/**
 * Convert Munsell (HVC) to CIE 1931 XYZ.
 * @param {Triplet} hvc Hue, value, chroma of Munsell color.
 * @param {Triplet} dest dest An array where the result will be stored. If not provided, a new array will be created and returned.
 * @return {Triplet} XYZ color.
 */
export function toXYZ([h, v, c]: Triplet, dest: Triplet = [0, 0, 0]): Triplet {
	return XYZ.fromIlluminantC(Yxy.toXYZ(_mun2yxy([h, v, c]), dest), dest);
}


// -------------------------------------------------------------------------


/**
 * Convert name-based hue expression to hue value.
 * If the Name-based hue expression is N, -1 is returned.
 * @param {string} hueName Name-based hue expression
 * @return {number} Hue value
 */
export function hueNameToHueValue(hueName: string): number {
	if (hueName.length === 1) return -1;  // In case of achromatic color N

	function isDigit(s: string) { return Number.isInteger(parseInt(s)); }
	const len = isDigit(hueName.charAt(hueName.length - 2)) ? 1 : 2;  // Length of color name
	const n = hueName.substring(hueName.length - len);

	let hv = parseFloat(hueName.substring(0, hueName.length - len));
	hv += HUE_NAMES.indexOf(n) * 10;
	if (MAX_HUE <= hv) hv -= MAX_HUE;
	return hv;
}

/**
 * Convert hue value to name-based hue expression.
 * If the hue value is -1, or if the chroma value is 0, N is returned.
 * @param {number} hue Hue value
 * @param {number} chroma Chroma value
 * @return {string} Name-based hue expression
 */
export function hueValueToHueName(hue: number, chroma: number): string {
	if (hue === -1 || _eq0(chroma)) return 'N';
	if (hue <= 0) hue += MAX_HUE;
	let h10 = (0 | hue * 10) % 100;
	let c = 0 | (hue / 10);
	if (h10 === 0) {
		h10 = 100;
		c -= 1;
	}
	return (Math.round(h10 * 10) / 100) + HUE_NAMES[c];
}

/**
 * Returns the string representation of Munsell numerical representation.
 * @param {Triplet} hvc Hue, value, chroma of Munsell color
 * @return {string} String representation
 */
export function toString([h, v, c]: Triplet): string {
	const str_v = Math.round(v * 10) / 10;
	if (c < MONO_LIMIT_C) {
		return `N ${str_v}`;
	} else {
		const hue = hueValueToHueName(h, c);
		const str_c = Math.round(c * 10) / 10;
		return `${hue} ${str_v}/${str_c}`;
	}
}
