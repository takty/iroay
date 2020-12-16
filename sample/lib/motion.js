/**
 * Motion library (MOTION)
 *
 * @author Takuto Yanagida
 * @version 2019-05-12
 */


/**
 * Library variable
 */
const MOTION = (function () {

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
	 * @param {number=} unitTime Unit time
	 * @return {number} Value
	 */
	const valueFunction = function (vf, unitTime = 1) {
		if (typeof vf === 'function') {
			return vf(unitTime);
		} else {
			return vf * unitTime;
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
	 * Axis coordinate motion
	 * @version 2020-05-05
	 */
	class AxisMotion {

		/**
		 * Make an axis coordinate motion
		 * @constructor
		 * @param {number=} [speedX=0] Horizontal speed
		 * @param {number=} [speedY=0] Vertical speed
		 */
		constructor(speedX = 0, speedY = 0) {
			this._speedX = speedX;
			this._speedY = speedY;
			this._checkRangeX = null;
			this._checkRangeY = null;
		}

		/**
		 * Horizontal speed
		 * @param {number=} val Value
		 * @return {number|AxisMotion} Value, or this motion
		 */
		speedX(val) {
			if (val === undefined) return this._speedX;
			this._speedX = val;
			return this;
		}

		/**
		 * Vertical speed
		 * @param {number=} val Value
		 * @return {number|AxisMotion} Value, or this motion
		 */
		speedY(val) {
			if (val === undefined) return this._speedY;
			this._speedY = val;
			return this;
		}

		/**
		 * Set the horizontal range
		 * @param {number} min Beginning
		 * @param {number} max End
		 * @param {boolean} isLoop Whether to loop
		 */
		setRangeX(min, max, isLoop) {
			this._checkRangeX = makeRangeChecker(min, max, isLoop);
		}

		/**
		 * Set the vertical range
		 * @param {number} min Beginning
		 * @param {number} max End
		 * @param {boolean} isLoop Whether to loop
		 */
		setRangeY(min, max, isLoop) {
			this._checkRangeY = makeRangeChecker(min, max, isLoop);
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
			x += valueFunction(this._speedX, unitTime);
			y += valueFunction(this._speedY, unitTime);
			if (this._checkRangeX !== null) x = this._checkRangeX(x);
			if (this._checkRangeY !== null) y = this._checkRangeY(y);
			return [x, y, dir];
		}

	}


	/**
	 * Polar coordinate motion
	 * @version 2020-05-05
	 */
	class PolarMotion {

		/**
		 * Make a polar coordinate motion
		 * @constructor
		 * @param {number=} [speedA=0] Angular speed
		 * @param {number=} [speedR=0] Radius speed
		 * @param {boolean=} [proportionalAngularSpeed=false] Whether angular speed is proportional to radius
		 */
		constructor(speedA = 0, speedR = 0, proportionalAngularSpeed = false) {
			this._speedA = speedA;
			this._speedR = speedR;
			this._propSpeedA = proportionalAngularSpeed;
			this._checkRangeR = null;
		}

		/**
		 * Angular speed
		 * @param {number=} val Value
		 * @return {number|PolarMotion} Value, or this motion
		 */
		speedA(val) {
			if (val === undefined) return this._speedA;
			this._speedA = val;
			return this;
		}

		/**
		 * Radius speed
		 * @param {number=} val Value
		 * @return {number|PolarMotion} Value, or this motion
		 */
		speedR(val) {
			if (val === undefined) return this._speedR;
			this._speedR = val;
			return this;
		}

		/**
		 * Set the radius range
		 * @param {number} min Beginning
		 * @param {number} max End
		 * @param {boolean} isLoop Whether to loop
		 */
		setRangeR(min, max, isLoop) {
			this._checkRangeR = makeRangeChecker(min, max, isLoop);
		}

		/**
		 * Whether angular speed is proportional to radius
		 * @param {boolean} val Value
		 * @return {boolean|PolarMotion} Value, or this motion
		 */
		proportionalAngularSpeed(val) {
			if (val === undefined) return this._propSpeedA;
			this._propSpeedA = val;
			return this;
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
			let r = Math.sqrt(x * x + y * y);
			r += valueFunction(this._speedR, unitTime);
			if (this._checkRangeR !== null) r = this._checkRangeR(r);

			let p = Math.atan2(y, x) * 180 / Math.PI;
			p += valueFunction(this._speedA, unitTime) / (this._propSpeedA ? r : 1);
			p = checkDegRange(p);

			const d = p * Math.PI / 180;
			return [r * Math.cos(d), r * Math.sin(d), dir];
		}

	}


	// Create a library --------------------------------------------------------


	return { AxisMotion, PolarMotion };

}());
