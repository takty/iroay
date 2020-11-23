/**
 *
 * This class converts the Munsell (HVC) color system.
 * D65 is used as tristimulus value.
 * Since conversion is performed by approximation based on the distance to the sample color, the conversion result is approximate value.
 * Also, when H is -1.0, it is regarded as an achromatic color (N) in particular.
 * Reference: http://www.cis.rit.edu/mcsl/online/munsell.php
 *
 * @author Takuto Yanagida
 * @version 2020-11-23
 *
 */


class Munsell {

	static _getXy(vi, h10, c) {
		if (c === 0) return this._ILLUMINANT_C;
		return this._TBL[vi][h10 / 25][c / 2];
	}

	// Find Y of XYZ (C) from Munsell's V (JIS).
	static _v2y(v) {
		const v2 = v * v, v3 = v2 * v, v4 = v2 * v2, v5 = v2 * v3;
		const y = 1.1913 * v - 0.22532 * v2 + 0.23351 * v3 - 0.020483 * v4 + 0.00081936 * v5;
		return y / 100.0;
	}

	// Munsell's V is obtained from Y of XYZ (C) (JIS, Newton's method).
	static _y2v(y) {
		if (this._eq(y, 0.0)) return 0.0;
		let v = 0;
		while (true) {
			const f = this._v2y(v) * 100.0 - y * 100.0;
			const v2 = v * v, v3 = v2 * v, v4 = v2 * v2;
			const fp = 1.1913 - 2 * 0.22532 * v + 3 * 0.23351 * v2 - 4 * 0.020483 * v3 + 5 * 0.00081936 * v4;
			const v1 = -f / fp + v;
			if (Math.abs(v1 - v) < 0.01) break;
			v = v1;
		}
		return v;
	}

	static _eq(a, b) {
		return Math.abs(a - b) < this._EP;
	}

	static _eq0(a) {
		return Math.abs(a) < this._EP;
	}

	// Find the Munsell value from xyY (standard illuminant C).
	static _yxy2mun(Y, x, y) {
		const v = this._y2v(Y);  // Find Munsell lightness

		// When the lightness is maximum 10.0
		if (this._eq(v, this._TBL_V[this._TBL_V.length - 1])) {
			const hc = this._interpolateHC(x, y, this._TBL_V.length - 1);
			return [hc[0], v, hc[1]];
		}
		// When the lightness is 0 or the lightness is larger than the maximum 10, or when it is an achromatic color (standard illuminant C)
		if (this._eq(v, 0.0) || this._TBL_V[this._TBL_V.length - 1] < v || (this._eq(x, this._ILLUMINANT_C[0]) && this._eq(y, this._ILLUMINANT_C[1]))) {
			return [0.0, v, 0.0];
		}
		// Obtain lower side
		let vi_l = -1;
		while (this._TBL_V[vi_l + 1] <= v) ++vi_l;
		let hc_l = [0, 0];  // Hue and chroma of the lower side
		if (vi_l != -1) hc_l = this._interpolateHC(x, y, vi_l);

		// Obtain upper side
		const vi_u = vi_l + 1;
		const hc_u = this._interpolateHC(x, y, vi_u);

		// When the lightness on the lower side is the minimum 0.0, the hue is matched with the upper side, and the chroma is set to 0.0
		if (vi_l == -1) {
			hc_l[0] = hc_u[0]; hc_l[1] = 0.0;
		}
		const v_l = ((vi_l == -1) ? 0.0 : this._TBL_V[vi_l]), v_h = this._TBL_V[vi_u];
		const r = (v - v_l) / (v_h - v_l);
		let h = (hc_u[0] - hc_l[0]) * r + hc_l[0];
		if (this.MAX_HUE <= h) h -= this.MAX_HUE;
		let c = (hc_u[1] - hc_l[1]) * r + hc_l[1];
		if (c < this.MONO_LIMIT_C) c = 0.0;
		return [h, v, c];
	}

