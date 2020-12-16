/**
 * Ruler library (RULER)
 *
 * @author Takuto Yanagida
 * @version 2020-04-22
 */


/**
 * Library variable
 */
const RULER = (function () {

	'use strict';


	// Utilities used only in the library --------------------------------------


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
	 * Make an angle between 0 to 360 degrees
	 * @param {number} deg Degree
	 * @return {number} Degree
	 */
	const checkDegRange = function (deg) {
		deg %= 360;
		if (deg < 0) deg += 360;
		return deg;
	};


	/**
	 * Ruler
	 * @version 2020-12-16
	 */
	class Ruler {

		/**
		 * Make a ruler
		 * @param {Paper|CanvasRenderingContext2D} ctx Paper or canvas context
		 */
		constructor(ctx) {
			if (typeof STYLE === 'undefined') throw new Error('Style library is needed.');
			if (typeof PATH === 'undefined') throw new Error('Path library is needed.');

			this._x = 0;
			this._y = 0;
			this._beginX = 0;
			this._beginY = 0;
			this._toBeResetArea = true;
			this._hasPath = false;

			this._ctx = ctx;
			this._stack = [];

			this._liner = new PATH.Liner({
				lineOrMoveTo: (x, y, dir) => {
					ctx.lineTo(x, y);
					this._x = x;
					this._y = y;
				},
				quadCurveOrMoveTo: (x1, y1, x2, y2, dir) => {
					ctx.quadraticCurveTo(x1, y1, x2, y2);
					this._x = x2;
					this._y = y2;
				},
				bezierCurveOrMoveTo: (x1, y1, x2, y2, x3, y3, dir) => {
					ctx.bezierCurveTo(x1, y1, x2, y2, x3, y3);
					this._x = x3;
					this._y = y3;
				},
				arcOrMoveTo: (cx, cy, dr, w, h, r0, r1, ac, dir, xx, yy) => {
					PATH.eclipse(ctx, cx, cy, w, h, dr, r0, r1, ac);
					this._x = xx;
					this._y = yy;
				}
			});
			this._area = { fromX: null, toX: null, left: null, right: null, fromY: null, toY: null, top: null, bottom: null, sqLen: null };
			this._stroke = new STYLE.Stroke();
			this._fill = new STYLE.Fill();
			this._edge = null;
		}

		/**
		 * Reset the area
		 * @private
		 * @param {number} x X coordinate
		 * @param {number} y Y coordinate
		 */
		_resetArea(x, y) {
			this._area.fromX = this._area.left = this._area.right = x;
			this._area.fromY = this._area.top = this._area.bottom = y;
			this._area.sqLen = 0;
			this._toBeResetArea = false;
			this._beginX = x;
			this._beginY = y;
		}

		/**
		 * Save the current state
		 * @param {boolean=} [opt_savePaper=false] Whether to save the paper state too
		 * @return {Ruler} This ruler
		 */
		save(opt_savePaper = false) {
			if (opt_savePaper === true) this._ctx.save();
			this._stack.push(this._getState());
			return this;
		}

		/**
		 * Restore previous state
		 * @param {boolean=} [opt_restorePaper=false] Whether to restore the paper state too
		 * @return {Ruler} This ruler
		 */
		restore(opt_restorePaper = false) {
			this._setState(this._stack.pop());
			if (opt_restorePaper === true) this._ctx.restore();
			return this;
		}

		/**
		 * Get state (used only in the library)
		 * @private
		 * @return {Array} State
		 */
		_getState() {
			return [
				this._x, this._y,  // 以下、順番に依存関係あり
				this._beginX, this._beginY = 0,
				this._toBeResetArea, this._hasPath,
				Object.assign({}, this._area),
				new STYLE.Stroke(this._stroke),
				new STYLE.Fill(this._fill),
				this._liner.edge(),
			];
		}

		/**
		 * Set state (used only in the library)
		 * @private
		 * @param {Array} t State
		 */
		_setState(t) {
			this._x = t[0]; this._y = t[1];
			this._beginX = t[2]; this._beginY = t[3];
			this._toBeResetArea = t[4]; this._hasPath = t[5];
			this._area = t[6];
			this._stroke = t[7];
			this._fill = t[8];
			this._liner.edge(t[9]);
		}


		// Change of drawing state -------------------------------------------------


		/**
		 * Stroke style
		 * @param {Stroke=} opt_stroke Stroke style (optional)
		 * @return {Stroke|Ruler} Stroke style, or this ruler
		 */
		stroke(opt_stroke) {
			if (opt_stroke === undefined) return this._stroke;
			this._stroke = new STYLE.Stroke(opt_stroke);
			return this;
		}

		/**
		 * Filling style
		 * @param {Fill=} opt_fill Filling style (optional)
		 * @return {Fill|Ruler} Filling style, or this ruler
		 */
		fill(opt_fill) {
			if (opt_fill === undefined) return this._fill;
			this._fill = new STYLE.Fill(opt_fill);
			return this;
		}

		/**
		 * Edge
		 * @param {function=} func Function to determine the edge
		 * @return {function|Ruler} Edge, or this ruler
		 */
		edge(func, ...fs) {
			if (func === undefined) return this._liner.edge();
			this._liner.edge(func, ...fs);
			return this;
		}


		// Paper operation ---------------------------------------------------------


		/**
		 * Get the paper
		 * @return {Paper|CanvasRenderingContext2D} Paper or canvas context
		 */
		context() {
			return this._ctx;
		}


		// Draw a shape ------------------------------------------------------------


		/**
		 * Begin a path
		 * @return {Ruler} This ruler
		 */
		beginPath() {
			this._ctx.beginPath();
			this._toBeResetArea = true;
			this._hasPath = false;
			return this;
		}

		/**
		 * Close the path
		 * @return {Ruler} This ruler
		 */
		closePath() {
			this.lineTo(this._beginX, this._beginY);
			return this;
		}

		/**
		 * Move to
		 * @param {number} x X coordinate
		 * @param {number} y Y coordinate
		 * @return {Ruler} This ruler
		 */
		moveTo(x, y) {
			this._ctx.moveTo(x, y);
			this._x = x;
			this._y = y;
			this._hasPath = true;
			return this;
		}

		/**
		 * Draw a line
		 * @param {number} x1 X coordinate of end point
		 * @param {number} y1 Y coordinate of end point
		 * @return {Ruler} This ruler
		 */
		lineTo(x1, y1) {
			if (!this._hasPath) {
				return this.moveTo(x1, y1);
			}
			const { _x: x0, _y: y0 } = this;
			if (this._toBeResetArea) this._resetArea(x0, y0);
			this._liner.lineAbs(x0, y0, x1, y1, null, this._area);
			return this;
		}

		/**
		 * Draw a quadratic Bezier curve
		 * @param {number} x1 X coordinate of handle
		 * @param {number} y1 Y coordinate of handle
		 * @param {number} x2 X coordinate of end point
		 * @param {number} y2 Y coordinate of end point
		 * @return {Ruler} This ruler
		 */
		quadraticCurveTo(x1, y1, x2, y2) {
			if (!this._hasPath) this.moveTo(x1, y1);
			const { _x: x0, _y: y0 } = this;
			if (this._toBeResetArea) this._resetArea(x0, y0);
			this._liner.quadCurveAbs(x0, y0, x1, y1, x2, y2, null, this._area);
			return this;
		}

		/**
		 * Draw a cubic Bezier curve
		 * @param {*} x1 X coordinate of handle 1
		 * @param {*} y1 Y coordinate of handle 1
		 * @param {*} x2 X coordinate of handle 2
		 * @param {*} y2 Y coordinate of handle 2
		 * @param {*} x3 X coordinate of end point
		 * @param {*} y3 Y coordinate of end point
		 * @return {Ruler} This ruler
		 */
		bezierCurveTo(x1, y1, x2, y2, x3, y3) {
			if (!this._hasPath) this.moveTo(x1, y1);
			const { _x: x0, _y: y0 } = this;
			if (this._toBeResetArea) this._resetArea(x0, y0);
			this._liner.bezierCurveAbs(x0, y0, x1, y1, x2, y2, x3, y3, null, this._area);
			return this;
		}

		/**
		 * Draw an arc
		 * @param {number} cx X coordinate of center
		 * @param {number} cy Y coordinate of center
		 * @param {number} radius Radius
		 * @param {number} startAngle Start angle
		 * @param {number} endAngle End angle
		 * @param {boolean=} [anticlockwise=false] Whether it is counterclockwise
		 * @return {Ruler} This ruler
		 */
		arc(cx, cy, radius, startAngle, endAngle, anticlockwise = false) {
			const x0 = cx + radius * Math.cos(rad(startAngle));
			const y0 = cy + radius * Math.sin(rad(startAngle));
			if (!this._hasPath) {
				this.moveTo(x0, y0);
			} else {
				this.lineTo(x0, y0);
			}
			if (this._toBeResetArea) this._resetArea(x0, y0);
			this._liner.arc(cx, cy, 0, radius, radius, startAngle, endAngle, anticlockwise, null, this._area);
			return this;
		}

		arcTo() {
		}

		/**
		 * Draw a circle
		 * @param {number} x X coordinate of center
		 * @param {number} y Y coordinate of center
		 * @param {number} radiusX Width
		 * @param {number} radiusY Height
		 * @param {number} rotation Rotation
		 * @param {number} startAngle Start angle
		 * @param {number} endAngle End angle
		 * @param {boolean=} [anticlockwise=false] Whether it is counterclockwise
		 * @return {Ruler} This ruler
		 */
		ellipse(x, y, radiusX, radiusY, rotation, startAngle, endAngle, anticlockwise = false) {
			const s0 = radiusX * Math.cos(rad(startAngle)), t0 = radiusY * Math.sin(rad(startAngle));
			const rsin = Math.sin(rad(rotation)), rcos = Math.cos(rad(rotation));
			const x0 = x + s0 * rcos - t0 * rsin;
			const y0 = y + s0 * rsin + t0 * rcos;
			if (!this._hasPath) {
				this.moveTo(x0, y0);
			} else {
				this.lineTo(x0, y0);
			}
			if (this._toBeResetArea) this._resetArea(x0, y0);
			this._liner.arc(x, y, rotation, radiusX, radiusY, startAngle, endAngle, anticlockwise, null, this._area);
			return this;
		}

		/**
		 * Draw a rectangle
		 * @param {number} x X coordinate
		 * @param {number} y Y coordinate
		 * @param {number} width Width
		 * @param {number} height Height
		 * @return {Ruler} This ruler
		 */
		rect(x, y, width, height) {
			this._resetArea(x, y);
			this._ctx.beginPath();

			this._ctx.moveTo(x, y);
			this._liner.line(x, y, 0, width, null, this._area);
			this._liner.line(x + width, y, 90, height, null, this._area);
			this._liner.line(x + width, y + height, 180, width, null, this._area);
			this._liner.line(x, y + height, -90, height, null, this._area);
			return this;
		}

		/**
		 * Actually draw
		 * @param {string} mode Mode
		 * @return {Ruler} This ruler
		 */
		draw(mode) {
			let ms = mode;
			ms = ms.replace('fill', 'f');
			ms = ms.replace('stroke', 's');
			ms = ms.replace('clip', 'c');
			for (const m of ms) {
				switch (m) {
					case 'f':
						this._fill.draw(this._ctx, this._area);
						break;
					case 's':
						this._stroke.draw(this._ctx, this._area);
						break;
					case 'c':
						if (this._isClipable) this._ctx.clip();
						break;
				}
			}
			return this;
		}


		// Direct drawing functions ------------------------------------------------


		/**
		 * Draw a circle
		 * @param {number} cx X coordinate of center
		 * @param {number} cy Y coordinate of center
		 * @param {number|Array<number>} r Radius (horizontal radius and vertical radius if an array given)
		 * @param {number=} [opt_dir=0] Direction
		 * @param {number=|Array<number>} [opt_deg=360] Degree (start and end angles if an array given)
		 * @param {boolean=} [opt_anticlockwise=false] Whether it is counterclockwise
		 * @return {Ruler} This ruler
		 */
		circle(cx, cy, r, opt_dir = 0, opt_deg = 360, opt_anticlockwise = false) {
			const p = PATH.arrangeArcParams(r, opt_deg, 1);

			const r0 = rad(p.deg0), s0 = p.w * Math.cos(r0), t0 = p.h * Math.sin(r0);
			const dr = rad(opt_dir), rsin = Math.sin(dr), rcos = Math.cos(dr);
			const sp = s0 * rcos - t0 * rsin, tp = s0 * rsin + t0 * rcos;

			this._resetArea(cx + sp, cy + tp);
			this._ctx.beginPath();

			this._ctx.moveTo(cx + sp, cy + tp);
			this._liner.arc(cx, cy, opt_dir, p.w, p.h, p.deg0, p.deg1, opt_anticlockwise, null, this._area);
			return this;
		};

		/**
		 * Draw a line
		 * @param {number} fromX X coordinate of start point
		 * @param {number} fromY Y coordinate of start point
		 * @param {number} toX X coordinate of end point
		 * @param {number} toY Y coordinate of end point
		 * @return {Ruler} This ruler
		 */
		line(fromX, fromY, toX, toY) {
			const dr = Math.atan2(toY - fromY, toX - fromX);
			const dest = Math.sqrt((toX - fromX) * (toX - fromX) + (toY - fromY) * (toY - fromY));

			this._resetArea(fromX, fromY);
			this._ctx.beginPath();

			this._ctx.moveTo(fromX, fromY);
			this._liner.line(fromX, fromY, deg(dr), dest, null, this._area);
			return this;
		};

		/**
		 * Draw a dot
		 * @param {number} x X coordinate
		 * @param {number} y Y coordinate
		 * @return {Ruler} This ruler
		 */
		dot(x, y) {
			this._ctx.beginPath();
			this._ctx.rect(x, y, 1, 1);
			return this;
		}

	}


	// Create a library --------------------------------------------------------


	// Function alias
	const aliasMap = {
		context: ['paper'],
	};

	// Register function alias
	for (const [orig, aliases] of Object.entries(aliasMap)) {
		for (let alias of aliases) {
			Ruler.prototype[alias] = Ruler.prototype[orig];
		}
	}

	return { Ruler };

}());
