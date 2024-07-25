/**
 * Script for Sample
 *
 * @author Takuto Yanagida
 * @version 2024-07-25
 */

import 'klales/klales.min.css';
import { Triplet, convert, isRGBSaturated, isMunsellSaturated } from '../colorjst.ts';

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
	];
	const idx = parseInt(sel.value, 10);
	ctx.save();
	fns[idx](ctx, parseInt(sli.value) / 255);
	ctx.restore();
};

function drawChartRGB(ctx: CanvasRenderingContext2D, v: number): void {
	const g = v * 255;
	for (let y = 0; y < 256; y += 1) {
		for (let x = 0; x < 256; x += 1) {
			setPixel(ctx, x, 255 - y, [x, g, y]);
		}
	}
}

function drawChartLRGB(ctx: CanvasRenderingContext2D, v: number): void {
	for (let y = 0; y < 256; y += 1) {
		const ry = y / 255;
		for (let x = 0; x < 256; x += 1) {
			const rx = x / 255;
			const c = convert([rx, v, ry], 'lrgb');
			setPixel(ctx, x, 255 - y, c);
		}
	}
}

function drawChartXYZ(ctx: CanvasRenderingContext2D, v: number): void {
	for (let y = 0; y < 256; y += 1) {
		const ry = y / 255;
		for (let x = 0; x < 256; x += 1) {
			const rx = x / 255;
			const c = convert([rx, v, ry], 'xyz');
			if (isRGBSaturated() && 0 !== (x + y) % 7) continue;
			setPixel(ctx, x, 255 - y, c);
		}
	}
}

function drawChartLab(ctx: CanvasRenderingContext2D, v: number): void {
	const L = v * 100;
	for (let y = 0; y < 256; y += 1) {
		for (let x = 0; x < 256; x += 1) {
			const c = convert([L, x - 128, y - 128], 'lab');
			if (isRGBSaturated() && 0 !== (x + y) % 7) {
				continue;
			}
			setPixel(ctx, x, 255 - y, c);
		}
	}
}

function drawChartYxy(ctx: CanvasRenderingContext2D, v: number): void {
	for (let y = 0; y < 256; y += 1) {
		const ry = y / 255;
		for (let x = 0; x < 256; x += 1) {
			const rx = x / 255;
			const c = convert([v, rx, ry], 'yxy');
			if (isRGBSaturated() && 0 !== (x + y) % 7) continue;
			setPixel(ctx, x, 255 - y, c);
		}
	}
}

function drawChartMunsell(ctx: CanvasRenderingContext2D, v: number): void {
	const V = v * 10;
	for (let y = 0; y < 256; y += 1) {
		const C = y * 38 / 255;
		for (let x = 0; x < 256; x += 1) {
			const H = x * 100 / 255;
			const c = convert([H, V, C], 'munsell');
			if ((isMunsellSaturated() || isRGBSaturated()) && 0 !== (x + y) % 7) continue;
			setPixel(ctx, x, 255 - y, c);
		}
	}
}

function drawChartPCCS(ctx: CanvasRenderingContext2D, v: number): void {
	const l = v * 10;
	for (let y = 0; y < 256; y += 1) {
		const s = y * 10 / 255;
		for (let x = 0; x < 256; x += 1) {
			const h = x * 24 / 255;
			const c = convert([h, l, s], 'pccs');
			if ((isMunsellSaturated() || isRGBSaturated()) && 0 !== (x + y) % 7) continue;
			setPixel(ctx, x, 255 - y, c);
		}
	}
}

function setPixel(ctx: CanvasRenderingContext2D, x: number, y: number, [r = 0, g = 0, b = 0]: Triplet) {
	ctx.strokeStyle = `rgb(${r},${g},${b}`;
	ctx.beginPath();
	ctx.rect(x, y, 1, 1);
	ctx.stroke();
}
