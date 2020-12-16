/**
 * Style library (STYLE)
 *
 * A library to make it easy to set the style of strokes and filling when painting
 *
 * @author Takuto Yanagida
 * @version 2020-04-21
 */


/**
 * Library variable
 */
const STYLE = (function () {

	'use strict';


	/**
	 * Style base (Common to stroke and fill)
	 * @version 2020-04-22
	 */
	class StyleBase {

		/**
		 * Make a style
		 * @param {Stroke=} base Original style
		 * @param {string=} color Default color
		 */
		constructor(base, color) {
			this._style       = base ? base._style              : color;
			this._color       = base ? base._color              : color;
			this._rgb         = base ? base._rgb                : null;
			this._hsl         = base ? base._hsl                : null;
			this._gradType    = base ? base._gradType           : null;
			this._gradParams  = base ? base._gradParams         : null;
			this._gradColors  = base ? [...base._gradColors]    : [];
			this._alpha       = base ? base._alpha              : 1;
			this._composition = base ? base._composition        : 'source-over';
			this._shadow      = base ? new Shadow(base._shadow) : new Shadow();
		}

		/**
		 * Reset
		 * @param {string} color Color
		 * @return {StyleBase} This style
		 */
		reset(color) {
			this._style       = color;
			this._color       = color;
			this._rgb         = null;
			this._hsl         = null;
			this._gradType    = null;
			this._gradParams  = null;
			this._gradColors  = [];
			this._alpha       = 1;
			this._composition = 'source-over';
			this._shadow      = new Shadow();
			return this;
		}

		/**
		 * Set the color name
		 * @param {string=} color Color name
		 * @param {number=} [opt_alpha=1] Alpha 0-1
		 * @return {string|StyleBase} Color or this style
		 */
		color(color, opt_alpha = 1) {
			if (arguments.length === 0) return this._color;
			checkColor(color);
			if (opt_alpha === 1) {
				this._clear();
				this._color = color;
				this._style = this._color;
			} else {
				if (Number.isNaN(opt_alpha)) throw new RangeError('STYLE::color: The alpha value seem to be wrong.');
				const vs = convertColorToRgb(color, opt_alpha);
				this.rgb(...vs);
			}
			return this;
		}

		/**
		 * Set RGB(A)
		 * @param {number=} r Red 0-255
		 * @param {number=} g Green 0-255
		 * @param {number=} b Blue 0-255
		 * @param {number=} [opt_alpha=1] Alpha 0-1
		 * @return {Array<number>|StyleBase} RGB or this style
		 */
		rgb(r, g, b, opt_alpha = 1) {
			if (arguments.length === 0) return this._rgb;
			this._clear();
			// Round r and g and b to integers
			this._rgb = [Math.round(r), Math.round(g), Math.round(b), opt_alpha];
			this._style = `rgba(${this._rgb.join(', ')})`;
			return this;
		}

		/**
		 * Set HSL(A)
		 * @param {number=} h Hue 0-360
		 * @param {number=} s Saturation 0-100
		 * @param {number=} l Lightness 0-100
		 * @param {number=} [opt_alpha=1] Alpha 0-1
		 * @return {Array<number>|StyleBase} HSL or this style
		 */
		hsl(h, s, l, opt_alpha = 1) {
			if (arguments.length === 0) return this._hsl;
			this._clear();
			this._hsl = [h, s, l, opt_alpha];
			this._style = `hsla(${h}, ${s}%, ${l}%, ${opt_alpha})`;
			return this;
		}

		/**
		 * Lighten the color
		 * @param {number} [opt_rate=10] Rate %
		 * @return {StyleBase} This style
		 */
		lighten(opt_rate = 10) {
			if (this._color) {
				this._rgb = convertColorToRgb(this._color);
			}
			const p = opt_rate / 100;
			if (this._rgb) {
				const [r, g, b] = this._rgb;
				this._rgb[0] = Math.round(r + (255 - r) * p);
				this._rgb[1] = Math.round(g + (255 - g) * p);
				this._rgb[2] = Math.round(b + (255 - b) * p);
				this._style = `rgba(${this._rgb.join(', ')})`;
			} else if (this._hsl) {
				const [h, s, l, av] = this._hsl;
				this._hsl[2] = l + (100 - l) * p;
				this._style = `hsla(${h}, ${s}%, ${this._hsl[2]}%, ${av})`;
			}
			return this;
		}

		/**
		 * Darken the color
		 * @param {number} [opt_rate=10] Rate %
		 * @return {StyleBase} This style
		 */
		darken(opt_rate = 10) {
			if (this._color) {
				this._rgb = convertColorToRgb(this._color);
			}
			const p = opt_rate / 100;
			if (this._rgb) {
				const [r, g, b] = this._rgb;
				this._rgb[0] = Math.round(r * (1.0 - p));
				this._rgb[1] = Math.round(g * (1.0 - p));
				this._rgb[2] = Math.round(b * (1.0 - p));
				this._style = `rgba(${this._rgb.join(', ')})`;
			} else if (this._hsl) {
				const [h, s, l, av] = this._hsl;
				this._hsl[2] = l * (1.0 - p);
				this._style = `hsla(${h}, ${s}%, ${this._hsl[2]}%, ${av})`;
			}
			return this;
		}

		/**
		 * Set the gradation
		 * - Linear ('linear', [Start coordinates x, y], [End coordinates x, y])
		 * - Radial ('radial', [1st center coordinates x、y], [Start radius, End radius], <[2nd center coordinates x, y]>)
		 * - Others ('type')
		 * @param {string} type Type ('linear', 'radial', Others)
		 * @param {Array<number>} xy1_dir [Start coordinates x, y], or [1st center coordinates x、y]
		 * @param {Array<number>} xy2_rs [End coordinates x, y], or [Start radius, End radius]
		 * @param {Array<number>=} xy2 [2nd center coordinates x、y]
		 * @return {Array|StyleBase} Gradation setting or this style
		 */
		gradation(type, xy1_dir, xy2_rs, xy2) {
			if (arguments.length === 0) {
				return this._gradParams ? [this._gradType, ...this._gradParams] : [this._gradType];
			}
			if (!['linear', 'radial', 'vertical', 'horizontal', 'vector', 'inner', 'outer', 'diameter', 'radius'].includes(type)) {
				throw new Error('STYLE::gradation: The type of gradation is incorrect.');
			}
			this._clear();
			this._gradType = type;
			if (type === 'linear') {
				this._gradParams = [xy1_dir[0], xy1_dir[1], xy2_rs[0], xy2_rs[1]];
			} else if (type === 'radial') {
				if (xy2 === undefined) {
					this._gradParams = [xy1_dir[0], xy1_dir[1], xy2_rs[0], xy1_dir[0], xy1_dir[1], xy2_rs[1]];
				} else {
					this._gradParams = [xy1_dir[0], xy1_dir[1], xy2_rs[0], xy2[0], xy2[1], xy2_rs[1]];
				}
			}
			return this;
		}

		/**
		 * Add a color name to the gradation
		 * @param {string} color Color name
		 * @param {number=} [opt_alpha=1] Alpha 0-1
		 * @return {StyleBase} This style
		 */
		addColor(color, opt_alpha = 1) {
			// Disable caching
			this._style = null;
			checkColor(color);
			if (opt_alpha === 1) {
				this._gradColors.push(color);
			} else {
				if (Number.isNaN(opt_alpha)) throw new RangeError('STYLE::addColor: The alpha value seem to be wrong.');
				const vs = convertColorToRgb(color, opt_alpha);
				this.addRgb(...vs);
			}
			return this;
		}

		/**
		 * Add RGB(A) to the gradation
		 * @param {number} r Red 0-255
		 * @param {number} g Green 0-255
		 * @param {number} b Blue 0-255
		 * @param {number=} [opt_alpha=1] Alpha 0-1
		 * @return {StyleBase} This style
		 */
		addRgb(r, g, b, opt_alpha = 1) {
			// Disable caching
			this._style = null;
			// Round r and g and b to integers
			r = Math.round(r), g = Math.round(g), b = Math.round(b);
			// If the alpha is not assigned
			if (opt_alpha === 1) {
				this._gradColors.push(`rgb(${r}, ${g}, ${b})`);
			} else {
				this._gradColors.push(`rgba(${r}, ${g}, ${b}, ${opt_alpha})`);
			}
			return this;
		}

		/**
		 * Add HSL(A) to the gradation
		 * @param {number} h Hue 0-360
		 * @param {number} s Saturation 0-100
		 * @param {number} l Lightness 0-100
		 * @param {number=} [opt_alpha=1] Alpha 0-1
		 * @return {StyleBase} This style
		 */
		addHsl(h, s, l, opt_alpha = 1) {
			// Disable caching
			this._style = null;
			// If the alpha is not assigned
			if (opt_alpha === 1) {
				this._gradColors.push(`hsl(${h}, ${s}%, ${l}%)`);
			} else {
				this._gradColors.push(`hsla(${h}, ${s}%, ${l}%, ${opt_alpha})`);
			}
			return this;
		}

		/**
		 * Set alpha
		 * @param {number=} alpha Alpha
		 * @param {string=} op Arithmetic symbol
		 * @return {number|StyleBase} Alpha or this style
		 */
		alpha(alpha, op) {
			if (alpha === undefined) return this._alpha;
			if (op === undefined) {
				this._alpha = alpha;
			} else {
				switch (op) {
					case '+': this._alpha += alpha; break;
					case '-': this._alpha -= alpha; break;
					case '*': this._alpha *= alpha; break;
					case '/': this._alpha /= alpha; break;
				}
			}
			return this;
		}

		/**
		 * Set composition (composition method)
		 * @param {string=} composition Composition
		 * @return {string|StyleBase} Composition or this style
		 */
		composition(composition) {
			if (composition === undefined) return this._composition;
			this._composition = composition;
			return this;
		}

		/**
		 * Set shadow
		 * @param {number?} blur Blur amount
		 * @param {string?} color Color
		 * @param {number?} x Shadow offset x
		 * @param {number?} y Shadow offset y
		 * @return {Shadow|StyleBase} Shadow or this style
		 */
		shadow(blur, color, x, y) {
			if (blur === undefined) return this._shadow.get();
			if (blur === false || blur === null) {
				this._shadow.clear();
			} else {
				this._shadow.set(blur, color, x, y);
			}
			return this;
		}

		/**
		 * Clear settings (used only in the library)
		 * @private
		 */
		_clear() {
			this._style       = null;
			this._color       = null;
			this._rgb         = null;
			this._hsl         = null;
			this._gradType    = null;
			this._gradParams  = null;
			this._gradColors  = [];
			this._gradBsCache = null;
		}

		/**
		 * Make the style (used only in the library)
		 * @private
		 * @param {Paper|CanvasRenderingContext2D} ctx Paper or canvas context
		 * @param {Array<number>} gradArea Gradation area
		 * @return {string} Style string
		 */
		_makeStyle(ctx, gradArea) {
			this._gradOpt = {};
			// When gradation
			if (this._gradType !== null) {
				if (this._style === null || (this._gradType !== 'linear' && this._gradType !== 'radial')) {
					this._style = this._makeGrad(ctx, gradArea, this._gradType, this._gradParams, this._gradColors, this._gradOpt);
				}
			}
			return this._style;
		}

		/**
		 * Make a gradation (used only in the library)
		 * @private
		 * @param {Paper|CanvasRenderingContext2D} ctx Paper or canvas context
		 * @param {dict} bs Bounds
		 * @param {string} type Type
		 * @param {Array} params Parameters
		 * @param {Array<string>} cs Colors
		 * @param {dict} opt Options
		 * @return {string} String of style
		 */
		_makeGrad(ctx, bs, type, params, cs, opt) {
			if (cs.length === 0) return 'Black';
			if (cs.length === 1) return cs[0];

			let style;
			switch (type) {
				case 'linear':
					style = ctx.createLinearGradient.apply(ctx, params);
					break;
				case 'vertical': case 'horizontal': case 'vector': default:
					style = ctx.createLinearGradient.apply(ctx, this._makeLinearGradParams(ctx, type, bs));
					break;
				case 'radial':
					style = ctx.createRadialGradient.apply(ctx, params);
					break;
				case 'inner': case 'outer': case 'diameter': case 'radius':
					style = ctx.createRadialGradient.apply(ctx, this._makeRadialGradParams(ctx, type, bs, opt));
					break;
			}
			for (let i = 0, I = cs.length; i < I; i += 1) {
				style.addColorStop(i / (I - 1), cs[i]);
			}
			return style;
		}

		/**
		 * Make linear gradation parameters (used only in the library)
		 * @private
		 * @param {Paper|CanvasRenderingContext2D} ctx Paper or canvas context
		 * @param {string} type Type
		 * @param {dict} bs Bounds
		 * @return {Array<number>} Linear gradation parameters
		 */
		_makeLinearGradParams(ctx, type, bs) {
			const ERROR_STR = 'STYLE::_makeLinerGradParams: Gradation bounds are not correct.';
			if (type === 'vertical') {
				if (bs && (bs.left == null || bs.top == null || bs.right == null || bs.bottom == null)) throw new Error(ERROR_STR);
				if (bs) return [bs.left, bs.top, bs.left, bs.bottom];
				else return [0, 0, 0, ctx.canvas.height];
			} else if (type === 'horizontal') {
				if (bs && (bs.left == null || bs.top == null || bs.right == null || bs.bottom == null)) throw new Error(ERROR_STR);
				if (bs) return [bs.left, bs.top, bs.right, bs.top];
				else return [0, 0, ctx.canvas.width, 0];
			} else {  // type === 'vector'
				if (bs && (bs.fromX == null || bs.fromY == null || bs.toX == null || bs.toY == null)) throw new Error(ERROR_STR);
				if (bs) return [bs.fromX, bs.fromY, bs.toX, bs.toY];
				else return [0, 0, ctx.canvas.width, ctx.canvas.height];
			}
		}

		/**
		 * Make radial gradation parameters (used only in the library)
		 * @private
		 * @param {Paper|CanvasRenderingContext2D} ctx Paper or canvas context
		 * @param {string} type Type
		 * @param {dict} bs Bounds
		 * @param {dict} opt Options
		 * @return {Array<number>} Radial gradation parameters
		 */
		_makeRadialGradParams(ctx, type, bs, opt) {
			const SQRT2 = 1.41421356237;
			const cw = ctx.canvas.width, ch = ctx.canvas.height;
			const bb = bs ? bs : { left: 0, top: 0, right: cw, bottom: ch, fromX: 0, fromY: 0, toX: cw, toY: ch };
			const _f = (x0, y0, x1, y1) => {
				return { w: Math.abs(x0 - x1), h: Math.abs(y0 - y1), cx: (x0 + x1) / 2, cy: (y0 + y1) / 2 };
			};
			let r, p;
			if (type === 'inner' || type === 'outer') {
				p = _f(bb.left, bb.top, bb.right, bb.bottom);
				opt.scale = ((p.w < p.h) ? [p.w / p.h, 1] : [1, p.h / p.w]);
				opt.center = [p.cx, p.cy];
				r = ((p.w < p.h) ? p.h : p.w) / 2;
				if (type === 'outer') r *= SQRT2;
			} else {  // type === 'diameter' || type === 'radius'
				p = _f(bb.fromX, bb.fromY, bb.toX, bb.toY);
				r = Math.sqrt(p.w * p.w + p.h * p.h);
				if (type === 'diameter') {
					r /= 2;
				} else {  // type === 'radius'
					p.cx = bb.fromX; p.cy = bb.fromY;
				}
			}
			return [p.cx, p.cy, 0, p.cx, p.cy, r];
		}

		/**
		 * Set radial gradation options (used only in the library)
		 * @private
		 * @param {Paper|CanvasRenderingContext2D} ctx Paper or canvas context
		 * @param {Array<number>} opt Options
		 */
		_setGradOpt(ctx, opt) {
			ctx.translate(opt.center[0], opt.center[1]);
			ctx.scale(opt.scale[0], opt.scale[1]);
			ctx.translate(-opt.center[0], -opt.center[1]);
		}

	}

	StyleBase.prototype.grad = StyleBase.prototype.gradation;


	/**
	 * Shadow
	 * @version 2020-04-21
	 */
	class Shadow {

		/**
		 * Make a shadow
		 * @param {Shadow=} base Original shadow
		 */
		constructor(shadow) {
			this._blur    = shadow ? shadow._blur    : 0;
			this._color   = shadow ? shadow._color   : 0;
			this._offsetX = shadow ? shadow._offsetX : 0;
			this._offsetY = shadow ? shadow._offsetY : 0;
		}

		/**
		 * Get the setting as an array
		 * @return {Array} Setting
		 */
		get() {
			return [this._blur, this._color, this._offsetX, this._offsetY];
		}

		/**
		 * Set
		 * @param {number?} blur Blur amount
		 * @param {string?} color Color
		 * @param {number?} x Shadow offset x
		 * @param {number?} y Shadow offset y
		 */
		set(blur, color, x, y) {
			// Check if the value is set with !=
			if (blur  != null) this._blur    = blur;
			if (color != null) this._color   = color;
			if (x     != null) this._offsetX = x;
			if (y     != null) this._offsetY = y;
		}

		/**
		 * Clear
		 */
		clear() {
			this._blur    = 0;
			this._color   = 0;
			this._offsetX = 0;
			this._offsetY = 0;
		}

		/**
		 * Assign the shadow settings
		 * @param {Paper|CanvasRenderingContext2D} ctx Paper or canvas context
		 */
		assign(ctx) {
			ctx.shadowBlur    = this._blur;
			ctx.shadowColor   = this._color;
			ctx.shadowOffsetX = this._offsetX;
			ctx.shadowOffsetY = this._offsetY;
		}

	}


	/**
	 * Filling style (Fill)
	 * @extends {StyleBase}
	 * @version 2020-04-21
	 */
	class Fill extends StyleBase {

		/**
		 * Make a filling style
		 * @param {Fill=} base Original filling style
		 */
		constructor(base) {
			super(base, 'White');
		}

		/**
		 * Reset
		 * @param {string} color Color
		 * @return {Fill} This filling style
		 */
		reset(color) {
			super.reset(color);
			return this;
		}

		// gradArea = {fromX, fromY, toX, toY, left, top, right, bottom}

		/**
		 * Set the filling style on the paper
		 * @param {Paper|CanvasRenderingContext2D} ctx Paper or canvas context
		 * @param {Array<number>} gradArea Gradation area
		 */
		assign(ctx, gradArea) {
			ctx.fillStyle = this._makeStyle(ctx, gradArea);
			ctx.globalAlpha *= this._alpha;
			ctx.globalCompositeOperation = this._composition;
			this._shadow.assign(ctx);
			if (this._gradOpt.scale) this._setGradOpt(ctx, this._gradOpt);
		}

		/**
		 * Draw shape using the filling style
		 * @param {Paper|CanvasRenderingContext2D} ctx Paper or canvas context
		 * @param {Array<number>} gradArea Gradation area
		 */
		draw(ctx, gradArea) {
			ctx.save();
			this.assign(ctx, gradArea);
			ctx.fill();
			ctx.restore();
		}

	}


	/**
	 * Stroke style (Stroke)
	 * @extends {StyleBase}
	 * @version 2020-04-21
	 */
	class Stroke extends StyleBase {

		/**
		 * Make a stroke style
		 * @param {Stroke=} base Original stroke style
		 */
		constructor(base) {
			super(base, 'Black');

			this._width      = base ? base._width      : 1;
			this._cap        = base ? base._cap        : 'butt';
			this._join       = base ? base._join       : 'bevel';
			this._miterLimit = base ? base._miterLimit : 10;
			this._dash       = base ? base._dash       : null;
			this._dashOffset = base ? base._dashOffset : 0;
		}

		/**
		 * Reset
		 * @param {string} color Color
		 * @return {Fill} This filling style
		 */
		reset(color) {
			super.reset(color);

			this._width      = 1;
			this._cap        = 'butt';
			this._join       = 'bevel';
			this._miterLimit = 10;
			this._dash       = null;
			this._dashOffset = 0;
			return this;
		}

		/**
		 * Set the line width
		 * @param {number=} width Line width
		 * @return {number|Stroke} Line width or this stroke
		 */
		width(width) {
			if (width === undefined) return this._width;
			this._width = width;
			return this;
		}

		/**
		 * Set the line cap
		 * @param {string=} cap Line cap
		 * @return {string|Stroke} Line cap or this stroke
		 */
		cap(cap) {
			if (cap === undefined) return this._cap;
			this._cap = cap;
			return this;
		}

		/**
		 * Set the line join
		 * @param {string=} join Line join
		 * @return {string|Stroke} Line join or this stroke
		 */
		join(join) {
			if (join === undefined) return this._join;
			this._join = join;
			return this;
		}

		/**
		 * Set the upper limit of miter
		 * @param {number=} miterLimit Upper limit of miter
		 * @return {number|Stroke} Upper limit of miter or this stroke
		 */
		miterLimit(miterLimit) {
			if (miterLimit === undefined) return this._miterLimit;
			this._miterLimit = miterLimit;
			return this;
		}

		/**
		 * Set a dash pattern
		 * @param {Array<number>=} dash Dash pattern
		 * @return {Array<number>|Stroke} Dash pattern or this stroke
		 */
		dash(...dash) {
			if (dash === undefined) return this._dash.concat();
			if (Array.isArray(dash[0])) {
				this._dash = [...dash[0]];
			} else {
				this._dash = [...dash];
			}
			return this;
		}

		/**
		 * Set the offset of dash pattern
		 * @param {number=} dashOffset The offset of dash pattern
		 * @return {number|Stroke} The offset of dash pattern or this stroke
		 */
		dashOffset(dashOffset) {
			if (dashOffset === undefined) return this._dashOffset;
			this._dashOffset = dashOffset;
			return this;
		}

		// gradArea = {fromX, fromY, toX, toY, left, top, right, bottom}

		/**
		 * Assign the stroke style in the paper
		 * @param {Paper|CanvasRenderingContext2D} ctx Paper or canvas context
		 * @param {Array<number>} gradArea Gradation area
		 */
		assign(ctx, gradArea) {
			ctx.strokeStyle = this._makeStyle(ctx, gradArea);
			ctx.globalAlpha *= this._alpha;
			ctx.globalCompositeOperation = this._composition;
			this._shadow.assign(ctx);
			if (this._gradOpt.scale) this._setGradOpt(ctx, this._gradOpt);

			ctx.lineWidth = this._width;
			ctx.lineCap = this._cap;
			ctx.lineJoin = this._join;
			ctx.miterLimit = this._miterLimit;

			ctx.setLineDash(this._dash ? this._dash : []);
			ctx.lineDashOffset = this._dashOffset;
		}

		/**
		 * Draw lines using the stroke style
		 * @param {Paper|CanvasRenderingContext2D} ctx Paper or canvas context
		 * @param {Array<number>} gradArea Gradation area
		 */
		draw(ctx, gradArea) {
			ctx.save();
			this.assign(ctx, gradArea);
			ctx.stroke();
			ctx.restore();
		}

	}


	// Utility functions -------------------------------------------------------


	/**
	 * Augment papers
	 * @param {Paper|CanvasRenderingContext2D} ctx Paper or canvas context
	 */
	const augment = (ctx) => {
		if (ctx['styleFill'] && ctx['styleStroke'] && ctx['styleClear']) return;
		let fill = makeFill(ctx), stroke = makeStroke(ctx), clear = makeClear(ctx);
		ctx.styleFill   = (opt_fill) => {
			if (opt_fill !== undefined) fill = makeFill(ctx, opt_fill);
			return fill;
		};
		ctx.styleStroke = (opt_stroke) => {
			if (opt_stroke !== undefined) stroke = makeStroke(ctx, opt_stroke);
			return stroke;
		};
		ctx.styleClear  = (opt_clear) => {
			if (opt_clear !== undefined) clear = makeClear(ctx, opt_clear);
			return clear;
		};
		function makeFill(ctx, opt_fill) {
			const fill = new Fill(opt_fill);
			fill.draw = Fill.prototype.draw.bind(fill, ctx);
			return fill;
		}
		function makeStroke(ctx, opt_stroke) {
			const stroke = new Stroke(opt_stroke);
			stroke.draw = Stroke.prototype.draw.bind(stroke, ctx);
			return stroke;
		}
		function makeClear(ctx, opt_clear) {
			const clear = new Fill(opt_clear);
			clear.draw = function () {
				ctx.save();
				this.assign(ctx);
				ctx.setTransform(1, 0, 0, 1, 0, 0);
				ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
				ctx.restore();
			}.bind(clear);
			return clear;
		}
	};


	/**
	 * Color table
	 * @author Takuto Yanagida
	 * @version 2019-10-12
	 */


	/**
	 * Check if the color name is correct
	 * @param {string} color Color name
	 */
	const checkColor = (color) => {
		if (COLOR_TO_RGB[color.toLowerCase()] === undefined) {
			throw new Error('The color name is incorrect.');
		}
	};

	/**
	 * Convert color name to RGB
	 * @param {string} color Color name
	 * @param {number=} [alpha=1] Alpha
	 * @return {Array<number>} RGB(A)
	 */
	const convertColorToRgb = (color, alpha = 1) => {
		return [...COLOR_TO_RGB[color.toLowerCase()], alpha];
	};

	const COLOR_TO_RGB = {
		'pink'             : /*#FFC0CB*/ [255, 192, 203], 'lightpink'           : /*#FFB6C1*/ [255, 182, 193],
		'hotpink'          : /*#FF69B4*/ [255, 105, 180], 'deeppink'            : /*#FF1493*/ [255, 20, 147],
		'palevioletred'    : /*#DB7093*/ [219, 112, 147], 'mediumvioletred'     : /*#C71585*/ [199, 21, 133],

		'lightsalmon'      : /*#FFA07A*/ [255, 160, 122], 'salmon'              : /*#FA8072*/ [250, 128, 114],
		'darksalmon'       : /*#E9967A*/ [233, 150, 122], 'lightcoral'          : /*#F08080*/ [240, 128, 128],
		'indianred'        : /*#CD5C5C*/ [205, 92, 92],   'crimson'             : /*#DC143C*/ [220, 20, 60],
		'firebrick'        : /*#B22222*/ [178, 34, 34],   'darkred'             : /*#8B0000*/ [139, 0, 0],
		'red'              : /*#FF0000*/ [255, 0, 0],

		'orangered'        : /*#FF4500*/ [255, 69, 0],    'tomato'              : /*#FF6347*/ [255, 99, 71],
		'coral'            : /*#FF7F50*/ [255, 127, 80],  'darkorange'          : /*#FF8C00*/ [255, 140, 0],
		'orange'           : /*#FFA500*/ [255, 165, 0],

		'yellow'           : /*#FFFF00*/ [255, 255, 0],   'lightyellow'         : /*#FFFFE0*/ [255, 255, 224],
		'lemonchiffon'     : /*#FFFACD*/ [255, 250, 205], 'lightgoldenrodyellow': /*#FAFAD2*/ [250, 250, 210],
		'papayawhip'       : /*#FFEFD5*/ [255, 239, 213], 'moccasin'            : /*#FFE4B5*/ [255, 228, 181],
		'peachpuff'        : /*#FFDAB9*/ [255, 218, 185], 'palegoldenrod'       : /*#EEE8AA*/ [238, 232, 170],
		'khaki'            : /*#F0E68C*/ [240, 230, 140], 'darkkhaki'           : /*#BDB76B*/ [189, 183, 107],
		'gold'             : /*#FFD700*/ [255, 215, 0],

		'cornsilk'         : /*#FFF8DC*/ [255, 248, 220], 'blanchedalmond'      : /*#FFEBCD*/ [255, 235, 205],
		'bisque'           : /*#FFE4C4*/ [255, 228, 196], 'navajowhite'         : /*#FFDEAD*/ [255, 222, 173],
		'wheat'            : /*#F5DEB3*/ [245, 222, 179], 'burlywood'           : /*#DEB887*/ [222, 184, 135],
		'tan'              : /*#D2B48C*/ [210, 180, 140], 'rosybrown'           : /*#BC8F8F*/ [188, 143, 143],
		'sandybrown'       : /*#F4A460*/ [244, 164, 96],  'goldenrod'           : /*#DAA520*/ [218, 165, 32],
		'darkgoldenrod'    : /*#B8860B*/ [184, 134, 11],  'peru'                : /*#CD853F*/ [205, 133, 63],
		'chocolate'        : /*#D2691E*/ [210, 105, 30],  'saddlebrown'         : /*#8B4513*/ [139, 69, 19],
		'sienna'           : /*#A0522D*/ [160, 82, 45],   'brown'               : /*#A52A2A*/ [165, 42, 42],
		'maroon'           : /*#800000*/ [128, 0, 0],

		'darkolivegreen'   : /*#556B2F*/ [85, 107, 47],   'olive'               : /*#808000*/ [128, 128, 0],
		'olivedrab'        : /*#6B8E23*/ [107, 142, 35],  'yellowgreen'         : /*#9ACD32*/ [154, 205, 50],
		'limegreen'        : /*#32CD32*/ [50, 205, 50],   'lime'                : /*#00FF00*/ [0, 255, 0],
		'lawngreen'        : /*#7CFC00*/ [124, 252, 0],   'chartreuse'          : /*#7FFF00*/ [127, 255, 0],
		'greenyellow'      : /*#ADFF2F*/ [173, 255, 47],  'springgreen'         : /*#00FF7F*/ [0, 255, 127],
		'mediumspringgreen': /*#00FA9A*/ [0, 250, 154],   'lightgreen'          : /*#90EE90*/ [144, 238, 144],
		'palegreen'        : /*#98FB98*/ [152, 251, 152], 'darkseagreen'        : /*#8FBC8F*/ [143, 188, 143],
		'mediumaquamarine' : /*#66CDAA*/ [102, 205, 170], 'mediumseagreen'      : /*#3CB371*/ [60, 179, 113],
		'seagreen'         : /*#2E8B57*/ [46, 139, 87],   'forestgreen'         : /*#228B22*/ [34, 139, 34],
		'green'            : /*#008000*/ [0, 128, 0],     'darkgreen'           : /*#006400*/ [0, 100, 0],

		'aqua'             : /*#00FFFF*/ [0, 255, 255],   'cyan'                : /*#00FFFF*/ [0, 255, 255],
		'lightcyan'        : /*#E0FFFF*/ [224, 255, 255], 'paleturquoise'       : /*#AFEEEE*/ [175, 238, 238],
		'aquamarine'       : /*#7FFFD4*/ [127, 255, 212], 'turquoise'           : /*#40E0D0*/ [64, 224, 208],
		'mediumturquoise'  : /*#48D1CC*/ [72, 209, 204],  'darkturquoise'       : /*#00CED1*/ [0, 206, 209],
		'lightseagreen'    : /*#20B2AA*/ [32, 178, 170],  'cadetblue'           : /*#5F9EA0*/ [95, 158, 160],
		'darkcyan'         : /*#008B8B*/ [0, 139, 139],   'teal'                : /*#008080*/ [0, 128, 128],

		'lightsteelblue'   : /*#B0C4DE*/ [176, 196, 222], 'powderblue'          : /*#B0E0E6*/ [176, 224, 230],
		'lightblue'        : /*#ADD8E6*/ [173, 216, 230], 'skyblue'             : /*#87CEEB*/ [135, 206, 235],
		'lightskyblue'     : /*#87CEFA*/ [135, 206, 250], 'deepskyblue'         : /*#00BFFF*/ [0, 191, 255],
		'dodgerblue'       : /*#1E90FF*/ [30, 144, 255],  'cornflowerblue'      : /*#6495ED*/ [100, 149, 237],
		'steelblue'        : /*#4682B4*/ [70, 130, 180],  'royalblue'           : /*#4169E1*/ [65, 105, 225],
		'blue'             : /*#0000FF*/ [0, 0, 255],     'mediumblue'          : /*#0000CD*/ [0, 0, 205],
		'darkblue'         : /*#00008B*/ [0, 0, 139],     'navy'                : /*#000080*/ [0, 0, 128],
		'midnightblue'     : /*#191970*/ [25, 25, 112],

		'lavender'         : /*#E6E6FA*/ [230, 230, 250], 'thistle'             : /*#D8BFD8*/ [216, 191, 216],
		'plum'             : /*#DDA0DD*/ [221, 160, 221], 'violet'              : /*#EE82EE*/ [238, 130, 238],
		'orchid'           : /*#DA70D6*/ [218, 112, 214], 'fuchsia'             : /*#FF00FF*/ [255, 0, 255],
		'magenta'          : /*#FF00FF*/ [255, 0, 255],   'mediumorchid'        : /*#BA55D3*/ [186, 85, 211],
		'mediumpurple'     : /*#9370DB*/ [147, 112, 219], 'blueviolet'          : /*#8A2BE2*/ [138, 43, 226],
		'darkviolet'       : /*#9400D3*/ [148, 0, 211],   'darkorchid'          : /*#9932CC*/ [153, 50, 204],
		'darkmagenta'      : /*#8B008B*/ [139, 0, 139],   'purple'              : /*#800080*/ [128, 0, 128],
		'indigo'           : /*#4B0082*/ [75, 0, 130],    'darkslateblue'       : /*#483D8B*/ [72, 61, 139],
		'rebeccapurple'    : /*#663399*/ [102, 51, 153],  'slateblue'           : /*#6A5ACD*/ [106, 90, 205],
		'mediumslateblue'  : /*#7B68EE*/ [123, 104, 238],

		'white'            : /*#FFFFFF*/ [255, 255, 255], 'snow'                : /*#FFFAFA*/ [255, 250, 250],
		'honeydew'         : /*#F0FFF0*/ [240, 255, 240], 'mintcream'           : /*#F5FFFA*/ [245, 255, 250],
		'azure'            : /*#F0FFFF*/ [240, 255, 255], 'aliceblue'           : /*#F0F8FF*/ [240, 248, 255],
		'ghostwhite'       : /*#F8F8FF*/ [248, 248, 255], 'whitesmoke'          : /*#F5F5F5*/ [245, 245, 245],
		'seashell'         : /*#FFF5EE*/ [255, 245, 238], 'beige'               : /*#F5F5DC*/ [245, 245, 220],
		'oldlace'          : /*#FDF5E6*/ [253, 245, 230], 'floralwhite'         : /*#FFFAF0*/ [255, 250, 240],
		'ivory'            : /*#FFFFF0*/ [255, 255, 240], 'antiquewhite'        : /*#FAEBD7*/ [250, 235, 215],
		'linen'            : /*#FAF0E6*/ [250, 240, 230], 'lavenderblush'       : /*#FFF0F5*/ [255, 240, 245],
		'mistyrose'        : /*#FFE4E1*/ [255, 228, 225],

		'gainsboro'        : /*#DCDCDC*/ [220, 220, 220], 'lightgray'           : /*#D3D3D3*/ [211, 211, 211],
		'silver'           : /*#C0C0C0*/ [192, 192, 192], 'darkgray'            : /*#A9A9A9*/ [169, 169, 169],
		'gray'             : /*#808080*/ [128, 128, 128], 'dimgray'             : /*#696969*/ [105, 105, 105],
		'lightslategray'   : /*#778899*/ [119, 136, 153], 'slategray'           : /*#708090*/ [112, 128, 144],
		'darkslategray'    : /*#2F4F4F*/ [47, 79, 79],    'black'               : /*#000000*/ [0, 0, 0],
	};


	// Create a library --------------------------------------------------------


	return { Shadow, Fill, Stroke, augment };

}());
