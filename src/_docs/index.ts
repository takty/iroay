/**
 * Script for Sample
 *
 * @author Takuto Yanagida
 * @version 2024-08-15
 */

import 'klales/klales.min.css';
import { Color, ColorSpace, Munsell, RGB, LRGB } from '../colorjst.ts';

type Triplet = [number, number, number];

document.addEventListener('DOMContentLoaded', () => {
	const sel = document.querySelector('select') as HTMLSelectElement;
	const sli = document.querySelector('#value') as HTMLInputElement;
	const ss  = document.querySelector('#show-saturation') as HTMLInputElement;
	const can = document.querySelector('canvas');
	if (can) {
		const ctx = can.getContext('2d') as CanvasRenderingContext2D;
		const w = can.width;
		const h = can.height;

		draw(w, h, ctx, sel, sli, ss);
		sel?.addEventListener('change', () => {
			draw(w, h, ctx, sel, sli, ss);
		});
		sli?.addEventListener('input', () => {
			draw(w, h, ctx, sel, sli, ss);
		});
		ss?.addEventListener('change', () => {
			draw(w, h, ctx, sel, sli, ss);
		});
	}
});

function draw(w: number, h: number, ctx: CanvasRenderingContext2D, sel: HTMLSelectElement, sli: HTMLInputElement, ss: HTMLInputElement): void {
	ctx.save();
	ctx.fillStyle = 'rgb(191, 191, 191)';
	ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
	ctx.restore();

	const fns = new Map([
		['rgb', drawChartRGB],
		['yiq', drawChartYIQ],
		['lrgb', drawChartLRGB],
		['xyz', drawChartXYZ],
		['lab', drawChartLab],
		['lch', drawChartLCh],
		['yxy', drawChartYxy],
		['mun', drawChartMunsell],
		['mun_p', drawChartMunsellPolar],
		['mun_i', drawChartMunsellFromXYZ],
		['pccs', drawChartPCCS],
		['pccs_p', drawChartPCCSPolar],
		['tone', drawChartTone],
	]);
	ctx.save();
	const idx = sel.value;
	const f = fns.get(idx);
	if  (f) {
		f(w, h, ctx, parseInt(sli.value) / 255, ss.checked);
	}
	ctx.restore();
};

function drawChartRGB(w: number, h: number, ctx: CanvasRenderingContext2D, v: number, ss: boolean): void {
	for (let y = 0; y < h; y += 1) {
		for (let x = 0; x < w; x += 1) {
			const rgb = [255 * x / (w - 1), v * 255, 255 * y / (h - 1)] as Triplet;
			setPixel(ctx, x, (h - 1) - y, rgb);
		}
	}
}

function drawChartYIQ(w: number, h: number, ctx: CanvasRenderingContext2D, v: number, ss: boolean): void {
	const c = new Color();

	for (let y = 0; y < h; y += 1) {
		for (let x = 0; x < w; x += 1) {
			c.set(ColorSpace.YIQ, [v, 0.5959 * (x / (w - 1) - 0.5), 0.5229 * (y / (h - 1) - 0.5)]);

			const rgb = c.asRGB();
			setPixel(ctx, x, (h - 1) - y, rgb);
		}
	}
}

function drawChartLRGB(w: number, h: number, ctx: CanvasRenderingContext2D, v: number, ss: boolean): void {
	const c = new Color();

	for (let y = 0; y < h; y += 1) {
		for (let x = 0; x < w; x += 1) {
			c.set(ColorSpace.LRGB, [x / (w - 1), v, y / (h - 1)]);

			const rgb = c.asRGB();
			setPixel(ctx, x, (h - 1) - y, rgb);
		}
	}
}

function drawChartXYZ(w: number, h: number, ctx: CanvasRenderingContext2D, v: number, ss: boolean): void {
	const c = new Color();

	for (let y = 0; y < h; y += 1) {
		for (let x = 0; x < w; x += 1) {
			c.set(ColorSpace.XYZ, [x / (w - 1), v, y / (h - 1)]);

			const rgb = c.asRGB();
			if (ss || !c.isRGBSaturated() || 0 === (x + y) % 7) {
					setPixel(ctx, x, (h - 1) - y, rgb);
			}
		}
	}
}

function drawChartLab(w: number, h: number, ctx: CanvasRenderingContext2D, v: number, ss: boolean): void {
	const c = new Color();

	for (let y = 0; y < h; y += 1) {
		for (let x = 0; x < w; x += 1) {
			c.set(ColorSpace.Lab, [v * 100, (x / w) * 256 - 128, (y / h) * 256 - 128]);

			const rgb = c.asRGB();
			if (ss || !c.isRGBSaturated() || 0 === (x + y) % 7) {
				setPixel(ctx, x, (h - 1) - y, rgb);
			}
		}
	}
}

function drawChartLCh(w: number, h: number, ctx: CanvasRenderingContext2D, v: number, ss: boolean): void {
	const c = new Color();
	const c2 = new Color();

	for (let y = 0; y < h; y += 1) {
		for (let x = 0; x < w; x += 1) {
			c.set(ColorSpace.LCh, [v * 100, (y / (h - 1)) * 128, (x / (w - 1)) * 360]);

			const rgb = c.asRGB();
			if (ss || !c.isRGBSaturated() || 0 === (x + y) % 7) {
				setPixel(ctx, x, (h - 1) - y, rgb);
			}
		}
	}
}

