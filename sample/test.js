// @need ../dist/color-space.min
// @need ../dist/color-util.min

const orig = [255, 127, 127];
let cs, ics;

function round(vs) {
	vs[0] = Math.round(vs[0] * 1000) / 1000;
	vs[1] = Math.round(vs[1] * 1000) / 1000;
	vs[2] = Math.round(vs[2] * 1000) / 1000;
	return vs;
}

console.log('--------------------------------');

console.log('XYZ');
cs = convert(orig, 'RGB', 'XYZ');
ics = convert(cs, 'XYZ', 'RGB');
console.log(round(cs));
console.log(ics);

console.log('--------------------------------');

console.log('Lab');
cs = convert(orig, 'RGB', 'Lab');
ics = convert(cs, 'Lab', 'RGB');
console.log(round(cs));
console.log(ics);

console.log('--------------------------------');

console.log('LMS');
cs = convert(orig, 'RGB', 'LMS');
ics = convert(cs, 'LMS', 'RGB');
console.log(round(cs));
console.log(ics);

console.log('--------------------------------');

console.log('Yxy');
cs = convert(orig, 'RGB', 'Yxy');
ics = convert(cs, 'Yxy', 'RGB');
console.log(round(cs));
console.log(ics);
console.log(CategoricalColor.categoryOfYxy(...cs));

console.log('--------------------------------');

console.log('Munsell');
cs = convert(orig, 'RGB', 'Munsell');
ics = convert(cs, 'Munsell', 'RGB');
console.log(round(cs));
console.log(ics);
console.log(Munsell.toString(cs));

console.log('--------------------------------');

console.log('PCCS');
cs = convert(orig, 'RGB', 'PCCS');
ics = convert(cs, 'PCCS', 'RGB');
console.log(round(cs));
console.log(ics);
console.log(PCCS.toString(...cs));
