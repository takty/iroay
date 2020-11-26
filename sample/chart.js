// @need lib/croqujs
// @need lib/style lib/path
// @need lib/calc
// @need lib/widget
// @need lib/ruler
// @need ../dist/color-util.min
// @need ../dist/color-space.min

const setup = function () {
	const sl = new WIDGET.Slider(0, 100, 0);
	const p = new CROQUJS.Paper(256, 256);
	STYLE.augment(p);

	draw(p, sl);
	sl.onChanged(() => {
		draw(p, sl);
	});
};

const draw = function (p, sl) {
	p.styleClear().color('White').draw();
	const value = sl.value();
// 	drawChartRGB(p, value / 100);
	drawChartMunsell(p, value / 100);
};

const drawChartRGB = function (p, value) {
	const ruler = p.getRuler();
	for (let y = 0; y < 256; y += 1) {
		for (let x = 0; x < 256; x += 1) {
			ruler.stroke().rgb(x, value * 255, y);
			ruler.dot(x, y).draw('stroke');
		}
	}
};

const drawChartMunsell = function (p, value) {
	const ruler = p.getRuler();
	for (let c = 0; c < 256; c += 1) {
		for (let h = 0; h < 256; h += 1) {
			const ics = RGB.fromLRGB(...LRGB.fromXYZ(...Munsell.toXYZ(h * 100 / 256, value * 10, c * 50 / 256)));
			ruler.stroke().rgb(...ics);
			ruler.dot(h, c).draw('stroke');
		}
	}
};
