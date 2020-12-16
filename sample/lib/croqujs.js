/**
 * Croqujs library (CROQUJS)
 *
 * A library to make paper for painting.
 * This library prepares to draw pictures easily from JavaScript
 * without having to know HTML and to be able to handle mouse operations.
 * ('Paper' here is an extension of CanvasRenderingContext2D of HTML5 Canvas element)
 *
 * @author Takuto Yanagida
 * @version 2020-11-20
 */


/**
 * Library variable
 */
const CROQUJS = (function () {

	'use strict';


	// Common CSS
	const s = document.createElement('style');
	s.innerHTML = '*{margin:0;padding:0}body{white-space:nowrap;display:flex;flex-wrap:wrap;align-items:flex-start;}';
	document.head.appendChild(s);

	// Register event listeners so that the setup function is called when all programs (scripts) have been loaded
	window.addEventListener('load', () => {
		if (typeof setup === 'function') {
			setup();
		}
	}, true);


	// Paper (CROQUJS.Paper) ------------------------------------------------


	const CANVAS_TO_PAPER = {};


	/**
	 * Key operation handler
	 * @author Takuto Yanagida
	 * @version 2019-05-12
	 */
	class KeyHandler {

		/**
		 * Make a key operation handler
		 * @param {Canvas} can Canvas
		 */
		constructor(can) {
			this._keys = {};
			this._onDown = null;
			this._onUp = null;

			// Handle key down events
			can.addEventListener('keydown', (e) => {
				if (!this._keys[e.keyCode]) {
					if (this._onDown !== null) {
						this._onDown(String.fromCharCode(e.keyCode), e);
						e.preventDefault();
					}
					this._keys[e.keyCode] = true;
				}
			}, true);

			// Handle key up events
			can.addEventListener('keyup', (e) => {
				if (this._keys[e.keyCode]) {
					if (this._onUp !== null) {
						this._onUp(String.fromCharCode(e.keyCode), e);
						e.preventDefault();
					}
					this._keys[e.keyCode] = false;
				}
			}, true);
		}


		// Public functions --------------------------------------------------------


		/**
		 * Set the function handling key down events
		 * @param {function(string, KeyEvent)=} handler Function
		 * @return {function(string, KeyEvent)=} Function
		 */
		onKeyDown(handler) {
			if (handler === undefined) return this._onDown;
			this._onDown = handler;
		}

		/**
		 * Set the function handling key up events
		 * @param {function(string, KeyEvent)=} handler Function
		 * @return {function(string, KeyEvent)=} Function
		 */
		onKeyUp(handler) {
			if (handler === undefined) return this._onUp;
			this._onUp = handler;
		}

	}


	/**
	 * Mouse operation handler
	 * @author Takuto Yanagida
	 * @version 2019-05-12
	 */
	class MouseHandler {

		/**
		 * Make a mouse operation handler
		 * @param {Canvas} can Canvas
		 */
		constructor(can) {
			this._canvas = can;
			this._children = [];

			this._posX = 0;
			this._posY = 0;
			this._btnL = false;
			this._btnR = false;
			this._btnM = false;
			this._btns = 0;

			this._onDown = null;
			this._onMove = null;
			this._onUp = null;
			this._onClick = null;
			this._onWheel = null;

			// Set event listener in window
			this._onDownWinListener = this._onDownWin.bind(this);
			this._onMoveWinListener = this._onMoveWin.bind(this);
			this._onUpWinListener = this._onUpWin.bind(this);
			this._onBlurWinListener = () => { this._btns = 0; };

			window.addEventListener('mousedown', this._onDownWinListener, true);
			window.addEventListener('dragstart', this._onDownWinListener, true);
			window.addEventListener('mousemove', this._onMoveWinListener, true);
			window.addEventListener('drag', this._onMoveWinListener, true);
			window.addEventListener('mouseup', this._onUpWinListener, false);
			window.addEventListener('dragend', this._onUpWinListener, false);
			window.addEventListener('blur', this._onBlurWinListener);

			// Set event listener in canvas
			if (window.ontouchstart !== undefined) {  // iOS, Android (& Chrome)
				this._canvas.addEventListener('touchstart', (e) => { this._onDownCan(e); this._onClickCan(e); }, true);
				this._canvas.addEventListener('touchmove', this._onMoveCan.bind(this), true);
				this._canvas.addEventListener('touchend', this._onUpCan.bind(this), false);
			}
			if (window.PointerEvent) {  // IE11 & Chrome
				this._canvas.addEventListener('pointerdown', this._onDownCan.bind(this), true);
				this._canvas.addEventListener('pointermove', this._onMoveCan.bind(this), true);
				this._canvas.addEventListener('pointerup', this._onUpCan.bind(this), false);
			} else {  // Mouse
				this._canvas.addEventListener('mousedown', this._onDownCan.bind(this), true);
				this._canvas.addEventListener('mousemove', this._onMoveCan.bind(this), true);
				this._canvas.addEventListener('mouseup', this._onUpCan.bind(this), false);
			}
			this._canvas.addEventListener('click', this._onClickCan.bind(this));
			this._canvas.addEventListener('wheel', this._onWheelCan.bind(this));

			this._canvas.oncontextmenu = () => {
				// Cancel context menu when event is assigned
				if (this._mouseUp !== null) return false;
				return true;
			};
		}

		/**
		 * Remove event listeners
		 */
		removeWinListener() {
			window.removeEventListener('mousedown', this._onDownWinListener, true);
			window.removeEventListener('dragstart', this._onDownWinListener, true);
			window.removeEventListener('mousemove', this._onMoveWinListener, true);
			window.removeEventListener('drag', this._onMoveWinListener, true);
			window.removeEventListener('mouseup', this._onUpWinListener, false);
			window.removeEventListener('dragend', this._onUpWinListener, false);
			window.removeEventListener('blur', this._onBlurWinListener);
		}

		/**
		 * Add a child
		 * @param {MouseHandler} child Child
		 */
		addChild(child) {
			this._children.push(child);
		}

		/**
		 * Remove a child
		 * @param {MouseHandler} child Child
		 */
		removeChild(child) {
			this._children = this._children.filter(e => (e !== child));
		}


		// Receive button events directly from the window --------------------------


		/**
		 * Respond to mouse down events (used only in the library)
		 * @private
		 * @param {MouseEvent} e Event
		 */
		_onDownWin(e) {
			if (e.target !== this._canvas) {
				e.preventDefault();
				return;
			}
			const btnTbl = [1, 4, 2];
			this._btns |= btnTbl[e.button];
			this._setButtonWin(this._btns);
		}

		/**
		 * Respond to mouse move events (used only in the library)
		 * @private
		 * @param {MouseEvent} e Event
		 */
		_onMoveWin(e) {
			if (e.target !== this._canvas && this._btns === 0) {
				e.preventDefault();
				return;
			}
			const whichTbl = [0, 1, 4, 2];
			this._btns = (e.buttons !== undefined) ? e.buttons : whichTbl[e.which] /* Chrome or Opera */;
			this._setButtonWin(this._btns);
		}

		/**
		 * Respond to mouse up events (used only in the library)
		 * @private
		 * @param {MouseEvent} e Event
		 */
		_onUpWin(e) {
			const btnTbl = [1, 4, 2];
			this._btns &= ~btnTbl[e.button];
			this._setButtonWin(this._btns);
		}

		/**
		 * Record which mouse button was pressed (used only in the library)
		 * @private
		 * @param {number} buttons Buttons
		 */
		_setButtonWin(buttons) {
			this._btnL = (buttons & 1) ? true : false;
			this._btnR = (buttons & 2) ? true : false;
			this._btnM = (buttons & 4) ? true : false;

			for (let c of this._children) {
				c._mouseButtons = buttons;
				c._setButtonWin(buttons);
			}
		}


		// Receive button events from the canvas -----------------------------------


		/**
		 * Respond to mouse down events (used only in the library)
		 * @private
		 * @param {MouseEvent} e Event
		 */
		_onDownCan(e) {
			this._setPosition(e);
			this._setButtonCanvas(e, true);
			if (this._onDown !== null) {
				this._onDown(this._posX, this._posY, e);
				e.preventDefault();
			}
			this._canvas.focus();
		}

		/**
		 * Respond to mouse move events (used only in the library)
		 * @private
		 * @param {MouseEvent} e Event
		 */
		_onMoveCan(e) {
			this._setPosition(e);
			if (this._onMove !== null) {
				// To avoid an event that occurs before the button is detected when the cursor enters from outside the window
				setTimeout(() => { this._onMove(this._posX, this._posY, e) }, 1);
				e.preventDefault();
			}
		}

		/**
		 * Respond to mouse up events (used only in the library)
		 * @private
		 * @param {MouseEvent} e Event
		 */
		_onUpCan(e) {
			this._setPosition(e);
			this._setButtonCanvas(e, false);
			if (this._onUp !== null) {
				this._onUp(this._posX, this._posY, e);
				e.preventDefault();
			}
		}

		/**
		 * Respond to click events (used only in the library)
		 * @private
		 * @param {MouseEvent} e Event
		 */
		_onClickCan(e) {
			this._setPosition(e);
			if (this._onClick !== null) {
				this._onClick(this._posX, this._posY, e);
				e.preventDefault();
			}
		}

		/**
		 * Respond to wheel events (used only in the library)
		 * @private
		 * @param {WheelEvent} e Event
		 */
		_onWheelCan(e) {
			if (this._onWheel !== null) {
				this._onWheel(0 < e.deltaY ? 1 : -1, e);
				e.preventDefault();
			}
		}

		/**
		 * Correctly record where the mouse event happened (coordinates) (used only in the library)
		 * @private
		 * @param {MouseEvent} e Event
		 */
		_setPosition(e) {
			// When touch, or when mouse
			const ee = (e.clientX === undefined) ? e.changedTouches[0] : e;
			const r = this._canvas.getBoundingClientRect();
			this._posX = ee.clientX - r.left;
			this._posY = ee.clientY - r.top;

			for (let c of this._children) {
				c._posX = this._posX;
				c._posY = this._posY;
			}
		}

		/**
		 * Record which mouse button was pressed (used only in the library)
		 * @private
		 * @param {MouseEvent} e Event
		 * @param {boolean} val State
		 */
		_setButtonCanvas(e, val) {
			// When it is not known which button (when touch on Android)
			const which = (e.which === undefined) ? 0 : e.which;

			// Basically, the InputMouseButton is in charge of processing other than touch (the following is for easy correspondence to touch event related)
			switch (which) {
				case 0:
				case 1: this._btnL = val; break;
				case 2: this._btnM = val; break;
				case 3: this._btnR = val; break;
			}
			for (let c of this._children) {
				c._setButtonCanvas(e, val);
			}
		}


		// Public functions --------------------------------------------------------


		/**
		 * Set the function handling the mouse down event
		 * @param {function(number, number, MouseEvent)=} handler Function
		 * @return {function(number, number, MouseEvent)=} Function
		 */
		onMouseDown(handler) {
			if (handler === undefined) return this._onDown;
			this._onDown = handler;
		}

		/**
		 * Set the function handling the mouse move event
		 * @param {function(number, number, MouseEvent)=} handler Function
		 * @return {function(number, number, MouseEvent)=} Function
		 */
		onMouseMove(handler) {
			if (handler === undefined) return this._onMove;
			this._onMove = handler;
		}

		/**
		 * Set the function handling the mouse up event
		 * @param {function(number, number, MouseEvent)=} handler Function
		 * @return {function(number, number, MouseEvent)=} Function
		 */
		onMouseUp(handler) {
			if (handler === undefined) return this._onUp;
			this._onUp = handler;
		}

		/**
		 * Set the function handling the mouse click event
		 * @param {function(number, number, MouseEvent)=} handler Function
		 * @return {function(number, number, MouseEvent)=} Function
		 */
		onMouseClick(handler) {
			if (handler === undefined) return this._onClick;
			this._onClick = handler;
		}

		/**
		 * Set the function handling the mouse wheel event
		 * @param {function(number, WheelEvent)=} handler Function
		 * @return {function(number, WheelEvent)=} Function
		 */
		onMouseWheel(handler) {
			if (handler === undefined) return this._onWheel;
			this._onWheel = handler;
		}

		/**
		 * Return x coordinate of the mouse
		 * @return {number} X coordinate of the mouse
		 */
		mouseX() {
			return this._posX;
		}

		/**
		 * Return y coordinate of the mouse
		 * @return {number} Y coordinate of the mouse
		 */
		mouseY() {
			return this._posY;
		}

		/**
		 * Whether the left mouse button is pressed
		 * @return {boolean} Whether the left mouse button is pressed
		 */
		mouseLeft() {
			return this._btnL;
		}

		/**
		 * Whether the right mouse button is pressed
		 * @return {boolean} Whether the right mouse button is pressed
		 */
		mouseRight() {
			return this._btnR;
		}

		/**
		 * Whether the middle mouse button is pressed
		 * @return {boolean} Whether the middle mouse button is pressed
		 */
		mouseMiddle() {
			return this._btnM;
		}

	}


	/**
	 * Zoom operation handler
	 * @author Takuto Yanagida
	 * @version 2020-04-30
	 */
	class ZoomHandler {

		/**
		 * Make a zoom operation handler
		 * @param {Paper|CanvasRenderingContext2D} ctx Paper or canvas context
		 */
		constructor(ctx) {
			this._ctx = ctx;
			this._isEnabled = true;

			this._zoom    = 0;
			this._steps   = [1, 1.5, 2, 3, 4, 6, 8, 12, 16, 24, 32];
			this._scale   = 1;
			this._viewOff = { x: 0, y: 0 };
			this._mousePt = { x: 0, y: 0 };

			this._touchPt    = { x: 0, y: 0 };
			this._touchCount = 0;
			this._touchDist  = 0;

			ctx.canvas.addEventListener('wheel',     this._onWheel.bind(this));
			ctx.canvas.addEventListener('mousedown', this._onMouseDown.bind(this));
			ctx.canvas.addEventListener('mousemove', this._onMouseMove.bind(this));

			ctx.canvas.addEventListener('touchstart', this._onTouchStart.bind(this));
			ctx.canvas.addEventListener('touchmove',  this._onTouchMove.bind(this), { passive: false });
		}

		/**
		 * Respond to mouse down events (used only in the library)
		 * @private
		 */
		_onMouseDown() {
			if (!this._isEnabled || !this._ctx.mouseMiddle()) return;
			this._mousePt = { x: this._ctx.mouseX(), y: this._ctx.mouseY() };
			this._viewOff.px = this._viewOff.x;
			this._viewOff.py = this._viewOff.y;
		}

		/**
		 * Respond to mouse move events (used only in the library)
		 * @private
		 */
		_onMouseMove() {
			if (!this._isEnabled || !this._ctx.mouseMiddle()) return;
			this._setViewOffset(
				this._viewOff.px - (this._ctx.mouseX() - this._mousePt.x),
				this._viewOff.py - (this._ctx.mouseY() - this._mousePt.y)
			);
		}

		/**
		 * Respond to wheel events (used only in the library)
		 * @private
		 * @param {WheelEvent} e Event
		 */
		_onWheel(e) {
			if (!this._isEnabled) return;
			const mx = this._ctx.mouseX(), my = this._ctx.mouseY();

			const px = (this._viewOff.x + mx) / this._scale;
			const py = (this._viewOff.y + my) / this._scale;

			if (0 < e.deltaY) {
				this._zoom = Math.max(this._zoom - 1, 0);
			} else {
				this._zoom = Math.min(this._zoom + 1, this._steps.length - 1);
			}
			this._scale = this._steps[this._zoom];
			this._setViewOffset(
				px * this._scale - mx,
				py * this._scale - my
			);
		}

		/**
		 * Set the view offsets (used only in the library)
		 * @private
		 * @param {number} x X coordinate
		 * @param {number} y Y coordinate
		 */
		_setViewOffset(x, y) {
			const w = this._ctx.width(), h = this._ctx.height();
			x = Math.min(Math.max(x, 0), w * this._scale - w);
			y = Math.min(Math.max(y, 0), h * this._scale - h);
			this._viewOff.x = x;
			this._viewOff.y = y;
		}


		// -------------------------------------------------------------------------


		/**
		 * Respond to touch start events (used only in the library)
		 * @private
		 * @param {TouchEvent} e Event
		 */
		_onTouchStart(e) {
			this._touchDist = 0;
			this._updateTouch(e.touches);
		}

		/**
		 * Respond to touch move events (used only in the library)
		 * @private
		 * @param {TouchEvent} e Event
		 */
		_onTouchMove(e) {
			e.preventDefault();
			e.stopPropagation();

			const ts = e.touches;
			if (this._touchCount !== ts.length) this._updateTouch(ts);

			const [cx, cy] = this._getTouchPoint(ts);
			this._viewOff.x += this._touchPt.x - cx;
			this._viewOff.y += this._touchPt.y - cy;

			this._touchPt.x = cx;
			this._touchPt.y = cy;

			if (2 <= ts.length) {
				const ntX = (cx + this._viewOff.x) / this._scale;
				const ntY = (cy + this._viewOff.y) / this._scale;
				const dis = this._getTouchDistance(ts);

				if (this._touchDist) {
					const s = dis / (this._touchDist * this._scale);
					if (s && s !== Infinity) {
						[this._zoom, this._scale] = this._calcZoomStep(this._scale * s);
						this._setViewOffset(
							ntX * this._scale - cx,
							ntY * this._scale - cy
						);
					}
				}
				this._touchDist = dis / this._scale;
			}
		}

		/**
		 * Calculate the zoom step (used only in the library)
		 * @private
		 * @param {number} s Scale (magnification rate)
		 */
		_calcZoomStep(s) {
			const ns = Math.min(Math.max(s, 1), this._steps[this._steps.length - 1]);

			let dis = Number.MAX_VALUE;
			let idx = -1;
			for (let i = 0; i < this._steps.length; i += 1) {
				const v = this._steps[i];
				const d = (s - v) * (s - v);
				if (d < dis) {
					dis = d;
					idx = i;
				}
			}
			return [idx, ns];
		}

		/**
		 * Update touch information (used only in the library)
		 * @private
		 * @param {TouchList} ts Touches
		 */
		_updateTouch(ts) {
			this._touchCount = ts.length;
			[this._touchPt.x, this._touchPt.y] = this._getTouchPoint(ts);
		}

		/**
		 * Get the touched point (used only in the library)
		 * @private
		 * @param {TouchList} ts Touches
		 */
		_getTouchPoint(ts) {
			let x = 0, y = 0;
			if (ts.length === 1) {
				x = ts[0].pageX - window.pageXOffset;
				y = ts[0].pageY - window.pageYOffset;
			} else if (2 <= ts.length) {
				x = (ts[0].pageX + ts[1].pageX) / 2 - window.pageXOffset;
				y = (ts[0].pageY + ts[1].pageY) / 2 - window.pageYOffset;
			}
			return [x, y];
		}

		/**
		 * Get the distance between two touched points (used only in the library)
		 * @private
		 * @param {TouchList} ts Touches
		 */
		_getTouchDistance(ts) {
			const x1 = ts[0].screenX, y1 = ts[0].screenY;
			const x2 = ts[1].screenX, y2 = ts[1].screenY;
			return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
		}


		// -------------------------------------------------------------------------


		/**
		 * Whether to magnify on wheel rotation
		 * @param {boolean=} val Whether to magnify on wheel rotation
		 * @return {boolean} Whether to magnify on wheel rotation
		 */
		enabled(val) {
			if (val === undefined) return this._isEnabled;
			this._isEnabled = val;
		}

		/**
		 * Make settings before drawing (used only in the Paper)
		 * @param {Paper|CanvasRenderingContext2D} ctx Paper or canvas context
		 */
		beforeDrawing(ctx) {
			if (!this._isEnabled) return;
			const t = ctx.getTransform();

			ctx.save();
			ctx.setTransform(1, 0, 0, 1, 0, 0);
			ctx.translate(-this._viewOff.x, -this._viewOff.y);
			ctx.scale(this._scale, this._scale);
			ctx.transform(t.a, t.b, t.c, t.d, t.e, t.f);
		}

		/**
		 * Reset the settings after drawing (used only in the Paper)
		 * @param {Paper|CanvasRenderingContext2D} ctx Paper or canvas context
		 */
		afterDrawing(ctx) {
			if (!this._isEnabled) return;
			ctx.restore();
		}

	}


	/**
	 * Paper
	 * @version 2020-05-05
	 */
	class Paper {

		/**
		 * Make a paper
		 * @constructor
		 * @param {number} width width
		 * @param {number} height height
		 * @param {boolean} [isVisible=true] Whether to be visible
		 */
		constructor(width, height, isVisible = true) {
			const can = document.createElement('canvas');
			can.setAttribute('width', width || 400);
			can.setAttribute('height', height || 400);
			can.setAttribute('tabindex', 1);

			this._ctx = can.getContext('2d');
			if (!PAPER_IS_AUGMENTED) augmentPaperPrototype(this._ctx);

			// When displaying on the screen
			if (isVisible === true) {
				const style = document.createElement('style');
				style.innerHTML = 'body>canvas{border:0 solid lightgray;display:inline-block;touch-action:none;outline:none;}';
				document.head.appendChild(style);

				can.id = 'canvas';
				document.body.appendChild(can);
				can.focus();
			}
			CANVAS_TO_PAPER[can] = this;
			this._augment(can);
			CROQUJS.currentPaper(this);

			if (typeof STYLE !== 'undefined') STYLE.augment(this);

			// this._initZoomingFunction();
		}

		/**
		 * Augment papers (used only in the library)
		 * @private
		 * @param {DOMElement} can Canvas element
		 */
		_augment(can) {
			this._frame = 0;
			this._fps = 60;
			this._frameLength = 60;
			this._totalFrame = 0;
			this._isAnimating = false;
			this._isGridVisible = true;

			this._keyEventHandler = new KeyHandler(can);
			this._mouseEventHandler = new MouseHandler(can);
			this._zoomHandler = new ZoomHandler(this);
			this.addEventListener = can.addEventListener.bind(can);

			can.addEventListener('keydown', (e) => {
				if (e.ctrlKey && String.fromCharCode(e.keyCode) === 'S') this.saveImage();
			}, true);
		}

		/**
		 * Width
		 * @param {number=} val Width
		 * @return {number|Paper} Width, or this paper
		 */
		width(val) {
			if (val === undefined) return this.canvas.width;
			this.canvas.width = val;
			return this;
		}

		/**
		 * Height
		 * @param {number=} val Height
		 * @return {number|Paper} Height, or this paper
		 */
		height(val) {
			if (val === undefined) return this.canvas.height;
			this.canvas.height = val;
			return this;
		}

		/**
		 * Set the size of the paper
		 * @param {number} width Width
		 * @param {number} height Height
		 * @return {Paper} This paper
		 */
		setSize(width, height) {
			this.canvas.width = width;
			this.canvas.height = height;
			return this;
		}

		/**
		 * Clear the paper in the specified color
		 * @param {string} style Style (transparent if not specified)
		 * @param {number} alpha Alpha
		 * @return {Paper} This paper
		 */
		clear(style, alpha) {
			this.save();
			this.setTransform(1, 0, 0, 1, 0, 0);
			if (alpha !== undefined) {
				this.globalAlpha = alpha;
			}
			if (style === undefined) {
				this.clearRect(0, 0, this.width(), this.height());  // 透明にする
			} else {
				this.fillStyle = style;
				this.fillRect(0, 0, this.width(), this.height());
			}
			this.restore();
			return this;
		}


		// Animation ------------------------------------------------------------


		/**
		 * Start animation
		 * @param {function} callback Function to draw picture one by one
		 * @param {Array} args_array Arguments to pass to the function
		 * @return {Paper} This paper
		 */
		animate(callback, args_array) {
			const startTime = getTime();
			let prevFrame = -1;

			const loop = () => {
				const timeSpan = getTime() - startTime;
				const frame = Math.floor(timeSpan / (1000.0 / this._fps)) % this._frameLength;

				if (frame !== prevFrame) {
					this._frame = frame;
					CROQUJS.currentPaper(this);
					this._zoomHandler.beforeDrawing(this);
					callback.apply(null, args_array);
					if (this.mouseMiddle() && this._isGridVisible) this.drawGrid();
					this._zoomHandler.afterDrawing(this);
					prevFrame = frame;
					this._totalFrame += 1;
				}
				if (this._isAnimating && this.canvas.parentNode !== null) {
					window.requestAnimationFrame(loop);
				}
			};
			this._isAnimating = true;
			window.requestAnimationFrame(loop);
			return this;
		}

		/**
		 * Stop animation
		 * @return {Paper} This paper
		 */
		stop() {
			this._isAnimating = false;
			return this;
		}

		/**
		 * Frames
		 * @return {number} Frames
		 */
		frame() {
			return this._frame;
		}

		/**
		 * Frames per second
		 * @param {number=} val Frames per second
		 * @return {number|Paper} Frames per second, or this paper
		 */
		fps(val) {
			if (val === undefined) return this._fps;
			this._fps = val;
			return this;
		}

		/**
		 * Frame length
		 * @param {number=} val Frame length
		 * @return {number|Paper} Frame length, or this paper
		 */
		frameLength(val) {
			if (val === undefined) return this._frameLength;
			this._frameLength = val;
			return this;
		}

		/**
		 * Total frames
		 * @return {number} Total frames
		 */
		totalFrame() {
			return this._totalFrame;
		}


		// Page -----------------------------------------------------------------


		/**
		 * Make a new page
		 * @param {string} pageName Page name
		 * @return {Paper} Page
		 */
		makePage(pageName) {
			if (!this._pages) this._pages = {};
			this._pages[pageName] = new CROQUJS.Paper(this.width(), this.height(), false);
			return this._pages[pageName];
		}

		/**
		 * Get a page
		 * @param {string} pageName Page name
		 * @return {Paper|boolean} Page, or false
		 */
		getPage(pageName) {
			if (!this._pages) return false;
			return this._pages[pageName];
		}


		// Child page -----------------------------------------------------------


		/**
		 * Add a child paper
		 * @param {Paper} paper Child paper
		 */
		addChild(paper) {
			if (!this._children) this._children = [];
			this._children.push(paper);
			this._mouseEventHandler.addChild(paper._mouseEventHandler);
		}

		/**
		 * Remove a child paper
		 * @param {Paper} paper Child paper
		 */
		removeChild(paper) {
			if (!this._children) return;
			this._children = this._children.filter(e => (e !== paper));
			this._mouseEventHandler.removeChild(paper._mouseEventHandler);
		}


		// Utilities ------------------------------------------------------------


		/**
		 * Get a ruler
		 * @return {Ruler} Ruler
		 */
		getRuler() {
			if (typeof RULER === 'undefined') throw new Error('Ruler library is needed.');
			if (!this._ruler) this._ruler = new RULER.Ruler(this);
			return this._ruler;
		}

		/**
		 * Save the picture drawn on the paper to a file
		 * @param {string=} fileName File name
		 * @param {string=} type File type
		 * @return {Paper} This paper
		 */
		saveImage(fileName, type) {
			const canvasToBlob = function (canvas, type) {
				const data = atob(canvas.toDataURL(type).split(',')[1]);
				const buf = new Uint8Array(data.length);

				for (let i = 0, I = data.length; i < I; i += 1) {
					buf[i] = data.charCodeAt(i);
				}
				return new Blob([buf], { type: type || 'image/png' });
			};
			const saveBlob = function (blob, fileName) {
				const a = document.createElement('a');
				a.href = window.URL.createObjectURL(blob);
				a.download = fileName;
				a.click();
			};
			saveBlob(canvasToBlob(this.canvas, type), fileName || 'default.png');
			return this;
		}


		/**
		 * Whether to show grid on wheel click
		 * @param {boolean=} val Whether to show grid on wheel click
		 * @return {boolean|Paper} Whether to show grid on wheel click, or this paper
		 */
		gridVisible(val) {
			if (val === undefined) return this._isGridVisible;
			this._isGridVisible = val;
			return this;
		}

		/**
		 * Draw grid on the paper
		 */
		drawGrid() {
			const w = this.width(), h = this.height();
			const wd = Math.floor(w / 10), hd = Math.floor(h / 10);

			this.save();
			this.lineWidth = 1;
			this.strokeStyle = 'White';
			this.globalCompositeOperation = 'xor';

			for (let x = -wd; x < wd; x += 1) {
				this.globalAlpha = (x % 10 === 0) ? 0.75 : 0.5;
				this.beginPath();
				this.moveTo(x * 10, -h);
				this.lineTo(x * 10, h);
				this.stroke();
			}
			for (let y = -hd; y < hd; y += 1) {
				this.globalAlpha = (y % 10 === 0) ? 0.75 : 0.5;
				this.beginPath();
				this.moveTo(-w, y * 10);
				this.lineTo(w, y * 10);
				this.stroke();
			}
			this.restore();
		}

		/**
		 * Whether to magnify on wheel rotation
		 * @param {boolean=} val Whether to magnify on wheel rotation
		 * @return {boolean|Paper} Whether to magnify on wheel rotation, or this paper
		 */
		zoomEnabled(val) {
			if (val === undefined) return this._zoomHandler.enabled();
			this._zoomHandler.enabled(val);
			return this;
		}


		// Keyboard -------------------------------------------------------------


		/**
		 * Set the function handling key down events
		 * @param {function(string, KeyEvent)=} handler Function
		 * @return {function(string, KeyEvent)=} Function
		 */
		onKeyDown(handler) {
			if (handler === undefined) return this._keyEventHandler.onKeyDown();
			this._keyEventHandler.onKeyDown(handler);
			return this;
		}

		/**
		 * Set the function handling key up events
		 * @param {function(string, KeyEvent)=} handler Function
		 * @return {function(string, KeyEvent)=} Function
		 */
		onKeyUp(handler) {
			if (handler === undefined) return this._keyEventHandler.onKeyUp();
			this._keyEventHandler.onKeyUp(handler);
			return this;
		}


		// Mouse ----------------------------------------------------------------


		/**
		 * Set the function handling the mouse down event
		 * @param {function(number, number, MouseEvent)=} handler Function
		 * @return {function(number, number, MouseEvent)=} Function
		 */
		onMouseDown(handler) {
			if (handler === undefined) return this._mouseEventHandler.onMouseDown();
			this._mouseEventHandler.onMouseDown(handler);
			return this;
		}

		/**
		 * Set the function handling the mouse move event
		 * @param {function(number, number, MouseEvent)=} handler Function
		 * @return {function(number, number, MouseEvent)=} Function
		 */
		onMouseMove(handler) {
			if (handler === undefined) return this._mouseEventHandler.onMouseMove();
			this._mouseEventHandler.onMouseMove(handler);
			return this;
		}

		/**
		 * Set the function handling the mouse up event
		 * @param {function(number, number, MouseEvent)=} handler Function
		 * @return {function(number, number, MouseEvent)=} Function
		 */
		onMouseUp(handler) {
			if (handler === undefined) return this._mouseEventHandler.onMouseUp();
			this._mouseEventHandler.onMouseUp(handler);
			return this;
		}

		/**
		 * Set the function handling the mouse click event
		 * @param {function(number, number, MouseEvent)=} handler Function
		 * @return {function(number, number, MouseEvent)=} Function
		 */
		onMouseClick(handler) {
			if (handler === undefined) return this._mouseEventHandler.onMouseClick();
			this._mouseEventHandler.onMouseClick(handler);
			return this;
		}

		/**
		 * Set the function handling the mouse wheel event
		 * @param {function(number, WheelEvent)=} handler Function
		 * @return {function(number, WheelEvent)=} Function
		 */
		onMouseWheel(handler) {
			if (handler === undefined) return this._mouseEventHandler.onMouseWheel();
			this._mouseEventHandler.onMouseWheel(handler);
			return this;
		}

		/**
		 * Return x coordinate of the mouse
		 * @return {number} X coordinate of the mouse
		 */
		mouseX() {
			return this._mouseEventHandler.mouseX();
		}

		/**
		 * Return y coordinate of the mouse
		 * @return {number} Y coordinate of the mouse
		 */
		mouseY() {
			return this._mouseEventHandler.mouseY();
		}

		/**
		 * Whether the left mouse button is pressed
		 * @return {boolean} Whether the left mouse button is pressed
		 */
		mouseLeft() {
			return this._mouseEventHandler.mouseLeft();
		}

		/**
		 * Whether the right mouse button is pressed
		 * @return {boolean} Whether the right mouse button is pressed
		 */
		mouseRight() {
			return this._mouseEventHandler.mouseRight();
		}

		/**
		 * Whether the middle mouse button is pressed
		 * @return {boolean} Whether the middle mouse button is pressed
		 */
		mouseMiddle() {
			return this._mouseEventHandler.mouseMiddle();
		}

	};

	let PAPER_IS_AUGMENTED = false;

	function augmentPaperPrototype(ctx) {
		PAPER_IS_AUGMENTED = true;
		const org = Object.getPrototypeOf(ctx);
		for (const name in ctx) {
			if (typeof ctx[name] === 'function') {
				Paper.prototype[name] = function (...args) { return this._ctx[name](...args); }
			} else {
				const d = Object.getOwnPropertyDescriptor(org, name);
				const nd = { configurable: d.configurable, enumerable: d.enumerable }
				if (d.get) nd['get'] = function () { return this._ctx[name]; };
				if (d.set) nd['set'] = function (v) { this._ctx[name] = v; };
				Object.defineProperty(Paper.prototype, name, nd);
			}
		}
	}


	// Utility functions ----------------------------------------------------


	/**
	 * Get the current millisecond
	 * @return {number} The current millisecond
	 */
	const getTime = (function () {
		return window.performance.now.bind(window.performance);
	}());

	/**
	 * Delete all elements on the screen except for the specified exception
	 * @param {DOMElement} exception Elements of exception
	 */
	const removeAll = function (...exception) {
		let ex = [];
		if (exception.length === 1 && Array.isArray(exception[0])) {
			ex = exception[0];
		} else {
			ex = exception;
		}
		ex = ex.map((e) => {return (e.domElement === undefined) ? e : e.domElement();});

		const rm = [];
		for (let c of document.body.childNodes) {
			if (ex.indexOf(c) === -1) rm.push(c);
		}
		rm.forEach((e) => {
			if (CANVAS_TO_PAPER[e]) {
				CANVAS_TO_PAPER[e]._mouseEventHandler.removeWinListener();
			}
			document.body.removeChild(e);
		});
	};

	/**
	 * Current paper
	 * @param {Paper=} paper Paper
	 * @return {Paper} Current paper
	 */
	const currentPaper = function (paper) {
		if (paper) CROQUJS._currentPaper = paper;
		return CROQUJS._currentPaper;
	};


	/**
	 * Script loader
	 * @author Takuto Yanagida
	 * @version 2020-04-24
	 */


	/**
	 * Load a script (asynchronous)
	 * @param {string} src The URL of a script
	 */
	function loadScript(src) {
		const s = document.createElement('script');
		s.src = src;
		document.head.appendChild(s);
	}

	/**
	 * Load a script (synchronous)
	 * @param {string} src The URL of a script
	 */
	function loadScriptSync(src) {
		const xhr = new XMLHttpRequest();
		xhr.open('GET', src, false);
		xhr.send(null);
		if (xhr.status === 200) {
			const s = document.createElement('script');
			s.text = xhr.responseText;
			document.head.appendChild(s);
		}
	}


	// Create a library -----------------------------------------------------


	return { Paper, getTime, removeAll, currentPaper, loadScript, loadScriptSync };

}());