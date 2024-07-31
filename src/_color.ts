/**
 * Color
 *
 * @author Takuto Yanagida
 * @version 2024-07-31
 */

import { Triplet } from './_triplet';
import { RGB } from './_cs-rgb';
import { Lab } from './_cs-lab';
import { Yxy } from './_cs-yxy';
import { LMS } from './_cs-lms';
import { LRGB } from './_cs-lrgb';
import { Munsell } from './_cs-munsell';
import { PCCS } from './_cs-pccs';
import { Evaluation } from './_eval';
import { ColorVisionSimulation } from './_sim-color-vision';

export enum ColorSpace {
	RGB,
	LRGB,
	XYZ,
	Yxy,
	Lab,
	LCh,
	LMS,
	Munsell,
	PCCS,
	Tone,
}

export class Color {
	private ts = new Map<ColorSpace, Triplet>();
	private us = new Map<string, string|number>();
	private cs: ColorSpace | null = null;

	public constructor(cs: ColorSpace|null = null, t: Triplet|null = null) {
		if (cs && t) {
			this.set(cs, t);
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
			case ColorSpace.RGB    : return this.asRGB();
			case ColorSpace.LRGB   : return this.asLRGB();
			case ColorSpace.XYZ    : return this.asXYZ();
			case ColorSpace.Yxy    : return this.asYxy();
			case ColorSpace.Lab    : return this.asLab();
			case ColorSpace.LCh    : return this.asLCh();
			case ColorSpace.LMS    : return this.asLMS();
			case ColorSpace.Munsell: return this.asMunsell();
			case ColorSpace.PCCS   : return this.asPCCS();
			case ColorSpace.Tone   : return this.asTone();
		}
	}


	// -------------------------------------------------------------------------


	public asRGB(): Triplet {
		if (this.ts.has(ColorSpace.RGB)) {
			return this.ts.get(ColorSpace.RGB) as Triplet;
		}
		const t: Triplet = RGB.fromLRGB(this.asLRGB());
		this.ts.set(ColorSpace.RGB, t);
		if (RGB.isSaturated) this.us.set('rgb_saturation', '');
		return t;
	}

	public asLRGB(): Triplet {
		if (this.ts.has(ColorSpace.LRGB)) {
			return this.ts.get(ColorSpace.LRGB) as Triplet;
		}
		let t: Triplet = [0, 0, 0];
		switch (this.cs) {
			case ColorSpace.RGB:
				t = RGB.toLRGB(this.asRGB());
				break;
			default:
				t = LRGB.fromXYZ(this.asXYZ());
				break;
		}
		this.ts.set(ColorSpace.LRGB, t);
		return t;
	}

	public asXYZ(): Triplet {
		if (this.ts.has(ColorSpace.XYZ)) {
			return this.ts.get(ColorSpace.XYZ) as Triplet;
		}
		let t: Triplet = [0, 0, 0];
		switch (this.cs) {
			case ColorSpace.RGB:
			case ColorSpace.LRGB:
				t = LRGB.toXYZ(this.asLRGB());
				break;
			case ColorSpace.LCh:
			case ColorSpace.Lab:
				t = Lab.toXYZ(this.asLab());
				break;
			case ColorSpace.Yxy:
				t = Yxy.toXYZ(this.asYxy());
				if (Yxy.isSaturated) this.us.set('yxy_saturation', '');
				break;
			case ColorSpace.LMS:
				t = LMS.toXYZ(this.asLMS());
				break;
			case ColorSpace.Munsell:
			case ColorSpace.PCCS:
			case ColorSpace.Tone:
				t = Munsell.toXYZ(this.asMunsell());
				if (Munsell.isSaturated) this.us.set('munsell_saturation', '');
				break;
		}
		this.ts.set(ColorSpace.XYZ, t);
		return t;
	}

	public asYxy(): Triplet {
		if (this.ts.has(ColorSpace.Yxy)) {
			return this.ts.get(ColorSpace.Yxy) as Triplet;
		}
		const t: Triplet = Yxy.fromXYZ(this.asXYZ());
		this.ts.set(ColorSpace.Yxy, t);
		return t;
	}

	public asLab(): Triplet {
		if (this.ts.has(ColorSpace.Lab)) {
			return this.ts.get(ColorSpace.Lab) as Triplet;
		}
		let t: Triplet = [0, 0, 0];
		switch (this.cs) {
			case ColorSpace.LCh:
				t = Lab.toOrthogonalCoordinate(this.asLCh());
				break;
			default:
				t = Lab.fromXYZ(this.asXYZ());
				break;
		}
		this.ts.set(ColorSpace.Lab, t);
		return t;
	}

	public asLCh(): Triplet {
		if (this.ts.has(ColorSpace.LCh)) {
			return this.ts.get(ColorSpace.LCh) as Triplet;
		}
		const t: Triplet = Lab.toPolarCoordinate(this.asLab());
		this.ts.set(ColorSpace.LCh, t);
		return t;
	}

