/**
 *
 * This class performs various simulations of color space.
 *
 * @author Takuto Yanagida
 * @version 2019-09-29
 *
 */


class AgeSimulation {

	/*
	 * Color vision age-related change simulation (conversion other than lightness)
	 * Reference: Katsunori Okajima, Human Color Vision Mechanism and its Age-Related Change,
	 * IEICE technical report 109(249), 43-48, 2009-10-15.
	 */

	static _hueDiff(a, b) {
		const p = (b > 0) ? Math.atan2(b, a) : (Math.atan2(-b, -a) + Math.PI);
		return 4.5 * Math.cos(2.0 * Math.PI * (p - 28.8) / 50.9) + 4.4;
	}

	static _chromaRatio(a, b) {
		const c = Math.sqrt(a * a + b * b);
		return 0.83 * Math.exp(-c / 13.3) - (1.0 / 8.0) * Math.exp(-(c - 50) * (c - 50) / (3000 * 3000)) + 1;
	}

	/**
	 * Convert CIELAB (L*a*b*) to CIELAB in the color vision of elderly people (70 years old) (conversion other than lightness).
	 * @param src CIELAB color (young person)
	 * @return CIELAB color in color vision of elderly people
	 */
	static labToElderlyAB(src) {
		const h = ((src[2] > 0) ? Math.atan2(src[2], src[1]) : (Math.atan2(-src[2], -src[1]) + Math.PI)) + AgeSimulation._hueDiff(src[1], src[2]);
		const c = Math.sqrt(src[1] * src[1] + src[2] * src[2]) * AgeSimulation._chromaRatio(src[1], src[2]);
		return [
			src[0],
			Math.cos(h) * c,
			Math.sin(h) * c,
		];
	}

	/**
	 * Convert CIELAB (L*a*b*) to CIELAB in the color vision of young people (20 years old) (conversion other than lightness).
	 * @param src CIELAB color (elderly person)
	 * @return CIELAB color in color vision of young people
	 */
	static labToYoungAB(src) {
		const h = ((src[2] > 0) ? Math.atan2(src[2], src[1]) : (Math.atan2(-src[2], -src[1]) + Math.PI)) - AgeSimulation._hueDiff(src[1], src[2]);
		const c = Math.sqrt(src[1] * src[1] + src[2] * src[2]) / AgeSimulation._chromaRatio(src[1], src[2]);
		return [
			src[0],
			Math.cos(h) * c,
			Math.sin(h) * c,
		];
	}

}
