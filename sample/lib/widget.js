/**
 * Widget library (WIDGET)
 *
 * A library that allows you to use various widgets (controls).
 *
 * @author Takuto Yanagida
 * @version 2020-04-24
 */


/**
 * Library variable
 */
const WIDGET = (function () {

	'use strict';

	const _addStyle = (function () {
		const s = document.createElement('style');
		s.setAttribute('type', 'text/css');
		document.head.appendChild(s);
		const ss = s.sheet;

		return (style) => {
			const styles = style.split('}').filter(e => e.indexOf('{') !== -1).map(e => e + '}');
			for (let s of styles) {
				ss.insertRule(s, ss.cssRules.length);
			}
		};
	})();

	let isBaseStyleAssigned = false;

	/**
	 * Register base style
	 */
	const ensureBaseStyle = function () {
		if (isBaseStyleAssigned) return;
		_addStyle(`
			.__widget {
				margin: 0px;
				padding: 0px;
				box-sizing: border-box;
				font-family: Consolas, Menlo, "Courier New", "メイリオ", Meiryo, "Osaka－等幅", Osaka-mono, monospace;
			}
			.__widget-base {
				display: inline-flex;
				position: relative;
				margin: 4px;
				padding: 8px;
				border-radius: 4px;
				background-color: White;
				box-shadow: 1px 1px 8px rgba(0, 0, 0, 0.4);
			}
			.__widget-full {
				width: 100%;
				height: 100%;
				position: relative;
			}
		`);
		_addStyle(`
			.__widget-button {
				flex: 1 1 1;
				min-width: 32px;
				min-height: 32px;
				display: flex;
				justify-content: center;
				align-items: center;
				margin-right: 12px;
				padding: 4px 8px;
				overflow: hidden;
				border-radius: 8px;
				box-shadow: 0px 0px 4px rgba(0, 0, 0, 0.25);
				cursor: pointer;
			}
			.__widget-button:last-child {
				margin-right: 0px;
			}
			.__widget-button:hover {
				box-shadow: 1px 1px 8px rgba(0, 0, 0, 0.4);
			}
			.__widget-button:active {
				box-shadow: 1px 1px 8px rgba(0, 0, 0, 0.4) inset;
			}
			.__widget-button-pushed {
				box-shadow: 1px 1px 8px rgba(0, 0, 0, 0.4) inset !important;
			}
		`);
		_addStyle(`
			.__widget-slider-knob {
				position: absolute;
				width: 16px; height: 16px;
				margin: -8px 0px 0px -8px;
				background-color: White;
				border-radius: 8px;
				box-shadow: 1px 1px 8px rgba(0, 0, 0, 0.4);
				cursor: -webkit-grab;
			}
		`);
		_addStyle(`
			.__widget-thermometer-output {
				display: block;
				margin-bottom: 10px;
				width: 100%;
				height: 20px;
				text-align: right;
				border: none;
			}
		`);
		isBaseStyleAssigned = true;
	};


	/**
	 * Common widget
	 * @author Takuto Yanagida
	 * @version 2019-05-14
	 */
	class Widget {

		/**
		 * Make a widget
		 * @param {number=} [width=null] Width
		 * @param {number=} [height=null] Height
		 */
		constructor(width = null, height = null) {
			ensureBaseStyle();
			this._outer = document.createElement('div');
			document.body.appendChild(this._outer);

			this._base = document.createElement('div');
			this._base.className = '__widget __widget-base';
			if (width !== null) {
				this._base.style.width = width + 'px';
			}
			if (height !== null) {
				this._base.style.height = height + 'px';
			}
			this._outer.appendChild(this._base);
		}

		/**
		 * Return the DOM element
		 * @return {domElement} DOM element
		 */
		domElement() {
			return this._outer;
		}

		/**
		 * Set whether to make the width full
		 * @param {boolean} flag Whether to make the width full
		 */
		setFillWidth(flag) {
			this._outer.style.flexBasis = flag ? '100%' : 'auto';
		}

		/**
		 * Set whether to display
		 * @param {boolean} flag Whether to display
		 */
		setVisible(flag) {
			this._outer.style.display = flag ? '' : 'none';
		}

	}


	/**
	 * Switch
	 * @author Takuto Yanagida
	 * @version 2019-05-14
	 */
	class Switch extends Widget {

		/**
		 * Make a switch
		 * @param {number} [num_or_names=3] Number of buttons, or an array of button names
		 * @param {number} [cur=0] Index of currently selected button
		 */
		constructor(num_or_names = 3, cur = 0) {
			super();
			if (Array.isArray(num_or_names) && num_or_names.length === 0) num_or_names = ['?'];

			const num = Array.isArray(num_or_names) ? num_or_names.length : num_or_names;
			const names = Array.isArray(num_or_names) ? num_or_names : null;

			this._value = (0 <= cur && cur < num) ? cur : (num - 1);

			let maxCharNum = 0;
			if (names) names.forEach(e => maxCharNum = Math.max(maxCharNum, e.length));

			const buttons = [];

			for (let i = 0; i < num; i += 1) {
				const b = document.createElement('a');
				b.className = '__widget __widget-button';
				b.innerText = (names) ? names[i] : i;
				b.style.width = `calc(${maxCharNum}rem + 16px)`;
				b.onmousedown = (ev) => {
					buttons.forEach(e => e.classList.remove('__widget-button-pushed'));
					this._value = buttons.indexOf(ev.target);
					ev.target.classList.add('__widget-button-pushed');
					if (this._onPushed) this._onPushed(this._value);
				};
				buttons.push(b);
				this._base.appendChild(b);
			}
			setTimeout(() => {
				buttons[this._value].classList.add('__widget-button-pushed');
				if (this._onPushed) this._onPushed(this._value);
			}, 100);
		}

		/**
		 * Current value
		 * @param {boolean} val Current value
		 * @return {boolean|Toggle} Current value, or this switch
		 */
		value(val) {
			if (val === undefined) return this._value;
			this._value = val;
			return this;
		}

		/**
		 * Function handling to push events
		 * @param {function(boolean, number)} handler Function
		 * @return {function(boolean, number)|Toggle} Function, or this switch
		 */
		onPushed(handler) {
			if (handler === undefined) return this._onPushed;
			this._onPushed = handler;
			return this;
		}

	}


	/**
	 * Toggle
	 * @author Takuto Yanagida
	 * @version 2019-05-14
	 */
	class Toggle extends Widget {

		/**
		 * Make a toggle button
		 * @param {string=|Array<string>} [caption_s=''] Name(s) of button(s)
		 * @param {boolean=|Array<boolean>} [state_s=false] Current state(s)
		 */
		constructor(caption_s = '', state_s = false) {
			super();

			const cs = Array.isArray(caption_s) ? caption_s : [caption_s];
			const ss = Array.isArray(state_s) ? state_s : [state_s];

			this._value = ss.length === 1 ? ss[0] : ss;

			const buttons = [];

			for (let c of cs) {
				const b = document.createElement('a');
				b.className = '__widget __widget-button';
				b.innerText = c;
				b.onmousedown = (ev) => {
					const idx = buttons.indexOf(ev.target);
					ss[idx] = !ss[idx]
					this._value = ss.length === 1 ? ss[0] : ss;
					ev.target.classList.toggle('__widget-button-pushed');
					if (this._onPushed) this._onPushed(ss[idx], idx);
				};
				buttons.push(b);
				this._base.appendChild(b);
			}
			setTimeout(() => {
				for (let i = 0; i < cs.length; i += 1) {
					if (!ss[i]) continue;
					buttons[i].classList.add('__widget-button-pushed');
					if (this._onPushed) this._onPushed(ss[i], i);
				}
			}, 100);
		}

		/**
		 * Current value
		 * @param {boolean} val Current value
		 * @return {boolean|Toggle} Current value, or this toggle
		 */
		value(val) {
			if (val === undefined) return this._value;
			this._value = val;
			return this;
		}

		/**
		 * Function handling to push events
		 * @param {function(boolean, number)} handler Function
		 * @return {function(boolean, number)|Toggle} Function, or this toggle
		 */
		onPushed(handler) {
			if (handler === undefined) return this._onPushed;
			this._onPushed = handler;
			return this;
		}

	}


	/**
	 * String output
	 * @author Takuto Yanagida
	 * @version 2019-05-14
	 */
	class Output extends Widget {

		/**
		 * Make an output
		 * @param {number} width Width
		 * @param {number=} [height=null] Height
		 * @param {boolean=} [nowrap=false] Whether to wrap
		 */
		constructor(width, height = null, nowrap = false) {
			super(width, height);

			this._inner = document.createElement('div');
			this._inner.className = '__widget __widget-output-inner';
			if (nowrap) {
				this._inner.style.lineHeight = 1;
			} else {
				this._inner.style.whiteSpace = 'normal';
			}
			this._inner.style.overflow = 'hidden';
			this._base.appendChild(this._inner);
		}

		/**
		 * String
		 * @param {string=} val String
		 * @return {string|Output} String, or this output
		 */
		string(val) {
			if (val === undefined) return this._inner.innerText;
			this._inner.innerText = val;
			return this;
		}

	}


	/**
	 * Chart
	 * @author Takuto Yanagida
	 * @version 2020-04-22
	 */


	 const CHART_ITEM_COLORS = [
		'rgb(91, 155, 213)',
		'rgb(237, 125, 49)',
		'rgb(165, 165, 165)',
		'rgb(255, 192, 0)',
		'rgb(68, 114, 196)',
		'rgb(112, 173, 71)',
		'rgb(37, 94, 145)',
		'rgb(158, 72, 14)',
		'rgb(99, 99, 99)',
		'rgb(153, 115, 0)',
		'rgb(38, 68, 120)',
		'rgb(67, 104, 43)',
	];

	class Chart extends Widget {

		/**
		 * Make a chart
		 * @param {number} [width=300] Width
		 * @param {number} [height=150] Height
		 */
		constructor(width = 300, height = 150) {
			super(width, height);

			this._can = document.createElement('canvas');
			this._can.className = '__widget __widget-full __widget-chart-inner';
			this._can.onclick = () => {
				this._allDataMode = !this._allDataMode;
				this._draw(this._legendWidth);
			};
			this._base.appendChild(this._can);
			// Do the following after adding to base (offsetWidth/Height can not be acquired without adding)
			this._can.setAttribute('width', this._can.offsetWidth);
			this._can.setAttribute('height', this._can.offsetHeight);

			this._allDataMode = true;
			this._items = {};
			this._keys = [];
			this._data = {};
			this._min = 0;
			this._max = 0;

			this._legendWidth = 128;
			this._digits = 1;
		}

		/**
		 * Set the width of legend
		 * @param {number} px Width
		 */
		setLegendWidth(px) {
			this._legendWidth = px;
		}

		/**
		 * Set digits
		 * @param {number} num Digits
		 */
		setDigits(num) {
			this._digits = num;
		}

		/**
		 * Set item configurations
		 * @param {dict} items Item configuration
		 */
		setItems(items) {
			// items = {key1: {name: 'name1', style: 'style1'}, key2: {}, ...}
			this._items = {};
			this._keys = [];
			this._data = {};

			let ci = 0;
			for (let key in items) {
				const i = items[key];
				const name = (i !== undefined && i.name !== undefined) ? i.name : key;
				const style = (i !== undefined && i.style !== undefined) ? i.style : CHART_ITEM_COLORS[ci];
				this._keys.push(key);
				this._items[key] = { name, style };
				this._data[key] = [];

				ci += 1;
				if (CHART_ITEM_COLORS.length <= ci) ci = 0;
			}
		}

		/**
		 * Add data
		 * @param {dict} data Data
		 */
		addData(data) {
			for (let key of this._keys) {
				const v = data[key];
				this._data[key].push(v);
				if (v < this._min) this._min = v;
				if (this._max < v) this._max = v;
			}
			this._draw(this._legendWidth);
		}

		/**
		 * Draw a picture
		 * @private
		 * @param {number} legendWidth Width of legend
		 */
		_draw(legendWidth) {
			const c = this._can.getContext('2d');
			c.clearRect(0, 0, this._can.width, this._can.height);

			this._drawLegend(c, legendWidth);
			const cx = this._can.width - legendWidth, cy = this._can.height;
			this._drawFrame(c, legendWidth, cx, cy, this._min, this._max);
			if (this._allDataMode) {
				this._drawAllDataMode(c, legendWidth, cx, cy, this._min, this._max);
			} else {
				this._drawScrollMode(c, legendWidth, cx, cy, this._min, this._max);
			}
		}

		/**
		 * Draw a legend
		 * @private
		 * @param {Paper|CanvasRenderingContext2D} ctx Paper or canvas context
		 * @param {number} legendWidth Width of legend
		 */
		_drawLegend(ctx, legendWidth) {
			ctx.font = '14px sans-serif';
			let y = 0;
			for (let key of this._keys) {
				const { name, style } = this._items[key];
				ctx.fillStyle = style;
				ctx.fillRect(0, y, 16, 16);

				ctx.fillStyle = 'Black';
				ctx.textAlign = 'left';
				ctx.fillText(name, 16 + 8, y + 13);

				const ds = this._data[key];
				const v = ds[ds.length - 1];
				ctx.textAlign = 'right';
				ctx.fillText(this._format(this._digits, v), legendWidth - 8, y + 13);

				y += 22;
			}
		}

		/**
		 * Format
		 * @private
		 * @param {number} digits Number of digits
		 * @param {number} val Value
		 * @return {string} Formatted string
		 */
		_format(digits, val) {
			if (digits === 0) {
				return (0 | val) + '';
			}
			const dv = Number.parseInt('1' + '0'.repeat(digits));
			const nv = (0 | val * dv) / dv;
			const sv = nv + '';
			const idx = sv.indexOf('.');
			if (idx === -1) {
				return sv + '.' + '0'.repeat(digits);
			} else {
				return sv + '0'.repeat(digits - (sv.length - idx - 1));
			}
		}

		/**
		 * Draw a frame
		 * @private
		 * @param {Paper|CanvasRenderingContext2D} ctx Paper or canvas context
		 * @param {number} left X coordinate
		 * @param {number} cx Width
		 * @param {number} cy Height
		 * @param {number} min Minimum value
		 * @param {number} max Maximum value
		 */
		_drawFrame(ctx, left, cx, cy, min, max) {
			ctx.strokeStyle = 'Black';
			ctx.beginPath();
			ctx.moveTo(left, 0);
			ctx.lineTo(left, cy);
			ctx.lineTo(left + cx, cy);
			ctx.stroke();
			if (this._min !== 0 || this._max !== 0) {
				const y = (max - 0) / (max - min) * cy;
				ctx.beginPath();
				ctx.moveTo(left, y);
				ctx.lineTo(left + cx, y);
				ctx.stroke();
			}
		}

		/**
		 * Draw a picture on all data mode
		 * @private
		 * @param {Paper|CanvasRenderingContext2D} ctx Paper or canvas context
		 * @param {number} left X coordinate
		 * @param {number} cx Width
		 * @param {number} cy Height
		 * @param {number} min Minimum value
		 * @param {number} max Maximum value
		 */
		_drawAllDataMode(ctx, left, cx, cy, min, max) {
			for (let key of this._keys) {
				const ds = this._data[key];
				const len = ds.length;
				if (len === 0) continue;

				ctx.strokeStyle = this._items[key].style;
				ctx.beginPath();
				ctx.moveTo(left, cy - ds[0] * cy / max);

				let prevX = 0, prevY = 0;
				for (let i = 1, I = ds.length; i < I; i += 1) {
					const x = left + cx / len * i;
					const dx = x - prevX;
					if (0.5 < dx) {
						const y = (max - ds[i]) / (max - min) * cy;
						if (1.0 < dx || cy * 0.5 < Math.abs(y - prevY)) {
							ctx.lineTo(x, y);
							prevX = x;
							prevY = y;
						}
					}
				}
				ctx.stroke();
			}
		}

		/**
		 * Draw a picture on scroll mode
		 * @private
		 * @param {Paper|CanvasRenderingContext2D} ctx Paper or canvas context
		 * @param {number} left X coordinate
		 * @param {number} cx Width
		 * @param {number} cy Height
		 * @param {number} min Minimum value
		 * @param {number} max Maximum value
		 */
		_drawScrollMode(ctx, left, cx, cy, min, max) {
			for (let key of this._keys) {
				const ds = this._data[key];
				let len = ds.length;
				if (len === 0) continue;
				const st = Math.max(0, len - cx);
				len -= st;

				ctx.strokeStyle = this._items[key].style;
				ctx.beginPath();
				ctx.moveTo(left, cy - ds[st] * cy / max);

				for (let i = st + 1, I = ds.length; i < I; i += 1) {
					const x = left + (i - st);
					const y = (max - ds[i]) / (max - min) * cy;
					ctx.lineTo(x, y);
				}
				ctx.stroke();
			}
		}

	}


	/**
	 * Slider base
	 * @author Takuto Yanagida
	 * @version 2019-09-06
	 */
	class SliderBase extends Widget {

		/**
		 * Make a slider base
		 * @param {number=} [width=null] Width
		 * @param {number=} [height=null] Height
		 * @param {boolean=} [isVertical=true] Whether to be vertical
		 */
		constructor(width = null, height = null, isVertical = true) {
			super(width, height);
			this._isVertical = isVertical;
			this._railHeight = null;

			this.VMARGIN = 12;
			this.SCALE_POS_RATE = this._isVertical ? 0.5 : 0.45;
		}

		/**
		 * Minimum value
		 * @param {number=} val Minimum value
		 * @return Minimum value, or this slider base
		 */
		min(val) {
			if (val === undefined) return this._min;
			this._min = val;
			this._draw(this._scale, this.VMARGIN);
			this.value(this._value);
			return this;
		}

		/**
		 * Maximum value
		 * @param {number=} val Maximum value
		 * @return Maximum value, or this slider base
		 */
		max(val) {
			if (val === undefined) return this._max;
			this._max = val;
			this._draw(this._scale, this.VMARGIN);
			this.value(this._value);
			return this;
		}

		/**
		 * Current value
		 * @param {boolean} val Current value
		 * @return {boolean|SliderBase} Current value, or this slider base
		 */
		value(val) {
			if (val === undefined) return this._value;
			val = (val < this._min) ? this._min : ((this._max < val) ? this._max : val);
			this._value = (this._int) ? Math.round(val) : val;
			if (this._onChanged) this._onChanged(this._value);
			this._valueChanged();
			return this;
		}

		/**
		 * Function handling to change events
		 * @param {function(number)} handler Function
		 * @return {function(number)|SliderBase} Function, or this slider base
		 */
		onChanged(handler) {
			if (handler === undefined) return this._onChanged;
			this._onChanged = handler;
			return this;
		}

		/**
		 * Calculate the position of the knob from the current value
		 * @private
		 * @param {number} v Current value
		 * @param {boolean=} reverse Whether to reverse the direction
		 * @return {number} Position
		 */
		_valueToPos(v, reverse = this._reverse) {
			v = (this._int) ? Math.round(v) : v;
			if (reverse) {
				return (this._railHeight - (v - this._min) * this._railHeight / (this._max - this._min));
			}
			return ((v - this._min) * this._railHeight / (this._max - this._min));
		}

		/**
		 * Calculate current value from knob position
		 * @private
		 * @param {number} p Position
		 * @param {boolean=} reverse Whether to reverse the direction
		 * @return {number} Current value
		 */
		_posToValue(p, reverse = this._reverse) {
			let v = this._min;
			if (reverse) {
				v += (this._railHeight - p) * (this._max - this._min) / this._railHeight;
			} else {
				v += p * (this._max - this._min) / this._railHeight;
			}
			return (this._int) ? Math.round(v) : v;
		}

		/**
		 * Draw a rail
		 * @private
		 * @param {Canvas} canvas Canvas
		 * @param {*} width Width
		 * @param {number} verticalMargin Vertical margin
		 */
		_drawRail(canvas, width, verticalMargin) {
			const isv = this._isVertical;
			const c = canvas.getContext('2d');
			const x = (isv ? canvas.width : canvas.height) * this.SCALE_POS_RATE - width * 0.5;
			let grad;
			if (isv) {
				grad = c.createLinearGradient(x, 0, x + width, 0);
			} else {
				grad = c.createLinearGradient(0, x, 0, x + width);
			}
			const cs = '#dadada, #eee, #eee, #fff, #fafafa, #e0e0e0'.split(', ');
			for (let i = 0; i < 6; i += 1) {
				grad.addColorStop(i / 5, cs[i]);
			}
			c.save();
			c.fillStyle = grad;
			if (isv) {
				c.fillRect(x, verticalMargin + 1, width, canvas.height - verticalMargin * 2 - 2);
			} else {
				c.fillRect(verticalMargin + 1, x, canvas.width - verticalMargin * 2 - 2, width);
			}
			c.restore();
		}

		/**
		 * Draw a scale
		 * @private
		 * @param {Canvas} canvas Canvas
		 * @param {number} verticalMargin Vertical margin
		 * @param {number} [subWidth=12] Width of sub scale
		 */
		_drawScale(canvas, verticalMargin, subWidth = 12) {
			const isv = this._isVertical;
			const maxInterval = this._calcMaxRange(this._min, this._max, 25);
			const interval = this._calcInterval(maxInterval, 25);
			const minInterval = this._calcInterval(interval, 5);
			const width = (isv ? canvas.width : canvas.height), subX = (width * this.SCALE_POS_RATE - subWidth * 0.5);
			const c = canvas.getContext('2d');
			c.clearRect(0, 0, canvas.width, canvas.height);
			c.textAlign = isv ? 'right' : 'center';
			c.font = '10.5px sans-serif';

			for (let m = this._min; m <= this._max; m += 1) {
				const y = this._valueToPos(m) + verticalMargin;
				if (m % interval === 0) {
					c.beginPath();
					if (isv) {
						c.moveTo(0, y);
						c.lineTo(width, y);
					} else {
						c.moveTo(y, 0);
						c.lineTo(y, width);
					}
					c.lineWidth = 0.8;
					c.stroke();
					if (isv) {
						c.lineWidth = 3;
						c.strokeStyle = '#fff';
						c.strokeText(m - (m % interval) + '', width, y - 3);
						c.strokeStyle = '#000';
						c.fillText(m - (m % interval) + '', width, y - 3);
					} else {
						c.lineWidth = 3;
						c.strokeStyle = '#fff';
						c.strokeText(m - (m % interval) + '', y, width - 1);
						c.strokeStyle = '#000';
						c.fillText(m - (m % interval) + '', y, width - 1);
					}
				} else if (m % minInterval === 0) {
					c.beginPath();
					if (isv) {
						c.moveTo(subX, y);
						c.lineTo(subX + subWidth, y);
					} else {
						c.moveTo(y, subX);
						c.lineTo(y, subX + subWidth);
					}
					c.lineWidth = 0.8;
					c.stroke();
				}
			}
		}

		/**
		 * Calculate the maximum range
		 * @private
		 * @param {number} min Minimum value
		 * @param {number} max Maximum value
		 * @param {number} minInt Minimum interval
		 * @return {number} Maximum range
		 */
		_calcMaxRange(min, max, minInt) {
			const is = [1, 2, 5, 10, 20, 25, 50, 100, 200, 250, 500, 1000, 2000, 2500, 5000];
			const len = Math.max(Math.abs(min), Math.abs(max));
			let minM = len, ret = 0;
			for (let i = is.length - 1; 0 <= i; i -= 1) {
				const m = len % is[i];
				if (m < minM && minInt < this._calcOneInt(is[i])) {
					ret = is[i];
					minM = m;
				}
			}
			return (0 | (len / ret)) * ret;
		}

		/**
		 * Calculate intervals
		 * @private
		 * @param {number} baseInt Base interval
		 * @param {number} minInt Minimum interval
		 * @return {number} Interval
		 */
		_calcInterval(baseInt, minInt) {
			const is = [1, 2, 5, 10, 20, 25, 50, 100, 200, 250, 500, 1000, 2000, 2500, 5000];
			let ret = baseInt;
			for (let i = is.length - 1; 0 <= i; i -= 1) {
				if (baseInt % is[i] !== 0) continue;
				if (minInt < this._calcOneInt(is[i])) {
					ret = is[i];
				}
			}
			if (ret !== baseInt) return ret;
			let minM = baseInt;
			for (let i = is.length - 1; 0 <= i; i -= 1) {
				const m = baseInt % is[i];
				if (m < minM && minInt < this._calcOneInt(is[i])) {
					ret = is[i];
					minM = m;
				}
			}
			return ret;
		}

		/**
		 * Calculate one interval
		 * @private
		 * @param {number} val Value
		 * @return {number} Interval
		 */
		_calcOneInt(val) {
			const y1 = this._valueToPos(val, false), y2 = this._valueToPos(val * 2, false);
			return Math.abs(y2 - y1);
		}

	}


	/**
	 * Slider
	 * @author Takuto Yanagida
	 * @version 2019-09-06
	 */
	class Slider extends SliderBase {

		/**
		 * Make a slider
		 * @param {number} [min=0] Minimum value
		 * @param {number} [max=10] Maximum value
		 * @param {number} [value=0] Current value
		 * @param {*} [{ int = false, reverse = false, horizontal = false, width = 72, height = 400 }={}] Options (Whether to integer, whether to reverse, whether to be vertical)
		 */
		constructor(min = 0, max = 10, value = 0, { int = false, reverse = false, horizontal = false, width = false, height = false } = {}) {
			if (horizontal) {
				if (width === false) width = 400;
				if (height === false) height = 72;
			} else {
				if (width === false) width = 72;
				if (height === false) height = 400;
			}
			super(width, height, !horizontal);

			this._min = min;
			this._max = max;
			this._int = int;
			this._reverse = reverse;

			const inner = document.createElement('div');
			inner.className = '__widget-full';
			this._base.appendChild(inner);

			this._scale = document.createElement('canvas');
			this._scale.className = '__widget __widget-full';
			inner.appendChild(this._scale);
			// Do the following after adding to base (offsetWidth/Height can not be acquired without adding)
			this._scale.setAttribute('width', this._scale.offsetWidth);
			this._scale.setAttribute('height', this._scale.offsetHeight);

			this._knob = document.createElement('div');
			this._knob.className = '__widget __widget-slider-knob';
			
			if (this._isVertical) {
				this._knob.style.left = (inner.offsetWidth * this.SCALE_POS_RATE) + 'px';
				this._knob.style.top = this.VMARGIN + 'px';
			} else {
				this._knob.style.top = (inner.offsetHeight * this.SCALE_POS_RATE) + 'px';
				this._knob.style.left = this.VMARGIN + 'px';
			}
			inner.appendChild(this._knob);

			this._railHeight = (this._isVertical ? this._scale.height : this._scale.width) - this.VMARGIN * 2;
			this._dragging = false;

			inner.addEventListener('mousedown', this._mouseDown.bind(this));
			inner.addEventListener('mousemove', this._mouseMove.bind(this));
			document.addEventListener('mousemove', this._mouseMove.bind(this));
			document.addEventListener('mouseup', this._mouseUp.bind(this));

			this._draw(this._scale, this.VMARGIN);
			this.value(value);
		}

		/**
		 * Called when the value has changed
		 * @private
		 */
		_valueChanged() {
			if (this._isVertical) {
				this._knob.style.top = this.VMARGIN + this._valueToPos(this._value) + 'px';
			} else {
				this._knob.style.left = this.VMARGIN + this._valueToPos(this._value) + 'px';
			}
		}

		/**
		 * Get the position of the knob
		 * @private
		 * @param {MouseEvent} e Mouse event
		 * @return {number} Position
		 */
		_getKnobPos(e) {
			const r = this._scale.getBoundingClientRect();
			// Need to calculate from client coordinate system!
			let p;
			if (this._isVertical) {
				p = e.clientY - this.VMARGIN - r.top;
			} else {
				p = e.clientX - this.VMARGIN - r.left;
			}
			return Math.min(Math.max(0, p), this._railHeight);
		}

		/**
		 * Called when the mouse button is pressed
		 * @private
		 * @param {MouseEvent} e Mouse event
		 */
		_mouseDown(e) {
			this.value(this._posToValue(this._getKnobPos(e)));
			this._dragging = true;
			this._knob.style.cursor = '-webkit-grabbing';
			this._scale.style.cursor = '-webkit-grabbing';
			e.preventDefault();
		}

		/**
		 * Called when the mouse moves
		 * @private
		 * @param {MouseEvent} e Mouse event
		 */
		_mouseMove(e) {
			if (!this._dragging) return;
			this.value(this._posToValue(this._getKnobPos(e)));
			e.preventDefault();
		}

		/**
		 * Called when the mouse button is released
		 * @private
		 * @param {MouseEvent} e Mouse event
		 */
		_mouseUp(e) {
			this._dragging = false;
			this._knob.style.cursor = '-webkit-grab';
			this._scale.style.cursor = 'auto';
		}

		/**
		 * Draw a picture
		 * @private
		 * @param {Canvas} canvas Canvas
		 * @param {number} verticalMargin Vertical margin
		 */
		_draw(canvas, verticalMargin) {
			this._drawScale(canvas, verticalMargin);
			this._drawRail(canvas, 6, verticalMargin);
		}

	}


	/**
	 * Thermometer
	 * @author Takuto Yanagida
	 * @version 2019-09-06
	 */
	class Thermometer extends SliderBase {

		/**
		 * Make a thermometer
		 * @param {number=} [min=-10] Minimum temperature
		 * @param {number=} [max=50] Maximum temperature
		 * @param {number=} [value=25] Current temperature
		 * @param {dict} [{ width = 72, height = 400 }={}] Options
		 */
		constructor(min = -10, max = 50, value = 25, { width = 72, height = 400 } = {}) {
			super(width, height);

			this._min = 0 | min;
			this._max = 0 | max;
			this._int = true;  // for SliderBase
			this._reverse = true;  // for SliderBase

			this._base.style.flexDirection = 'column';

			this._output = document.createElement('input');
			this._output.className = '__widget-thermometer-output';
			this._output.type = 'text';
			this._base.appendChild(this._output);

			const inner = document.createElement('div');
			inner.className = '__widget-full';
			inner.style.height = 'calc(100% - 30px)';
			this._base.appendChild(inner);

			this._scale = document.createElement('canvas');
			this._scale.className = '__widget __widget-full';
			inner.appendChild(this._scale);
			// Do the following after adding to base (offsetWidth/Height can not be acquired without adding)
			this._scale.setAttribute('width', this._scale.offsetWidth);
			this._scale.setAttribute('height', this._scale.offsetHeight);

			this._railHeight = this._scale.height - this.VMARGIN * 2;
			this._dragging = false;

			inner.addEventListener('mousedown', this._mouseDown.bind(this));
			inner.addEventListener('mousemove', this._mouseMove.bind(this));
			document.addEventListener('mousemove', this._mouseMove.bind(this));
			document.addEventListener('mouseup', this._mouseUp.bind(this));

			this._draw(this._scale, this.VMARGIN);
			this.value(value);
		}

		/**
		 * Called when the value has changed
		 * @private
		 */
		_valueChanged() {
			this._output.value = this._value + '℃';
			this._draw(this._scale, this.VMARGIN);
		}

		/**
		 * Get the position of the knob
		 * @private
		 * @param {MouseEvent} e Mouse event
		 * @return {number} Position
		 */
		_getKnobPos(e) {
			const r = this._scale.getBoundingClientRect();
			// Need to calculate from client coordinate system!
			const p = e.clientY - this.VMARGIN - r.top;
			return Math.min(Math.max(0, p), this._railHeight);
		}

		/**
		 * Called when the mouse button is pressed
		 * @private
		 * @param {MouseEvent} e Mouse event
		 */
		_mouseDown(e) {
			this.value(this._posToValue(this._getKnobPos(e)));
			this._dragging = true;
			this._scale.style.cursor = '-webkit-grabbing';
			e.preventDefault();
		}

		/**
		 * Called when the mouse moves
		 * @private
		 * @param {MouseEvent} e Mouse event
		 */
		_mouseMove(e) {
			if (!this._dragging) return;
			this.value(this._posToValue(this._getKnobPos(e)));
			e.preventDefault();
		}

		/**
		 * Called when the mouse button is released
		 * @private
		 * @param {MouseEvent} e Mouse event
		 */
		_mouseUp(e) {
			this._dragging = false;
			this._scale.style.cursor = 'auto';
		}

		/**
		 * Draw a picture
		 * @private
		 * @param {Canvas} canvas Canvas
		 * @param {number} verticalMargin Vertical margin
		 */
		_draw(canvas, verticalMargin) {
			this._drawScale(canvas, verticalMargin, 16);
			this._drawRail(canvas, 10, verticalMargin);
			this._drawFiller(canvas, 10, verticalMargin);
		}

		/**
		 * Draw a filler
		 * @private
		 * @param {Canvas} canvas Canvas
		 * @param {number} width Width
		 * @param {number} verticalMargin Vertical margin
		 */
		_drawFiller(canvas, width, verticalMargin) {
			const c = canvas.getContext('2d');
			const x = (canvas.width - width) / 2;
			const grad = c.createLinearGradient(x, 0, x + width, 0);
			const cs = '#f00, #f55, #faa, #e55, #e00, #da0000'.split(', ');
			for (let i = 0; i < 6; i += 1) {
				grad.addColorStop(i / 5, cs[i]);
			}
			const st = Math.max(1, this._valueToPos(this._value));
			c.save();
			c.fillStyle = grad;
			c.fillRect(x, verticalMargin + st, width, canvas.height - verticalMargin * 2 - 1 - st);
			c.restore();
		}

	}


	// Create a library --------------------------------------------------------


	return { Widget, Switch, Toggle, Output, Chart, Slider, Thermometer };

}());
