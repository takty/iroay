/**
 * Color
 *
 * @author Takuto Yanagida
 * @version 2025-02-25
 */

import { Triplet } from './type';
import * as Category from './eval/category';
import * as Conspicuity from './eval/conspicuity';
import * as Difference from './eval/difference';
import * as ColorVision from './sim/color-vision';
import * as Util from './util';

import * as Rgb from './cs/rgb';
import * as Hsl from './cs/hsl';
import * as Yiq from './cs/yiq';
import * as Lrgb from './cs/lrgb';
import * as Xxy from './cs/xyy';
import * as Lab from './cs/lab';
import * as Lch from './cs/lch';
import * as Lms from './cs/lms';
import * as Munsell from './cs/munsell';
import * as Pccs from './cs/pccs';

export enum ColorSpace {
	Rgb,
	Hsl,
	Yiq,
	Lrgb,
	Xyz,
	Xyy,
	Lab,
	Lch,
	Lms,
	Munsell,
	Pccs,
	Tone,
}

export class Color {


	/**
	 * Creates a Color object based on the integer.
	 * @param i Integer.
	 * @returns A Color object.
	 */
	static fromInteger(i: number): Color {
		return new Color(ColorSpace.Rgb, Util.fromInteger(i | 0xff000000));
	}

	/**
	 * Parses a color string in various formats and returns a corresponding Color object.
	 *
	 * @param {string} str - The color string to parse.
	 * @returns {Color | null} A Color object if parsing is successful; otherwise, null.
	 */
	static fromString(str: string): Color | null {
		let cs: any = null;
		if (cs = Util.parseRgb(str)) return new Color(ColorSpace.Rgb, [cs[0], cs[1], cs[2]], cs[3]);
		if (cs = Util.parseHex(str)) return new Color(ColorSpace.Rgb, [cs[0], cs[1], cs[2]], cs[3]);
		if (cs = Util.parseHsl(str)) return new Color(ColorSpace.Hsl, [cs[0], cs[1], cs[2]], cs[3]);
		if (cs = Util.parseLab(str)) return new Color(ColorSpace.Lab, [cs[0], cs[1], cs[2]], cs[3]);
		if (cs = Util.parseLch(str)) return new Color(ColorSpace.Lch, [cs[0], cs[1], cs[2]], cs[3]);
		return null;
	}

	#ts: Map<ColorSpace, Triplet> = new Map();
	#us: Map<string, string | boolean | number> = new Map();
	#cs: ColorSpace | null = null;
	#al: number = 1;

	constructor(cs: ColorSpace | null = null, t: Triplet | null = null, al: number = 1) {
		if (cs !== null && t !== null) {  // Must check for null.
			this.#ts.set(cs, t);
			this.#cs = cs;
			this.#al = al;
		}
	}

	/**
	 * Returns a string representation of an object.
	 * @returns A string representation.
	 */
	toString(): string {
		if (null === this.#cs) {
			return 'empty';
		}
		const t = this.#ts.get(this.#cs) as Triplet;
		return `${ColorSpace[this.#cs]} [${t[0]}, ${t[1]}, ${t[2]}] (${this.#al})`;
	}

	/**
	 * Sets the color space and the triplet.
	 * @param {ColorSpace} cs - The color space.
	 * @param {Triplet} t - The triplet.
	 * @param {number} al - The alpha value.
	 */
	set(cs: ColorSpace, t: Triplet, al: number = 1): void {
		this.#ts.clear();
		this.#us.clear();

		this.#ts.set(cs, t);
		this.#cs = cs;
		this.#al = al;
	}

	alpha(al: number | null = null): number | void {
		if (null === al) return this.#al;
		this.#al = al;
	}

	as(cs: ColorSpace): Triplet {
		switch (cs) {
			case ColorSpace.Rgb    : return this.asRgb();
			case ColorSpace.Hsl    : return this.asHsl();
			case ColorSpace.Yiq    : return this.asYiq();
			case ColorSpace.Lrgb   : return this.asLrgb();
			case ColorSpace.Xyz    : return this.asXyz();
			case ColorSpace.Xyy    : return this.asXyy();
			case ColorSpace.Lab    : return this.asLab();
			case ColorSpace.Lch    : return this.asLch();
			case ColorSpace.Lms    : return this.asLms();
			case ColorSpace.Munsell: return this.asMunsell();
			case ColorSpace.Pccs   : return this.asPccs();
			case ColorSpace.Tone   : return this.asTone();
		}
	}


	// -------------------------------------------------------------------------


	asRgb(): Triplet {
		if (this.#ts.has(ColorSpace.Rgb)) {
			return this.#ts.get(ColorSpace.Rgb) as Triplet;
		}
		let t: Triplet;
		switch (this.#cs) {
			case ColorSpace.Hsl:
				t = Hsl.toRgb(this.asHsl());
				break;
			default:
				t = Rgb.fromLrgb(this.asLrgb());
				break;
		}
		this.#ts.set(ColorSpace.Rgb, t);
		this.#us.set('rgb_saturation', Rgb.isSaturated);
		return t;
	}

