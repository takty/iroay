/**
 *
 * Converter of original dat files
 *
 * @author Takuto Yanagida
 * @version 2020-11-26
 *
 */


const DAT_FILE_REAL = 'real.dat';
const DAT_FILE_ALL  = 'all.dat';
const V_IDX_REAL = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];
const V_IDX_ALL  = ['0.2', '0.4', '0.6', '0.8', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];

const DAT_FILE = DAT_FILE_REAL;
const V_IDX = V_IDX_REAL;

const fs = require('fs');

fs.readFile(DAT_FILE, 'utf-8', (err, data) => {
	if (err) throw err;
	const vss = splitLines(data);
	output(vss);
});

function splitLines(data) {
	const lines = data.split('\n');
	lines.shift();
	const vss = [];
	for (const l of lines) {
		const lt = l.trim();
		if (lt.length === 0) continue;
		const vs = lt.split(/\s+/);
		vss.push(vs);
	}
	return vss;
}

function output(vss) {
	let lastV = '';
	const tbl_v = [];

	for (const vs of vss) {
		if (lastV !== vs[1]) {
			tbl_v.push([]);
			lastV = vs[1];
		}
		tbl_v[V_IDX.indexOf(vs[1])].push(`\t['${vs[0]}',${vs[2]},${vs[3]},${vs[4]}]`);
	}
	for (let i = 0; i < tbl_v.length; i += 1) {
		console.log(`Munsell._TBL_SRC[${i}] = [`);
		console.log(tbl_v[i].join(',\n'));
		console.log(`];`);
	}
}
