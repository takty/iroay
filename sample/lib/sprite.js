/**
 * Sprite library (SPRITE)
 *
 * A library to make sprites (like animation cell pictures)
 * and display them in the size, orientation, and transparency you like.
 *
 * @author Takuto Yanagida
 * @version 2020-05-04
 */


/**
 * Library variable
 */
const SPRITE = (function () {

	'use strict';


	// Utilities used only in the library --------------------------------------


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
	 * If a value is given, return it, and if a function is given, call it
	 * @param {number|function(): number} vf Value or function
	 * @return {number} Value
	 */
	const valueFunction = function (vf) {
		if (typeof vf === 'function') {
			return vf();
		} else {
			return vf;
		}
	};

	/**
	 * Make a function to check the range
	 * @param {number} min Minimum value
	 * @param {number} max Maximum value
	 * @param {boolean=} isLoop Whether to loop
	 * @return {function(number): number} Function to check the range
	 */
	const makeRangeChecker = function (min, max, isLoop) {
		if (isLoop) {
			return function (v) {
				if (v < min) return max;
				if (max < v) return min;
				return v;
			}
		} else {
			return function (v) {
				if (v < min) return min;
				if (max < v) return max;
				return v;
			}
		}
	};


	/**
	 * Element (common to sprites and stages)
	 * @version 2020-05-05
	 */
	class Element {

		/**
		 * Make an element
		 * @param {Motion?} [motion=null] Motion
		 */
		constructor(motion = null) {
			this._parent    = null;
			this._data      = null;
			this._observers = null;

			this._x   = 0;
			this._y   = 0;
			this._dir = 0;

			this._scale = 1;
			this._alpha = 1;
			this._isFixedHeading = false;

			this._angle  = 0;
			this._angleX = 0;
			this._angleZ = 0;

			this._speed = 1;

			this._angleSpeed  = 0;
			this._angleSpeedX = 0;
			this._angleSpeedZ = 0;

			this._checkRangeX = null;
			this._checkRangeY = null;

			this._motion = motion;
		}

		/**
		 * X coordinate
		 * @param {number=} val Value of x coordinate
		 * @return {number|Element} Value of x coordinate, or this element
		 */
		x(val) {
			if (val === undefined) return this._x;
			this._x = val;
			return this;
		}

		/**
		 * Y coordinate
		 * @param {number=} val Value of y coordinate
		 * @return {number|Element} Value of y coordinate, or this element
		 */
		y(val) {
			if (val === undefined) return this._y;
			this._y = val;
			return this;
		}

		/**
		 * Direction
		 * @param {number=} deg Value of degree
		 * @return {number|Element} Value of degree, or this element
		 */
		direction(deg) {
			if (deg === undefined) return this._dir;
			this._dir = checkDegRange(deg);
			return this;
		}

		/**
		 * Move to
		 * @param {number} x X coordinate
		 * @param {number} y Y coordinate
		 * @param {number=} opt_dir Direction (optional)
		 * @return {Element} This element
		 */
		moveTo(x, y, opt_dir) {
			this._x = x;
			this._y = y;
			if (opt_dir !== undefined) this._dir = checkDegRange(opt_dir);
			return this;
		}

		/**
		 * Scale
		 * @param {number=} val Value of scale
		 * @return {number|Element} Value of scale, or this element
		 */
		scale(val) {
			if (val === undefined) return this._scale;
			this._scale = val;
			return this;
		}

		/**
		 * Alpha
		 * @param {number=} val Value of alpha
		 * @return {number|Element} Value of alpha, or this element
		 */
		alpha(val) {
			if (val === undefined) return this._alpha;
			this._alpha = val;
			return this;
		}

		/**
		 * Angle around z axis (direction)
		 * @param {number=} deg Value of degree
		 * @return {number|Element} Value of degree, or this element
		 */
		angle(val) {
			if (val === undefined) return this._angle;
			this._angle = val;
			return this;
		}

		/**
		 * Angle around x axis (direction)
		 * @param {number=} deg Value of degree
		 * @return {number|Element} Value of degree, or this element
		 */
		angleX(val) {
			if (val === undefined) return this._angleX;
			this._angleX = val;
			return this;
		}

		/**
		 * 2nd angle around z axis (direction)
		 * @param {number=} deg Value of degree
		 * @return {number|Element} Value of degree, or this element
		 */
		angleZ(val) {
			if (val === undefined) return this._angleZ;
			this._angleZ = val;
			return this;
		}

		/**
		 * Whether is the drawing direction fixed regardless of the direction of the element?
		 * @param {boolean=} val Value
		 * @return {boolean|Element} Value or this element
		 */
		fixedHeading(val) {
			if (val === undefined) return this._isFixedHeading;
			this._isFixedHeading = val;
			return this;
		}

		/**
		 * Speed
		 * @param {number=} val Speed
		 * @return {number|Element} Speed or this element
		 */
		speed(val) {
			if (val === undefined) return this._speed;
			this._speed = val;
			return this;
		}

		/**
		 * Angle speed
		 * @param {number=} val Angle speed
		 * @return {number|Element} Angle speed or this element
		 */
		angleSpeed(val) {
			if (val === undefined) return this._angleSpeed;
			this._angleSpeed = val;
			return this;
		}

		/**
		 * Angle speed x
		 * @param {number=} val Angle speed
		 * @return {number|Element} Angle speed or this element
		 */
		angleSpeedX(val) {
			if (val === undefined) return this._angleSpeedX;
			this._angleSpeedX = val;
			return this;
		}

		/**
		 * Angle speed z
		 * @param {number=} val Angle speed
		 * @return {number|Element} Angle speed or this element
		 */
		angleSpeedZ(val) {
			if (val === undefined) return this._angleSpeedZ;
			this._angleSpeedZ = val;
			return this;
		}

		/**
		 * Set the horizontal range
		 * @param {number} min Minimum value
		 * @param {number} max Maximum value
		 * @param {boolean} isLoop Whether to loop
		 */
		setRangeX(min, max, isLoop) {
			this._checkRangeX = makeRangeChecker(min, max, isLoop);
		}

		/**
		 * Set the vertical range
		 * @param {number} min Minimum value
		 * @param {number} max Maximum value
		 * @param {boolean} isLoop Whether to loop
		 */
		setRangeY(min, max, isLoop) {
			this._checkRangeY = makeRangeChecker(min, max, isLoop);
		}

		/**
		 * Set handler for update event
		 * @param {function(*)} fn Function
		 * @param {Array} args_array Array of arguments to pass to the function
		 */
		setOnUpdate(fn, args_array) {
			const f = () => { fn.apply(this, args_array); };
			this._onUpdate = f;
		}

		/**
		 * Set handler for updated event
		 * @param {function(*)} fn Function
		 * @param {Array} args_array Array of arguments to pass to the function
		 */
		setOnUpdated(fn, args_array) {
			const f = () => { fn.apply(this, args_array); };
			this._onUpdated = f;
		}

		/**
		 * Motion
		 * @param {Motion=} val Motion
		 * @return {Motion|Element} Motion or this element
		 */
		motion(val) {
			if (val === undefined) return this._motion;
			this._motion = val;
			return this;
		}

		/**
		 * Data
		 * @param {object=} val Data
		 * @return {object|Element} Data or this element
		 */
		data(val) {
			if (val === undefined) return this._data;
			this._data = val;
			return this;
		}

		/**
		 * Set paper transformation and alpha value (used only in the library)
		 * @private
		 * @param {Paper|CanvasRenderingContext2D} ctx Paper or canvas context
		 */
		_setTransformation(ctx) {
			ctx.translate(this._x, this._y);
			if (!this._isFixedHeading) {
				ctx.rotate(this._dir * Math.PI / 180.0);
			}
			// Below, the sprite is rotated by angle degrees around the Z axis, angleX degrees around the X axis, and again by angleZ degrees around the Z axis.
			// Convert an angle to radians and rotate (radian = angle * π / 180)
			ctx.rotate(this._angleZ * Math.PI / 180);
			ctx.scale(1.0, Math.cos(this._angleX * Math.PI / 180));
			ctx.rotate(this._angle * Math.PI / 180);
			// * Corresponding to Euler angle of Z-X-Z

			if (this._scale instanceof Array) {
				ctx.scale(this._scale[0], this._scale[1]);
			} else {
				ctx.scale(this._scale, this._scale);
			}
			ctx.globalAlpha *= this._alpha;
		}

		/**
		 * Update coordinates and angles according to the speeds (used only in the library)
		 * @private
		 */
		_update() {
			// Update event
			if (this._onUpdate) this._onUpdate.call(this);

			this._angle  = checkDegRange(this._angle  + valueFunction(this._angleSpeed));
			this._angleX = checkDegRange(this._angleX + valueFunction(this._angleSpeedX));
			this._angleZ = checkDegRange(this._angleZ + valueFunction(this._angleSpeedZ));

			if (this._motion !== null) {
				const newPos = this._motion.update(this._x, this._y, this._dir, this._speed);
				this._x   = newPos[0];
				this._y   = newPos[1];
				this._dir = newPos[2];
			}
			if (this._checkRangeX !== null) this._x = this._checkRangeX(this._x);
			if (this._checkRangeY !== null) this._y = this._checkRangeY(this._y);

			if (this._observers) {
				for (let o of this._observers) {
					o.update(this);
				}
			}

			// Updated event
			if (this._onUpdated) this._onUpdated.call(this);
			// This function is called first to indicate that the coordinates etc. are correct
			this._fisrtUpdated = true;
		}

	}


	/**
	 * Sprite
	 * @extends {Element}
	 * @version 2020-05-05
	 */
	class Sprite extends Element {

		/**
		 * Make a sprite
		 * - However, normally, use the makeSprite function of SPRITE.Stage.
		 * @param {function(*)} drawFunction Function to draw pictures
		 * @param {Array=} opt_args_array Array of arguments to pass to the function
		 * @param {Motion=} opt_motion Motion
		 */
		constructor(drawFunction, opt_args_array, opt_motion) {
			super(opt_motion);

			this._drawFunction = drawFunction;
			this._drawFunctionArgs = opt_args_array;

			this._collisionRadius = 1;
			this._onCollision = null;
		}

		/**
		 * Draw a sprite
		 * @param {Paper|CanvasRenderingContext2D} ctx Paper or canvas context
		 * @param {Array} args_array Array of other arguments
		 */
		draw(ctx, args_array) {
			let args = args_array;
			if (this._drawFunctionArgs) {
				args = args_array.concat(this._drawFunctionArgs);
			}
			if (this._fisrtUpdated) {
				ctx.save();
				this._setTransformation(ctx);
				this._drawFunction.apply(this, args);
				ctx.restore();
			}
			this._update();
		}

		/**
		 * Collision radius
		 * @param {number=} val Radius
		 * @return {number|Sprite} Radius, or this sprite
		 */
		collisionRadius(val) {
			if (val === undefined) return this._collisionRadius;
			this._collisionRadius = val;
			return this;
		}

		/**
		 * Set the function handling the collision event
		 * @param {function(this, Sprite)=} handler Function
		 * @return {function(this, Sprite)=|Sprite} Function, or this sprite
		 */
		onCollision(handler) {
			if (handler === undefined) return this._onCollision;
			this._onCollision = handler;
			return this;
		}

	}


	/**
	 * Stage
	 * @extends {Element}
	 * @version 2020-05-05
	 */
	class Stage extends Element {

		/**
		 * Make a stage
		 * @param {Motion=} opt_motion Motion
		 */
		constructor(opt_motion) {
			super(opt_motion);

			this._children = [];

			this._localizeOption = null;
			this._localizedOffset = [0, 0, 0];

			this._update();
		}

		/**
		 * Make a sprite and add it to this stage
		 * @param {function(*)} drawFunction Function to draw pictures
		 * @param {Array=} opt_args_array Array of arguments to pass to the function
		 * @param {Motion=} opt_motion Motion
		 * @return {Sprite} Sprite
		 */
		makeSprite(drawFunction, opt_args_array, opt_motion) {
			const s = new SPRITE.Sprite(drawFunction, opt_args_array, opt_motion);
			this.add(s);
			return s;
		}

		/**
		 * Make a stage and add it to this stage
		 * @return {Stage} Stage
		 */
		makeStage() {
			const l = new SPRITE.Stage();
			this.add(l);
			return l;
		}

		/**
		 * Add a sprite or a stage
		 * @param {Element} child A sprite or a child stage
		 */
		add(child) {
			this._children.push(child);
			child._parent = this;
		}

		/**
		 * スプライトか子ステージを返す
		 * @param {number} index Index
		 * @return {Element} Sprite or child stage
		 */
		get(index) {
			return this._children[index];
		}

		/**
		 * Return the count of sprites or child stages this stage has
		 * @return {mumber} Count
		 */
		size() {
			return this._children.length;
		}

		/**
		 * Process for sprites and child stages that this stage has
		 * @param {function} callback Function to process
		 * @param {*} thisArg 'This' argument
		 */
		forEach(callback, thisArg) {
			for (let i = 0, I = this._children.length; i < I; i += 1) {
				const val = this._children[i];
				callback.call(thisArg, val, i, this);
			}
		}

		/**
		 * Display specified sprite as fixed
		 * @param {Element} descendant Sprite or stage
		 * @param {boolean=} opt_stopRotation Whether to stop rotation
		 */
		localize(descendant, opt_stopRotation) {
			this._localizeOption = [descendant, opt_stopRotation];
		}

		/**
		 * Display specified sprite as fixed (used only in the library)
		 * @private
		 */
		_localize() {
			if (this._localizeOption) {
				const descendant       = this._localizeOption[0];
				const opt_stopRotation = this._localizeOption[1];
				const off = this._getPositionOnParent(descendant, 0, 0, 0, opt_stopRotation);
				this._localizedOffset[0] = -off[0];
				this._localizedOffset[1] = -off[1];
				this._localizedOffset[2] = -off[2];
			} else {
				this._localizedOffset[0] = 0;
				this._localizedOffset[1] = 0;
				this._localizedOffset[2] = 0;
			}
		}

		/**
		 * Returns the position in the paper of this stage's origin
		 * @param {Element} descendant Sprite or child stage of this stage
		 * @return {Array<number>} Position
		 */
		getPositionOnContext(descendant) {
			const p = this._getPositionOnParent(descendant, 0, 0, 0);
			p[0] += this._localizedOffset[0];
			p[1] += this._localizedOffset[1];

			const r = this._localizedOffset[2] * Math.PI / 180;
			const sin = Math.sin(r);
			const cos = Math.cos(r);
			const x = (p[0] * cos - p[1] * sin);
			const y = (p[0] * sin + p[1] * cos);
			return [x, y];
		}

		/**
		 * Draw all sprites and child stages this stage has
		 * @param {Paper|CanvasRenderingContext2D} ctx Paper or canvas context
		 * @param {Array} args_array Array of other arguments
		 */
		draw(ctx, args_array) {
			ctx.save();

			this._localize();
			ctx.rotate(this._localizedOffset[2] * Math.PI / 180);
			ctx.translate(this._localizedOffset[0], this._localizedOffset[1]);
			this._setTransformation(ctx);

			for (let i = 0, I = this._children.length; i < I; i += 1) {
				const c = this._children[i];
				// Call the sprite's draw function
				c.draw.call(c, ctx, args_array);
			}
			ctx.restore();

			// At this timing Tracer::stepNext is called, and as a result, Tracer::onStep is also called
			this._update();
			this._checkCollision();
		}

		/**
		 * Return the position in the paper of the origin of an element (used only in the library)
		 * @private
		 * @param {Element} elm Sprite or child stage
		 * @param {number} cx Position x
		 * @param {number} cy Position y
		 * @param {number} ca Angle
		 * @param {boolean=} opt_stopRotation Whether to stop rotation
		 * @return {Array<number>} Position
		 */
		_getPositionOnParent(elm, cx, cy, ca, opt_stopRotation) {
			const a = (opt_stopRotation ? elm._angle : 0) + (elm._isFixedHeading ? 0 : elm._dir);
			const r = a * Math.PI / 180;
			const sin = Math.sin(r);
			const cos = Math.cos(r);
			let sx, sy;
			if (elm._scale instanceof Array) {
				sx = elm._scale[0], sy = elm._scale[1];
			} else {
				sx = sy = elm._scale;
			}
			const x = sx * (cx * cos - cy * sin);
			const y = sy * (cx * sin + cy * cos);
			if (elm._parent === null) return [x + elm._x, y + elm._y, a + ca];
			return this._getPositionOnParent(elm._parent, x + elm._x, y + elm._y, a + ca);
		}

		/**
		 * Check if the sprites are colliding (used only in the library)
		 * @private
		 */
		_checkCollision() {
			for (let i = 0, I = this._children.length; i < I; i += 1) {
				const c0 = this._children[i];
				const r0 = c0._collisionRadius;
				const x0 = c0._x;
				const y0 = c0._y;

				for (let j = i + 1, J = this._children.length; j < J; j += 1) {
					const c1 = this._children[j];
					if (!c0._onCollision && !c1._onCollision) continue;

					const r1 = c1._collisionRadius;
					const x1 = c1._x;
					const y1 = c1._y;
					const d2 = (x1 - x0) * (x1 - x0) + (y1 - y0) * (y1 - y0);
					const e2 = (r0 + r1) * (r0 + r1);
					if (d2 <= e2) {
						if (c0._onCollision) c0._onCollision(c0, c1);
						if (c1._onCollision) c1._onCollision(c1, c0);
					}
				}
			}
		}

		/**
		 * Add an observer
		 * @param {*} observer Observer
		 */
		addObserver(observer) {
			if (!this._observers) {
				this._observers = [];
			}
			this._observers.push(observer);
		}

	}


	/**
	 * Density Map
	 * @version 2020-05-05
	 */
	class DensityMap {

		/**
		 * Make a density map
		 * @constructor
		 * @param {number} width width
		 * @param {number} height height
		 * @param {number} gridSize grid size
		 */
		constructor(width, height, gridSize) {
			this._width    = width;
			this._height   = height;
			this._gridSize = gridSize;

			const dw = width  / gridSize;
			const dh = height / gridSize;
			this._gw = (0 | dw) < dw ? (0 | dw) + 1 : (0 | dw);
			this._gh = (0 | dh) < dh ? (0 | dh) + 1 : (0 | dh);

			this._map = this._makeMap();
		}

		/**
		 * Make a map (used only in the library)
		 * @private
		 * @return {Array<Array<number>>} Map
		 */
		_makeMap() {
			const m = new Array(this._gh);
			for (let y = 0; y < this._gh; y += 1) m[y] = new Array(this._gw).fill(0);
			return m;
		}

		/**
		 * Update the map according to the stage
		 * @param {Stage} stage Stage
		 */
		update(stage) {
			const m = this._map;
			const gs = this._gridSize;
			stage.forEach((e) => {
				const x = Math.min(Math.max(e.x(), 0), this._width  - 1);
				const y = Math.min(Math.max(e.y(), 0), this._height - 1);
				const dx = 0 | (x / gs);
				const dy = 0 | (y / gs);
				m[dy][dx] += 1;

				const pDx = e._prevDx;
				const pDy = e._prevDy;
				if (pDx !== undefined && pDy !== undefined) m[pDy][pDx] -= 1;
				e._prevDx = dx;
				e._prevDy = dy;
			}, this);
		}

		/**
		 * Get a density
		 * @param {number} x X coordinate
		 * @param {number} y Y coordinate
		 * @param {number} [deg=0] Direction
		 * @param {number} [len=0] Length
		 * @return Density
		 */
		getDensity(x, y, deg = 0, len = 0) {
			if (len === 0) {
				return this._getDensity(x, y);
			}
			[x, y] = this._checkCoordinate(x, y);
			const r = (deg - 90) * Math.PI / 180;
			const sin = Math.sin(r);
			const cos = Math.cos(r);
			const step = 0 | (len * 2 / this._gridSize);
			let sum = 0;
			for (let i = 1; i <= step; i += 1) {
				const r = i * this._gridSize / 2;
				const xx = x + r * cos;
				const yy = y + r * sin;
				sum += this._getDensity(xx, yy);
			}
			return sum;
		}

		/**
		 * Get a density of one point (used only in the library)
		 * @param {number} x X coordinate
		 * @param {number} y Y coordinate
		 * @return Density
		 */
		_getDensity(x, y) {
			[x, y] = this._checkCoordinate(x, y);
			const gs = this._gridSize;
			const dx = 0 | (x / gs);
			const dy = 0 | (y / gs);
			return this._map[dy][dx];
		}

		/**
		 * Check the range of coordinates and return the correct range of coordinates (used only in the library)
		 * @param {number} x X coordinate
		 * @param {number} y Y coordinate
		 * @return Coordinate
		 */
		_checkCoordinate(x, y) {
			if (x < 0) x += this._width;
			if (y < 0) y += this._height;
			if (this._width  <= x) x -= this._width;
			if (this._height <= y) y -= this._height;
			x = Math.min(Math.max(x, 0), this._width  - 1);
			y = Math.min(Math.max(y, 0), this._height - 1);
			return [x, y];
		}

		/**
		 * Draw the density map
		 * @param {Paper|CanvasRenderingContext2D} ctx Paper or canvas context
		 * @param {number} max Maximum value
		 */
		draw(ctx, max) {
			const gs = this._gridSize;
			for (let y = 0; y < this._gh; y += 1) {
				for (let x = 0; x < this._gw; x += 1) {
					const d = this._map[y][x];
					ctx.styleFill().alpha(CALC.map(d, 0, max, 0, 1));
					ctx.beginPath();
					ctx.rect(x * gs, y * gs, gs, gs);
					ctx.styleFill().draw();
				}
			}
		}

	}


	// Utility functions -------------------------------------------------------


	/**
	 * Make a function to plot sprite trajectory
	 * @param {Element} descendant Descendant element
	 * @param {Stage} ancestorStage Ancestor stage
	 * @param {Paper|CanvasRenderingContext2D} ctx Paper or canvas context to plot
	 * @return {function} Function to plot sprite trajectory
	 */
	const makePlotFunction = function (descendant, ancestorStage, ctx) {
		let old = [];
		return function () {
			if (!descendant._fisrtUpdated) return;
			const p = ancestorStage.getPositionOnContext(descendant);
			if (old.length > 0) {
				ctx.beginPath();
				ctx.moveTo(old[0], old[1]);
				ctx.lineTo(p[0], p[1]);
				ctx.stroke();
			}
			old = p;
		};
	};


	// Create a library --------------------------------------------------------


	return { Stage, Sprite, DensityMap, makePlotFunction };

}());
