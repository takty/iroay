/**
 * Script for Sample
 *
 * @author Takuto Yanagida
 * @version 2024-07-31
 */

import 'klales/klales.min.css';
import { Color, ColorSpace } from '../colorjst.ts';

type Triplet = [number, number, number];

document.addEventListener('DOMContentLoaded', () => {
	const sel = document.querySelector('select') as HTMLSelectElement;
	const sli = document.querySelector('#value') as HTMLInputElement;
	const ss  = document.querySelector('#show-saturation') as HTMLInputElement;
	const can = document.querySelector('canvas');
	if (can) {
		const ctx = can.getContext('2d') as CanvasRenderingContext2D;

		draw(ctx, sel, sli, ss);
		sel?.addEventListener('change', () => {
			draw(ctx, sel, sli, ss);
		});
		sli?.addEventListener('input', () => {
			draw(ctx, sel, sli, ss);
		});
		ss?.addEventListener('change', () => {
			draw(ctx, sel, sli, ss);
		});
	}
});

function draw(ctx: CanvasRenderingContext2D, sel: HTMLSelectElement, sli: HTMLInputElement, ss: HTMLInputElement): void {
	ctx.save();
	ctx.fillStyle = 'rgb(191, 191, 191)';
	ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
	ctx.restore();

	const fns = [
		drawChartRGB,
		drawChartLRGB,
		drawChartXYZ,
		drawChartLab,
		drawChartYxy,
		drawChartMunsell,
		drawChartMunsellPolar,
		drawChartPCCS,
		drawChartPCCSPolar,
		drawChartTone,
	];
	const idx = parseInt(sel.value, 10);
	ctx.save();
	fns[idx](ctx, parseInt(sli.value) / 255, ss.checked);
	ctx.restore();
};

function drawChartRGB(ctx: CanvasRenderingContext2D, v: number, ss: boolean): void {
	for (let y = 0; y < 256; y += 1) {
		for (let x = 0; x < 256; x += 1) {
			const rgb = [x, v * 255, y] as Triplet;
			setPixel(ctx, x, 255 - y, rgb);
		}
	}
}

function drawChartLRGB(ctx: CanvasRenderingContext2D, v: number, ss: boolean): void {
	const c = new Color();

	for (let y = 0; y < 256; y += 1) {
		for (let x = 0; x < 256; x += 1) {
			c.set(ColorSpace.LRGB, [x / 255, v, y / 255]);

			const rgb = c.asRGB();
			setPixel(ctx, x, 255 - y, rgb);
		}
	}
}

function drawChartXYZ(ctx: CanvasRenderingContext2D, v: number, ss: boolean): void {
	const c = new Color();

	for (let y = 0; y < 256; y += 1) {
		for (let x = 0; x < 256; x += 1) {
			c.set(ColorSpace.XYZ, [x / 255, v, y / 255]);

			const rgb = c.asRGB();
			if (ss || !c.isRGBSaturated() || 0 === (x + y) % 7) {
				setPixel(ctx, x, 255 - y, rgb);
			}
		}
	}
}

function drawChartLab(ctx: CanvasRenderingContext2D, v: number, ss: boolean): void {
	const c = new Color();

	for (let y = 0; y < 256; y += 1) {
		for (let x = 0; x < 256; x += 1) {
			c.set(ColorSpace.Lab, [v * 100, x - 128, y - 128]);

			const rgb = c.asRGB();
			if (ss || !c.isRGBSaturated() || 0 === (x + y) % 7) {
				setPixel(ctx, x, 255 - y, rgb);
			}
		}
	}
}

function drawChartYxy(ctx: CanvasRenderingContext2D, v: number, ss: boolean): void {
	const c = new Color();

	for (let y = 0; y < 256; y += 1) {
		for (let x = 0; x < 256; x += 1) {
			c.set(ColorSpace.Yxy, [v, x / 255, y / 255]);

			const rgb = c.asRGB();
			if (ss || !c.isRGBSaturated() || 0 === (x + y) % 7) {
				setPixel(ctx, x, 255 - y, rgb);
			}
		}
	}
}

function drawChartMunsell(ctx: CanvasRenderingContext2D, v: number, ss: boolean): void {
	const c = new Color();

	for (let y = 0; y < 256; y += 1) {
		for (let x = 0; x < 256; x += 1) {
			c.set(ColorSpace.Munsell, [x * 100 / 255, v * 10, y * 38 / 255]);

			const rgb = c.asRGB();
			if (ss || (!c.isRGBSaturated() && !c.isMunsellSaturated()) || 0 === (x + y) % 7) {
				setPixel(ctx, x, 255 - y, rgb);
			}
		}
	}
}

function drawChartMunsellPolar(ctx: CanvasRenderingContext2D, v: number, ss: boolean): void {
	const c = new Color();

	for (let y = 0; y < 256; y += 1) {
		for (let x = 0; x < 256; x += 1) {
			const xx = x - 128, yy = y - 128;
			const rad = (yy > 0) ? Math.atan2(yy, xx) : (Math.atan2(-yy, -xx) + Math.PI);

			let tb0 = rad / (Math.PI * 2) * 100 + 30;
			if (tb0 >= 100) tb0 -= 100;
			const tb2 = Math.sqrt((xx / 128 * 33) * (xx / 128 * 33) + (yy / 128 * 33) * (yy / 128 * 33));

			c.set(ColorSpace.Munsell, [tb0, v * 10, tb2]);

			const rgb = c.asRGB();
			if (ss || (!c.isRGBSaturated() && !c.isMunsellSaturated()) || 0 === (x + y) % 7) {
				setPixel(ctx, x, y, rgb);
			}
		}
	}
}

function drawChartPCCS(ctx: CanvasRenderingContext2D, v: number, ss: boolean): void {
	const c = new Color();

	for (let y = 0; y < 256; y += 1) {
		for (let x = 0; x < 256; x += 1) {
			c.set(ColorSpace.PCCS, [x * 24 / 255, v * 10, y * 10 / 255]);

			const rgb = c.asRGB();
			if (ss || (!c.isRGBSaturated() && !c.isMunsellSaturated()) || 0 === (x + y) % 7) {
				setPixel(ctx, x, 255 - y, rgb);
			}
		}
	}
}

function drawChartPCCSPolar(ctx: CanvasRenderingContext2D, v: number, ss: boolean): void {
	const c = new Color();

	for (let y = 0; y < 256; y += 1) {
		for (let x = 0; x < 256; x += 1) {
			const xx = x - 128, yy = y - 128;
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

function drawChartTone(ctx: CanvasRenderingContext2D, v: number, ss: boolean): void {
	const c = new Color();

	for (let y = 0; y < 256; y += 1) {
		for (let x = 0; x < 256; x += 1) {
			c.set(ColorSpace.Tone, [v * 24, y * 10 / 256, x * 10 / 256]);

			const rgb = c.asRGB();
			if (ss || (!c.isRGBSaturated() && !c.isMunsellSaturated()) || 0 === (x + y) % 7) {
				setPixel(ctx, x, 255 - y, rgb);
			}
		}
	}
}

function setPixel(ctx: CanvasRenderingContext2D, x: number, y: number, [r = 0, g = 0, b = 0]: Triplet) {
	ctx.fillStyle = `rgb(${r},${g},${b}`;
	ctx.fillRect(x, y, 1, 1);
}