	// Acquires the hue and chroma for the chromaticity coordinates (x, y) on the surface of the given lightness index.
	// If not included, -1 is returned.
	static _interpolateHC(x, y, vi) {
		let h10_l, h10_u = -1, c_l = -1, c_u = -1;
		let hv = null;

		out:
		for (h10_l = 0; h10_l <= 975; h10_l += 25) {  // h 0-975 step 25;
			h10_u = h10_l + 25;
			if (h10_u == 1000) h10_u = 0;

			inner:
			for (c_l = 0; c_l <= 50; c_l += 2) {  // c 0-50 step 2;
				c_u = c_l + 2;

				const a = this._getXy(vi, h10_l, c_l), d = this._getXy(vi, h10_l, c_u);
				const b = this._getXy(vi, h10_u, c_l), c = this._getXy(vi, h10_u, c_u);
				if (a == null && b == null) break inner;
				if (a == null || b == null || c == null || d == null) continue;
				//  ^
				// y| B C      ↖H (Direction of rotation) ↗C (Radial direction)
				//  | A D
				//  ------> x
				if (a[0] == b[0] && a[1] == b[1]) {
					if (this._isInside(a, c, d, x, y)) hv = this._interpolationRatio(x, y, a, d, b, c);
				} else {
					if (this._isInside(a, c, d, x, y) || this._isInside(a, b, c, x, y)) hv = this._interpolationRatio(x, y, a, d, b, c);
				}
				if (hv != null) break out;
			}
		}
		if (hv === null) {
			return [0, 0];
		}
		if (h10_u == 0) h10_u = 1000;
		return [((h10_u - h10_l) * hv[0] + h10_l) / 10.0, (c_u - c_l) * hv[1] + c_l];
	}

	// Whether a point (x, y) exists within the interior (including the boundary) of the clockwise triangle abc
	// in the mathematical coordinate system (positive on the y axis is upward)
	static _isInside(a, b, c, x, y) {
		// If x, y are on the right side of ab, the point is outside the triangle
		if (this._cross(x - a[0], y - a[1], b[0] - a[0], b[1] - a[1]) < 0.0) return false;
		// If x, y are on the right side of bc, the point is outside the triangle
		if (this._cross(x - b[0], y - b[1], c[0] - b[0], c[1] - b[1]) < 0.0) return false;
		// If x, y are on the right side of ca, the point is outside the triangle
		if (this._cross(x - c[0], y - c[1], a[0] - c[0], a[1] - c[1]) < 0.0) return false;
		return true;
	}

	static _cross(ax, ay, bx, by) {
		return ax * by - ay * bx;
	}