function drawChartYxy(w: number, h: number, ctx: CanvasRenderingContext2D, v: number, ss: boolean): void {
	const c = new Color();

	for (let y = 0; y < h; y += 1) {
		for (let x = 0; x < w; x += 1) {
			c.set(ColorSpace.Yxy, [v, x / (w - 1), y / (h - 1)]);

			const rgb = c.asRGB();
			if (ss || (!c.isRGBSaturated() && !c.isYxySaturated()) || 0 === (x + y) % 7) {
				setPixel(ctx, x, (h - 1) - y, rgb);
			}
		}
	}
}

function drawChartMunsell(w: number, h: number, ctx: CanvasRenderingContext2D, v: number, ss: boolean): void {
	const c = new Color();

	for (let y = 0; y < h; y += 1) {
		for (let x = 0; x < w; x += 1) {
			c.set(ColorSpace.Munsell, [x * 100 / (w - 1), v * 10, y * 38 / (h - 1)]);

			const rgb = c.asRGB();
			const s = c.isRGBSaturated() || c.isMunsellSaturated();
			if (ss || !s || 0 === (x + y) % 7) {
				setPixel(ctx, x, (h - 1) - y, rgb);
			}
		}
	}
}

function drawChartMunsellPolar(w: number, h: number, ctx: CanvasRenderingContext2D, v: number, ss: boolean): void {
	const c = new Color();

	for (let y = 0; y < h; y += 1) {
		for (let x = 0; x < w; x += 1) {
			const xx = (x / w) * 256 - 128;
			const yy = (y / h) * 256 - 128;
			const rad = (yy > 0) ? Math.atan2(yy, xx) : (Math.atan2(-yy, -xx) + Math.PI);

			let tb0 = rad / (Math.PI * 2) * 100 + 30;
			if (tb0 >= 100) tb0 -= 100;
			const tb2 = Math.sqrt((xx / 128 * 33) * (xx / 128 * 33) + (yy / 128 * 33) * (yy / 128 * 33));

			c.set(ColorSpace.Munsell, [tb0, v * 10, tb2]);

			const rgb = c.asRGB();
			const s = c.isRGBSaturated() || c.isMunsellSaturated();
			if (ss || !s || 0 === (x + y) % 7) {
				setPixel(ctx, x, y, rgb);
			}
		}
	}
}

function drawChartMunsellFromXYZ(w: number, h: number, ctx: CanvasRenderingContext2D, v: number, ss: boolean): void {
	const c = new Color();
	const c2 = new Color();

	for (let y = 0; y < h; y += 1) {
		for (let x = 0; x < w; x += 1) {
			c.set(ColorSpace.XYZ, [x / (w - 1), v, y / (h - 1)]);
			c2.set(ColorSpace.Munsell, c.asMunsell());
			const s = Munsell.isSaturated;

			const rgb = c2.asRGB();
			if (ss || !s || 0 === (x + y) % 7) {
				setPixel(ctx, x, (h - 1) - y, rgb);
			}
		}
	}
}

function drawChartPCCS(w: number, h: number, ctx: CanvasRenderingContext2D, v: number, ss: boolean): void {
	const c = new Color();

	for (let y = 0; y < h; y += 1) {
		for (let x = 0; x < w; x += 1) {
			c.set(ColorSpace.PCCS, [x * 24 / (w - 1), v * 10, y * 10 / (h - 1)]);

			const rgb = c.asRGB();
			if (ss || (!c.isRGBSaturated() && !c.isMunsellSaturated()) || 0 === (x + y) % 7) {
				setPixel(ctx, x, (h - 1) - y, rgb);
			}
		}
	}
}

function drawChartPCCSPolar(w: number, h: number, ctx: CanvasRenderingContext2D, v: number, ss: boolean): void {
	const c = new Color();

	for (let y = 0; y < h; y += 1) {
		for (let x = 0; x < w; x += 1) {
			const xx = (x / w) * 256 - 128;
			const yy = (y / h) * 256 - 128;
			const rad = ((yy > 0) ? Math.atan2(yy, xx) : (Math.atan2(-yy, -xx) + Math.PI)) / (Math.PI * 2);

			let tb0 = rad * 24 - 8;
			if (tb0 >= 24) tb0 -= 24;
			if (tb0 < 0) tb0 += 24;
			const tb2 = Math.sqrt((xx / 128 * 10) * (xx / 128 * 10) + (yy / 128 * 10) * (yy / 128 * 10));

			c.set(ColorSpace.PCCS, [tb0, v * 10, tb2]);

			const rgb = c.asRGB();
			if (ss || (!c.isRGBSaturated() && !c.isMunsellSaturated()) || 0 === (x + y) % 7) {
				setPixel(ctx, x, y, rgb);
			}
		}
	}
}

function drawChartTone(w: number, h: number, ctx: CanvasRenderingContext2D, v: number, ss: boolean): void {
	const c = new Color();

	for (let y = 0; y < h; y += 1) {
		for (let x = 0; x < w; x += 1) {
			c.set(ColorSpace.Tone, [v * 24, y * 10 / (h - 1), x * 10 / (w - 1)]);

			const rgb = c.asRGB();
			if (ss || (!c.isRGBSaturated() && !c.isMunsellSaturated()) || 0 === (x + y) % 7) {
				setPixel(ctx, x, (h - 1) - y, rgb);
			}
		}
	}
}

function setPixel(ctx: CanvasRenderingContext2D, x: number, y: number, [r = 0, g = 0, b = 0]: Triplet) {
	ctx.fillStyle = `rgb(${r},${g},${b}`;
	ctx.fillRect(x, y, 1, 1);
}
