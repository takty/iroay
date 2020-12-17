// @need lib/croqujs
// @need lib/style lib/path
// @need lib/calc
// @need lib/widget
// @need lib/ruler
// @need ../dist/color
// @need ../dist/vision

const setup = function () {
	const sl = new WIDGET.Slider(0, 255, 0);
	const p = new CROQUJS.Paper(256, 256);
	STYLE.augment(p);

	draw(p, sl);
	sl.onChanged(() => {
		draw(p, sl);
	});
};

const draw = function (p, sl) {
	const v = sl.value() / 255;
	p.styleClear().color(v < 0.5 ? 'White' : 'Black').draw();
// 	drawChartRGB(p, v);
// 	drawChartLRGB(p, v);
// 	drawChartXYZ(p, v);
	drawChartLab(p, v);
// 	drawChartYxy(p, v);
// 	drawChartMunsell(p, v);
// 	drawChartPCCS(p, v);
};

const drawChartRGB = function (p, value) {
	const g = value * 255;
	for (let y = 0; y < 256; y += 1) {
		for (let x = 0; x < 256; x += 1) {
			p.setPixel(x, 255 - y, [x, g, y]);
		}
	}
};

const drawChartLRGB = function (p, value) {
	for (let y = 0; y < 256; y += 1) {
		const ry = y / 255;
		for (let x = 0; x < 256; x += 1) {
			const rx = x / 255;
			const c = COLOR.convert([rx, value, ry], 'lrgb');
			p.setPixel(x, 255 - y, c);
		}
	}
};

const drawChartXYZ = function (p, value) {
	for (let y = 0; y < 256; y += 1) {
		const ry = y / 255;
		for (let x = 0; x < 256; x += 1) {
			const rx = x / 255;
			const c = COLOR.convert([rx, value, ry], 'xyz');
			if (COLOR.RGB.isSaturated) continue;
			p.setPixel(x, 255 - y, c);
		}
	}
};

const drawChartLab = function (p, value) {
	const L = value * 100;
	for (let y = 0; y < 256; y += 1) {
		for (let x = 0; x < 256; x += 1) {
			const c = COLOR.convert([L, x - 128, y - 128], 'lab');
			if (COLOR.RGB.isSaturated) continue;
			p.setPixel(x, 255 - y, c);
		}
	}
};

const drawChartYxy = function (p, value) {
	for (let y = 0; y < 256; y += 1) {
		const ry = y / 255;
		for (let x = 0; x < 256; x += 1) {
			const rx = x / 255;
			const c = COLOR.convert([value, rx, ry], 'yxy');
			if (COLOR.RGB.isSaturated) continue;
			p.setPixel(x, 255 - y, c);
		}
	}
};

const drawChartMunsell = function (p, value) {
	const V = value * 10;
	for (let y = 0; y < 256; y += 1) {
		const C = y * 38 / 255;
		for (let x = 0; x < 256; x += 1) {
			const H = x * 100 / 255;
			const c = COLOR.convert([H, V, C], 'munsell');
			if (COLOR.Munsell.isSaturated || COLOR.RGB.isSaturated) continue;
			p.setPixel(x, 255 - y, c);
		}
	}
};

const drawChartPCCS = function (p, value) {
	const l = value * 10;
	for (let y = 0; y < 256; y += 1) {
		const s = y * 10 / 255;
		for (let x = 0; x < 256; x += 1) {
			const h = x * 24 / 255;
			const c = COLOR.convert([h, l, s], 'pccs');
			if (COLOR.Munsell.isSaturated || COLOR.RGB.isSaturated) continue;
			p.setPixel(x, 255 - y, c);
		}
	}
};
