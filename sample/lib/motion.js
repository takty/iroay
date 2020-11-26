/**
 * モーション・ライブラリ（MOTION）
 *
 * @author Takuto Yanagida
 * @version 2019-05-12
 */


/**
 * ライブラリ変数
 */
const MOTION = (function () {

	'use strict';


	// ライブラリ中だけで使用するユーティリティ --------------------------------


	/**
	 * 角度を0～360度の範囲にする
	 * @param {number} deg 角度
	 * @return {number} 角度
	 */
	const checkDegRange = function (deg) {
		deg %= 360;
		if (deg < 0) deg += 360;
		return deg;
	};

	/**
	 * 値なら返し、関数なら関数を呼び出す
	 * @param {number|function(): number} vf 値か関数
	 * @param {number=} unitTime 単位時間
	 * @return {number} 値
	 */
	const valueFunction = function (vf, unitTime = 1) {
		if (typeof vf === 'function') {
			return vf(unitTime);
		} else {
			return vf * unitTime;
		}
	};

	/**
	 * 範囲をチェックする関数を作る
	 * @param {number} min 最小値
	 * @param {number} max 最大値
	 * @param {boolean=} isLoop ループする？
	 * @return {function(number): number} 範囲をチェックする関数
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
	 * 直交座標モーション
	 * @version 2020-05-05
	 */
	class AxisMotion {

		/**
		 * 直交座標モーションを作る
		 * @constructor
		 * @param {number=} [speedX=0] 横方向のスピード
		 * @param {number=} [speedY=0] たて方向のスピード
		 */
		constructor(speedX = 0, speedY = 0) {
			this._speedX = speedX;
			this._speedY = speedY;
			this._checkRangeX = null;
			this._checkRangeY = null;
		}

		/**
		 * 横方向のスピード
		 * @param {number=} val 値
		 * @return {number|AxisMotion} 値／このモーション
		 */
		speedX(val) {
			if (val === undefined) return this._speedX;
			this._speedX = val;
			return this;
		}

		/**
		 * たて方向のスピード
		 * @param {number=} val 値
		 * @return {number|AxisMotion} 値／このモーション
		 */
		speedY(val) {
			if (val === undefined) return this._speedY;
			this._speedY = val;
			return this;
		}

		/**
		 * 横方向の範囲をセットする
		 * @param {number} min 始まり
		 * @param {number} max 終わり
		 * @param {boolean} isLoop ループする？
		 */
		setRangeX(min, max, isLoop) {
			this._checkRangeX = makeRangeChecker(min, max, isLoop);
		}

		/**
		 * たて方向の範囲をセットする
		 * @param {number} min 始まり
		 * @param {number} max 終わり
		 * @param {boolean} isLoop ループする？
		 */
		setRangeY(min, max, isLoop) {
			this._checkRangeY = makeRangeChecker(min, max, isLoop);
		}

		/**
		 * スピードに合わせて座標を更新する
		 * @param {number} x x座標（横の場所）
		 * @param {number} y y座標（たての場所）
		 * @param {number} dir 方向
		 * @param {number} unitTime 単位時間
		 * @return {Array<number>} 座標
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
	 * 極座標モーション
	 * @version 2020-05-05
	 */
	class PolarMotion {

		/**
		 * 極座標モーションを作る
		 * @constructor
		 * @param {number=} [speedA=0] 角度方向のスピード
		 * @param {number=} [speedR=0] 半径方向のスピード
		 * @param {boolean=} [proportionalAngularSpeed=false] 角度方向のスピードが半径に比例する？
		 */
		constructor(speedA = 0, speedR = 0, proportionalAngularSpeed = false) {
			this._speedA = speedA;
			this._speedR = speedR;
			this._propSpeedA = proportionalAngularSpeed;
			this._checkRangeR = null;
		}

		/**
		 * 角度方向のスピード
		 * @param {number=} val 値
		 * @return {number|PolarMotion} 値／このモーション
		 */
		speedA(val) {
			if (val === undefined) return this._speedA;
			this._speedA = val;
			return this;
		}

		/**
		 * 半径方向のスピード
		 * @param {number=} val 値
		 * @return {number|PolarMotion} 値／このモーション
		 */
		speedR(val) {
			if (val === undefined) return this._speedR;
			this._speedR = val;
			return this;
		}

		/**
		 * 半径方向の範囲をセットする
		 * @param {number} min 始まり
		 * @param {number} max 終わり
		 * @param {boolean} isLoop ループする？
		 */
		setRangeR(min, max, isLoop) {
			this._checkRangeR = makeRangeChecker(min, max, isLoop);
		}

		/**
		 * 角度方向のスピードが半径に比例する？
		 * @param {boolean} val 値
		 * @return {boolean|PolarMotion} 値／このモーション
		 */
		proportionalAngularSpeed(val) {
			if (val === undefined) return this._propSpeedA;
			this._propSpeedA = val;
			return this;
		}

		/**
		 * スピードに合わせて座標を更新する
		 * @param {number} x x座標（横の場所）
		 * @param {number} y y座標（たての場所）
		 * @param {number} dir 方向
		 * @param {number} unitTime 単位時間
		 * @return {Array<number>} 座標
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


	// ライブラリを作る --------------------------------------------------------


	return { AxisMotion, PolarMotion };

}());
