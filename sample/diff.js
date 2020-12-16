// @need lib/croqujs
// @need lib/style lib/path
// @need lib/ruler
// @need ../dist/color-space.min
// @need ../dist/color-util.min

const pairs = [
	[[250, 100, 100], [250, 150, 50]],
	[[100, 250, 100], [150, 250, 50]],
];

const setup = function () {
	const p = new CROQUJS.Paper(256, 256);
	STYLE.augment(p);

	draw(p);

	for (const p of pairs) {
		console.log(Evaluation.distance(p[0], p[1]));
		const lab0 = convert(p[0], 'rgb', 'lab');
		const lab1 = convert(p[1], 'rgb', 'lab');
		console.log(Evaluation.CIE76(lab0, lab1));
		console.log(Evaluation.CIEDE2000(lab0, lab1));
	}
};

const draw = function (p) {
	const ruler = p.getRuler();
	for (let y = 0; y < 2; y += 1) {
		for (let x = 0; x < 2; x += 1) {
			ruler.fill().rgb(...pairs[y][x]);
			ruler.rect(x * 128, y * 128, 128, 128).draw('fill');
		}
	}
};