	asHsl(): Triplet {
		if (this.#ts.has(ColorSpace.Hsl)) {
			return this.#ts.get(ColorSpace.Hsl) as Triplet;
		}
		const t: Triplet = Hsl.fromRgb(this.asRgb());
		this.#ts.set(ColorSpace.Hsl, t);
		return t;
	}

	asYiq(): Triplet {
		if (this.#ts.has(ColorSpace.Yiq)) {
			return this.#ts.get(ColorSpace.Yiq) as Triplet;
		}
		const t: Triplet = Yiq.fromLrgb(this.asLrgb());
		this.#ts.set(ColorSpace.Yiq, t);
		return t;
	}

	asLrgb(): Triplet {
		if (this.#ts.has(ColorSpace.Lrgb)) {
			return this.#ts.get(ColorSpace.Lrgb) as Triplet;
		}
		let t: Triplet;
		switch (this.#cs) {
			case ColorSpace.Rgb:
			case ColorSpace.Hsl:
				t = Rgb.toLrgb(this.asRgb());
				break;
			case ColorSpace.Yiq:
				t = Yiq.toLrgb(this.asYiq());
				break;
			default:
				t = Lrgb.fromXyz(this.asXyz());
				break;
		}
		this.#ts.set(ColorSpace.Lrgb, t);
		return t;
	}

	asXyz(): Triplet {
		if (this.#ts.has(ColorSpace.Xyz)) {
			return this.#ts.get(ColorSpace.Xyz) as Triplet;
		}
		let t: Triplet = [0, 0, 0];
		switch (this.#cs) {
			case ColorSpace.Rgb:
			case ColorSpace.Hsl:
			case ColorSpace.Yiq:
			case ColorSpace.Lrgb:
				t = Lrgb.toXyz(this.asLrgb());
				break;
			case ColorSpace.Lch:
			case ColorSpace.Lab:
				t = Lab.toXyz(this.asLab());
				break;
			case ColorSpace.Xyy:
				t = Xxy.toXyz(this.asXyy());
				this.#us.set('xyy_saturation', Xxy.isSaturated);
				break;
			case ColorSpace.Lms:
				t = Lms.toXyz(this.asLms());
				break;
			case ColorSpace.Munsell:
			case ColorSpace.Pccs:
			case ColorSpace.Tone:
				t = Munsell.toXyz(this.asMunsell());
				this.#us.set('munsell_saturation', Munsell.isSaturated);
				break;
		}
		this.#ts.set(ColorSpace.Xyz, t);
		return t;
	}

	asXyy(): Triplet {
		if (this.#ts.has(ColorSpace.Xyy)) {
			return this.#ts.get(ColorSpace.Xyy) as Triplet;
		}
		const t: Triplet = Xxy.fromXyz(this.asXyz());
		this.#ts.set(ColorSpace.Xyy, t);
		return t;
	}

	asLab(): Triplet {
		if (this.#ts.has(ColorSpace.Lab)) {
			return this.#ts.get(ColorSpace.Lab) as Triplet;
		}
		let t: Triplet;
		switch (this.#cs) {
			case ColorSpace.Lch:
				t = Lch.toLab(this.asLch());
				break;
			default:
				t = Lab.fromXyz(this.asXyz());
				break;
		}
		this.#ts.set(ColorSpace.Lab, t);
		return t;
	}

	asLch(): Triplet {
		if (this.#ts.has(ColorSpace.Lch)) {
			return this.#ts.get(ColorSpace.Lch) as Triplet;
		}
		const t: Triplet = Lch.fromLab(this.asLab());
		this.#ts.set(ColorSpace.Lch, t);
		return t;
	}

	asLms(): Triplet {
		if (this.#ts.has(ColorSpace.Lms)) {
			return this.#ts.get(ColorSpace.Lms) as Triplet;
		}
		const t: Triplet = Lms.fromXyz(this.asXyz());
		this.#ts.set(ColorSpace.Lms, t);
		return t;
	}

	asMunsell(): Triplet {
		if (this.#ts.has(ColorSpace.Munsell)) {
			return this.#ts.get(ColorSpace.Munsell) as Triplet;
		}
		let t: Triplet;
		switch (this.#cs) {
			case ColorSpace.Pccs:
			case ColorSpace.Tone:
				t = Pccs.toMunsell(this.asPccs());
				break;
			default:
				t = Munsell.fromXyz(this.asXyz());
				this.#us.set('munsell_saturation', Munsell.isSaturated);
				break;
		}
		this.#ts.set(ColorSpace.Munsell, t);
		return t;
	}

