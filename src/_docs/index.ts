/**
 * Script for Sample
 *
 * @author Takuto Yanagida
 * @version 2024-11-12
 */

import 'klales/klales.min.css';
import { PI2, atan2rad, mag } from '../math.ts';
import { Color, ColorSpace, Munsell } from './../../iroay.ts';

type Triplet = [number, number, number];

document.addEventListener('DOMContentLoaded', () => {
	const sel = document.querySelector('select') as HTMLSelectElement;
	const sli = document.querySelector('#value') as HTMLInputElement;
	const ss  = document.querySelector('#show-saturation') as HTMLInputElement;
	const can  = document.querySelector('canvas');
	if (can) {
		const ctx = can.getContext('2d') as CanvasRenderingContext2D;
		const w: number = can.width;
		const h: number = can.height;

		draw(w, h, ctx, sel, sli, ss);
		sel?.addEventListener('change', (): void => {
			draw(w, h, ctx, sel, sli, ss);
		});
		sli?.addEventListener('input', (): void => {
			draw(w, h, ctx, sel, sli, ss);
		});
		ss?.addEventListener('change', (): void => {
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
		['rgb', drawChartRgb],
		['hsl', drawChartHsl],
		['yiq', drawChartYiq],
		['lrgb', drawChartLrgb],
		['xyz', drawChartXyz],
		['lab', drawChartLab],
		['lch', drawChartLch],
		['xyy', drawChartXyy],
		['mun', drawChartMunsell],
		['mun_p', drawChartMunsellPolar],
		['mun_i', drawChartMunsellFromXyz],
		['pccs', drawChartPccs],
		['pccs_p', drawChartPccsPolar],
		['tone', drawChartTone],
	]);
	ctx.save();
	const f = fns.get(sel.value);
	if  (f) {
		f(w, h, ctx, parseInt(sli.value) / 255, ss.checked);
	}
	ctx.restore();
};

function drawChartRgb(w: number, h: number, ctx: CanvasRenderingContext2D, v: number, ss: boolean): void {
	for (let y: number = 0; y < h; y += 1) {
		for (let x: number = 0; x < w; x += 1) {
			const rgb = [255 * x / (w - 1), v * 255, 255 * y / (h - 1)] as Triplet;
			setPixel(ctx, x, (h - 1) - y, rgb);
		}
	}
}

function drawChartHsl(w: number, h: number, ctx: CanvasRenderingContext2D, v: number, ss: boolean): void {
	const c = new Color();

	for (let y: number = 0; y < h; y += 1) {
		for (let x: number = 0; x < w; x += 1) {
			c.set(ColorSpace.Hsl, [360 * x / (w - 1), 100 * y / (h - 1), v * 100]);

			const rgb: Triplet = c.asRgb();
			setPixel(ctx, x, (h - 1) - y, rgb);
		}
	}
}

function drawChartYiq(w: number, h: number, ctx: CanvasRenderingContext2D, v: number, ss: boolean): void {
	const c = new Color();

	for (let y: number = 0; y < h; y += 1) {
		for (let x: number = 0; x < w; x += 1) {
			c.set(ColorSpace.Yiq, [v, 0.5959 * (x / (w - 1) - 0.5), 0.5229 * (y / (h - 1) - 0.5)]);

			const rgb: Triplet = c.asRgb();
			setPixel(ctx, x, (h - 1) - y, rgb);
		}
	}
}

function drawChartLrgb(w: number, h: number, ctx: CanvasRenderingContext2D, v: number, ss: boolean): void {
	const c = new Color();

	for (let y: number = 0; y < h; y += 1) {
		for (let x: number = 0; x < w; x += 1) {
			c.set(ColorSpace.Lrgb, [x / (w - 1), v, y / (h - 1)]);

			const rgb: Triplet = c.asRgb();
			setPixel(ctx, x, (h - 1) - y, rgb);
		}
	}
}

function drawChartXyz(w: number, h: number, ctx: CanvasRenderingContext2D, v: number, ss: boolean): void {
	const c = new Color();

	for (let y: number = 0; y < h; y += 1) {
		for (let x: number = 0; x < w; x += 1) {
			c.set(ColorSpace.Xyz, [x / (w - 1), v, y / (h - 1)]);

			const rgb: Triplet = c.asRgb();
			if (ss || !c.isRGBSaturated() || 0 === (x + y) % 7) {
					setPixel(ctx, x, (h - 1) - y, rgb);
			}
		}
	}
}

function drawChartLab(w: number, h: number, ctx: CanvasRenderingContext2D, v: number, ss: boolean): void {
	const c = new Color();

	for (let y: number = 0; y < h; y += 1) {
		for (let x: number = 0; x < w; x += 1) {
			c.set(ColorSpace.Lab, [v * 100, (x / w) * 256 - 128, (y / h) * 256 - 128]);

			const rgb: Triplet = c.asRgb();
			if (ss || !c.isRGBSaturated() || 0 === (x + y) % 7) {
				setPixel(ctx, x, (h - 1) - y, rgb);
			}
		}
	}
}

function drawChartLch(w: number, h: number, ctx: CanvasRenderingContext2D, v: number, ss: boolean): void {
	const c = new Color();

	for (let y: number = 0; y < h; y += 1) {
		for (let x: number = 0; x < w; x += 1) {
			c.set(ColorSpace.Lch, [v * 100, (y / (h - 1)) * 128, (x / (w - 1)) * 360]);

			const rgb: Triplet = c.asRgb();
			if (ss || !c.isRGBSaturated() || 0 === (x + y) % 7) {
				setPixel(ctx, x, (h - 1) - y, rgb);
			}
		}
	}
}

function drawChartXyy(w: number, h: number, ctx: CanvasRenderingContext2D, v: number, ss: boolean): void {
	const c = new Color();

	for (let y: number = 0; y < h; y += 1) {
		for (let x: number = 0; x < w; x += 1) {
			c.set(ColorSpace.Xyy, [x / (w - 1), y / (h - 1), v]);

			const rgb: Triplet = c.asRgb();
			if (ss || (!c.isRGBSaturated() && !c.isXyySaturated()) || 0 === (x + y) % 7) {
				setPixel(ctx, x, (h - 1) - y, rgb);
			}
		}
	}
}

function drawChartMunsell(w: number, h: number, ctx: CanvasRenderingContext2D, v: number, ss: boolean): void {
	const c = new Color();

	for (let y: number = 0; y < h; y += 1) {
		for (let x: number = 0; x < w; x += 1) {
			c.set(ColorSpace.Munsell, [x * 100 / (w - 1), v * 10, y * 38 / (h - 1)]);

			const rgb: Triplet = c.asRgb();
			const s: boolean = c.isRGBSaturated() || c.isMunsellSaturated();
			if (ss || !s || 0 === (x + y) % 7) {
				setPixel(ctx, x, (h - 1) - y, rgb);
			}
		}
	}
}

function drawChartMunsellPolar(w: number, h: number, ctx: CanvasRenderingContext2D, v: number, ss: boolean): void {
	const c = new Color();

	for (let y: number = 0; y < h; y += 1) {
		for (let x: number = 0; x < w; x += 1) {
			const xx: number = (x / w) * 256 - 128;
			const yy: number = (y / h) * 256 - 128;
			const rad: number = atan2rad(yy, xx);

			let tb0: number = rad / (Math.PI * 2) * 100 + 30;
			if (tb0 >= 100) tb0 -= 100;
			const tb2: number = mag(xx / 128 * 33, yy / 128 * 33);

			c.set(ColorSpace.Munsell, [tb0, v * 10, tb2]);

			const rgb: Triplet = c.asRgb();
			const s: boolean = c.isRGBSaturated() || c.isMunsellSaturated();
			if (ss || !s || 0 === (x + y) % 7) {
				setPixel(ctx, x, y, rgb);
			}
		}
	}
}

function drawChartMunsellFromXyz(w: number, h: number, ctx: CanvasRenderingContext2D, v: number, ss: boolean): void {
	const c = new Color();
	const c2 = new Color();

	for (let y: number = 0; y < h; y += 1) {
		for (let x: number = 0; x < w; x += 1) {
			c.set(ColorSpace.Xyz, [x / (w - 1), v, y / (h - 1)]);
			c2.set(ColorSpace.Munsell, c.asMunsell());
			const s: boolean = Munsell.isSaturated;

			const rgb: Triplet = c2.asRgb();
			if (ss || !s || 0 === (x + y) % 7) {
				setPixel(ctx, x, (h - 1) - y, rgb);
			}
		}
	}
}

function drawChartPccs(w: number, h: number, ctx: CanvasRenderingContext2D, v: number, ss: boolean): void {
	const c = new Color();

	for (let y: number = 0; y < h; y += 1) {
		for (let x: number = 0; x < w; x += 1) {
			c.set(ColorSpace.Pccs, [x * 24 / (w - 1), v * 10, y * 10 / (h - 1)]);

			const rgb: Triplet = c.asRgb();
			if (ss || (!c.isRGBSaturated() && !c.isMunsellSaturated()) || 0 === (x + y) % 7) {
				setPixel(ctx, x, (h - 1) - y, rgb);
			}
		}
	}
}

function drawChartPccsPolar(w: number, h: number, ctx: CanvasRenderingContext2D, v: number, ss: boolean): void {
	const c = new Color();

	for (let y: number = 0; y < h; y += 1) {
		for (let x: number = 0; x < w; x += 1) {
			const xx: number = (x / w) * 256 - 128;
			const yy: number = (y / h) * 256 - 128;
			const rad: number = atan2rad(yy, xx) / PI2;

			let tb0: number = rad * 24 - 8;
			if (tb0 >= 24) tb0 -= 24;
			if (tb0 < 0) tb0 += 24;
			const tb2: number = mag(xx / 128 * 10, yy / 128 * 10);

			c.set(ColorSpace.Pccs, [tb0, v * 10, tb2]);

			const rgb: Triplet = c.asRgb();
			if (ss || (!c.isRGBSaturated() && !c.isMunsellSaturated()) || 0 === (x + y) % 7) {
				setPixel(ctx, x, y, rgb);
			}
		}
	}
}

function drawChartTone(w: number, h: number, ctx: CanvasRenderingContext2D, v: number, ss: boolean): void {
	const c = new Color();

	for (let y: number = 0; y < h; y += 1) {
		for (let x: number = 0; x < w; x += 1) {
			c.set(ColorSpace.Tone, [v * 24, y * 10 / (h - 1), x * 10 / (w - 1)]);

			const rgb: Triplet = c.asRgb();
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


// -----------------------------------------------------------------------------


document.addEventListener('DOMContentLoaded', (): void => {
	const inp = document.getElementById('inp') as HTMLInputElement;
	const btn = document.getElementById('parse') as HTMLButtonElement;
	const out = document.getElementById('out') as HTMLOutputElement;

	btn.addEventListener('click', (): void => {
		const c: Color | null = Color.fromString(inp.value);
		if (c) {
			out.value = c.toString();
		} else {
			out.value = '';
		}
	});
});
