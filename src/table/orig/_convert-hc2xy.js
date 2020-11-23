/**
 *
 * Converter of original hc2xy data for minimizing
 *
 * @author Takuto Yanagida
 * @version 2020-11-23
 *
 */


function convert() {
	const min = [];
	for (let vi = 0; vi < Munsell._TBL_V.length; vi += 1) {
		const src = Munsell._TBL_SRC[vi];
		const vs = [];
		for (let cs of src) {
			const h10 = 0 | (Munsell.hueNameToHueValue(cs[0]) * 10);
			const c0 = h10 / 25;
			const c1 = cs[1] / 2;
			const c2 = 0 | Math.round(cs[2] * 1000);
			const c3 = 0 | Math.round(cs[3] * 1000);
			const v = c0 + ',' + c1 + ',' + c2 + ',' + c3;
			vs.push(v);
		}
		min.push('[\n' + vs.join(',') + '\n]');
	}
	console.log(min.join(',\n'));
}
