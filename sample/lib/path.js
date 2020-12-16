/**
 * Path library (PATH)
 *
 * A library to make the path of the shape.
 *
 * @author Takuto Yanagida
 * @version 2020-04-21
 */


/**
 * Library variable
 */
const PATH = (function () {

	'use strict';


	// Utilities used only in the library --------------------------------------


	/**
	 * Minimum value
	 */
	const E = 0.0000000000001;

	/**
	 * Convert degree to radian
	 * @param {number} deg Degree
	 * @return {number} Radian
	 */
	const rad = function (deg) {
		return deg * Math.PI / 180.0;
	};

	/**
	 * Convert radian to degree
	 * @param {number} rad Radian
	 * @return {number} Degree
	 */
	const deg = function (rad) {
		return rad * 180.0 / Math.PI;
	};

	/**
	 * Find the angle between two points
	 * @param {number} x0 X coordinate of point 1
	 * @param {number} y0 Y coordinate of point 1
	 * @param {number} x1 X coordinate of point 2
	 * @param {number} y1 Y coordinate of point 2
	 * @return {number} Degree
	 */
	const degOf = function (x0, y0, x1, y1) {
		let d = (Math.atan2(y1 - y0, x1 - x0) * 180.0 / Math.PI);
		while (d < 0) d += 360;
		while (360 <= d) d -= 360;
		return d;
	};

	/**
	 * Find the length between two points
	 * @param {number} x0 X coordinate of point 1
	 * @param {number} y0 Y coordinate of point 1
	 * @param {number} x1 X coordinate of point 2
	 * @param {number} y1 Y coordinate of point 2
	 * @return {number} Length
	 */
	const lenOf = function (x0, y0, x1, y1) {
		return Math.sqrt((x0 - x1) * (x0 - x1) + (y0 - y1) * (y0 - y1));
	};

	/**
	 * Determine the length
	 * @param {number} x0 X coordinate of start point
	 * @param {number} y0 Y coordinate of start point
	 * @param {function(number, number, Array<number>)} func Function
	 * @param {number} I Accuracy to calculate
	 * @param {number=} [opt_limit=null] Length limitation
	 * @param {dict=} [opt_retArea=null] An array returning areas
	 * @return {dict} Length of span
	 */
	const calcSpan = function (x0, y0, func, I, opt_limit = null, opt_retArea = null) {
		let px = x0, py = y0, pt = [], span = 0, limitedSpan = false, paramT, checkLimit;

		if (opt_limit !== null) checkLimit = true;

		for (let i = 1; i <= I; i += 1) {
			const t = i / I, tp = 1 - t;
			func(t, tp, pt);
			const x = pt[0], y = pt[1];

			if (opt_retArea !== null) updateArea(opt_retArea, x, y);
			span += Math.sqrt((x - px) * (x - px) + (y - py) * (y - py));
			px = x;
			py = y;

			if (checkLimit && opt_limit <= span) {
				limitedSpan = span;
				paramT = t;
				checkLimit = false;
			}
		}
		if (checkLimit) {
			limitedSpan = span;
			paramT = 1;
		}
		if (limitedSpan === false) limitedSpan = span;
		return { span, limitedSpan, paramT };
	};

	/**
	 * Update area information
	 * @param {dict} area Area information
	 * @param {number} x X coordinate
	 * @param {number} y Y coordinate
	 */
	const updateArea = function (area, x, y) {
		const fX = area.fromX, fY = area.fromY;
		const sqLen = (x - fX) * (x - fX) + (y - fY) * (y - fY);
		if (area.sqLen < sqLen) {
			area.sqLen = sqLen;
			area.toX = x;
			area.toY = y;
		}
		if (x < area.left)   area.left = x;
		if (y < area.top)    area.top = y;
		if (area.right < x)  area.right = x;
		if (area.bottom < y) area.bottom = y;
	};

	/**
	 * Find the length of a line segment
	 * @param {number} x0 X coordinate of start point
	 * @param {number} y0 Y coordinate of start point
	 * @param {number} x1 X coordinate of end point
	 * @param {number} y1 Y coordinate of end point
	 * @param {number} I Accuracy to calculate
	 * @param {number=} [opt_limit=null] Length limitation
	 * @param {dict=} [opt_retArea=null] An array returning areas
	 * @return {dict} Length of span
	 */
	const _lineLen = function (x0, y0, x1, y1, I, opt_limit = null, opt_retArea = null) {
		return calcSpan(x0, y0, function (t, tp, pt) {
			pt[0] = tp * x0 + t * x1;
			pt[1] = tp * y0 + t * y1;
		}, I, opt_limit, opt_retArea);
	};

	/**
	 * Find the length of a quadratic Bezier curve
	 * @param {number} x0 X coordinate of start point
	 * @param {number} y0 Y coordinate of start point
	 * @param {number} x1 X coordinate of handle
	 * @param {number} y1 Y coordinate of handle
	 * @param {number} x2 X coordinate of end point
	 * @param {number} y2 Y coordinate of end point
	 * @param {number} I Accuracy to calculate
	 * @param {number=} [opt_limit=null] Length limitation
	 * @param {dict=} [opt_retArea=null] An array returning areas
	 * @return {dict} Length of span
	 */
	const _quadLen = function (x0, y0, x1, y1, x2, y2, I, opt_limit = null, opt_retArea = null) {
		return calcSpan(x0, y0, function (t, tp, pt) {
			const k0 = tp * tp, k1 = 2 * t * tp, k2 = t * t;
			pt[0] = k0 * x0 + k1 * x1 + k2 * x2;
			pt[1] = k0 * y0 + k1 * y1 + k2 * y2;
		}, I, opt_limit, opt_retArea);
	};

	/**
	 * Find the length of a cubic Bézier curve
	 * @param {number} x0 X coordinate of start point
	 * @param {number} y0 Y coordinate of start point
	 * @param {number} x1 X coordinate of handle 1
	 * @param {number} y1 Y coordinate of handle 1
	 * @param {number} x2 X coordinate of handle 2
	 * @param {number} y2 Y coordinate of handle 2
	 * @param {number} x3 X coordinate of end point
	 * @param {number} y3 Y coordinate of end point
	 * @param {number} I Accuracy to calculate
	 * @param {number=} [opt_limit=null] Length limitation
	 * @param {dict=} [opt_retArea=null] An array returning areas
	 * @return {dict} Length of span
	 */
	const _bezierLen = function (x0, y0, x1, y1, x2, y2, x3, y3, I, opt_limit = null, opt_retArea = null) {
		return calcSpan(x0, y0, function (t, tp, pt) {
			const k0 = tp * tp * tp, k1 = 3 * t * tp * tp;
			const k2 = 3 * t * t * tp, k3 = t * t * t;
			pt[0] = k0 * x0 + k1 * x1 + k2 * x2 + k3 * x3;
			pt[1] = k0 * y0 + k1 * y1 + k2 * y2 + k3 * y3;
		}, I, opt_limit, opt_retArea);
	};

	/**
	 * Calculate arc length
	 * - Clockwise if r0 < r1, or counterclockwise if r1 < r0
	 * @param {number} cx X coordinate of center
	 * @param {number} cy Y coordinate of center
	 * @param {number} dr Direction
	 * @param {number} w Width
	 * @param {number} h Height
	 * @param {number} r0 Start angle
	 * @param {number} r1 End angle
	 * @param {number} I Accuracy to calculate
	 * @param {number=} [opt_limit=null] Length limitation
	 * @param {dict=} [opt_retArea=null] An array returning areas
	 * @return {dict} Length of span
	 */
	const _arcLen = function (cx, cy, dr, w, h, r0, r1, I, opt_limit = null, opt_retArea = null) {
		const s0 = w * Math.cos(r0), t0 = h * Math.sin(r0);
		const rsin = Math.sin(dr), rcos = Math.cos(dr);
		const x0 = cx + s0 * rcos - t0 * rsin;
		const y0 = cy + s0 * rsin + t0 * rcos;

		return calcSpan(x0, y0, function (t, tp, pt) {
			const r = tp * r0 + t * r1;
			const st = w * Math.cos(r), tt = h * Math.sin(r);
			pt[0] = cx + st * rcos - tt * rsin;
			pt[1] = cy + st * rsin + tt * rcos;
		}, I, opt_limit, opt_retArea);
	};

	/**
	 * Find the coordinates of the midpoint of the line segment
	 * @private
	 * @param {number} t Parameter variable
	 * @param {number} x0 X coordinate of point 1
	 * @param {number} y0 Y coordinate of point 1
	 * @param {number} x1 X coordinate of point 2
	 * @param {number} y1 Y coordinate of point 2
	 * @return {Array<number>} Coordinates
	 */
	const _linePoints = function (t, x0, y0, x1, y1) {
		const tp = 1 - t;
		const x1p = tp * x0 + t * x1, y1p = tp * y0 + t * y1;
		return [x1p, y1p];
	};

	/**
	 * Find the coordinates of the midpoint of the quadratic Bezier curve
	 * @private
	 * @param {number} t Parameter variable
	 * @param {number} x0 X coordinate of point 1
	 * @param {number} y0 Y coordinate of point 1
	 * @param {number} x1 X coordinate of point 2
	 * @param {number} y1 Y coordinate of point 2
	 * @param {number} x2 X coordinate of point 3
	 * @param {number} y2 Y coordinate of point 3
	 * @return {Array<number>} Coordinates
	 */
	const _quadPoints = function (t, x0, y0, x1, y1, x2, y2) {
		const tp = 1 - t;
		const k0 = tp * tp, k1 = 2 * t * tp, k2 = t * t;
		const x1p = tp * x0 + t * x1, y1p = tp * y0 + t * y1;
		const x2p = k0 * x0 + k1 * x1 + k2 * x2, y2p = k0 * y0 + k1 * y1 + k2 * y2;
		return [x1p, y1p, x2p, y2p];
	};

	/**
	 * Find the coordinates of the midpoint of the cubic Bezier curve
	 * @private
	 * @param {number} t Parameter variable
	 * @param {number} x0 X coordinate of point 1
	 * @param {number} y0 Y coordinate of point 1
	 * @param {number} x1 X coordinate of point 2
	 * @param {number} y1 Y coordinate of point 2
	 * @param {number} x2 X coordinate of point 3
	 * @param {number} y2 Y coordinate of point 3
	 * @param {number} x3 X coordinate of point 4
	 * @param {number} y3 Y coordinate of point 4
	 * @return {Array<number>} Coordinates
	 */
	const _bezierPoints = function (t, x0, y0, x1, y1, x2, y2, x3, y3) {
		const tp = 1 - t;
		const k0 = tp * tp, k1 = 2 * t * tp, k2 = t * t;
		const k3 = tp * tp * tp, k4 = 3 * t * tp * tp;
		const k5 = 3 * t * t * tp, k6 = t * t * t;
		const x1p = tp * x0 + t * x1,                      y1p = tp * y0 + t * y1;
		const x2p = k0 * x0 + k1 * x1 + k2 * x2,           y2p = k0 * y0 + k1 * y1 + k2 * y2;
		const x3p = k3 * x0 + k4 * x1 + k5 * x2 + k6 * x3, y3p = k3 * y0 + k4 * y1 + k5 * y2 + k6 * y3;
		return [x1p, y1p, x2p, y2p, x3p, y3p];
	};


	/**
	 * Liner
	 * @version 2019-09-03
	 */
	class Liner {

		/**
		 * Make a liner
		 * @param {*} handler Drawing handler
		 * @param {number=} [opt_normalDir=Math.PI / -2] Normal direction
		 */
		constructor(handler, opt_normalDir = Math.PI / -2) {
			this._handler   = handler;
			this._normalDir = opt_normalDir;
			this._edge      = NORMAL_EDGE;
		}

		/**
		 * Edge
		 * @param {function=} func Function to determine the edge
		 * @return {function|Liner} Edge, or this liner
		 */
		edge(func, ...fs) {
			if (func === undefined) return this._edge;
			this._edge = fs.length ? PATH.mixEdge(func, ...fs) : func;
		}


		// Line --------------------------------------------------------------------


		line(x0, y0, dir, dist, opt_limit = null, opt_retArea = null) {
			const r = rad(dir);
			const x1 = x0 + dist * Math.cos(r), y1 = y0 + dist * Math.sin(r);
			const roughSpan = Math.ceil(Math.abs(dist));
			return this._linePre(x0, y0, x1, y1, dir, roughSpan, opt_limit, opt_retArea);
		}

		lineAbs(x0, y0, x1, y1, opt_limit = null, opt_retArea = null) {
			const dir = degOf(x0, y0, x1, y1);
			const roughSpan = Math.ceil(lenOf(x0, y0, x1, y1));
			return this._linePre(x0, y0, x1, y1, dir, roughSpan, opt_limit, opt_retArea);
		}

		_linePre(x0, y0, x1, y1, dirEnd, roughSpan, opt_limit, opt_retArea) {
			const { span, limitedSpan, paramT } = _lineLen(x0, y0, x1, y1, roughSpan, opt_limit, opt_retArea);

			if (opt_limit === null) {
			} else {
				[x1, y1] = _linePoints(paramT, x0, y0, x1, y1);
			}
			if (this._edge) {
				this._lineDraw(dirEnd, x0, y0, rad(dirEnd), x1, y1, span, limitedSpan, this._edge);
			} else {
				this._handler.lineOrMoveTo(x1, y1, dirEnd);
			}
			return limitedSpan;
		}

		_lineDraw(dirEnd, x0, y0, r, x1, y1, span, limitedSpan, edge) {
			const nd = this._normalDir;
			const nR = r + nd, nX = Math.cos(nR), nY = Math.sin(nR);

			for (let i = 0, I = Math.ceil(limitedSpan); i <= I; i += 1) {
				const t = i / I, tp = 1 - t;
				const x = tp * x0 + t * x1, y = tp * y0 + t * y1;
				const l = limitedSpan * t;

				const nD = edge(l, span);
				const nXd = nD * nX, nYd = nD * nY;
				this._handler.lineOrMoveTo(x + nXd, y + nYd, dirEnd);
			}
		}


		// Quadratic Bezier curve --------------------------------------------------


		quadCurve(x0, y0, dir, dist0, deg0, dist1, opt_limit = null, opt_retArea = null) {
			const r0 = rad(dir), r1 = rad(dir + deg0);
			const x1 = x0 + dist0 * Math.cos(r0), y1 = y0 + dist0 * Math.sin(r0);
			const x2 = x1 + dist1 * Math.cos(r1), y2 = y1 + dist1 * Math.sin(r1);
			const roughSpan = Math.ceil(Math.abs(dist0) + Math.abs(dist1));
			return this._quadCurvePre(x0, y0, x1, y1, x2, y2, dir + deg0, roughSpan, opt_limit, opt_retArea);
		}

		quadCurveAbs(x0, y0, x1, y1, x2, y2, opt_limit = null, opt_retArea = null) {
			const roughSpan = Math.ceil(lenOf(x0, y0, x1, y1) + lenOf(x1, y1, x2, y2));
			return this._quadCurvePre(x0, y0, x1, y1, x2, y2, null, roughSpan, opt_limit, opt_retArea);
		}

		_quadCurvePre(x0, y0, x1, y1, x2, y2, dirEnd, roughSpan, opt_limit, opt_retArea) {
			const { span, limitedSpan, paramT } = _quadLen(x0, y0, x1, y1, x2, y2, roughSpan, opt_limit, opt_retArea);

			if (opt_limit === null) {
				if (dirEnd === null) dirEnd = degOf(x1, y1, x2, y2);
			} else {
				[x1, y1, x2, y2] = _quadPoints(paramT, x0, y0, x1, y1, x2, y2);
				dirEnd = degOf(x1, y1, x2, y2);
			}
			if (this._edge) {
				this._quadCurveDraw(dirEnd, x0, y0, x1, y1, x2, y2, span, limitedSpan, this._edge);
			} else {
				this._handler.quadCurveOrMoveTo(x1, y1, x2, y2, dirEnd);
			}
			return limitedSpan;
		}

		_quadCurveDraw(dirEnd, x0, y0, x1, y1, x2, y2, span, limitedSpan, edge) {
			const nd = this._normalDir;
			let px = x0, py = y0, l = 0;

			for (let i = 1, I = Math.ceil(limitedSpan); i <= I; i += 1) {
				const t = i / I, tp = 1 - t;
				const k0 = tp * tp, k1 = 2 * t * tp, k2 = t * t;
				const x = k0 * x0 + k1 * x1 + k2 * x2;
				const y = k0 * y0 + k1 * y1 + k2 * y2;
				const at = Math.atan2(y - py, x - px);
				const de = (i === I) ? dirEnd : deg(at);
				l += Math.sqrt((x - px) * (x - px) + (y - py) * (y - py));
				px = x;
				py = y;

				const nD = edge(l, span);
				if (0 !== nD) {
					const nXd = nD * Math.cos(at + nd), nYd = nD * Math.sin(at + nd);
					this._handler.lineOrMoveTo(x + nXd, y + nYd, de);
				} else {
					this._handler.lineOrMoveTo(x, y, de);
				}
			}
		}


		// Cubic Bezier curve ------------------------------------------------------


		bezierCurve(x0, y0, dir, dist0, deg0, dist1, deg1, dist2, opt_limit = null, opt_retArea = null) {
			const r0 = rad(dir), r1 = rad(dir + deg0), r2 = rad(dir + deg0 + deg1);
			const x1 = x0 + dist0 * Math.cos(r0), y1 = y0 + dist0 * Math.sin(r0);
			const x2 = x1 + dist1 * Math.cos(r1), y2 = y1 + dist1 * Math.sin(r1);
			const x3 = x2 + dist2 * Math.cos(r2), y3 = y2 + dist2 * Math.sin(r2);
			const roughSpan = Math.ceil(Math.abs(dist0) + Math.abs(dist1) + Math.abs(dist2));
			return this._bezierCurvePre(x0, y0, x1, y1, x2, y2, x3, y3, dir + deg0 + deg1, roughSpan, opt_limit, opt_retArea);
		}

		bezierCurveAbs(x0, y0, x1, y1, x2, y2, x3, y3, opt_limit = null, opt_retArea = null) {
			const roughSpan = Math.ceil(lenOf(x0, y0, x1, y1) + lenOf(x1, y1, x2, y2) + lenOf(x2, y2, x3, y3));
			return this._bezierCurvePre(x0, y0, x1, y1, x2, y2, x3, y3, null, roughSpan, opt_limit, opt_retArea);
		}

		_bezierCurvePre(x0, y0, x1, y1, x2, y2, x3, y3, dirEnd, roughSpan, opt_limit, opt_retArea) {
			const { span, limitedSpan, paramT } = _bezierLen(x0, y0, x1, y1, x2, y2, x3, y3, roughSpan, opt_limit, opt_retArea);

			if (opt_limit === null) {
				if (dirEnd === null) dirEnd = degOf(x2, y2, x3, y3);
			} else {
				[x1, y1, x2, y2, x3, y3] = _bezierPoints(paramT, x0, y0, x1, y1, x2, y2, x3, y3);
				dirEnd = degOf(x2, y2, x3, y3);
			}
			if (this._edge) {
				this._bezierCurveDraw(dirEnd, x0, y0, x1, y1, x2, y2, x3, y3, span, limitedSpan, this._edge);
			} else {
				this._handler.bezierCurveOrMoveTo(x1, y1, x2, y2, x3, y3, dirEnd);
			}
			return limitedSpan;
		}

		_bezierCurveDraw(dirEnd, x0, y0, x1, y1, x2, y2, x3, y3, span, limitedSpan, edge) {
			const nd = this._normalDir;
			let px = x0, py = y0, l = 0;

			for (let i = 1, I = Math.ceil(limitedSpan); i <= I; i += 1) {
				const t = i / I, tp = 1 - t;
				const k0 = tp * tp * tp, k1 = 3 * t * tp * tp;
				const k2 = 3 * t * t * tp, k3 = t * t * t;
				const x = k0 * x0 + k1 * x1 + k2 * x2 + k3 * x3;
				const y = k0 * y0 + k1 * y1 + k2 * y2 + k3 * y3;
				const at = Math.atan2(y - py, x - px);
				const de = (i === I) ? dirEnd : deg(at);
				l += Math.sqrt((x - px) * (x - px) + (y - py) * (y - py));
				px = x;
				py = y;

				const nD = edge(l, span);
				if (0 !== nD) {
					const nXd = nD * Math.cos(at + nd), nYd = nD * Math.sin(at + nd);
					this._handler.lineOrMoveTo(x + nXd, y + nYd, de);
				} else {
					this._handler.lineOrMoveTo(x, y, de);
				}
			}
		}


		// Arc ---------------------------------------------------------------------


		arc(cx, cy, dir, w, h, deg0, deg1, anticlockwise = false, opt_limit = null, opt_retArea = null) {
			if (-E < w && w < E) w = (0 < w) ? E : -E;
			if (-E < h && h < E) h = (0 < h) ? E : -E;

			deg0 %= 360;
			deg1 %= 360;
			if (Math.abs(deg0) > 180) deg0 += (deg0 < 0) ? 360 : -360
			if (Math.abs(deg1) > 180) deg1 += (deg1 < 0) ? 360 : -360
			if (anticlockwise) {  // 向きの考慮に必要
				while (deg0 < deg1) deg1 -= 360;
			} else {
				while (deg1 < deg0) deg1 += 360;
			}
			if (deg0 === deg1) {
				if (anticlockwise) deg1 -= 360;
				else deg1 += 360;
			}
			if (dir == null) dir = 0;
			const roughSpan = Math.PI * (w + h);
			return this._arcPre(cx, cy, rad(dir), w, h, rad(deg0), rad(deg1), anticlockwise, roughSpan, opt_limit, opt_retArea);
		}

		_arcPre(cx, cy, dr, w, h, r0, r1, ac, roughSpan, opt_limit, opt_retArea) {
			const { span, limitedSpan, paramT } = _arcLen(cx, cy, dr, w, h, r0, r1, roughSpan, opt_limit, opt_retArea);

			if (opt_limit === null) {
			} else {
				const t = paramT, tp = 1 - t;
				r1 = tp * r0 + t * r1;
			}
			// r1の角度を計算
			const s1 = w * Math.cos(r1), t1 = h * Math.sin(r1);
			const a1 = Math.atan2(-h * h * s1, w * w * t1) + (ac ? 0 : Math.PI);  // 時計回り、反時計回りの接線の傾き
			const dirEnd = deg(dr) + deg(a1);

			if (this._edge) {
				this._arcDraw(dirEnd, cx, cy, dr, w, h, r0, r1, span, limitedSpan, this._edge);
			} else {
				// r1の座標を計算
				const rsin = Math.sin(dr), rcos = Math.cos(dr);
				const sp = s1 * rcos - t1 * rsin, tp = s1 * rsin + t1 * rcos;
				this._handler.arcOrMoveTo(cx, cy, dr, w, h, r0, r1, ac, dirEnd, cx + sp, cy + tp);
			}
			return limitedSpan;
		}

		_arcDraw(dirEnd, cx, cy, dr, w, h, r0, r1, span, limitedSpan, edge) {
			const nd = this._normalDir;
			const rsin = Math.sin(dr), rcos = Math.cos(dr);
			let px = w * Math.cos(r0), py = h * Math.sin(r0), l = 0;

			for (let i = 1, I = Math.ceil(limitedSpan); i <= I; i += 1) {
				const t = i / I, tp = 1 - t;
				const r = tp * r0 + t * r1;
				const x = w * Math.cos(r), y = h * Math.sin(r);
				const at = Math.atan2(y - py, x - px);
				const de = (i === I) ? dirEnd : deg(at + dr);
				l += Math.sqrt((x - px) * (x - px) + (y - py) * (y - py));
				px = x; py = y;

				const nD = edge(l, span);
				let nXd = 0, nYd = 0;
				if (0 !== nD) {
					nXd = nD * Math.cos(at + nd);
					nYd = nD * Math.sin(at + nd);
				}
				const xr = cx + (x + nXd) * rcos - (y + nYd) * rsin;
				const yr = cy + (x + nXd) * rsin + (y + nYd) * rcos;
				this._handler.lineOrMoveTo(xr, yr, de);
			}
		}

	}


	// Default handler generation function -------------------------------------


	/**
	 * Make a default handler
	 * @param {Paper|CanvasRenderingContext2D} ctx Paper or canvas context
	 * @return {*} Handler
	 */
	const makeDefaultHandler = function (ctx) {
		return {
			/**
			 * Draw a line or change the location of the pen
			 * @param {number} x X coordinate of end point
			 * @param {number} y Y coordinate of end point
			 * @param {number} dir End direction
			 */
			lineOrMoveTo: function (x, y, dir) {
				ctx.lineTo(x, y);
			},
			/**
			 * Draw a quadratic Bezier curve or change the location of the pen
			 * @param {number} x1 X coordinate of handle
			 * @param {number} y1 Y coordinate of handle
			 * @param {number} x2 X coordinate of end point
			 * @param {number} y2 Y coordinate of end point
			 * @param {number} dir End direction
			 */
			quadCurveOrMoveTo: function (x1, y1, x2, y2, dir) {
				ctx.quadraticCurveTo(x1, y1, x2, y2);
			},
			/**
			 * Draw a cubic Bezier curve or change the location of the pen
			 * @param {number} x1 X coordinate of handle 1
			 * @param {number} y1 Y coordinate of handle 1
			 * @param {number} x2 X coordinate of handle 2
			 * @param {number} y2 Y coordinate of handle 2
			 * @param {number} x3 X coordinate of end point
			 * @param {number} y3 Y coordinate of end point
			 * @param {number} dir End direction
			 */
			bezierCurveOrMoveTo: function (x1, y1, x2, y2, x3, y3, dir) {
				ctx.bezierCurveTo(x1, y1, x2, y2, x3, y3);
			},
			/**
			 * Draw an arc or change the location of the pen
			 * @param {number} cx X coordinate of center
			 * @param {number} cy Y coordinate of center
			 * @param {number} dr Direction
			 * @param {number} w Width
			 * @param {number} h Height
			 * @param {number} r0 Start angle
			 * @param {number} r1 End angle
			 * @param {boolean} ac Whether it is counterclockwise
			 * @param {number} dir End direction
			 * @param {number} xx X coordinate of end point
			 * @param {number} yy Y coordinate of end point
			 */
			arcOrMoveTo: function (cx, cy, dr, w, h, r0, r1, ac, dir, xx, yy) {
				eclipse(ctx, cx, cy, w, h, dr, r0, r1, ac);
			}
		};
	};


	/**
	 * Edge generation functions
	 * @author Takuto Yanagida
	 * @version 2019-09-04
	 */


	const NORMAL_EDGE = null;


	/**
	 * Make a straight edge
	 * @return {function(number, number): number} Straight edge
	 */
	const normalEdge = function () {
		return NORMAL_EDGE;
	};

	/**
	 * Make a sine wave edge
	 * @param {number=} [length=10] Length
	 * @param {number=} [amplitude=10] Amplitude
	 * @param {*=} [opt={}] Options
	 * @return {function(number, number): number} Sine wave edge
	 */
	const sineEdge = function (length = 10, amplitude = 10, opt = {}) {
		return _makeEdge(length, amplitude, opt, function (p) {
			return Math.sin(p * Math.PI * 2);
		}, -0.25, 0.25);
	};

	/**
	 * Make a square wave edge
	 * @param {number=} [length=10] Length
	 * @param {number=} [amplitude=10] Amplitude
	 * @param {*=} [opt={}] Options
	 * @return {function(number, number): number} Square wave edge
	 */
	const squareEdge = function (length = 10, amplitude = 10, opt = {}) {
		return _makeEdge(length, amplitude, opt, function (p) {
			if (p < 0.01) return p / 0.01;
			if (p < 0.49) return 1;
			if (p < 0.51) return -(p - 0.5) / 0.01;
			if (p < 0.99) return -1;
			return (p - 1) / 0.01;
		}, -0.01, 0.01);
	};

	/**
	 * Make a triangle wave edge
	 * @param {number=} [length=10] Length
	 * @param {number=} [amplitude=10] Amplitude
	 * @param {*=} [opt={}] Options
	 * @return {function(number, number): number} Triangle wave edge
	 */
	const triangleEdge = function (length = 10, amplitude = 10, opt = {}) {
		return _makeEdge(length, amplitude, opt, function (p) {
			if (p < 0.25) return p / 0.25;
			if (p < 0.75) return -(p - 0.5) / 0.25;
			return (p - 1) / 0.25;
		}, -0.25, 0.25);
	};

	/**
	 * Make a sawtooth wave edge
	 * @param {number=} [length=10] Length
	 * @param {number=} [amplitude=10] Amplitude
	 * @param {*=} [opt={}] Options
	 * @return {function(number, number): number} Sawtooth wave edge
	 */
	const sawtoothEdge = function (length = 10, amplitude = 10, opt = {}) {
		return _makeEdge(length, amplitude, opt, function (p) {
			if (p < 0.49) return p / 0.49;
			if (p < 0.51) return -(p - 0.5) / 0.01;
			return (p - 1) / 0.49;
		}, -0.49, 0.49);
	};

	/**
	 * Make an edge of the absolute value of the sine function
	 * @param {number=} [length=10] Length
	 * @param {number=} [amplitude=10] Amplitude
	 * @param {*=} [opt={}] Options
	 * @return {function(number, number): number} Edge of the absolute value of the sine function
	 */
	const absSineEdge = function (length = 10, amplitude = 10, opt = {}) {
		return _makeEdge(length, amplitude, opt, function (p) {
			return Math.abs(Math.sin(p * Math.PI + Math.PI / 6)) * 2 - 1;
		}, -1 / 6, 1 / 3);
	};

	/**
	 * Make a noise edge
	 * @param {number=} [length=10] Length
	 * @param {number=} [amplitude=10] Amplitude
	 * @param {*=} [opt={}] Options
	 * @return {function(number, number): number} Noise edge
	 */
	const noiseEdge = function (length = 10, amplitude = 10, opt = {}) {
		const amp = 2 * amplitude;

		const p = (CROQUJS.currentPaper()) ? CROQUJS.currentPaper() : null;
		let lastFrame = 0;
		let off = 0;

		return function (x, max) {
			max = Math.round(max * 100) / 100;
			const l = 1 / Math.min(length, max);
			let d = (0 | (max * l)) / max;
			if (d === (0 | d)) d += 0.01;
			let s = d * x;
			if (Math.abs(x - max) < 0.01) {
				s = 0 | s;
				if (p) off += d * max;
			}
			if (p && p.totalFrame() !== lastFrame) {
				lastFrame = p.totalFrame();
				off = 0;
			}
			return (CALC.noise(s + off) - 0.5) * amp;
		};
	};

	/**
	 * Make a mixture edge
	 * @param {function(number, number)} Edge
	 * @param {Array<function(number, number)>} Edges
	 * @return {function(number, number): number} Mixed edge
	 */
	const mixEdge = function (func, ...fs) {
		return function (x, max) {
			let v = func(x, max);
			for (let f of fs) v += f(x, max);
			return v;
		};
	};

	/**
	 * Make an edge (used only in the library)
	 * @private
	 * @param {number} length Length
	 * @param {number} amplitude Amplitude
	 * @param {*} opt Options
	 * @param {function(number): number} fn Function (Amplitude 1 through the origin)
	 * @param {number} minPhase Minimum phase
	 * @param {number} maxPhase Maximum phase
	 * @return {function(number, number): number} Edge
	 */
	const _makeEdge = function (length, amplitude, opt, fn, minPhase, maxPhase) {
		let amp = 0.5 * amplitude;
		let phase = minPhase, off = 1, rev = 1;

		if (opt.centering) {
			phase = 0;
			off = 0;
		}
		if (opt.reverse) {
			phase = maxPhase;
			rev = -1;
		}
		if (opt.flip) {
			amp *= -1;
		}
		return function (x, max) {
			const l = max / Math.max(1, (~~(max / length)));
			let p = x % l / l + phase;
			if (p < 0) p += 1;
			return (fn(p) * rev + off) * amp;
		};
	};


	// Utility functions -------------------------------------------------------


	/**
	 * Arrange the arguments of functions that draw circles and arcs
	 * @param {number|Array<number>} r Radius (horizontal radius and vertical radius if an array given)
	 * @param {number|Array<number>} deg Degree (start and end angles if an array given)
	 * @param {number} [step=1] Factor
	 * @return {dict} Parameters
	 */
	const arrangeArcParams = function (r, deg, step = 1) {
		const ap = {};

		// Arrange the radius argument (negative also OK)
		if (Array.isArray(r)) {
			if (r.length < 2) throw new Error('PATH::arrangeArcParams: Although the radius r is an array, it contains only one number.');
			ap.w = r[0] * step;
			ap.h = r[1] * step;
		} else {
			ap.w = ap.h = r * step;
		}
		if (-E < ap.w && ap.w < E) ap.w = (0 < ap.w) ? E : -E;
		if (-E < ap.h && ap.h < E) ap.h = (0 < ap.h) ? E : -E;

		// Arrange the degree argument
		if (Array.isArray(deg)) {
			if (deg.length < 2) throw new Error('PATH::arrangeArcParams: Although the angle deg is an array, it contains only one number.');
			ap.deg0 = deg[0];
			ap.deg1 = deg[1];
		} else {
			ap.deg0 = 0;
			ap.deg1 = deg;
		}
		return ap;
	};

	/**
	 * Draw a circle
	 * @param {Paper|CanvasRenderingContext2D} ctx Paper or canvas context
	 * @param {number} cx X coordinate of center
	 * @param {number} cy Y coordinate of center
	 * @param {number} w Width
	 * @param {number} h Height
	 * @param {number} dr Direction
	 * @param {number} r0 Start radian
	 * @param {number} r1 End radian
	 * @param {boolean} ac Whether it is counterclockwise
	 */
	const eclipse = function (ctx, cx, cy, w, h, dr, r0, r1, ac) {
		// Negative radius is also OK
		if (w <= 0 || h <= 0 || ctx.ellipse === undefined) {
			ctx.save();
			ctx.translate(cx, cy);
			ctx.rotate(dr);
			ctx.scale(w, h);
			ctx.arc(0, 0, 1, r0, r1, ac);
			ctx.restore();
		} else {
			ctx.ellipse(cx, cy, w, h, dr, r0, r1, ac);
		}
	};


	// Create a library --------------------------------------------------------


	return {
		Liner,
		makeDefaultHandler,

		normalEdge,
		sineEdge,
		squareEdge,
		triangleEdge,
		sawtoothEdge,
		absSineEdge,
		noiseEdge,
		mixEdge,

		arrangeArcParams,
		eclipse,
	};

}());
