/**
 * Script for Sample
 *
 * @author Takuto Yanagida
 * @version 2024-07-27
 */

import 'klales/klales.min.css';
import { Color, ColorSpace } from '../colorjst.ts';

type Triplet = [number, number, number];

document.addEventListener('DOMContentLoaded', () => {
	const sel = document.querySelector('select') as HTMLSelectElement;
	const sli = document.querySelector('input[type="range"]') as HTMLInputElement;
	const can = document.querySelector('canvas');
	if (can) {
		const ctx = can.getContext('2d') as CanvasRenderingContext2D;

		draw(ctx, sel, sli);
		sel?.addEventListener('change', () => {
			draw(ctx, sel, sli);
		});
		sli?.addEventListener('input', () => {
			draw(ctx, sel, sli);
		});
	}
});

function draw(ctx: CanvasRenderingContext2D, sel: HTMLSelectElement, sli: HTMLInputElement): void {
	ctx.save();
	ctx.fillStyle = 'rgb(127, 127, 127)';
	ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
	ctx.restore();

	const fns = [
		drawChartRGB,
		drawChartLRGB,
		drawChartXYZ,
		drawChartLab,
		drawChartYxy,
		drawChartMunsell,
		drawChartPCCS,
		drawChartTone,
	];
	const idx = parseInt(sel.value, 10);
	ctx.save();
	fns[idx](ctx, parseInt(sli.value) / 255);
	ctx.restore();
};

function drawChartRGB(ctx: CanvasRenderingContext2D, v: number): void {
	for (let y = 0; y < 256; y += 1) {
		for (let x = 0; x < 256; x += 1) {
			const rgb = [x, v * 255, y] as Triplet;
			setPixel(ctx, x, 255 - y, rgb);
		}
	}
}

function drawChartLRGB(ctx: CanvasRenderingContext2D, v: number): void {
	const c = new Color();

	for (let y = 0; y < 256; y += 1) {
		for (let x = 0; x < 256; x += 1) {
			c.set(ColorSpace.LRGB, [x / 255, v, y / 255]);

			const rgb = c.asRGB();
			setPixel(ctx, x, 255 - y, rgb);
		}
	}
}

function drawChartXYZ(ctx: CanvasRenderingContext2D, v: number): void {
	const c = new Color();

	for (let y = 0; y < 256; y += 1) {
		for (let x = 0; x < 256; x += 1) {
			c.set(ColorSpace.XYZ, [x / 255, v, y / 255]);

			const rgb = c.asRGB();
			if (!c.isRGBSaturated() || 0 === (x + y) % 7) {
				setPixel(ctx, x, 255 - y, rgb);
			}
		}
	}
}

function drawChartLab(ctx: CanvasRenderingContext2D, v: number): void {
	const c = new Color();

	for (let y = 0; y < 256; y += 1) {
		for (let x = 0; x < 256; x += 1) {
			c.set(ColorSpace.Lab, [v * 100, x - 128, y - 128]);

			const rgb = c.asRGB();
			if (!c.isRGBSaturated() || 0 === (x + y) % 7) {
				setPixel(ctx, x, 255 - y, rgb);
			}
		}
	}
}

function drawChartYxy(ctx: CanvasRenderingContext2D, v: number): void {
	const c = new Color();

	for (let y = 0; y < 256; y += 1) {
		for (let x = 0; x < 256; x += 1) {
			c.set(ColorSpace.Yxy, [v, x / 255, y / 255]);

			const rgb = c.asRGB();
			if (!c.isRGBSaturated() || 0 === (x + y) % 7) {
				setPixel(ctx, x, 255 - y, rgb);
			}
		}
	}
}

function drawChartMunsell(ctx: CanvasRenderingContext2D, v: number): void {
	const c = new Color();

	for (let y = 0; y < 256; y += 1) {
		for (let x = 0; x < 256; x += 1) {
			c.set(ColorSpace.Munsell, [x * 100 / 255, v * 10, y * 38 / 255]);

			const rgb = c.asRGB();
			if ((!c.isRGBSaturated() && !c.isMunsellSaturated()) || 0 === (x + y) % 7) {
				setPixel(ctx, x, 255 - y, rgb);
			}
		}
	}
}

function drawChartPCCS(ctx: CanvasRenderingContext2D, v: number): void {
	const c = new Color();

	for (let y = 0; y < 256; y += 1) {
		for (let x = 0; x < 256; x += 1) {
			c.set(ColorSpace.PCCS, [x * 24 / 255, v * 10, y * 10 / 255]);

			const rgb = c.asRGB();
			if ((!c.isRGBSaturated() && !c.isMunsellSaturated()) || 0 === (x + y) % 7) {
				setPixel(ctx, x, 255 - y, rgb);
			}
		}
	}
}

function drawChartTone(ctx: CanvasRenderingContext2D, v: number): void {
	const c = new Color();

	for (let y = 0; y < 256; y += 1) {
		for (let x = 0; x < 256; x += 1) {
			c.set(ColorSpace.Tone, [v * 24, y * 10 / 256, x * 10 / 256]);

			const rgb = c.asRGB();
			if ((!c.isRGBSaturated() && !c.isMunsellSaturated()) || 0 === (x + y) % 7) {
				setPixel(ctx, x, 255 - y, rgb);
			}
		}
	}
}

function setPixel(ctx: CanvasRenderingContext2D, x: number, y: number, [r = 0, g = 0, b = 0]: Triplet) {
	ctx.strokeStyle = `rgb(${r},${g},${b}`;
	ctx.beginPath();
	ctx.rect(x, y, 1, 1);
	ctx.stroke();
}