	/*
	 * Calculate the proportion [h, v] of each point in the area surrounded by the points of the following placement (null if it is invalid).
	 *  ^
	 * y| B C      ↖H (Direction of rotation) ↗C (Radial direction)
	 *  | A D
	 *  ------> x
	 */
	static _interpolationRatio(x, y, a, d, b, c) {
		// Find the ratio in the vertical direction
		let v = -1.0;

		// Solve a v^2 + b v + c = 0
		const ea = (a[0] - d[0]) * (a[1] + c[1] - b[1] - d[1]) - (a[0] + c[0] - b[0] - d[0]) * (a[1] - d[1]);
		const eb = (x - a[0]) * (a[1] + c[1] - b[1] - d[1]) + (a[0] - d[0]) * (b[1] - a[1]) - (a[0] + c[0] - b[0] - d[0]) * (y - a[1]) - (b[0] - a[0]) * (a[1] - d[1]);
		const ec = (x - a[0]) * (b[1] - a[1]) - (y - a[1]) * (b[0] - a[0]);

		if (this._eq0(ea)) {
			if (!this._eq0(eb)) v = -ec / eb;
		} else {
			const rt = Math.sqrt(eb * eb - 4.0 * ea * ec);
			const v1 = (-eb + rt) / (2.0 * ea), v2 = (-eb - rt) / (2.0 * ea);

			if (a[0] == b[0] && a[1] == b[1]) {  // In this case, v1 is always 0, but this is not a solution.
				if (0.0 <= v2 && v2 <= 1.0) v = v2;
			} else {
				if     (0.0 <= v1 && v1 <= 1.0) v = v1;
				else if (0.0 <= v2 && v2 <= 1.0) v = v2;
			}
		}
		if (v < 0.0) return null;

		// Find the ratio in the horizontal direction
		let h = -1.0, h1 = -1.0, h2 = -1.0;
		const deX = (a[0] - d[0] - b[0] + c[0]) * v - a[0] + b[0];
		const deY = (a[1] - d[1] - b[1] + c[1]) * v - a[1] + b[1];

		if (!this._eq0(deX)) h1 = ((a[0] - d[0]) * v + x - a[0]) / deX;
		if (!this._eq0(deY)) h2 = ((a[1] - d[1]) * v + y - a[1]) / deY;

		if      (0.0 <= h1 && h1 <= 1.0) h = h1;
		else if (0.0 <= h2 && h2 <= 1.0) h = h2;

		if (h < 0.0) return null;

		return [h, v];
	}

	/**
	 * Convert name-based hue expression to hue value.
	 * If the Name-based hue expression is N, -1.0 is returned.
	 * @param hueName Name-based hue expression
	 * @return Hue value
	 */
	static hueNameToHueValue(hueName) {
		if (hueName.length == 1) return -1.0;  // In case of achromatic color N

		function isDigit(s) { return Number.isInteger(parseInt(s)); }
		const slen = isDigit(hueName.charAt(hueName.length - 2)) ? 1 : 2;  // Length of color name
		const n = hueName.substring(hueName.length - slen);

		let hv = parseFloat(hueName.substring(0, hueName.length - slen));
		hv += this.HueNames.indexOf(n) * 10;
		if (this.MAX_HUE <= hv) hv -= this.MAX_HUE;
		return hv;
	}

	/**
	 * Convert hue value to name-based hue expression.
	 * If the hue value is -1.0, or if the chroma value is 0.0, N is returned.
	 * @param hue Hue value
	 * @param chroma Chroma value
	 * @return Name-based hue expression
	 */
	static hueValueToHueName(hue, chroma) {
		if (hue == -1.0 || this._eq0(chroma)) return 'N';
		if (hue < 0) hue += this.MAX_HUE;
		let c = 0 | (hue / 10.0);
		if (10 <= c) c -= 10;
		const n = this.HueNames[c];
		// return String.format("%.1f%s", hue - c * 10.0, n);
		return (Math.round(hue - c * 10 * 10) / 10) + n;
	}

	/**
	 * Convert CIE 1931 XYZ to Munsell (HVC).
	 * @param x X of XYZ color (standard illuminant D65)
	 * @param y Y of XYZ color (standard illuminant D65)
	 * @param z Z of XYZ color (standard illuminant D65)
	 * @return Munsell color
	 */
	static fromXYZ(x, y, z) {
		return Munsell._yxy2mun(...Yxy.fromXYZ(...XYZ.toIlluminantC(x, y, z)));
	}