	public asLMS(): Triplet {
		if (this.ts.has(ColorSpace.LMS)) {
			return this.ts.get(ColorSpace.LMS) as Triplet;
		}
		const t: Triplet = LMS.fromXYZ(this.asXYZ());
		this.ts.set(ColorSpace.LMS, t);
		return t;
	}

	public asMunsell(): Triplet {
		if (this.ts.has(ColorSpace.Munsell)) {
			return this.ts.get(ColorSpace.Munsell) as Triplet;
		}
		let t: Triplet = [0, 0, 0];
		switch (this.cs) {
			case ColorSpace.PCCS:
			case ColorSpace.Tone:
				t = PCCS.toMunsell(this.asPCCS());
				break;
			default:
				t = Munsell.fromXYZ(this.asXYZ());
				break;
		}
		this.ts.set(ColorSpace.Munsell, t);
		return t;
	}

	public asPCCS(): Triplet {
		if (this.ts.has(ColorSpace.PCCS)) {
			return this.ts.get(ColorSpace.PCCS) as Triplet;
		}
		let t: Triplet = [0, 0, 0];
		switch (this.cs) {
			case ColorSpace.Tone:
				t = PCCS.toNormalCoordinate(this.asTone());
				break;
			default:
				t = PCCS.fromMunsell(this.asMunsell());
				break;
		}
		this.ts.set(ColorSpace.PCCS, t);
		return t;
	}

	public asTone(): Triplet {
		if (this.ts.has(ColorSpace.Tone)) {
			return this.ts.get(ColorSpace.Tone) as Triplet;
		}
		const t: Triplet = PCCS.toToneCoordinate(this.asPCCS());
		this.ts.set(ColorSpace.Tone, t);
		return t;
	}


	// -------------------------------------------------------------------------


	public isRGBSaturated(): boolean {
		return this.us.has('rgb_saturation');
	}

	public isYxySaturated(): boolean {
		return this.us.has('yxy_saturation');
	}

	public isMunsellSaturated(): boolean {
		return this.us.has('munsell_saturation');
	}


	// -------------------------------------------------------------------------


	public asMunsellNotation(): string {
		if (this.us.has('munsell_notation')) {
			return this.us.get('munsell_notation') as string;
		}
		const s = Munsell.toString(this.asMunsell());
		this.us.set('munsell_notation', s);
		return s;
	}

	public asPCCSNotation(): string {
		if (this.us.has('pccs_notation')) {
			return this.us.get('pccs_notation') as string;
		}
		const s = PCCS.toString(this.asPCCS());
		this.us.set('pccs_notation', s);
		return s;
	}


	// -------------------------------------------------------------------------


	public asConspicuity(): number {
		if (this.us.has('conspicuity')) {
			return this.us.get('conspicuity') as number;
		}
		const s = Evaluation.conspicuityOfLab(this.asLab());
		this.us.set('conspicuity', s);
		return s;
	}

	public asCategory(): string {
		if (this.us.has('category')) {
			return this.us.get('category') as string;
		}
		const n = Evaluation.categoryOfYxy(this.asYxy());
		this.us.set('category', n);
		return n;
	}

	public distanceTo(c: Color, method: 'sqrt'|'cie76'|'ciede2000' = 'ciede2000'): number {
		switch (method) {
			case 'sqrt':
				return Evaluation.distance(this.asLab(), c.asLab());
			case 'cie76':
				return Evaluation.CIE76(this.asLab(), c.asLab());
			case 'ciede2000':
			default:
				return Evaluation.CIEDE2000(this.asLab(), c.asLab());
		}
	}


	// -------------------------------------------------------------------------


	public toProtanopia(method: 'lms'|'lrgb' = 'lrgb', doCorrection: boolean = false): Color {
		switch (method) {
			case 'lms':
				const lms0 = ColorVisionSimulation.lmsToProtanopia(this.asLMS(), doCorrection);
				return new Color(ColorSpace.LMS, lms0);
			case 'lrgb':
			default:
				const lms1 = ColorVisionSimulation.lrgbToProtanopia(this.asLRGB(), doCorrection);
				return new Color(ColorSpace.LMS, lms1);
		}
	}

	public toDeuteranopia(method: 'lms'|'lrgb' = 'lrgb', doCorrection: boolean = false): Color {
		switch (method) {
			case 'lms':
				const lms0 = ColorVisionSimulation.lmsToDeuteranopia(this.asLMS(), doCorrection);
				return new Color(ColorSpace.LMS, lms0);
			case 'lrgb':
			default:
				const lms1 = ColorVisionSimulation.lrgbToDeuteranopia(this.asLRGB(), doCorrection);
				return new Color(ColorSpace.LMS, lms1);
		}
	}
}
