/**
 * スプライト・ライブラリ（SPRITE）
 *
 * スプライト（アニメのセル画のようなもの）を作って、
 * 好きな場所に好きな大きさ、向き、透明度で表示するためのライブラリです。
 *
 * @author Takuto Yanagida
 * @version 2020-05-04
 */


/**
 * ライブラリ変数
 */
const SPRITE = (function () {

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
	 * 値ならそのまま返し、関数なら関数を呼び出す
	 * @param {number|function(): number} vf 値か関数
	 * @return {number} 値
	 */
	const valueFunction = function (vf) {
		if (typeof vf === 'function') {
			return vf();
		} else {
			return vf;
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
	 * 要素（スプライト・ステージ共通）
	 * @version 2020-05-05
	 */
	class Element {

		/**
		 * 要素を作る
		 * @param {Motion?} [motion=null] 動き
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
		 * x座標
		 * @param {number=} val x座標の値
		 * @return {number|Element} x座標の値／この要素
		 */
		x(val) {
			if (val === undefined) return this._x;
			this._x = val;
			return this;
		}

		/**
		 * y座標
		 * @param {number=} val y座標の値
		 * @return {number|Element} y座標の値／この要素
		 */
		y(val) {
			if (val === undefined) return this._y;
			this._y = val;
			return this;
		}

		/**
		 * 方向
		 * @param {number=} deg 角度の値
		 * @return {number|Element} 角度の値／この要素
		 */
		direction(deg) {
			if (deg === undefined) return this._dir;
			this._dir = checkDegRange(deg);
			return this;
		}

		/**
		 * 移動する
		 * @param {number} x x座標
		 * @param {number} y y座標
		 * @param {number=} opt_dir 方向（オプション）
		 * @return {Element} この要素
		 */
		moveTo(x, y, opt_dir) {
			this._x = x;
			this._y = y;
			if (opt_dir !== undefined) this._dir = checkDegRange(opt_dir);
			return this;
		}

		/**
		 * スケール
		 * @param {number=} val スケールの値
		 * @return {number|Element} スケールの値／この要素
		 */
		scale(val) {
			if (val === undefined) return this._scale;
			this._scale = val;
			return this;
		}

		/**
		 * アルファ
		 * @param {number=} val アルファの値
		 * @return {number|Element} アルファの値／この要素
		 */
		alpha(val) {
			if (val === undefined) return this._alpha;
			this._alpha = val;
			return this;
		}

		/**
		 * z軸を中心とする角度（向き）
		 * @param {number=} deg 角度の値
		 * @return {number|Element} 角度の値／この要素
		 */
		angle(val) {
			if (val === undefined) return this._angle;
			this._angle = val;
			return this;
		}

		/**
		 * x軸を中心とする角度（向き）
		 * @param {number=} deg 角度の値
		 * @return {number|Element} 角度の値／この要素
		 */
		angleX(val) {
			if (val === undefined) return this._angleX;
			this._angleX = val;
			return this;
		}

		/**
		 * z軸を中心とする角度2（向き）
		 * @param {number=} deg 角度の値
		 * @return {number|Element} 角度の値／この要素
		 */
		angleZ(val) {
			if (val === undefined) return this._angleZ;
			this._angleZ = val;
			return this;
		}

		/**
		 * 絵をかく方向を向きと関係なく固定するか？
		 * @param {boolean=} val 値
		 * @return {boolean|Element} 値／この要素
		 */
		fixedHeading(val) {
			if (val === undefined) return this._isFixedHeading;
			this._isFixedHeading = val;
			return this;
		}

		/**
		 * スピード
		 * @param {number=} val スピード
		 * @return {number|Element} スピード／この要素
		 */
		speed(val) {
			if (val === undefined) return this._speed;
			this._speed = val;
			return this;
		}

		/**
		 * 方向スピード
		 * @param {number=} val 方向スピード
		 * @return {number|Element} 方向スピード／この要素
		 */
		angleSpeed(val) {
			if (val === undefined) return this._angleSpeed;
			this._angleSpeed = val;
			return this;
		}

		/**
		 * 方向スピードx
		 * @param {number=} val 方向スピード
		 * @return {number|Element} 方向スピード／この要素
		 */
		angleSpeedX(val) {
			if (val === undefined) return this._angleSpeedX;
			this._angleSpeedX = val;
			return this;
		}

		/**
		 * 方向スピードz
		 * @param {number=} val 方向スピード
		 * @return {number|Element} 方向スピード／この要素
		 */
		angleSpeedZ(val) {
			if (val === undefined) return this._angleSpeedZ;
			this._angleSpeedZ = val;
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
		 * 更新前イベントのハンドラーをセットする
		 * @param {function(*)} fn 関数
		 * @param {Array} args_array 関数に渡す引数の配列
		 */
		setOnUpdate(fn, args_array) {
			const f = () => { fn.apply(this, args_array); };
			this._onUpdate = f;
		}

		/**
		 * 更新後イベントのハンドラーをセットする
		 * @param {function(*)} fn 関数
		 * @param {Array} args_array 関数に渡す引数の配列
		 */
		setOnUpdated(fn, args_array) {
			const f = () => { fn.apply(this, args_array); };
			this._onUpdated = f;
		}

		/**
		 * 動き
		 * @param {Motion=} val 動き
		 * @return {Motion|Element} 動き／この要素
		 */
		motion(val) {
			if (val === undefined) return this._motion;
			this._motion = val;
			return this;
		}

		/**
		 * データ
		 * @param {object=} val データ
		 * @return {object|Element} データ／この要素
		 */
		data(val) {
			if (val === undefined) return this._data;
			this._data = val;
			return this;
		}

		/**
		 * 紙の座標変換とアルファ値をセットする（ライブラリ内だけで使用）
		 * @private
		 * @param {Paper|CanvasRenderingContext2D} ctx 紙／キャンバス・コンテキスト
		 */
		_setTransformation(ctx) {
			ctx.translate(this._x, this._y);
			if (!this._isFixedHeading) {
				ctx.rotate(this._dir * Math.PI / 180.0);
			}
			// 下ではスプライトを、Z軸中心にangle度回転、X軸を中心にangleX度回転、さらにもう一度Z軸を中心にangleZ度回転させている
			// 角度をラジアンに変換して回転（ラジアン = 角度 ✕ π / 180）
			ctx.rotate(this._angleZ * Math.PI / 180);
			ctx.scale(1.0, Math.cos(this._angleX * Math.PI / 180));
			ctx.rotate(this._angle * Math.PI / 180);
			// ※Z-X-Zのオイラー角に対応

			if (this._scale instanceof Array) {
				ctx.scale(this._scale[0], this._scale[1]);
			} else {
				ctx.scale(this._scale, this._scale);
			}
			ctx.globalAlpha *= this._alpha;
		}

		/**
		 * スピードに合わせて座標と角度を更新する（ライブラリ内だけで使用）
		 * @private
		 */
		_update() {
			// 更新前イベント
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

			// 更新後イベント
			if (this._onUpdated) this._onUpdated.call(this);
			// 最初にこの関数が呼ばれ、座標などが正しいことを示す
			this._fisrtUpdated = true;
		}

	}


	/**
	 * スプライト
	 * @extends {Element}
	 * @version 2020-05-05
	 */
	class Sprite extends Element {

		/**
		 * スプライトを作る
		 * - ただし普通は、SPRITE.StageのmakeSprite関数を使う。
		 * @param {function(*)} drawFunction 絵をかく関数
		 * @param {Array=} opt_args_array 関数に渡す引数の配列
		 * @param {Motion=} opt_motion モーション
		 */
		constructor(drawFunction, opt_args_array, opt_motion) {
			super(opt_motion);

			this._drawFunction = drawFunction;
			this._drawFunctionArgs = opt_args_array;

			this._collisionRadius = 1;
			this._onCollision = null;
		}

		/**
		 * スプライトをかく
		 * @param {Paper|CanvasRenderingContext2D} ctx 紙／キャンバス・コンテキスト
		 * @param {Array} args_array その他の引数の配列
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
		 * 衝突半径
		 * @param {number=} val 半径
		 * @return {number|Sprite} 半径／このスプライト
		 */
		collisionRadius(val) {
			if (val === undefined) return this._collisionRadius;
			this._collisionRadius = val;
			return this;
		}

		/**
		 * 衝突イベントに対応する関数をセットする
		 * @param {function(this, Sprite)=} handler 関数
		 * @return {function(this, Sprite)=} 半径／このスプライト
		 */
		onCollision(handler) {
			if (handler === undefined) return this._onCollision;
			this._onCollision = handler;
			return this;
		}

	}


	/**
	 * ステージ
	 * @extends {Element}
	 * @version 2020-05-05
	 */
	class Stage extends Element {

		/**
		 * ステージを作る
		 * @param {Motion=} opt_motion モーション
		 */
		constructor(opt_motion) {
			super(opt_motion);

			this._children = [];

			this._localizeOption = null;
			this._localizedOffset = [0, 0, 0];

			this._update();
		}

		/**
		 * スプライトを作って加える
		 * @param {function(*)} drawFunction 絵をかく関数
		 * @param {Array=} opt_args_array 関数に渡す引数の配列
		 * @param {Motion=} opt_motion モーション
		 * @return {Sprite} スプライト
		 */
		makeSprite(drawFunction, opt_args_array, opt_motion) {
			const s = new SPRITE.Sprite(drawFunction, opt_args_array, opt_motion);
			this.add(s);
			return s;
		}

		/**
		 * ステージを作って加える
		 * @return {Stage} ステージ
		 */
		makeStage() {
			const l = new SPRITE.Stage();
			this.add(l);
			return l;
		}

		/**
		 * スプライトか子ステージを加える
		 * @param {Element} child スプライトか子ステージ
		 */
		add(child) {
			this._children.push(child);
			child._parent = this;
		}

		/**
		 * スプライトか子ステージを返す
		 * @param {number} index 何番目か
		 * @return {Element} スプライトか子ステージ
		 */
		get(index) {
			return this._children[index];
		}

		/**
		 * 何枚のスプライトか子ステージを持っているか、数を返す
		 * @return {mumber} 数
		 */
		size() {
			return this._children.length;
		}

		/**
		 * 持っているスプライトと子ステージに対して処理をする
		 * @param {function} callback 処理をする関数
		 * @param {*} thisArg This引数
		 */
		forEach(callback, thisArg) {
			for (let i = 0, I = this._children.length; i < I; i += 1) {
				const val = this._children[i];
				callback.call(thisArg, val, i, this);
			}
		}

		/**
		 * 指定したスプライトを固定して表示する
		 * @param {Element} descendant スプライトかステージ
		 * @param {boolean=} opt_stopRotation 回転を止めるか
		 */
		localize(descendant, opt_stopRotation) {
			this._localizeOption = [descendant, opt_stopRotation];
		}

		/**
		 * 指定したスプライトを固定して表示する（ライブラリ内だけで使用）
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
		 * このステージの原点の紙での場所を返す
		 * @param {Element} descendant スプライトかステージ
		 * @return {Array<number>} 場所
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
		 * 持っているスプライトと子ステージを全てかく
		 * @param {Paper|CanvasRenderingContext2D} ctx 紙／キャンバス・コンテキスト
		 * @param {Array} args_array その他の引数の配列
		 */
		draw(ctx, args_array) {
			ctx.save();

			this._localize();
			ctx.rotate(this._localizedOffset[2] * Math.PI / 180);
			ctx.translate(this._localizedOffset[0], this._localizedOffset[1]);
			this._setTransformation(ctx);

			for (let i = 0, I = this._children.length; i < I; i += 1) {
				const c = this._children[i];
				// スプライトのdraw関数を呼び出す
				c.draw.call(c, ctx, args_array);
			}
			ctx.restore();

			// このタイミングでTracer::stepNextが呼ばれ、その結果、Tracer::onStepも呼び出される
			this._update();
			this._checkCollision();
		}

		/**
		 * ある要素の原点の紙での場所を返す（ライブラリ内だけで使用）
		 * @private
		 * @param {Element} elm スプライトか子ステージ
		 * @param {number} cx 横位置
		 * @param {number} cy たて位置
		 * @param {number} ca 角度
		 * @param {boolean=} opt_stopRotation 回転を止めるか
		 * @return {Array<number>} 場所
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
		 * 持っているスプライトが衝突しているかどうかをチェックする（ライブラリ内だけで使用）
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
		 * 観察者（オブザーバー）を加える
		 * @param {*} observer 観察者（オブザーバー）
		 */
		addObserver(observer) {
			if (!this._observers) {
				this._observers = [];
			}
			this._observers.push(observer);
		}

	}


	/**
	 * 密度マップ
	 * @version 2020-05-05
	 */
	class DensityMap {

		/**
		 * 密度マップを作る
		 * @constructor
		 * @param {number} width 横の大きさ
		 * @param {number} height たての大きさ
		 * @param {number} gridSize マス目の大きさ
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
		 * マップを作る（ライブラリ内だけで使用）
		 * @private
		 * @return {Array<Array<number>>} マップ
		 */
		_makeMap() {
			const m = new Array(this._gh);
			for (let y = 0; y < this._gh; y += 1) m[y] = new Array(this._gw).fill(0);
			return m;
		}

		/**
		 * ステージに合わせてマップを更新する
		 * @param {Stage} stage ステージ
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
		 * 密度を求める
		 * @param {number} x x座標
		 * @param {number} y y座標
		 * @param {number} [deg=0] 方向
		 * @param {number} [len=0] 長さ
		 * @return 密度
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
		 * 1点の密度を求める（ライブラリ内だけで使用）
		 * @param {number} x x座標
		 * @param {number} y y座標
		 * @return 密度
		 */
		_getDensity(x, y) {
			[x, y] = this._checkCoordinate(x, y);
			const gs = this._gridSize;
			const dx = 0 | (x / gs);
			const dy = 0 | (y / gs);
			return this._map[dy][dx];
		}

		/**
		 * 座標の範囲を調べて正しい範囲の座標を返す（ライブラリ内だけで使用）
		 * @param {number} x x座標
		 * @param {number} y y座標
		 * @return 座標
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
		 * 密度マップをかく
		 * @param {Paper|CanvasRenderingContext2D} ctx 紙／キャンバス・コンテキスト
		 * @param {number} max 最大値
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


	// ユーティリティ関数 ------------------------------------------------------


	/**
	 * スプライトの軌跡をプロットする関数を作る
	 * @param {Element} descendant 子孫要素
	 * @param {Stage} ancestorStage 先祖ステージ
	 * @param {Paper|CanvasRenderingContext2D} ctx プロットする紙／キャンバス・コンテキスト
	 * @return {function} スプライトの軌跡をプロットする関数
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


	// ライブラリを作る --------------------------------------------------------


	return { Stage, Sprite, DensityMap, makePlotFunction };

}());
