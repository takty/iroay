/**
 * Tracer library (TRACER)
 *
 * A library to move an object with coordinates.
 *
 * @author Takuto Yanagida
 * @version 2019-05-12
 */


/**
 * Library variable
 */
const TRACER = (function () {

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
	 * Tracer
	 * @version 2020-05-05
	 */
	class Tracer {

		/**
		 * Make a tracer
		 * @constructor
		 */
		constructor() {
			if (typeof PATH === 'undefined') throw new Error('Path library is needed.');

			this._cmdQueue = [];
			this._remainTime = 0;

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
				lineOrMoveTo : (x, y, dir) => {
					this._changePos(x, y, dir + 90);
				},
				quadCurveOrMoveTo: (x1, y1, x2, y2, dir) => {
					this._changePos(x2, y2, dir + 90);
				},
				bezierCurveOrMoveTo: (x1, y1, x2, y2, x3, y3, dir) => {
					this._changePos(x3, y3, dir + 90);
				},
				arcOrMoveTo: (cx, cy, dr, w, h, r0, r1, ac, dir, xx, yy) => {
					this._changePos(xx, yy, dir + 90);
				}
			});
		}

		/**
		 * Save the current state
		 * @return {Tracer} This tracer
		 */
		save() {
			const t = this._getState();
			this._stack.push(t);
			return this;
		}

		/**
		 * Restore previous state
		 * @return {Tracer} This tracer
		 */
		restore() {
			const t = this._stack.pop();
			this._setState(t);
			return this;
		}

		/**
		 * Get state (used only in the library)
		 * @private
		 * @return {Array} State
		 */
		_getState() {
			return [
				this._x, this._y, this._dir,  // 以下、順番に依存関係あり
				this._step,
				this._liner.edge(),
				this._homeX, this._homeY, this._homeDir,
			];
		}

		/**
		 * Set state (used only in the library)
		 * @private
		 * @param {Array} t State
		 */
		_setState(t) {
			this._changePos(t[0], t[1], t[2]);  // 以下、順番に依存関係あり
			this.step(t[3]);
			this._liner.edge(t[4]);
			this._homeX = t[5]; this._homeY = t[6]; this._homeDir = t[7];
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


		// Change of place or direction --------------------------------------------


		/**
		 * Go forward
		 * @param {number} step Number of steps
		 * @return {Tracer} This tracer
		 */
		go(step) {
			this._addCommand((limit) => {
				return this._liner.line(this._x, this._y, this._dir - 90, step * this._step, limit);
			});
			return this;
		}

		/**
		 * Go back
		 * @param {number} step Number of steps
		 * @return {Tracer} This tracer
		 */
		back(step) {
			return this.go(-step);  // 前に進むことの逆
		}

		/**
		 * Turn right
		 * @param {number} deg Degree
		 * @return {Tracer} This tracer
		 */
		turnRight(deg) {
			this._addCommand((limit) => {
				return this._doTurn(deg, limit);
			});
			return this;
		}

		turnLeft(deg) {
			return this.turnRight(-deg);  // 右に回ることの逆
		}

		/**
		 * Actually change direction (used only in the library)
		 * @private
		 * @param {number} deg Degree
		 * @param {number} limit Limitation
		 * @return {number} Amount actually moved
		 */
		_doTurn(deg, limit) {
			const sign = deg < 0 ? -1 : 1;
			let limDeg;
			if (limit !== undefined) {
				limDeg = (limit < sign * deg) ? (sign * limit) : deg;
			} else {
				limDeg = deg;
			}
			this._changePos(this._x, this._y, this._dir + limDeg);
			return sign * limDeg;
		}

		/**
		 * X coordinate
		 * @param {number=} val Value
		 * @return X coordinate, or this tracer
		 */
		x(val) {
			if (val === undefined) return this._x;
			this._addCommand((limit) => { this._changePos(val, this._y); });
			return this;
		}

		/**
		 * Y coordinate
		 * @param {number=} val Value
		 * @return Y coordinate, or this tracer
		 */
		y(val) {
			if (val === undefined) return this._y;
			this._addCommand((limit) => { this._changePos(this._x, val); });
			return this;
		}

		/**
		 * Direction
		 * @param {number=} deg Degree
		 * @return Degree, or this tracer
		 */
		direction(deg) {
			if (deg === undefined) return this._dir;
			this._addCommand((limit) => { this._changePos(this._x, this._y, deg); });
			return this;
		}

		/**
		 * Move to
		 * @param {number} x X coordinate
		 * @param {number} y Y coordinate
		 * @param {number=} opt_dir Direction (optional)
		 * @return {Tracer} This tracer
		 */
		moveTo(x, y, opt_dir) {
			this._addCommand((limit) => {
				this._changePos(x, y);
				if (opt_dir !== undefined) this._changePos(this._x, this._y, opt_dir);  // 値のチェックが必要なので関数呼び出し
			});
			return this;
		}

		/**
		 * Go back to home (Return to the first place and direction)
		 * @return {Tracer} This tracer
		 */
		home() {
			return this.moveTo(this._homeX, this._homeY, this._homeDir);
		}

		/**
		 * Set your current location to 'home'
		 * @return {Tracer} This tracer
		 */
		setHome() {
			this._addCommand(() => {
				this._homeX   = this._x;
				this._homeY   = this._y;
				this._homeDir = this._dir;
			});
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
		 * @return {Tracer} This tracer
		 */
		curveRight(step0, deg, step1, opt_deg, opt_step) {
			this._addCommand((limit) => {
				return this._doCurve(step0, deg, step1, opt_deg, opt_step, limit);
			});
			return this;
		}

		/**
		 * Curve to the left
		 * @param {number} step0 Number of steps 1
		 * @param {number} deg Degree 1
		 * @param {number} step1 Number of steps 2
		 * @param {number=} opt_deg Degree 2 (optional)
		 * @param {number=} opt_step Number of steps 3 (optional)
		 * @return {Tracer} This tracer
		 */
		curveLeft(step0, deg, step1, opt_deg, opt_step) {
			if (opt_deg === undefined) {
				return this.curveRight(step0, -deg, step1);
			} else {
				return this.curveRight(step0, -deg, step1, -opt_deg, opt_step);
			}
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
		 * @return {number} Amount actually moved
		 */
		_doCurve(step0, deg, step1, opt_deg, opt_step, limit) {
			const s = this._step;
			if (opt_deg === undefined) {
				return this._liner.quadCurve(this._x, this._y, this._dir - 90, step0 * s, deg, step1 * s, limit);
			} else {
				return this._liner.bezierCurve(this._x, this._y, this._dir - 90, step0 * s, deg, step1 * s, opt_deg, opt_step * s, limit);
			}
		}

		/**
		 * Draw an arc that turns to the right
		 * @param {number|Array<number>} r Radius (horizontal radius and vertical radius if an array given)
		 * @param {number|Array<number>} deg Degree (start and end angles if an array given)
		 * @return {Tracer} This tracer
		 */
		arcRight(r, deg) {
			this._arcPrep(r, deg, false);
			return this;
		}

		/**
		 * Draw an arc that turns to the left
		 * @param {number|Array<number>} r Radius (horizontal radius and vertical radius if an array given)
		 * @param {number|Array<number>} deg Degree (start and end angles if an array given)
		 * @return {Tracer} This tracer
		 */
		arcLeft(r, deg) {
			this._arcPrep(r, deg, true);
			return this;
		}

		/**
		 * Draw an arc (used only in the library)
		 * @private
		 * @param {number|Array<number>} r Radius (horizontal radius and vertical radius if an array given)
		 * @param {number|Array<number>} deg Degree (start and end angles if an array given)
		 * @param {boolean} isLeft Whether it is left
		 * @return {Tracer} This tracer
		 */
		_arcPrep(r, deg, isLeft) {
			this._addCommand((limit) => {
				return this._doArc(r, deg, isLeft, limit);
			});
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
			const p = PATH.arrangeArcParams(r, deg, this._step);
			let rev = 0;

			if (isLeft) {
				p.deg0 = -p.deg0;
				p.deg1 = -p.deg1;
			} else {
				p.deg0 = p.deg0 + 180;
				p.deg1 = p.deg1 + 180;
				// Since it is the inclination of the tangent in the clockwise direction, add PI
				rev = Math.PI;
			}
			const r0 = rad(p.deg0);
			const s0 = p.w * Math.cos(r0), t0 = p.h * Math.sin(r0);
			const a0 = Math.atan2(-(p.h * p.h * s0), (p.w * p.w * t0)) + rev;

			const rot = rad(this._dir - 90) - a0;
			const lrsin = Math.sin(rot), lrcos = Math.cos(rot);
			const lsp = this._x + -s0 * lrcos - -t0 * lrsin;
			const ltp = this._y + -s0 * lrsin + -t0 * lrcos;

			return this._liner.arc(lsp, ltp, rot * 180.0 / Math.PI, p.w, p.h, p.deg0, p.deg1, isLeft, limit);
		}


		// Others ------------------------------------------------------------------


		/**
		 * Length per step
		 * @param {number=} val Value
		 * @return {number|Tracer} Length per step, or this tracer
		 */
		step(val) {
			if (val === undefined) return this._step;
			this._addCommand(() => { this._step = val; });
			return this;
		}

		/**
		 * Edge
		 * @param {function=} func Function to determine the edge
		 * @return {function|Tracer} Edge, or this tracer
		 */
		edge(func, ...fs) {
			if (func === undefined) return this._liner.edge();
			this._addCommand(() => { this._liner.edge(func, ...fs); });
			return this;
		}

		/**
		 * Seeing from the current location, what direction is there
		 * @param {number} x X coordinate of a place
		 * @param {number} y Y coordinate of a place
		 * @return {number} Degree
		 */
		getDirectionOf(x, y) {
			return (Math.atan2(y - this._y, x - this._x) * 180.0 / Math.PI - this._dir - 90);
		}


		// Animation ---------------------------------------------------------------


		/**
		 * Run later
		 * @param {function} func Function
		 * @param {Array=} args_array Arguments to pass to the function
		 * @return {Tracer} This tracer
		 */
		doLater(func, args_array) {
			const fn = function () { func.apply(this, args_array); };
			this._addCommand(fn);
			return this;
		}

		/**
		 * Run immediately
		 * @param {function} func Function
		 * @param {Array=} args_array Arguments to pass to the function
		 * @return {Tracer} This tracer
		 */
		doNow(func, args_array) {
			const fn = function () { func.apply(this, args_array); };

			if (this._cmdQueue.length > 0) {
				const c = this._cmdQueue[0];
				const cmd = new Command(fn);
				if (c._isFirstTime) {
					this._cmdQueue.unshift(cmd);
				} else {
					this._cmdQueue.splice(1, 0, cmd);
				}
			} else {
				this._addCommand(fn);
			}
			return this;
		}

		/**
		 * Add command (used only in the library)
		 * @private
		 * @param {function} func Function
		 */
		_addCommand(func) {
			this._cmdQueue.push(new Command(func));
		}

		/**
		 * Step the animation next
		 * @param {number} num Number of frames
		 */
		stepNext(num) {
			this.update(this._x, this._y, this._dir, num);
		}

		/**
		 * Update coordinates according to the speed
		 * @param {number} x X coordinate
		 * @param {number} y Y coordinate
		 * @param {number} dir Direction
		 * @param {number} unitTime Unit time
		 * @return {Array<number>} Coordinate
		 */
		update(x, y, dir, unitTime) {
			if (this._x !== x || this._y !== y || this._dir !== dir) {
				this.cancel();
				this._changePos(x, y, dir);
			}
			if (0 < this._cmdQueue.length) this._remainTime += unitTime;
			while (0 < this._cmdQueue.length) {
				const c = this._cmdQueue[0];
				if (c._initState === null) {
					c._initState = this._getState();
				} else {
					this._setState(c._initState);
				}
				const remain = this._remainTime - c.run(this._remainTime);
				if (0 < remain) {
					this._cmdQueue.shift();
					this._remainTime = remain;
				} else {
					break;
				}
			}
			if (0 === this._cmdQueue.length) this._remainTime = 0;
			return [this._x, this._y, this._dir];
		}

		/**
		 * Cancel the current motion
		 * @return {Tracer} This tracer
		 */
		cancel() {
			if (0 < this._cmdQueue.length) {
				const c = this._cmdQueue[0];
				if (c._initState !== null) {
					this._setState(c._initState);
					this._cmdQueue.shift();
					this._remainTime = 0;
				}
			}
			return this;
		}

		/**
		 * Stop all motion
		 * @return {Tracer} This tracer
		 */
		stop() {
			this._cmdQueue.length = 0;
			this._remainTime = 0;
			return this;
		}

	}


	/**
	 * Command
	 * @version 2020-05-05
	 */
	class Command {

		/**
		 * Make a command (used only in the library)
		 * @private
		 * @constructor
		 * @param {function} func Function
		 */
		constructor(func) {
			this._func = func;
			this._initState = null;
		}

		/**
		 * Run the command (used only in the library)
		 * @param {number} deltaT Time to advance
		 * @return {number} Power consumption
		 */
		run(deltaT) {
			const pc = this._func(deltaT);
			return (pc === undefined) ? 0 : pc;
		}

	}


	// Create a library --------------------------------------------------------


	// Function alias
	const aliases = {
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
	};

	// Register function alias
	Object.keys(aliases).forEach((p) => {
		aliases[p].forEach((a) => {
			Tracer.prototype[a] = Tracer.prototype[p];
		});
	});

	return { Tracer };

}());
