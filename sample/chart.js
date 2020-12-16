// @need lib/croqujs
// @need lib/style lib/path
// @need lib/calc
// @need lib/widget
// @need lib/ruler
// @need ../dist/color-space.min
// @need ../dist/color-util.min

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
	const ruler = p.getRuler();
	for (let y = 0; y < 256; y += 1) {
		for (let x = 0; x < 256; x += 1) {
			ruler.stroke().rgb(x, g, y);
			ruler.dot(x, 255 - y).draw('stroke');
		}
	}
};

const drawChartLRGB = function (p, value) {
	const ruler = p.getRuler();
	for (let y = 0; y < 256; y += 1) {
		const ry = y / 255;
		for (let x = 0; x < 256; x += 1) {
			const rx = x / 255;
			const c = RGB.fromLRGB([rx, value, ry]);
			ruler.stroke().rgb(...c);
			ruler.dot(x, 255 - y).draw('stroke');
		}
	}
};

const drawChartXYZ = function (p, value) {
	const ruler = p.getRuler();
	for (let y = 0; y < 256; y += 1) {
		const ry = y / 255;
		for (let x = 0; x < 256; x += 1) {
			const rx = x / 255;
			const c = RGB.fromLRGB(LRGB.fromXYZ([rx, value, ry]));
			if (RGB.isSaturated) continue;
			ruler.stroke().rgb(...c);
			ruler.dot(x, 255 - y).draw('stroke');
		}
	}
};

const drawChartLab = function (p, value) {
	const L = value * 100;
	const ruler = p.getRuler();
	for (let y = 0; y < 256; y += 1) {
		for (let x = 0; x < 256; x += 1) {
			const c = RGB.fromLRGB(LRGB.fromXYZ(XYZ.fromLab([L, x - 128, y - 128])));
			if (RGB.isSaturated) continue;
			ruler.stroke().rgb(...c);
			ruler.dot(x, 255 - y).draw('stroke');
		}
	}
};

const drawChartYxy = function (p, value) {
	const ruler = p.getRuler();
	for (let y = 0; y < 256; y += 1) {
		const ry = y / 255;
		for (let x = 0; x < 256; x += 1) {
			const rx = x / 255;
			const c = RGB.fromLRGB(LRGB.fromXYZ(XYZ.fromYxy([value, rx, ry])));
			if (RGB.isSaturated) continue;
			ruler.stroke().rgb(...c);
			ruler.dot(x, 255 - y).draw('stroke');
		}
	}
};

const drawChartMunsell = function (p, value) {
	const V = value * 10;
	const ruler = p.getRuler();
	for (let y = 0; y < 256; y += 1) {
		const C = y * 38 / 255;
		for (let x = 0; x < 256; x += 1) {
			const H = x * 100 / 255;
			const c = RGB.fromLRGB(LRGB.fromXYZ(XYZ.fromMunsell([H, V, C])));
			if (Munsell.isSaturated || RGB.isSaturated) continue;
			ruler.stroke().rgb(...c);
			ruler.dot(x, 255 - y).draw('stroke');
		}
	}
};

const drawChartPCCS = function (p, value) {
	const l = value * 10;
	const ruler = p.getRuler();
	for (let y = 0; y < 256; y += 1) {
		const s = y * 10 / 255;
		for (let x = 0; x < 256; x += 1) {
			const h = x * 24 / 255;
			const c = RGB.fromLRGB(LRGB.fromXYZ(XYZ.fromMunsell(Munsell.fromPCCS([h, l, s]))));
			if (Munsell.isSaturated || RGB.isSaturated) continue;
			ruler.stroke().rgb(...c);
			ruler.dot(x, 255 - y).draw('stroke');
		}
	}
};
