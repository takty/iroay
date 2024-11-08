/**
 * Color
 *
 * @author Takuto Yanagida
 * @version 2024-10-31
 */

import { Triplet } from './type';
import * as Category from './eval/category';
import * as Conspicuity from './eval/conspicuity';
import * as Difference from './eval/difference';
import * as ColorVisionSimulation from './sim/color-vision';

import { fromColorInteger, toColorInteger } from './util';

import * as Rgb from './cs/rgb';
import * as Yiq from './cs/yiq';
import * as Lrgb from './cs/lrgb';
import * as Xxy from './cs/xyy';
import * as Lab from './cs/lab';
import * as Lch from './cs/lch';
import * as Lms from './cs/lms';
import * as Munsell from './cs/munsell';
import * as Pccs from './cs/pccs';

export enum ColorSpace {
	RGB,
	YIQ,
	LRGB,
	XYZ,
	xyY,
	Lab,
	LCh,
	LMS,
	Munsell,
	PCCS,
	Tone,
}

export class Color {

	static fromInteger(i: number): Color {
		return new Color(ColorSpace.RGB, fromColorInteger(i | 0xff000000));
	}

	private ts: Map<ColorSpace, Triplet> = new Map();
	private us: Map<string, string | boolean | number> = new Map();
	private cs: ColorSpace | null = null;

	public constructor(cs: ColorSpace|null = null, t: Triplet|null = null) {
		if (cs !== null && t !== null) {  // Must check for null.
			this.ts.set(cs, t);
			this.cs = cs;
		}
	}

	public set(cs: ColorSpace, t: Triplet): void {
		this.ts.clear();
		this.us.clear();

		this.ts.set(cs, t);
		this.cs = cs;
	}

	public as(cs: ColorSpace): Triplet {
		switch (cs) {
			case ColorSpace.RGB    : return this.asRgb();
			case ColorSpace.YIQ    : return this.asYiq();
			case ColorSpace.LRGB   : return this.asLrgb();
			case ColorSpace.XYZ    : return this.asXyz();
			case ColorSpace.xyY    : return this.asXyy();
			case ColorSpace.Lab    : return this.asLab();
			case ColorSpace.LCh    : return this.asLch();
			case ColorSpace.LMS    : return this.asLms();
			case ColorSpace.Munsell: return this.asMunsell();
			case ColorSpace.PCCS   : return this.asPccs();
			case ColorSpace.Tone   : return this.asTone();
		}
	}


	// -------------------------------------------------------------------------


	public asRgb(): Triplet {
		if (this.ts.has(ColorSpace.RGB)) {
			return this.ts.get(ColorSpace.RGB) as Triplet;
		}
		const t: Triplet = Rgb.fromLrgb(this.asLrgb());
		this.ts.set(ColorSpace.RGB, t);
		this.us.set('rgb_saturation', Rgb.isSaturated);
		return t;
	}

	public asYiq(): Triplet {
		if (this.ts.has(ColorSpace.YIQ)) {
			return this.ts.get(ColorSpace.YIQ) as Triplet;
		}
		const t: Triplet = Yiq.fromLrgb(this.asLrgb());
		this.ts.set(ColorSpace.YIQ, t);
		return t;
	}

	public asLrgb(): Triplet {
		if (this.ts.has(ColorSpace.LRGB)) {
			return this.ts.get(ColorSpace.LRGB) as Triplet;
		}
		let t: Triplet;
		switch (this.cs) {
			case ColorSpace.RGB:
				t = Rgb.toLrgb(this.asRgb());
				break;
			case ColorSpace.YIQ:
				t = Yiq.toLrgb(this.asYiq());
				break;
			default:
				t = Lrgb.fromXyz(this.asXyz());
				break;
		}
		this.ts.set(ColorSpace.LRGB, t);
		return t;
	}

	public asXyz(): Triplet {
		if (this.ts.has(ColorSpace.XYZ)) {
			return this.ts.get(ColorSpace.XYZ) as Triplet;
		}
		let t: Triplet = [0, 0, 0];
		switch (this.cs) {
			case ColorSpace.RGB:
			case ColorSpace.YIQ:
			case ColorSpace.LRGB:
				t = Lrgb.toXyz(this.asLrgb());
				break;
			case ColorSpace.LCh:
			case ColorSpace.Lab:
				t = Lab.toXyz(this.asLab());
				break;
			case ColorSpace.xyY:
				t = Xxy.toXyz(this.asXyy());
				this.us.set('xyy_saturation', Xxy.isSaturated);
				break;
			case ColorSpace.LMS:
				t = Lms.toXyz(this.asLms());
				break;
			case ColorSpace.Munsell:
			case ColorSpace.PCCS:
			case ColorSpace.Tone:
				t = Munsell.toXyz(this.asMunsell());
				this.us.set('munsell_saturation', Munsell.isSaturated);
				break;
		}
		this.ts.set(ColorSpace.XYZ, t);
		return t;
	}

	public asXyy(): Triplet {
		if (this.ts.has(ColorSpace.xyY)) {
			return this.ts.get(ColorSpace.xyY) as Triplet;
		}
		const t: Triplet = Xxy.fromXyz(this.asXyz());
		this.ts.set(ColorSpace.xyY, t);
		return t;
	}

	public asLab(): Triplet {
		if (this.ts.has(ColorSpace.Lab)) {
			return this.ts.get(ColorSpace.Lab) as Triplet;
		}
		let t: Triplet;
		switch (this.cs) {
			case ColorSpace.LCh:
				t = Lch.toLab(this.asLch());
				break;
			default:
				t = Lab.fromXyz(this.asXyz());
				break;
		}
		this.ts.set(ColorSpace.Lab, t);
		return t;
	}

