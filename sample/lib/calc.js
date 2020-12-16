/**
 * Calculation library (CALC)
 *
 * A library that allows you to use random functions with bounds,
 * mappings that translate from one range number to another,
 * and easing functions that you use to create non-trivial motions.
 *
 * @author Takuto Yanagida
 * @version 2019-09-03
 */


/**
 * Library variable
 */
const CALC = (function () {

	'use strict';


	// Random number function --------------------------------------------------


	/**
	 * Dice base
	 * @author Takuto Yanagida
	 * @version 2020-05-05
	 */
	class DiceBase {

		/**
		 * Make a dice
		 */
		constructor() {
			this._r = Math.random;
		}

		/**
		 * Return a random number from min to max
		 * @param {number} min Minimum number
		 * @param {number} max Maximum number
		 * @param {function(number): number=} opt_fn Easing function (optional)
		 * @return {number} A random number
		 */
		random(min, max, opt_fn) {
			if (opt_fn === undefined) {
				return this._r() * (max - min) + min;
			}
			return opt_fn(this._r()) * (max - min) + min;
		}

		/**
		 * Returns a random number from 0 to n_min or from min to max
		 * @param {number} n_min　An integer or a minimum integer
		 * @param {number=} opt_max　Maximum integer
		 * @return {number} A random integer
		 */
		rand(n_min, opt_max) {
			if (opt_max === undefined) {
				return Math.floor(this._r() * (n_min + 1));
			}
			return Math.floor(this._r() * (opt_max + 1 - n_min) + n_min);
		}

		/**
		 * Occur with probability specified in percent
		 * @param {number} percent Percent
		 * @return {boolean} Whether it occurs
		 */
		isLikely(percent) {
			return Math.floor(this._r() * (100 + 1)) <= percent;
		}

	}


	/**
	 * Dice
	 * @author Takuto Yanagida
	 * @version 2019-05-07
	 */
	class Dice extends DiceBase {

		/**
		 * Make a dice
		 */
		constructor(seed = Math.random()) {
			super();
			this._seed = 0 | (seed * (seed < 1 ? 1000 : 1));
			this._r = this._createGenerator(this._seed);
		}

		/**
		 * Create a function that returns a random number (Xorshift32) (used only in the library)
		 * @private
		 * @param {number} seed Seed number
		 * @return {function(): number} Function that returns a random number
		 */
		_createGenerator(seed) {
			let y = seed;
			const fn = () => {
				y = y ^ (y << 13);
				y = y ^ (y >> 17);
				y = y ^ (y << 15);
				return (y + 2147483648) / 4294967295;
			};
			const stack = [];
			fn.save = () => { stack.push(y); };
			fn.restore = () => { y = stack.pop(); };
			return fn;
		}

		/**
		 * Reset
		 */
		reset() {
			this._r = this._createGenerator(this._seed);
		}

		/**
		 * Save the current state
		 */
		save() {
			this._r.save();
		}

		/**
		 * Restore the previous state
		 */
		restore() {
			this._r.restore();
		}

	}


	let _dice = new DiceBase();

	/**
	 * Specify a seed value for the random function
	 * The same seed value produces the same combination of random values.
	 * @param {number} seed Seed value
	 */
	const setRandomSeed = function (seed) {
		_dice = new Dice(seed);
	};

	/**
	 * Reset the random function
	 */
	const resetRandomSeed = function () {
		if (!(_dice instanceof Dice)) _dice = new Dice();
		_dice.reset();
	};

	/**
	 * Save the current state of the random function
	 */
	const saveRandomState = function () {
		if (!(_dice instanceof Dice)) _dice = new Dice();
		_dice.save();
	};

	/**
	 * Restore the previous state of the random function
	 */
	const restoreRandomState = function () {
		if (!(_dice instanceof Dice)) _dice = new Dice();
		_dice.restore();
	};

	/**
	 * Return a random number from min to max
	 * @param {number} min Minimum number
	 * @param {number} max Maximum number
	 * @param {function(number): number=} opt_fn Easing function (optional)
	 * @return {number} A random number
	 */
	const random = function (min, max, opt_fn) {
		return _dice.random(min, max, opt_fn);
	};

	/**
	 * Returns a random number from 0 to n_min or from min to max
	 * @param {number} n_min　An integer or a minimum integer
	 * @param {number=} opt_max　Maximum integer
	 * @return {number} A random integer
	 */
	const rand = function (n_min, opt_max) {
		return _dice.rand(n_min, opt_max);
	};

	/**
	 * Occur with probability specified in percent
	 * @param {number} percent Percent
	 * @return {boolean} Whether it occurs
	 */
	const isLikely = function (percent) {
		return _dice.isLikely(percent);
	};


	/**
	 * Noise
	 * Reference: Stefan Gustavson, SimplexNoise1234, http://staffwww.itn.liu.se/~stegu/aqsis/aqsis-newnoise/simplexnoise1234.cpp
	 * @author Takuto Yanagida
	 * @version 2020-04-29
	 */
	class Noise {

		constructor() {
			this._perm = [];
			for (let i = 0; i < 256; i += 1) {
				this._perm.push(0 | (Math.random() * 256));
			}
		}

		get(x) {
			return (this._generate(x) + 1) * 0.5;
		}

		_generate(x) {
			const i0 = Math.floor(x);
			const i1 = i0 + 1;
			const x0 = x - i0;
			const x1 = x0 - 1;

			let t0 = 1.0 - x0 * x0;
			t0 *= t0;
			const n0 = t0 * t0 * this._grad(this._perm[i0 & 0xff], x0);

			let t1 = 1.0 - x1 * x1;
			t1 *= t1;
			const n1 = t1 * t1 * this._grad(this._perm[i1 & 0xff], x1);
			return 0.395 * (n0 + n1);
		}

		_grad(hash, x) {
			const h = hash & 15;
			let grad = 1.0 + (h & 7);
			if ((h & 8) !== 0) grad = -grad;
			return (grad * x);
		}

	}


	let _noise = new Noise();

	const noise = function (x) {
		return _noise.get(x);
	};


	// Utility functions -------------------------------------------------------


	/**
	 * Limit the number to a certain range
	 * @param {number} val A number
	 * @param {number} min Minimum number
	 * @param {number} max Maximum number
	 * @param {string=} type Type
	 * @return {number} A limited number
	 */
	const constrain = function (val, min, max, type) {
		if (type === 'loop') {
			if (val < min) return max;
			if (max < val) return min;
		} else {
			if (val < min) return min;
			if (max < val) return max;
		}
		if (val === undefined || Number.isNaN(val)) return min;
		return val;
	};

	/**
	 * Convert one range of numbers to another range of numbers
	 * @param {number} val An original number
	 * @param {number} from1 Beginning of original range
	 * @param {number} to1 End of original range
	 * @param {number} from2 Beginning of another range
	 * @param {number} to2 End of another range
	 * @param {function(number): number=} opt_fn Easing function (optional)
	 * @return {number} A converted number
	 */
	const map = function (val, from1, to1, from2, to2, opt_fn) {
		if (from1 < to1) {
			if (val < from1) val = from1;
			if (val > to1)   val = to1;
		} else {
			if (val > from1) val = from1;
			if (val < to1)   val = to1;
		}
		if (opt_fn === undefined) {
			return (val - from1) * (to2 - from2) / (to1 - from1) + from2;
		}
		return opt_fn((val - from1) / (to1 - from1)) * (to2 - from2) + from2;
	};


	/**
	 * Easing functions (algorithms)
	 * Reference: http://easings.net/
	 * @author Takuto Yanagida
	 * @version 2019-05-06
	 */


	/**
	 * Linear (no change)
	 * @param {number} t A number fron 0 to 1
	 * @return {number} A number
	 */
	const linear = function (t) {
		return t;
	};

	/**
	 * Sine function (ease-in)
	 * @param {number} t A number fron 0 to 1
	 * @return {number} A number
	 */
	const easeInSine = function (t) {
		return -Math.cos(t * (Math.PI / 2)) + 1;
	};

	/**
	 * Sine function (ease-out)
	 * @param {number} t A number fron 0 to 1
	 * @return {number} A number
	 */
	const easeOutSine = function (t) {
		return Math.sin(t * (Math.PI / 2));
	};

	/**
	 * Sine function (ease-in/out)
	 * @param {number} t A number fron 0 to 1
	 * @return {number} A number
	 */
	const easeInOutSine = function (t) {
		return -0.5 * (Math.cos(Math.PI * t) - 1);
	};

	/**
	 * Quadratic function (ease-in)
	 * @param {number} t A number fron 0 to 1
	 * @return {number} A number
	 */
	const easeInQuad = function (t) {
		return t * t;
	};

	/**
	 * Quadratic function (ease-out)
	 * @param {number} t A number fron 0 to 1
	 * @return {number} A number
	 */
	const easeOutQuad = function (t) {
		return -t * (t - 2);
	};

	/**
	 * Quadratic function (ease-in/out)
	 * @param {number} t A number fron 0 to 1
	 * @return {number} A number
	 */
	const easeInOutQuad = function (t) {
		t *= 2;
		if (t < 1) {
			return 0.5 * t * t;
		}
		t -= 1;
		return -0.5 * (t * (t - 2) - 1);
	};

	/**
	 * Cubic function (ease-in)
	 * @param {number} t A number fron 0 to 1
	 * @return {number} A number
	 */
	const easeInCubic = function (t) {
		return t * t * t;
	};

	/**
	 * Cubic function (ease-out)
	 * @param {number} t A number fron 0 to 1
	 * @return {number} A number
	 */
	const easeOutCubic = function (t) {
		t -= 1;
		return (t * t * t + 1);
	};

	/**
	 * Cubic function (ease-in/out)
	 * @param {number} t A number fron 0 to 1
	 * @return {number} A number
	 */
	const easeInOutCubic = function (t) {
		t *= 2;
		if (t < 1) {
			return 0.5 * t * t * t;
		}
		t -= 2;
		return 0.5 * (t * t * t + 2);
	};

	/**
	 * Quartic function (ease-in)
	 * @param {number} t A number fron 0 to 1
	 * @return {number} A number
	 */
	const easeInQuart = function (t) {
		return t * t * t * t;
	};

	/**
	 * Quartic function (ease-out)
	 * @param {number} t A number fron 0 to 1
	 * @return {number} A number
	 */
	const easeOutQuart = function (t) {
		t -= 1;
		return -(t * t * t * t - 1);
	};

	/**
	 * Quartic function (ease-in/out)
	 * @param {number} t A number fron 0 to 1
	 * @return {number} A number
	 */
	const easeInOutQuart = function (t) {
		t *= 2;
		if (t < 1) {
			return 0.5 * t * t * t * t;
		}
		t -= 2;
		return -0.5 * (t * t * t * t - 2);
	};

	/**
	 * Quintic function (ease-in)
	 * @param {number} t A number fron 0 to 1
	 * @return {number} A number
	 */
	const easeInQuint = function (t) {
		return t * t * t * t * t;
	};

	/**
	 * Quintic function (ease-out)
	 * @param {number} t A number fron 0 to 1
	 * @return {number} A number
	 */
	const easeOutQuint = function (t) {
		t -= 1;
		return (t * t * t * t * t + 1);
	};

	/**
	 * Quintic function (ease-in/out)
	 * @param {number} t A number fron 0 to 1
	 * @return {number} A number
	 */
	const easeInOutQuint = function (t) {
		t *= 2;
		if (t < 1) {
			return 0.5 * t * t * t * t * t;
		}
		t -= 2;
		return 0.5 * (t * t * t * t * t + 2);
	};

	/**
	 * Exponential function (ease-in)
	 * @param {number} t A number fron 0 to 1
	 * @return {number} A number
	 */
	const easeInExpo = function (t) {
		return Math.pow(2, 10 * (t - 1));
	};

	/**
	 * Exponential function (ease-out)
	 * @param {number} t A number fron 0 to 1
	 * @return {number} A number
	 */
	const easeOutExpo = function (t) {
		return -Math.pow(2, -10 * t) + 1;
	};

	/**
	 * Exponential function (ease-in/out)
	 * @param {number} t A number fron 0 to 1
	 * @return {number} A number
	 */
	const easeInOutExpo = function (t) {
		t *= 2;
		if (t < 1) {
			return 0.5 * Math.pow(2, 10 * (t - 1));
		}
		t -= 1;
		return 0.5 * (-Math.pow(2, -10 * t) + 2);
	};

	/**
	 * Circular function (ease-in)
	 * @param {number} t A number fron 0 to 1
	 * @return {number} A number
	 */
	const easeInCirc = function (t) {
		return -(Math.sqrt(1 - t * t) - 1);
	};

	/**
	 * Circular function (ease-out)
	 * @param {number} t A number fron 0 to 1
	 * @return {number} A number
	 */
	const easeOutCirc = function (t) {
		t -= 1;
		return Math.sqrt(1 - t * t);
	};

	/**
	 * Circular function (ease-in/out)
	 * @param {number} t A number fron 0 to 1
	 * @return {number} A number
	 */
	const easeInOutCirc = function (t) {
		t *= 2;
		if (t < 1) {
			return -0.5 * (Math.sqrt(1 - t * t) - 1);
		}
		t -= 2;
		return 0.5 * (Math.sqrt(1 - t * t) + 1);
	};


	// Create a library --------------------------------------------------------


	return {
		Dice,
		setRandomSeed,
		resetRandomSeed,
		saveRandomState,
		restoreRandomState,

		random, rand, isLikely,
		constrain, map,

		Noise,
		noise,

		linear,
		easeInSine, easeOutSine, easeInOutSine,
		easeInQuad, easeOutQuad, easeInOutQuad,
		easeInCubic, easeOutCubic, easeInOutCubic,
		easeInQuart, easeOutQuart, easeInOutQuart,
		easeInQuint, easeOutQuint, easeInOutQuint,
		easeInExpo, easeOutExpo, easeInOutExpo,
		easeInCirc, easeOutCirc, easeInOutCirc,
	};

}());
