/**
 *
 * Converter of original hc2xy data for minimizing
 *
 * @author Takuto Yanagida
 * @version 2020-11-25
 *
 */


const HUE_NAMES = ['R', 'YR', 'Y', 'GY', 'G', 'BG', 'B', 'PB', 'P', 'RP'];  // 1R = 1, 9RP = 99, 10RP = 0
const MAX_HUE = 100.0;

Munsell = {};
Munsell._TBL_V = [0.2, 0.4, 0.6, 0.8, 1.0, 2.0, 3.0, 4.0, 5.0, 6.0, 7.0, 8.0, 9.0, 10.0];
Munsell._TBL_SRC = new Array(Munsell._TBL_V.length);

require('./src/table/orig/_hc2xy-002.js');
require('./src/table/orig/_hc2xy-004.js');
require('./src/table/orig/_hc2xy-006.js');
require('./src/table/orig/_hc2xy-008.js');
require('./src/table/orig/_hc2xy-010.js');
require('./src/table/orig/_hc2xy-020.js');
require('./src/table/orig/_hc2xy-030.js');
require('./src/table/orig/_hc2xy-040.js');
require('./src/table/orig/_hc2xy-050.js');
require('./src/table/orig/_hc2xy-060.js');
require('./src/table/orig/_hc2xy-070.js');
require('./src/table/orig/_hc2xy-080.js');
require('./src/table/orig/_hc2xy-090.js');
require('./src/table/orig/_hc2xy-100.js');


convert();

function convert() {
	const vs_v = [];
	for (let vi = 0; vi < Munsell._TBL_V.length; vi += 1) {
		const src = Munsell._TBL_SRC[vi];
		const vs = {};
		for (let cs of src) {
			const h10 = 0 | (hueNameToHueValue(cs[0]) * 10);
			const c0 = h10 / 25;
			const c1 = cs[1] / 2;
			const c2 = 0 | Math.round(cs[2] * 1000);
			const c3 = 0 | Math.round(cs[3] * 1000);

			if (!vs[c0]) vs[c0] = [];
			vs[c0].push(c2 + ',' + c3);
			if (vs[c0].length !== c1) throw new Error();
		}
		const vs_c = [];
		for (let [c0, vss] of Object.entries(vs)) {
			vs_c.push('\t\t' + c0 + ': [' + vss.join(',') + ']');
		}
		vs_v.push('\t{\n' + vs_c.join(',\n') + '\n\t}');
	}
	console.log('Munsell._TBL_SRC_MIN = [\n' + vs_v.join(',\n') + '\n];');
}

function hueNameToHueValue(hueName) {
	if (hueName.length == 1) return -1.0;  // In case of achromatic color N

	function isDigit(s) { return Number.isInteger(parseInt(s)); }
	const slen = isDigit(hueName.charAt(hueName.length - 2)) ? 1 : 2;  // Length of color name
	const n = hueName.substring(hueName.length - slen);

	let hv = parseFloat(hueName.substring(0, hueName.length - slen));
	hv += HUE_NAMES.indexOf(n) * 10;
	if (MAX_HUE <= hv) hv -= MAX_HUE;
	return hv;
}
