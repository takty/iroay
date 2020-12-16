/**
 * Turtle library (TURTLE)
 *
 * A library for moving the turtle and drawing pictures.
 *
 * @author Takuto Yanagida
 * @version 2020-04-22
 */


/**
 * Library variable
 */
const TURTLE = (function () {

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
	 * Turtle base
	 * @version 2020-12-16
	 */
	class TurtleBase {

		/**
		 * Make a turtle
		 * @param {Paper|CanvasRenderingContext2D} ctx Paper or canvas context
		 * @param {number=} normalDeg Normal degree
		 */
		constructor(ctx, normalDeg) {
			if (typeof STYLE === 'undefined') throw new Error('Style library is needed.');
			if (typeof PATH === 'undefined') throw new Error('Path library is needed.');

			this._ctx = ctx;
			this._stack = [];

			// Do not change the following variables directly
			this._x       = 0;
			this._y       = 0;
			this._dir     = 0;
			this._step    = 1;
			this._homeX   = 0;
			this._homeY   = 0;
			this._homeDir = 0;

			this._liner = new PATH.Liner({
				lineOrMoveTo: (x, y, dir) => {
					if (this._pen) this._ctx.lineTo(x, y);
					this._changePos(x, y, dir + 90);
				},
				quadCurveOrMoveTo: (x1, y1, x2, y2, dir) => {
					if (this._pen) this._ctx.quadraticCurveTo(x1, y1, x2, y2);
					this._changePos(x2, y2, dir + 90);
				},
				bezierCurveOrMoveTo: (x1, y1, x2, y2, x3, y3, dir) => {
					if (this._pen) this._ctx.bezierCurveTo(x1, y1, x2, y2, x3, y3);
					this._changePos(x3, y3, dir + 90);
				},
				arcOrMoveTo: (cx, cy, dr, w, h, r0, r1, ac, dir, xx, yy) => {
					if (this._pen) PATH.eclipse(this._ctx, cx, cy, w, h, dr, r0, r1, ac);
					this._changePos(xx, yy, dir + 90);
				}
			}, normalDeg ? rad(normalDeg) : undefined);

			this._area = { fromX: 0, toX: 0, left: 0, right: 0, fromY: 0, toY: 0, top: 0, bottom: 0, sqLen: 0 };
			this._mode = 'stroke';
			this._stroke = new STYLE.Stroke();
			this._fill = new STYLE.Fill();
			this._curMode = this._mode;
			this._pen = false;

			this._isClipable = true;
		}

		/**
		 * Make a child turtle
		 * @return {*} Child turtle
		 */
		makeChild() {
			const child = new this.constructor(this._ctx);
			child._setState(this._getState(), false);
			// Make it impossible to make up and down the pen
			child.pen = () => { return this; };
			return child;
		}

		/**
		 * Save the current state
		 * @param {boolean=} [opt_savePaper=false] Whether to save the paper state too
		 * @return {TurtleBase} This turtle base
		 */
		save(opt_savePaper = false) {
			if (opt_savePaper === true) this._ctx.save();
			this._stack.push(this._getState());
			return this;
		}

		/**
		 * Restore previous state
		 * @param {boolean=} [opt_restorePaper=false] Whether to restore the paper state too
		 * @return {TurtleBase} This turtle base
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
				// Below, there is a dependency in order
				this._x, this._y, this._dir,
				this._step,
				this._liner.edge(),
				this._homeX, this._homeY, this._homeDir,
				Object.assign({}, this._area),
				this._mode,
				new STYLE.Stroke(this._stroke),
				new STYLE.Fill(this._fill),
				this._curMode,
				// The state of the pen is last
				this._pen,
			];
		}

		/**
		 * Set state (used only in the library)
		 * @private
		 * @param {Array} t State
		 * @param {boolean=} [applyPenState=true] Whether to set the state of the pen
		 */
		_setState(t, applyPenState = true) {
			// Below, there is a dependency in order
			this._changePos(t[0], t[1], t[2]);
			this.step(t[3]);
			this._liner.edge(t[4]);
			this._homeX = t[5]; this._homeY = t[6]; this._homeDir = t[7];
			this._area = t[8];
			this.mode(t[9]);
			this._stroke = t[10];
			this._fill = t[11];
			this._curMode = t[12];
			// The state of the pen should be set at the end (because the area etc. are referred)
			if (applyPenState === true) this.pen(t[13]);
		}

		/**
		 * Called when changing places and directions (used only in the library)
		 * @private
		 * @param {number} x x coordinate
		 * @param {number} y y coordinate
		 * @param {number=} opt_deg Degree (optional)
		 */
		_changePos(x, y, opt_deg) {
			this._x = x;
			this._y = y;
			if (opt_deg !== undefined) this._dir = checkDegRange(opt_deg);
		}

		/**
		 * Placeholder for animation (check skip animation) (used only in the library)
		 * @private
		 */
		_getPower() {
			return null;
		}

		/**
		 * Placeholder for animation (check the end of animation) (used only in the library)
		 * @private
		 * @param {number} consumption
		 */
		_usePower(consumption) {
		}


		// Change of place or direction --------------------------------------------


		/**
		 * Go forward
		 * @param {number} step Number of steps
		 * @return {TurtleBase} This turtle base
		 */
		go(step) {
			return this._goPrep(step);
		}

		/**
		 * Go back
		 * @param {number} step Number of steps
		 * @return {TurtleBase} This turtle base
		 */
		back(step) {
			// The reverse of going forward
			return this._goPrep(-step);
		}

		/**
		 * Go (used only in the library)
		 * @private
		 * @param {number} step Number of steps
		 * @return {TurtleBase} This turtle base
		 */
		_goPrep(step) {
			const limit = this._getPower();
			if (limit === 0) return this;
			this._usePower(this._doGo(step, limit));
			return this;
		}

		/**
		 * Actually go (used only in the library)
		 * @private
		 * @param {number} step Number of steps
		 * @param {number} limit Limitation
		 * @param {function=} [before=null] Function to be called before it actually moves
		 * @return {number} Amount actually moved
		 */
		_doGo(step, limit, before = null) {
			const x = this._x, y = this._y, dir_ = this._dir - 90, d = step * this._step;
			if (before) before(x, y, dir_, d);
			return this._liner.line(x, y, dir_, d, limit, this._area);
		}

		/**
		 * Turn right
		 * @param {number} deg Degree
		 * @return {TurtleBase} This turtle base
		 */
		turnRight(deg) {
			return this._turnPrep(deg);
		}

		turnLeft(deg) {
			// The reverse of turning to the right
			return this._turnPrep(-deg);
		}

		/**
		 * Turn (used only in the library)
		 * @private
		 * @param {number} deg Degree
		 * @return {TurtleBase} This turtle base
		 */
		_turnPrep(deg) {
			const limit = this._getPower();
			if (limit === 0) return this;
			this._usePower(this._doTurn(deg, limit));
			return this;
		}

		/**
		 * Actually change direction (used only in the library)
		 * @private
		 * @param {number} deg Degree
		 * @param {number} limit Limitation
		 * @param {function=} [before=null] Function to be called before it actually moves
		 * @return {number} Amount actually moved
		 */
		_doTurn(deg, limit, before = null) {
			const sign = (deg < 0 ? -1 : 1), d = sign * deg;
			let cons;
			if (limit !== null) {
				const f = (90 < d) ? 1 : ((d < 10) ? 5 : (5 - 4 * (d - 10) / 80));  // 10 ~ 90 => 5 ~ 1
				const need = d * f;
				if (limit < need) deg = sign * limit / f;
				cons = Math.min(limit, need);
			} else {
				cons = d;
			}
			if (before) before(this._x, this._y);
			this._changePos(this._x, this._y, this._dir + deg);
			return cons;
		}

		/**
		 * X coordinate
		 * @param {number=} val Value
		 * @return X coordinate, or this turtle base
		 */
		x(val) {
			if (val === undefined) return this._x;
			return this.moveTo(val, this._y);
		}

		/**
		 * Y coordinate
		 * @param {number=} val Value
		 * @return Y coordinate, or this turtle base
		 */
		y(val) {
			if (val === undefined) return this._y;
			return this.moveTo(this._x, val);
		}

		/**
		 * Direction
		 * @param {number=} deg Degree
		 * @return Degree, or this turtle base
		 */
		direction(deg) {
			if (deg === undefined) return this._dir;
			if (this._getPower() === 0) return this;
			this._changePos(this._x, this._y, deg);
			return this;
		}

		/**
		 * Move to
		 * @param {number} x X coordinate
		 * @param {number} y Y coordinate
		 * @param {number=} opt_dir Direction (optional)
		 * @return {TurtleBase} This turtle base
		 */
		moveTo(x, y, opt_dir) {
			if (this._getPower() === 0) return this;
			if (this._pen) {
				const dir = Math.atan2(y - this._y, x - this._x) * 180.0 / Math.PI;
				const dist = Math.sqrt((x - this._x) * (x - this._x) + (y - this._y) * (y - this._y));
				this._liner.line(this._x, this._y, dir, dist, null, this._area);
			}
			this._changePos(x, y, opt_dir);
			return this;
		}

		/**
		 * Gather to
		 * @param {TurtleBase} turtle Another turtle
		 * @return {TurtleBase} This turtle base
		 */
		gatherTo(turtle) {
			return this.moveTo(turtle._x, turtle._y, turtle._dir);
		}

		/**
		 * Go back to home (Return to the first place and direction)
		 * @return {TurtleBase} This turtle base
		 */
		home() {
			return this.moveTo(this._homeX, this._homeY, this._homeDir);
		}

		/**
		 * Set your current location to 'home'
		 * @return {TurtleBase} This turtle base
		 */
		setHome() {
			if (this._getPower() === 0) return this;
			this._homeX = this._x;
			this._homeY = this._y;
			this._homeDir = this._dir;
			return this;
		}


		// Change of place and direction -------------------------------------------


		/**
		 * Curve to the right
		 * @param {number} step0 Number of steps 1
		 * @param {number} deg Degree 1
		 * @param {number} step1 Number of steps 2
		 * @param {number=} opt_deg Degree 2 (optional)
		 * @param {number=} opt_step Number of steps 3 (optional)
		 * @return {TurtleBase} This turtle base
		 */
		curveRight(step0, deg, step1, opt_deg, opt_step) {
			return this._curvePrep(step0, deg, step1, opt_deg, opt_step);
		}

		/**
		 * Curve to the left
		 * @param {number} step0 Number of steps 1
		 * @param {number} deg Degree 1
		 * @param {number} step1 Number of steps 2
		 * @param {number=} opt_deg Degree 2 (optional)
		 * @param {number=} opt_step Number of steps 3 (optional)
		 * @return {TurtleBase} This turtle base
		 */
		curveLeft(step0, deg, step1, opt_deg, opt_step) {
			if (opt_deg === undefined) return this._curvePrep(step0, -deg, step1);
			return this._curvePrep(step0, -deg, step1, -opt_deg, opt_step);
		}

		/**
		 * Curve (used only in the library)
		 * @private
		 * @param {number} step0 Number of steps 1
		 * @param {number} deg Degree 1
		 * @param {number} step1 Number of steps 2
		 * @param {number=} opt_deg Degree 2 (optional)
		 * @param {number=} opt_step Number of steps 3 (optional)
		 * @return {TurtleBase} This turtle base
		 */
		_curvePrep(step0, deg, step1, opt_deg, opt_step) {
			const limit = this._getPower();
			if (limit === 0) return this;
			this._usePower(this._doCurve(step0, deg, step1, opt_deg, opt_step, limit));
			return this;
		}

		/**
		 * Actually curve (used only in the library)
		 * @private
		 * @param {number} step0 Number of steps 1
		 * @param {number} deg Degree 1
		 * @param {number} step1 Number of steps 2
		 * @param {number=} opt_deg Degree 2 (optional)
		 * @param {number=} opt_step Number of steps 3 (optional)
		 * @param {number} limit Limitation
		 * @param {function=} [before=null] Function to be called before it actually moves
		 * @return {number} Amount actually moved
		 */
		_doCurve(step0, deg, step1, opt_deg, opt_step, limit, before = null) {
			const x = this._x, y = this._y, dir_ = this._dir - 90, s = this._step;
			const d0 = step0 * s, d1 = step1 * s;

			if (opt_deg === undefined) {
				if (before) before(x, y, dir_, d0, deg, d1);
				return this._liner.quadCurve(x, y, dir_, d0, deg, d1, limit, this._area);
			} else {
				const d2 = opt_step * s;
				if (before) before(x, y, dir_, d0, deg, d1, opt_deg, d2);
				return this._liner.bezierCurve(x, y, dir_, d0, deg, d1, opt_deg, d2, limit, this._area);
			}
		}

		/**
		 * Draw an arc that turns to the right
		 * @param {number|Array<number>} r Radius (horizontal radius and vertical radius if an array given)
		 * @param {number|Array<number>} deg Degree (start and end angles if an array given)
		 * @return {TurtleBase} This turtle base
		 */
		arcRight(r, deg) {
			return this._arcPrep(r, deg, false);
		}

		/**
		 * Draw an arc that turns to the left
		 * @param {number|Array<number>} r Radius (horizontal radius and vertical radius if an array given)
		 * @param {number|Array<number>} deg Degree (start and end angles if an array given)
		 * @return {TurtleBase} This turtle base
		 */
		arcLeft(r, deg) {
			return this._arcPrep(r, deg, true);
		}

		/**
		 * Draw an arc (used only in the library)
		 * @private
		 * @param {number|Array<number>} r Radius (horizontal radius and vertical radius if an array given)
		 * @param {number|Array<number>} deg Degree (start and end angles if an array given)
		 * @param {boolean} isLeft Whether it is left
		 * @return {TurtleBase} This turtle base
		 */
		_arcPrep(r, deg, isLeft) {
			const limit = this._getPower();
			if (limit === 0) return this;
			this._usePower(this._doArc(r, deg, isLeft, limit));
			return this;
		}

		/**
		 * Actually draw an arc (used only in the library)
		 * @private
		 * @param {number|Array<number>} r Radius (horizontal radius and vertical radius if an array given)
		 * @param {number|Array<number>} deg Degree (start and end angles if an array given)
		 * @param {boolean} isLeft Whether it is left
		 * @param {number} limit Limitation
		 * @param {function=} [before=null] Function to be called before it actually moves
		 * @return {number} Amount actually moved
		 */
		_doArc(r, deg, isLeft, limit, before = null) {
			const p = PATH.arrangeArcParams(r, deg, this._step);
			// Since it is the inclination of the tangent in the clockwise direction, add PI
			const rev = isLeft ? 0 : Math.PI;

			if (isLeft) {
				p.deg0 = -p.deg0;
				p.deg1 = -p.deg1;
			} else {
				p.deg0 = p.deg0 + 180;
				p.deg1 = p.deg1 + 180;
			}
			const r0 = rad(p.deg0);
			const s0 = p.w * Math.cos(r0), t0 = p.h * Math.sin(r0);
			const a0 = Math.atan2(-(p.h * p.h * s0), (p.w * p.w * t0)) + rev;

			const rot = rad(this._dir - 90) - a0;
			const lrsin = Math.sin(rot), lrcos = Math.cos(rot);
			const lsp = this._x + -s0 * lrcos - -t0 * lrsin;
			const ltp = this._y + -s0 * lrsin + -t0 * lrcos;

			if (before) before(lsp, ltp, rot, p);
			return this._liner.arc(lsp, ltp, rot * 180.0 / Math.PI, p.w, p.h, p.deg0, p.deg1, isLeft, limit, this._area);
		}


		// Others ------------------------------------------------------------------


		/**
		 * Length per step
		 * @param {number=} val Value
		 * @return {number|TurtleBase} Length per step, or this turtle base
		 */
		step(val) {
			if (val === undefined) return this._step;
			this._step = val;
			return this;
		}

		/**
		 * Seeing from the current location, what direction is there
		 * @param {number} x X coordinate of a place
		 * @param {number} y Y coordinate of a place
		 * @return {number} Degree
		 */
		getDirectionOf(x, y) {
			let d = (Math.atan2(this._y - y, this._x - x) * 180.0 / Math.PI - this._dir - 90);
			while (d < 0) d += 360;
			while (360 <= d) d -= 360;
			return d;
		}

		/**
		 * Seeing from the current location, which direction is home
		 * @return {number} Degree
		 */
		getDirectionOfHome() {
			return this.getDirectionOf(this._homeX, this._homeY);
		}

		/**
		 * Distance from current location to a certain location
		 * @param {number} x X coordinate of a place
		 * @param {number} y Y coordinate of a place
		 * @return {number} Distance
		 */
		getDistanceTo(x, y) {
			return Math.sqrt((x - this._x) * (x - this._x) + (y - this._y) * (y - this._y));
		}

		/**
		 * Distance from current location to home
		 * @return {number} Distance
		 */
		getDistanceToHome() {
			return this.getDistanceTo(this._homeX, this._homeY);
		}


		// Draw a shape ------------------------------------------------------------


		/**
		 * Draw a point
		 * @return {TurtleBase} This turtle base
		 */
		dot() {
			this._drawShape((limit) => {
				let r = this._stroke._width / 2;
				if (limit) r = Math.min(r, limit);
				const dr0 = rad(this._dir - 90), offX = r * Math.cos(dr0), offY = r * Math.sin(dr0);

				this._area.fromX = this._x - offX, this._area.fromY = this._y - offY;
				this._area.toX = this._x + offX, this._area.toY = this._y + offY;
				this._area.left = this._x - r, this._area.top = this._y - r;
				this._area.right = this._x + r, this._area.bottom = this._y + r;

				if (this._pen) this._ctx.arc(this._x, this._y, r, 0, 2 * Math.PI, false);
				return r;
			});
			return this;
		}

		/**
		 * Draw a circle
		 * @param {number|Array<number>} r Radius (horizontal radius and vertical radius if an array given)
		 * @param {number|Array<number>} deg Degree (start and end angles if an array given)
		 * @param {boolean=} [anticlockwise=false] Whether it is counterclockwise
		 * @return {TurtleBase} This turtle base
		 */
		circle(r, deg = 360, anticlockwise = false) {
			const p = PATH.arrangeArcParams(r, deg, this._step);
			const cx = this._x, cy = this._y;
			const dr0 = rad(p.deg0 - 90), s1 = p.w * Math.cos(dr0), t1 = p.h * Math.sin(dr0);
			const dr = rad(this._dir), rsin = Math.sin(dr), rcos = Math.cos(dr);
			const x0 = cx + s1 * rcos - t1 * rsin, y0 = cy + s1 * rsin + t1 * rcos;

			this._drawShape((limit) => { return this._doCircle(cx, cy, p, anticlockwise, limit, dr); }, x0, y0);
			return this;
		}

		/**
		 * Actually draw a circle (used only in the library)
		 * @private
		 * @param {number} cx X coordinate of center
		 * @param {number} cy Y coordinate of center
		 * @param {dict} p Parameters
		 * @param {boolean} anticlockwise Whether it is counterclockwise
		 * @param {number} limit Limitation
		 * @param {number} dr Direction
		 * @param {function=} [before=null] Function to be called before it actually moves
		 * @return {number} Amount actually moved
		 */
		_doCircle(cx, cy, p, anticlockwise, limit, dr, before = false) {
			if (before) before(cx, cy, p, dr);
			return this._liner.arc(cx, cy, this._dir, p.w, p.h, p.deg0 - 90, p.deg1 - 90, anticlockwise, limit, this._area);
		}

		/**
		 * Actually draw a shape (used only in the library)
		 * @private
		 * @param {function} doFunc Function
		 * @param {number=} [opt_x=null] Start point x coordinate
		 * @param {number=} [opt_y=null] Start point y coordinate
		 */
		_drawShape(doFunc, opt_x = null, opt_y = null) {
			const limit = this._getPower();
			if (limit === 0) return;
			const pen = this._pen;

			this.save();
			if (pen) this.penUp();
			if (opt_x !== null && opt_y !== null) this.moveTo(opt_x, opt_y);
			if (pen) this.penDown();
			this._usePower(doFunc(limit));
			if (pen) this.penUp();
			this.restore();
		}

		/**
		 * Draw an image
		 * @param {Image|Paper|CanvasRenderingContext2D} image Image, paper, or canvas context
		 * @param {number} cx X coordinate of center
		 * @param {number} cy Y coordinate of center
		 * @param {number=} [scale=1] Scale
		 */
		image(image, cx, cy, scale = 1) {
			const img = (image instanceof CROQUJS.Paper || image instanceof CanvasRenderingContext2D) ? image.canvas : image;
			this._ctx.save();
			this.localize();
			this._ctx.drawImage(img, -cx * scale, -cy * scale, img.width * scale, img.height * scale);
			this._ctx.restore();
		}


		// Change of drawing state -------------------------------------------------


		/**
		 * Raise up the pen
		 * @return {TurtleBase} This turtle base
		 */
		penUp() {
			return this.pen(false);
		}

		/**
		 * Put down the pen
		 * @return {TurtleBase} This turtle base
		 */
		penDown() {
			return this.pen(true);
		}

		/**
		 * Pen state
		 * @param {boolean=} val Value (true if down)
		 * @return {boolean|TurtleBase} Pen state, or this turtle base
		 */
		pen(val) {
			if (val === undefined) return this._pen;
			if (this._pen === false && val === true) {
				this._ctx.beginPath();
				this._ctx.moveTo(this._x, this._y);
				// Save the place where the pen put down
				this._area.fromX = this._area.left = this._area.right = this._x;
				this._area.fromY = this._area.top = this._area.bottom = this._y;
				this._area.sqLen = 0;
				this._curMode = this._mode.toLowerCase();
			}
			if (this._pen === true && val === false && !this._isNotDrawn()) {
				// Close the path (connect the start and end points) by raising the pen at the same place where putting down the pen
				if (this._isInPenDownPoint()) this._ctx.closePath();
				this._drawActually();
			}
			this._pen = val;
			return this;
		}

		/**
		 * Whether the current location is where putting down the pen (used only in the library)
		 * @private
		 * @return {boolean} Whether the current location is where putting down the pen
		 */
		_isInPenDownPoint() {
			const x = this._x, y = this._y;
			const pdX = this._area.fromX, pdY = this._area.fromY;
			const sqLen = (x - pdX) * (x - pdX) + (y - pdY) * (y - pdY);
			return (sqLen < 0.01);
		}

		/**
		 * Actually draw (used only in the library)
		 * @private
		 */
		_drawActually() {
			let ms = this._curMode;
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
		}

		/**
		 * Drawing mode
		 * @param {string=} val Value
		 * @return {string|TurtleBase} Drawing mode, or this turtle base
		 */
		mode(val) {
			if (val === undefined) return this._mode;
			this._mode = val;

			// Even if the pen is down, if nothing is drawn
			if (this._pen && this._isNotDrawn()) {
				this._curMode = this._mode.toLowerCase();
			}
			return this;
		}

		/**
		 * Whether nothing is drawn (used only in the library)
		 * @private
		 * @return {boolean} Whether nothing is drawn
		 */
		_isNotDrawn() {
			const a = this._area, x = this._x, y = this._y;
			if (a.fromX === x && a.left === x && a.right === x && a.fromY === y && a.top === y && a.bottom === y) {
				return true;
			}
			return false;
		}

		/**
		 * Stroke style
		 * @param {Stroke=} opt_stroke Stroke style (optional)
		 * @return {Stroke|TurtleBase} Stroke style, or this turtle base
		 */
		stroke(opt_stroke) {
			if (opt_stroke === undefined) return this._stroke;
			this._stroke = new STYLE.Stroke(opt_stroke);
			return this;
		}

		/**
		 * Filling style
		 * @param {Fill=} opt_fill Filling style (optional)
		 * @return {Fill|TurtleBase} Filling style, or this turtle base
		 */
		fill(opt_fill) {
			if (opt_fill === undefined) return this._fill;
			this._fill = new STYLE.Fill(opt_fill);
			return this;
		}

		/**
		 * Edge
		 * @param {function=} func Function to determine the edge
		 * @return {function|TurtleBase} Edge, or this turtle base
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

		/**
		 * Align the paper with turtle location and orientation
		 */
		localize() {
			this._ctx.translate(this._x, this._y);
			this._ctx.rotate(rad(this._dir));
		}

		/**
		 * Scale the paper to the location of the turtle
		 * @param {number} rate Scaling rate
		 * @param {number=} opt_rateY Vertical scaling rate (optional)
		 */
		scale(rate, opt_rateY = null) {
			this._ctx.translate(this._x, this._y);
			if (opt_rateY === null) {
				this._ctx.scale(rate, rate);
			} else {
				this._ctx.scale(rate, opt_rateY);
			}
			this._ctx.translate(-this._x, -this._y);
		}

	}


	/**
	 * Turtle
	 * @version 2020-04-22
	 */
	class Turtle extends TurtleBase {

		/**
		 * Make a turtle
		 * @param {Paper|CanvasRenderingContext2D} ctx Paper or canvas context
		 * @param {number=} normalDeg Normal degree
		 */
		constructor(ctx, normalDeg) {
			super(ctx, normalDeg);

			this._visible      = false;
			this._isAnimating  = false;
			this._aniRemain    = 0;
			this._aniMax       = 0;
			this._aniFinished  = true;
			this._lastPenState = false;

			this._curLoc     = [0, 0, 0];
			this._curHomeLoc = [0, 0, 0];
			this._curFnPos   = [null, null];
			this._curFn      = '';
			this._curAs      = [];
			this._curPen     = false;
			this._curTrans   = this._ctx.getTransform();

			this._onPenChanged = null;
			this._onMoved      = null;
		}

		/**
		 * Set the function corresponding to 'Pen changed event'
		 * @param {function} handler Function
		 * @return {function|Turtle} Function, or this turtle
		 */
		onPenChanged(handler) {
			if (handler === undefined) return this._onPenChanged;
			this._onPenChanged = handler;
			return this;
		}

		/**
		 * Set the function corresponding to 'moved event'
		 * @param {function} handler Function
		 * @return {function|Turtle} Function, or this turtle
		 */
		onMoved(handler) {
			if (handler === undefined) return this._onMoved;
			this._onMoved = handler;
			return this;
		}


		// Change of place or direction --------------------------------------------


		/**
		 * Go forward
		 * @param {number} step Number of steps
		 * @return {Turtle} This turtle
		 */
		go(step) {
			this._curFn = 'go';
			return super.go(step);
		}

		/**
		 * Go back
		 * @param {number} step Number of steps
		 * @return {Turtle} This turtle
		 */
		back(step) {
			this._curFn = 'bk';
			return super.back(step);
		}

		/**
		 * Actually go (used only in the library)
		 * @private
		 * @param {number} step Number of steps
		 * @param {number} limit Limitation
		 * @return {number} Amount actually moved
		 */
		_doGo(step, limit) {
			return super._doGo(step, limit, (x0, y0, dir_, d) => {
				if (!this._visible) return;
				const r = rad(dir_);
				const x = x0 + d * Math.cos(r);
				const y = y0 + d * Math.sin(r);
				this._curAs = [{ x0, y0 }, { x, y }];
			});
		}

		/**
		 * Turn right
		 * @param {number} deg Degree
		 * @return {Turtle} This turtle
		 */
		turnRight(deg) {
			this._curFn = 'tr';
			return super.turnRight(deg);
		}

		turnLeft(deg) {
			this._curFn = 'tl';
			return super.turnLeft(deg);
		}

		/**
		 * Actually change direction (used only in the library)
		 * @private
		 * @param {number} deg Degree
		 * @param {number} limit Limitation
		 * @return {number} Amount actually moved
		 */
		_doTurn(deg, limit) {
			return super._doTurn(deg, limit, (bx, by) => {
				if (!this._visible) return;
				const dir_ = this._dir - 90;
				const r0 = rad(dir_), r1 = rad(dir_ + deg);
				this._curAs = [{ bx, by, r0, r1 }];
			});
		}


		// Change of place and direction -------------------------------------------


		/**
		 * Curve to the right
		 * @param {number} step0 Number of steps 1
		 * @param {number} deg Degree 1
		 * @param {number} step1 Number of steps 2
		 * @param {number=} opt_deg Degree 2 (optional)
		 * @param {number=} opt_step Number of steps 3 (optional)
		 * @return {Turtle} This turtle
		 */
		curveRight(step0, deg, step1, opt_deg, opt_step) {
			this._curFn = 'cr';
			return super.curveRight(step0, deg, step1, opt_deg, opt_step);
		}

		/**
		 * Curve to the left
		 * @param {number} step0 Number of steps 1
		 * @param {number} deg Degree 1
		 * @param {number} step1 Number of steps 2
		 * @param {number=} opt_deg Degree 2 (optional)
		 * @param {number=} opt_step Number of steps 3 (optional)
		 * @return {Turtle} This turtle
		 */
		curveLeft(step0, deg, step1, opt_deg, opt_step) {
			this._curFn = 'cl';
			return super.curveLeft(step0, deg, step1, opt_deg, opt_step);
		}

		/**
		 * Actually curve (used only in the library)
		 * @private
		 * @param {number} step0 Number of steps 1
		 * @param {number} deg Degree 1
		 * @param {number} step1 Number of steps 2
		 * @param {number=} opt_deg Degree 2 (optional)
		 * @param {number=} opt_step Number of steps 3 (optional)
		 * @param {number} limit Limitation
		 * @param {function=} [before=null] Function to be called before it actually moves
		 * @return {number} Amount actually moved
		 */
		_doCurve(step0, deg, step1, opt_deg, opt_step, limit) {
			return super._doCurve(step0, deg, step1, opt_deg, opt_step, limit, (x, y, dir_, d0, deg, d1, opt_deg, d2) => {
				if (!this._visible) return;
				const r0 = rad(dir_), r1 = rad(dir_ + deg);
				const x1 = x + d0 * Math.cos(r0), y1 = y + d0 * Math.sin(r0);
				const x2 = x1 + d1 * Math.cos(r1), y2 = y1 + d1 * Math.sin(r1);

				if (opt_deg === undefined) {
					this._curAs = [{ x0: x, y0: y }, { tx: x1, ty: y1 }, { x: x2, y: y2 }];
				} else {
					const r2 = rad(dir_ + deg + opt_deg);
					const x3 = x2 + d2 * Math.cos(r2), y3 = y2 + d2 * Math.sin(r2);
					this._curAs = [{ x0: x, y0: y }, { tx: x1, ty: y1 }, { tx: x2, ty: y2 }, { x: x3, y: y3 }];
				}
			});
		}

		/**
		 * Draw an arc that turns to the right
		 * @param {number|Array<number>} r Radius (horizontal radius and vertical radius if an array given)
		 * @param {number|Array<number>} deg Degree (start and end angles if an array given)
		 * @return {Turtle} This turtle
		 */
		arcRight(r, deg) {
			this._curFn = 'ar';
			return super.arcRight(r, deg);
		}

		/**
		 * Draw an arc that turns to the left
		 * @param {number|Array<number>} r Radius (horizontal radius and vertical radius if an array given)
		 * @param {number|Array<number>} deg Degree (start and end angles if an array given)
		 * @return {Turtle} This turtle
		 */
		arcLeft(r, deg) {
			this._curFn = 'al';
			return super.arcLeft(r, deg);
		}

		/**
		 * Actually draw an arc (used only in the library)
		 * @private
		 * @param {number|Array<number>} r Radius (horizontal radius and vertical radius if an array given)
		 * @param {number|Array<number>} deg Degree (start and end angles if an array given)
		 * @param {boolean} isLeft Whether it is left
		 * @param {number} limit Limitation
		 * @return {number} Amount actually moved
		 */
		_doArc(r, deg, isLeft, limit) {
			return super._doArc(r, deg, isLeft, limit, (lsp, ltp, rot, p) => {
				if (this._visible) this._curAs = [{ cx: lsp, cy: ltp, w: p.w, h: p.h, r: rot }];
			});
		}


		// Draw a shape ------------------------------------------------------------


		/**
		 * Draw a point
		 * @return {Turtle} This turtle
		 */
		dot() {
			this._curFn = 'dot';
			return super.dot();
		}

		/**
		 * Draw a circle
		 * @param {number|Array<number>} r Radius (horizontal radius and vertical radius if an array given)
		 * @param {number|Array<number>} deg Degree (start and end angles if an array given)
		 * @param {boolean=} [anticlockwise=false] Whether it is counterclockwise
		 * @return {Turtle} This turtle
		 */
		circle(r, deg = 360, anticlockwise = false) {
			this._curFn = 'circle';
			return super.circle(r, deg, anticlockwise);
		}

		/**
		 * Actually draw a circle (used only in the library)
		 * @private
		 * @param {number} cx X coordinate of center
		 * @param {number} cy Y coordinate of center
		 * @param {dict} p Parameters
		 * @param {boolean} anticlockwise Whether it is counterclockwise
		 * @param {number} limit Limitation
		 * @param {number} dr Direction
		 * @return {number} Amount actually moved
		 */
		_doCircle(cx, cy, p, anticlockwise, limit, dr) {
			return super._doCircle(cx, cy, p, anticlockwise, limit, dr, (cx, cy, p, dr) => {
				if (this._visible) this._curAs = [{ cx: cx, cy: cy, w: p.w, h: p.h, r: dr }];
			});
		}


		// Animation ---------------------------------------------------------------


		/**
		 * Whether to show animation
		 * @param {boolean} val Value
		 * @return {boolean|Turtle} Whether to show animation, or this turtle
		 */
		visible(val) {
			if (val === undefined) return this._visible;
			this._visible = val;
			return this;
		}

		/**
		 * Step the animation next
		 * @param {number} num Number of frames
		 */
		stepNext(num) {
			if (this._isAnimating) {
				// Animation ends
				if (this._aniFinished) {
					this._isAnimating = false;
					// Discard saved state at the animation start time
					this._stack.pop();
				} else {
					this._drawTurtle(this._ctx);
					// Revert to the beginning of the animation
					this.restore().save();
					this._aniMax += num;
				}
			} else {
				// Animation starts
				if (!this._aniFinished) {
					this._isAnimating = true;
					// Save the state at the animation start time
					this.save();
				}
			}
			this._aniRemain = this._aniMax;
			this._aniFinished = true;
			this._isClipable = true;
		}

		/**
		 * Reset the animation to beginning
		 */
		resetAnimation() {
			if (this._isAnimating) {
				this._isAnimating = false;
				// Discard saved state at the animation start time
				this._stack.pop();
			}
			this._aniMax = 0;
		}

		/**
		 * Check the animation skip (used only in the library)
		 * @private
		 * @return {number} Remaining power
		 */
		_getPower() {
			// Return null if the animation disabled
			if (!this._visible) return null;

			if (this._aniRemain <= 0) {
				this._aniFinished = false;
				this._isClipable = false;
				return 0;
			}
			return this._aniRemain;
		}

		/**
		 * Check the end of the animation (used only in the library)
		 * @private
		 * @param {number} consumption Power consumption
		 */
		_usePower(consumption) {
			if (!this._visible) return;

			this._aniRemain -= consumption;
			if (this._aniRemain <= 0) {
				const p = this._pen;
				this.penUp();

				// Need after penUp
				this._aniFinished = false;
				this._isClipable  = false;

				// Save information for drawing the turtle
				this._curLoc     = [this._x, this._y, this._dir];
				this._curHomeLoc = [this._homeX, this._homeY, this._homeDir];
				this._curPen     = p;
				this._curTrans   = this._ctx.getTransform();

				if (this._onPenChanged !== null && this._lastPenState !== p) this._onPenChanged(this, p);
				if (this._onMoved !== null) this._onMoved(this, this._x, this._y, p);
				this._lastPenState = p;
			}
		}

		/**
		 * Apply matrix to coordinates (used only in the library)
		 * @private
		 * @param {Array} t Matrix
		 * @param {number} x x coordinate
		 * @param {number} y y coordinate
		 * @param {number} r Degree
		 */
		_transform(t, x, y, r) {
			if (t === null) return [x, y, r];
			const nx = t.a * x + t.c * y + t.e;
			const ny = t.b * x + t.d * y + t.f;
			return [nx, ny, r];
		}

		/**
		 * Draw the turtle (home) (used only in the library)
		 * @private
		 * @param {Paper|CanvasRenderingContext2D} ctx Paper or canvas context
		 */
		_drawTurtle(ctx) {
			ctx.save();
			ctx.setLineDash([]);
			ctx.globalAlpha = 1;

			if (this._curTrans) ctx.setTransform(this._curTrans);
			this._drawAnchor(ctx, this._curAs);

			ctx.setTransform(1, 0, 0, 1, 0, 0);
			let [hx, hy, hd] = this._curHomeLoc;
			// If home location has been changed
			if (hx !== 0 || hy !== 0 || hd !== 0) {
				if (this._curTrans) [hx, hy, hd] = this._transform(this._curTrans, hx, hy, hd);
				this._drawTriangle(ctx, [hx, hy, hd], true, 'Purple', '', 'Magenta');
			}
			let [x, y, d] = this._curLoc;
			if (this._curTrans) [x, y, d] = this._transform(this._curTrans, x, y, d);
			this._drawTriangle(ctx, [x, y, d], this._curPen, 'SeaGreen', 'DarkSeaGreen', 'Lime');
			this._drawFunction(ctx, [x, y, d], this._curFnPos, this._curFn);

			ctx.restore();
			this._curFn = '';
			this._curAs = [];
		}

		/**
		 * Draw a triangle representing a turtle or home (used only in the library)
		 * @private
		 * @param {Paper|CanvasRenderingContext2D} ctx Paper or canvas context
		 * @param {*} loc Location
		 * @param {*} pen Pen state
		 * @param {*} downColor Color when putting down the pen
		 * @param {*} upColor Color when raising up the pen
		 * @param {*} lineColor Line color
		 */
		_drawTriangle(ctx, loc, pen, downColor, upColor, lineColor) {
			ctx.save();
			ctx.translate(loc[0], loc[1]);
			ctx.rotate(rad(loc[2]));

			ctx.beginPath();
			ctx.moveTo(0, -10);
			ctx.lineTo(8, 8);
			ctx.lineTo(-8, 8);
			ctx.closePath();

			ctx.fillStyle = pen ? downColor : upColor;
			Turtle._setShadow(ctx, pen ? 4 : 6, 4);
			ctx.fill();

			Turtle._setShadow(ctx, 0, 0);
			ctx.lineWidth = 2;
			ctx.strokeStyle = lineColor;
			ctx.stroke();
			ctx.restore();
		}

		/**
		 * Draw the running function of the turtle (used only in the library)
		 * @private
		 * @param {Paper|CanvasRenderingContext2D} ctx Paper or canvas context
		 * @param {Array<number>} loc Location
		 * @param {Array<number>} fnPos Location of drawing function
		 * @param {string} curFn Current function
		 */
		_drawFunction(ctx, loc, fnPos, curFn) {
			ctx.save();
			const offX = loc[0] <= 0 ? 48 : -48;
			const offY = loc[1] <= 0 ? 48 : -48;
			if (fnPos[0] === null || fnPos[1] === null) {
				fnPos[0] = loc[0] + offX;
				fnPos[1] = loc[1] + offY;
			} else {
				fnPos[0] = fnPos[0] * 0.95 + (loc[0] + offX) * 0.05;
				fnPos[1] = fnPos[1] * 0.95 + (loc[1] + offY) * 0.05;
			}

			ctx.fillStyle = 'black';
			ctx.strokeStyle = 'white';
			ctx.lineWidth = 3;
			ctx.font = 'bold 26px Consolas, Menlo, "Courier New", Meiryo, monospace';
			ctx.textAlign = 'center';
			ctx.translate(fnPos[0], fnPos[1]);
			Turtle._setShadow(ctx, 4, 2);
			ctx.strokeText(curFn, 0, 12);
			Turtle._setShadow(ctx, 0, 0);
			ctx.fillText(curFn, 0, 12);
			ctx.restore();
		}

		/**
		 * Draw a turtle anchors (used only in the library)
		 * @private
		 * @param {Paper|CanvasRenderingContext2D} ctx Paper or canvas context
		 * @param {Array} curPos Positions
		 */
		_drawAnchor(ctx, curPos) {
			for (let p of curPos) {
				if (p.x0 !== undefined) {
					draw(p.x0, p.y0, null, 'Lime', 'DarkSeaGreen', drawCheck);
				} else if (p.x !== undefined) {
					draw(p.x, p.y, null, 'Lime', 'SeaGreen', drawCheck);
				} else if (p.tx !== undefined) {
					draw(p.tx, p.ty, null, 'Magenta', 'Purple', drawCheck);
				} else if (p.cx !== undefined) {
					draw(p.cx, p.cy, null, 'Magenta', 'Purple', drawCheck);
					draw(p.cx, p.cy, p.r, 'Magenta', 'Purple', drawRect, p.w, p.h);
				} else if (p.bx !== undefined) {
					draw(p.bx, p.by, p.r0, 'Magenta', 'DarkPurple', drawLine);
					draw(p.bx, p.by, p.r1, 'Magenta', 'Purple', drawLine);
				}
			}
			function draw(x, y, r, outer, inner, fn, ...args) {
				ctx.save();
				ctx.translate(x, y);
				if (r !== null) ctx.rotate(r);
				ctx.strokeStyle = outer;
				ctx.lineWidth = 4;
				Turtle._setShadow(ctx, 4, 2);
				fn(...args);

				ctx.strokeStyle = inner;
				ctx.lineWidth = 2;
				Turtle._setShadow(ctx, 0, 0);
				fn(...args);
				ctx.restore();
			}
			function drawCheck() {
				ctx.beginPath();
				ctx.moveTo(-8, -8);
				ctx.lineTo(8, 8);
				ctx.moveTo(8, -8);
				ctx.lineTo(-8, 8);
				ctx.stroke();
			}
			function drawRect(hw, hh) {
				ctx.setLineDash([6, 4]);
				ctx.beginPath();
				ctx.rect(-hw, -hh, hw * 2, hh * 2);
				ctx.stroke();
			}
			function drawLine() {
				ctx.setLineDash([6, 4]);
				ctx.beginPath();
				ctx.moveTo(0, 0);
				ctx.lineTo(128, 0);
				ctx.stroke();
			}
		}

		/**
		 * Set shadow (used only in the library)
		 * @private
		 * @param {Paper|CanvasRenderingContext2D} ctx Paper or canvas context
		 * @param {number} blur Blur amount
		 * @param {number} off Shadow offset
		 * @param {string} [color='rgba(0,0,0,0.5)'] Color
		 */
		static _setShadow(ctx, blur, off, color = 'rgba(0,0,0,0.5)') {
			ctx.shadowBlur = blur;
			ctx.shadowOffsetX = ctx.shadowOffsetY = off;
			ctx.shadowColor = color;
		}

	}


	// Utility functions -------------------------------------------------------


	/**
	 * Create a stamp (a function that draws a picture at high speed) from a function drawn using a turtle
	 * @param {number} width Width of stamp
	 * @param {number} height Height of stamp
	 * @param {number} cx X coordinate of center of stamp
	 * @param {number} cy Y coordinate of center of stamp
	 * @param {number} scale Scaling rate
	 * @param {function} func Function
	 * @return {function} Stamp function
	 */
	const makeStamp = function (width, height, cx, cy, scale, func) {
		let curArgs = null, cacheCtx = null, cacheT = null;

		function isSame(a0, a1) {
			if (a0.length !== a1.length) return false;
			for (let i = 0, I = a0.length; i < I; i += 1) {
				if (a0[i] !== a1[i]) return false;
			}
			return true;
		}
		return function (t, ...var_args) {
			if (!cacheCtx) {
				cacheCtx = new CROQUJS.Paper(width, height, false);
				cacheCtx.translate(cx, cy);
				t.context().addChild(cacheCtx);
				cacheT = new TURTLE.Turtle(cacheCtx);
			}
			if (!curArgs || !isSame(curArgs, var_args)) {
				cacheCtx.clear();
				var_args.unshift(cacheT);  // cacheTを挿入
				func.apply(null, var_args);
				curArgs = var_args.slice(1);  // cacheTを削除
			}
			t.image(cacheCtx, cx, cy, scale);
		};
	};


	// Create a library --------------------------------------------------------


	// Function alias
	const aliasMap = {
		go            : ['forward', 'fd'],
		back          : ['bk', 'backward'],
		step          : ['unit'],
		turnRight     : ['tr', 'right', 'rt'],
		turnLeft      : ['tl', 'left', 'lt'],
		direction     : ['heading'],
		curveRight    : ['cr'],
		curveLeft     : ['cl'],
		arcRight      : ['ar'],
		arcLeft       : ['al'],
		getDirectionOf: ['towards'],
		penDown       : ['pd', 'down'],
		penUp         : ['pu', 'up'],
		context       : ['paper'],
	};

	// Register function alias
	for (let target of [Turtle, TurtleBase]) {
		for (const [orig, aliases] of Object.entries(aliasMap)) {
			for (let alias of aliases) {
				target.prototype[alias] = target.prototype[orig];
			}
		}
	}

	return { Turtle, TurtleBase, makeStamp };

}());
