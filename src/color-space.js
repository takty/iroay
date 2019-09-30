/**
 *
 * This class represents the color system.
 * @author Takuto Yanagida
 * @version 2019-09-29
 *
 */


class ColorSpace {

	static checkRange(vs, min, max) {
		let isSaturated = false;
		if (vs[0] > max) { vs[0] = max; isSaturated = true; }
		if (vs[0] < min) { vs[0] = min; isSaturated = true; }
		if (vs[1] > max) { vs[1] = max; isSaturated = true; }
		if (vs[1] < min) { vs[1] = min; isSaturated = true; }
		if (vs[2] > max) { vs[2] = max; isSaturated = true; }
		if (vs[2] < min) { vs[2] = min; isSaturated = true; }
		return isSaturated;
	}

}

ColorSpace.Type = Object.freeze({
	RGB : 0,
	LRGB: 1,
	LAB : 2,
	XYZ : 3,
	YXY : 4,
	LMS : 5,
	YIQ : 6,
});
