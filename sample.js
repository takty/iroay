// @need dist/color-space.min
// @need dist/color-eval.min
// @need dist/color-sim.min

const orig = [255, 127, 127];
let cs, ics;

cs = XYZ.fromLRGB(...LRGB.fromRGB(...orig));
console.log('XYZ', cs);
ics = RGB.fromLRGB(...LRGB.fromXYZ(...cs));
console.log(ics);

cs = Lab.fromXYZ(...XYZ.fromLRGB(...LRGB.fromRGB(...orig)));
console.log('Lab', cs);
ics = RGB.fromLRGB(...LRGB.fromXYZ(...XYZ.fromLab(...cs)));
console.log(ics);

cs = LMS.fromXYZ(...XYZ.fromLRGB(...LRGB.fromRGB(...orig)));
console.log('LMS', cs);
ics = RGB.fromLRGB(...LRGB.fromXYZ(...XYZ.fromLMS(...cs)));
console.log(ics);

cs = Yxy.fromXYZ(...XYZ.fromLRGB(...LRGB.fromRGB(...orig)));
console.log('Yxy', cs);
console.log(BasicCategoricalColor.categoryOfYxy(...cs));
ics = RGB.fromLRGB(...LRGB.fromXYZ(...XYZ.fromYxy(...cs)));
console.log(ics);

cs = Munsell.fromXYZ(...XYZ.fromLRGB(...LRGB.fromRGB(...orig)));
console.log('Munsell', cs);
console.log(Munsell.hueValueToHueName(cs[0], cs[2]));
ics = RGB.fromLRGB(...LRGB.fromXYZ(...Munsell.toXYZ(...cs)));
console.log(ics);

cs = PCCS.fromMunsell(...cs);
console.log('PCCS', cs);
ics = PCCS.toMunsell(...cs);
console.log(ics);