	public asLch(): Triplet {
		if (this.ts.has(ColorSpace.LCh)) {
			return this.ts.get(ColorSpace.LCh) as Triplet;
		}
		const t: Triplet = Lch.fromLab(this.asLab());
		this.ts.set(ColorSpace.LCh, t);
		return t;
	}

	public asLms(): Triplet {
		if (this.ts.has(ColorSpace.LMS)) {
			return this.ts.get(ColorSpace.LMS) as Triplet;
		}
		const t: Triplet = Lms.fromXyz(this.asXyz());
		this.ts.set(ColorSpace.LMS, t);
		return t;
	}

	public asMunsell(): Triplet {
		if (this.ts.has(ColorSpace.Munsell)) {
			return this.ts.get(ColorSpace.Munsell) as Triplet;
		}
		let t: Triplet;
		switch (this.cs) {
			case ColorSpace.PCCS:
			case ColorSpace.Tone:
				t = Pccs.toMunsell(this.asPccs());
				break;
			default:
				t = Munsell.fromXyz(this.asXyz());
				this.us.set('munsell_saturation', Munsell.isSaturated);
				break;
		}
		this.ts.set(ColorSpace.Munsell, t);
		return t;
	}

	public asPccs(): Triplet {
		if (this.ts.has(ColorSpace.PCCS)) {
			return this.ts.get(ColorSpace.PCCS) as Triplet;
		}
		let t: Triplet;
		switch (this.cs) {
			case ColorSpace.Tone:
				t = Pccs.toNormalCoordinate(this.asTone());
				break;
			default:
				t = Pccs.fromMunsell(this.asMunsell());
				break;
		}
		this.ts.set(ColorSpace.PCCS, t);
		return t;
	}

	public asTone(): Triplet {
		if (this.ts.has(ColorSpace.Tone)) {
			return this.ts.get(ColorSpace.Tone) as Triplet;
		}
		const t: Triplet = Pccs.toToneCoordinate(this.asPccs());
		this.ts.set(ColorSpace.Tone, t);
		return t;
	}


	// -------------------------------------------------------------------------


	public isRGBSaturated(forceToCheck: boolean = false): boolean {
		if (forceToCheck && !this.us.has('rgb_saturation')) {
			this.asRgb();
		}
		return (this.us.get('rgb_saturation') ?? false) as boolean;
	}

	public isXyySaturated(): boolean {
		return (this.us.get('xyy_saturation') ?? false) as boolean;
	}

	public isMunsellSaturated(): boolean {
		return (this.us.get('munsell_saturation') ?? false) as boolean;
	}


	// -------------------------------------------------------------------------


	public asMunsellNotation(): string {
		if (this.us.has('munsell_notation')) {
			return this.us.get('munsell_notation') as string;
		}
		const s: string = Munsell.toString(this.asMunsell());
		this.us.set('munsell_notation', s);
		return s;
	}

	public asPCCSNotation(): string {
		if (this.us.has('pccs_notation')) {
			return this.us.get('pccs_notation') as string;
		}
		const s: string = Pccs.toString(this.asPccs());
		this.us.set('pccs_notation', s);
		return s;
	}


	// -------------------------------------------------------------------------


	public asInteger(): number {
		if (this.us.has('integer')) {
			return this.us.get('integer') as number;
		}
		const i: number = toColorInteger(this.asRgb());
		this.us.set('integer', i);
		return i;
	}

	public asConspicuity(): number {
		if (this.us.has('conspicuity')) {
			return this.us.get('conspicuity') as number;
		}
		const s: number = Conspicuity.conspicuityOfLab(this.asLab());
		this.us.set('conspicuity', s);
		return s;
	}

	public asCategory(): string {
		if (this.us.has('category')) {
			return this.us.get('category') as string;
		}
		const n: string = Category.categoryOfXyy(this.asXyy());
		this.us.set('category', n);
		return n;
	}

	public differenceFrom(c: Color, method: 'sqrt'|'cie76'|'ciede2000' = 'ciede2000'): number {
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


	public toMonochrome(): Color {
		return new Color(ColorSpace.Lab, [this.asLab()[0], 0, 0]);
	}


	// -------------------------------------------------------------------------


	public toProtanopia(method: 'lms'|'lrgb' = 'lrgb', doCorrection: boolean = false): Color {
		ColorVisionSimulation.setOkajimaCorrectionOption(doCorrection);
		switch (method) {
			case 'lms':
				const lms0: Triplet = ColorVisionSimulation.lmsToProtanopia(this.asLms());
				return new Color(ColorSpace.LMS, lms0);
			case 'lrgb':
			default:
				const lms1: Triplet = ColorVisionSimulation.lrgbToProtanopia(this.asLrgb());
				return new Color(ColorSpace.LMS, lms1);
		}
	}

	public toDeuteranopia(method: 'lms'|'lrgb' = 'lrgb', doCorrection: boolean = false): Color {
		ColorVisionSimulation.setOkajimaCorrectionOption(doCorrection);
		switch (method) {
			case 'lms':
				const lms0: Triplet = ColorVisionSimulation.lmsToDeuteranopia(this.asLms());
				return new Color(ColorSpace.LMS, lms0);
			case 'lrgb':
			default:
				const lms1: Triplet = ColorVisionSimulation.lrgbToDeuteranopia(this.asLrgb());
				return new Color(ColorSpace.LMS, lms1);
		}
	}
}