	asPccs(): Triplet {
		if (this.#ts.has(ColorSpace.Pccs)) {
			return this.#ts.get(ColorSpace.Pccs) as Triplet;
		}
		let t: Triplet;
		switch (this.#cs) {
			case ColorSpace.Tone:
				t = Pccs.toNormalCoordinate(this.asTone());
				break;
			default:
				t = Pccs.fromMunsell(this.asMunsell());
				break;
		}
		this.#ts.set(ColorSpace.Pccs, t);
		return t;
	}

	asTone(): Triplet {
		if (this.#ts.has(ColorSpace.Tone)) {
			return this.#ts.get(ColorSpace.Tone) as Triplet;
		}
		const t: Triplet = Pccs.toToneCoordinate(this.asPccs());
		this.#ts.set(ColorSpace.Tone, t);
		return t;
	}


	// -------------------------------------------------------------------------


	isRGBSaturated(forceToCheck: boolean = false): boolean {
		if (forceToCheck && !this.#us.has('rgb_saturation')) {
			this.asRgb();
		}
		return (this.#us.get('rgb_saturation') ?? false) as boolean;
	}

	isXyySaturated(): boolean {
		return (this.#us.get('xyy_saturation') ?? false) as boolean;
	}

	isMunsellSaturated(): boolean {
		return (this.#us.get('munsell_saturation') ?? false) as boolean;
	}


	// -------------------------------------------------------------------------


	asMunsellNotation(): string {
		if (this.#us.has('munsell_notation')) {
			return this.#us.get('munsell_notation') as string;
		}
		const s: string = Munsell.toString(this.asMunsell());
		this.#us.set('munsell_notation', s);
		return s;
	}

	asPCCSNotation(): string {
		if (this.#us.has('pccs_notation')) {
			return this.#us.get('pccs_notation') as string;
		}
		const s: string = Pccs.toString(this.asPccs());
		this.#us.set('pccs_notation', s);
		return s;
	}


	// -------------------------------------------------------------------------


	asInteger(): number {
		if (this.#us.has('integer')) {
			return this.#us.get('integer') as number;
		}
		const i: number = Util.toInteger(this.asRgb());
		this.#us.set('integer', i);
		return i;
	}

	asConspicuity(): number {
		if (this.#us.has('conspicuity')) {
			return this.#us.get('conspicuity') as number;
		}
		const s: number = Conspicuity.conspicuityOfLab(this.asLab());
		this.#us.set('conspicuity', s);
		return s;
	}

	asCategory(): string {
		if (this.#us.has('category')) {
			return this.#us.get('category') as string;
		}
		const n: string = Category.categoryOfXyy(this.asXyy());
		this.#us.set('category', n);
		return n;
	}

	differenceFrom(c: Color, method: 'sqrt' | 'cie76' | 'ciede2000' = 'ciede2000'): number {
		switch (method) {
			case 'sqrt':
				return Difference.distance(this.asLab(), c.asLab());
			case 'cie76':
				return Difference.CIE76(this.asLab(), c.asLab());
			case 'ciede2000':
			default:
				return Difference.CIEDE2000(this.asLab(), c.asLab());
		}
	}


	// -------------------------------------------------------------------------


	/**
	 * Converts the color to grayscale.
	 * @returns {Color} A new Color object.
	 */
	toMonochrome(): Color {
		return new Color(ColorSpace.Lab, [this.asLab()[0], 0, 0]);
	}


	// -------------------------------------------------------------------------


	/**
	 * Converts the color to protanopia.
	 * @param {string} method - The method to use for the conversion. 'lms' or 'lrgb'.
	 * @param {boolean} doCorrection - Whether to apply the Okajima correction.
	 * @returns {Color} A new Color object.
	 */
	toProtanopia(method: 'lms' | 'lrgb' = 'lrgb', doCorrection: boolean = false): Color {
		ColorVision.setOkajimaCorrectionOption(doCorrection);
		switch (method) {
			case 'lms':
				const lms0: Triplet = ColorVision.lmsToProtanopia(this.asLms());
				return new Color(ColorSpace.Lms, lms0);
			case 'lrgb':
			default:
				const lms1: Triplet = ColorVision.lrgbToProtanopia(this.asLrgb());
				return new Color(ColorSpace.Lms, lms1);
		}
	}

	/**
	 * Converts the color to deuteranopia.
	 * @param {string} method - The method to use for the conversion. 'lms' or 'lrgb'.
	 * @param {boolean} doCorrection - Whether to apply the Okajima correction.
	 * @returns {Color} A new Color object.
	 */
	toDeuteranopia(method: 'lms' | 'lrgb' = 'lrgb', doCorrection: boolean = false): Color {
		ColorVision.setOkajimaCorrectionOption(doCorrection);
		switch (method) {
			case 'lms':
				const lms0: Triplet = ColorVision.lmsToDeuteranopia(this.asLms());
				return new Color(ColorSpace.Lms, lms0);
			case 'lrgb':
			default:
				const lms1: Triplet = ColorVision.lrgbToDeuteranopia(this.asLrgb());
				return new Color(ColorSpace.Lms, lms1);
		}
	}
}
