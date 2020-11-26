/**
 *
 * This class performs various simulations of color space.
 *
 * @author Takuto Yanagida
 * @version 2020-11-27
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
		return 4.5 * Math.cos(2 * Math.PI * (p - 28.8) / 50.9) + 4.4;
	}

	static _chromaRatio(a, b) {
		const c = Math.sqrt(a * a + b * b);
		return 0.83 * Math.exp(-c / 13.3) - (1 / 8) * Math.exp(-(c - 50) * (c - 50) / (3000 * 3000)) + 1;
	}

	/**
	 * Convert CIELAB (L*a*b*) to CIELAB in the color vision of elderly people (70 years old) (conversion other than lightness).
	 * @param ls L* of CIELAB color (young person)
	 * @param as a* of CIELAB color (young person)
	 * @param bs b* of CIELAB color (young person)
	 * @return CIELAB color in color vision of elderly people
	 */
	static labToElderlyAB(ls, as, bs) {
		const h = ((bs > 0) ? Math.atan2(bs, as) : (Math.atan2(-bs, -as) + Math.PI)) + AgeSimulation._hueDiff(as, bs);
		const c = Math.sqrt(as * as + bs * bs) * AgeSimulation._chromaRatio(as, bs);
		return [
			ls,
			Math.cos(h) * c,
			Math.sin(h) * c,
		];
	}

	/**
	 * Convert CIELAB (L*a*b*) to CIELAB in the color vision of young people (20 years old) (conversion other than lightness).
	 * @param ls L* of CIELAB color (elderly person)
	 * @param as a* of CIELAB color (elderly person)
	 * @param bs b* of CIELAB color (elderly person)
	 * @return CIELAB color in color vision of young people
	 */
	static labToYoungAB(ls, as, bs) {
		const h = ((bs > 0) ? Math.atan2(bs, as) : (Math.atan2(-bs, -as) + Math.PI)) - AgeSimulation._hueDiff(as, bs);
		const c = Math.sqrt(as * as + bs * bs) / AgeSimulation._chromaRatio(as, bs);
		return [
			ls,
			Math.cos(h) * c,
			Math.sin(h) * c,
		];
	}

}