	/**
	 * Convert Munsell (HVC) to CIE 1931 XYZ.
	 * @param h Hue of Munsell color
	 * @param v Value of Munsell color
	 * @param c Chroma of Munsell color
	 * @return XYZ color
	 */
	static toXYZ(h, v, c) {
		if (this.MAX_HUE <= h) h -= this.MAX_HUE;
		const dest = [this._v2y(v), 0, 0];
		this.isSaturated = false;

		// When the lightness is 0 or achromatic (check this first)
		if (this._eq(v, 0.0) || h < 0.0 || c < this.MONO_LIMIT_C) {
			dest[1] = this._ILLUMINANT_C[0]; dest[2] = this._ILLUMINANT_C[1];
			this.isSaturated = this._eq(v, 0.0) && 0.0 < c;
			return XYZ.fromIlluminantC(...Yxy.toXYZ(...dest));
		}
		// When the lightness is the maximum value 10.0 or more
		if (this._TBL_V[this._TBL_V.length - 1] <= v) {
			const xy = this._interpolateXY(h, c, this._TBL_V.length - 1);
			dest[1] = xy[0]; dest[2] = xy[1];
			this.isSaturated = (this._TBL_V[this._TBL_V.length - 1] < v);
			return XYZ.fromIlluminantC(...Yxy.toXYZ(...dest));
		}
		let vi_l = -1;
		while (this._TBL_V[vi_l + 1] <= v) ++vi_l;
		const vi_u = vi_l + 1;

		// Obtain lower side
		let xy_l = [0, 0];
		if (vi_l != -1) {
			xy_l = this._interpolateXY(h, c, vi_l);
			if (!xy_l[2]) this.isSaturated = true;
		} else {  // When the lightness of the lower side is the minimum 0.0, use standard illuminant.
			xy_l[0] = this._ILLUMINANT_C[0]; xy_l[1] = this._ILLUMINANT_C[1];
			this.isSaturated = true;
		}
		// Obtain upper side
		const xy_u = this._interpolateXY(h, c, vi_u);
		if (!xy_u[2]) this.isSaturated = true;

		const v_l = ((vi_l == -1) ? 0.0 : this._TBL_V[vi_l]), v_h = this._TBL_V[vi_u];
		const r = (v - v_l) / (v_h - v_l);
		const x = (xy_u[0] - xy_l[0]) * r + xy_l[0], y = (xy_u[1] - xy_l[1]) * r + xy_l[1];
		dest[1] = x; dest[2] = y;

		return XYZ.fromIlluminantC(...Yxy.toXYZ(...dest));
	}

	// Obtain the hue and chroma for the chromaticity coordinates (h, c) on the surface of the given lightness index.
	// Return false if it is out of the range of the table.
	static _interpolateXY(h, c, vi) {
		const h10 = h * 10.0;
		const h10_l = 0 | Math.floor(h10 / 25.0) * 25, h10_u = h10_l + 25;
		const c_l = 0 | Math.floor(c / 2.0) * 2, c_u = c_l + 2;

		const rh = (h10 - h10_l) / (h10_u - h10_l);
		const rc = (c - c_l) / (c_u - c_l);

		if (h10_u == 1000) h10_u = 0;
		const maxC_hl = this._TBL_MAX_C[vi][h10_l / 25], maxC_hu = this._TBL_MAX_C[vi][h10_u / 25];

		if (maxC_hl <= c_l || maxC_hu <= c_l) {
			const xy_hl = [0, 0], xy_hu = [0, 0];

			if (c_l < maxC_hl) {
				const a = this._getXy(vi, h10_l, c_l), d = this._getXy(vi, h10_l, c_u);
				xy_hl[0] = (d[0] - a[0]) * rc + a[0]; xy_hl[1] = (d[1] - a[1]) * rc + a[1];
			} else {
				xy_hl = this._getXy(vi, h10_l, maxC_hl);
			}
			if (c_l < maxC_hu) {
				const a = this._getXy(vi, h10_u, c_l), d = this._getXy(vi, h10_u, c_u);
				xy_hu[0] = (d[0] - a[0]) * rc + a[0]; xy_hu[1] = (d[1] - a[1]) * rc + a[1];
			} else {
				xy_hu = this._getXy(vi, h10_u, maxC_hu);
			}
			return [
				(xy_hu[0] - xy_hl[0]) * rh + xy_hl[0],
				(xy_hu[1] - xy_hl[1]) * rh + xy_hl[1],
				false
			];
		}
		if (c_l == 0) {
			const o = this._ILLUMINANT_C, d = this._getXy(vi, h10_l, c_u), C = this._getXy(vi, h10_u, c_u);
			const cd_x = (C[0] - d[0]) * rh + d[0], cd_y = (C[1] - d[1]) * rh + d[1];
			return [
				(cd_x - o[0]) * rc + o[0],
				(cd_y - o[1]) * rc + o[1],
				true
			];
		} else {
			const a = this._getXy(vi, h10_l, c_l), d = this._getXy(vi, h10_l, c_u);
			const b = this._getXy(vi, h10_u, c_l), C = this._getXy(vi, h10_u, c_u);
			const ab_x = (b[0] - a[0]) * rh + a[0], ab_y = (b[1] - a[1]) * rh + a[1];
			const cd_x = (C[0] - d[0]) * rh + d[0], cd_y = (C[1] - d[1]) * rh + d[1];
			return [
				(cd_x - ab_x) * rc + ab_x,
				(cd_y - ab_y) * rc + ab_y,
				true
			];
		}
	}

	/**
	 * Returns the string representation of Munsell numerical representation.
	 * @param hvc Munsell color
	 * @return String representation
	 */
	static toString(hvc) {
		if (hvc[2] < this.MONO_LIMIT_C) {
			// return String.format("N %.1f", hvc[1]);
			return 'N ' + (Math.round(hvc[1] * 10) / 10);
		} else {
			// return String.format("%s %.1f/%.1f", this.hueValueToHueName(hvc[0], hvc[2]), hvc[1], hvc[2]);
			return this.hueValueToHueName(hvc[0], hvc[2]) + ' ' + (Math.round(hvc[1] * 10) / 10) + '/' + (Math.round(hvc[2] * 10) / 10);
		}
	}

}

Munsell.MIN_HUE = 0.0;
Munsell.MAX_HUE = 100.0;  // Same as MIN_HUE

Munsell.MONO_LIMIT_C = 0.05;

Munsell.isSaturated = false;

Munsell.HueNames = ['R', 'YR', 'Y', 'GY', 'G', 'BG', 'B', 'PB', 'P', 'RP'];  // 1R = 1, 9RP = 99, 10RP = 0

Munsell._EP = 0.0000000000001;
Munsell._ILLUMINANT_C = [0.3101, 0.3162];  // Standard illuminant C, white point

Munsell._TBL_V     = [0.2, 0.4, 0.6, 0.8, 1.0, 2.0, 3.0, 4.0, 5.0, 6.0, 7.0, 8.0, 9.0, 10.0];
Munsell._TBL_MAX_C = new Array(Munsell._TBL_V.length);
Munsell._TBL       = new Array(Munsell._TBL_V.length);  // [vi][10 * h / 25][c / 2] -> [x, y]
// Munsell._TBL_SRC   = new Array(Munsell._TBL_V.length);

function _initTable() {
	for (let vi = 0; vi < Munsell._TBL_V.length; vi += 1) {
		Munsell._TBL_MAX_C[vi] = new Array(1000 / 25);
		Munsell._TBL[vi] = new Array(1000 / 25);
		for (let i = 0, n = 1000 / 25; i < n; i += 1) Munsell._TBL[vi][i] = new Array(50 / 2 + 2);  // 2 <= C <= 51

		const src = Munsell._TBL_SRC[vi];
		for (let i = 0; i < src.length; i += 4) {
			const c0 = src[i];
			const c1 = src[i + 1];
			const c2 = src[i + 2] / 1000;
			const c3 = src[i + 3] / 1000;
			Munsell._TBL[vi][c0][c1] = [c2, c3];
			if (Munsell._TBL_MAX_C[vi][c0] < c1 * 2) {
				Munsell._TBL_MAX_C[vi][c0] = c1 * 2;
			}
		}
	}
}

//=
//=include table/_hc2xy-min.js

_initTable();
