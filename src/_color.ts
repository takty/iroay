/**
 * Color
 *
 * @author Takuto Yanagida
 * @version 2024-07-26
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
	private us = new Map<string, string>();
	private cs: ColorSpace | null = null;

	public constructor(cs: ColorSpace|null = null, t: Triplet|null = null) {
		if (cs && t) {
			this.set(cs, t);
		}
	}

	public set(cs: ColorSpace, t: Triplet): void {
		this.ts.clear();
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
		if (RGB.isSaturated) this.us.set('rgb_sat', '');
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
				if (Yxy.isSaturated) this.us.set('yxy_sat', '');
				break;
			case ColorSpace.LMS:
				t = LMS.toXYZ(this.asLMS());
				break;
			case ColorSpace.Munsell:
			case ColorSpace.PCCS:
			case ColorSpace.Tone:
				t = Munsell.toXYZ(this.asMunsell());
				if (Munsell.isSaturated) this.us.set('mun_sat', '');
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
		return this.us.has('rgb_sat');
	}

	public isYxySaturated(): boolean {
		return this.us.has('yxy_sat');
	}

	public isMunsellSaturated(): boolean {
		return this.us.has('mun_sat');
	}


	// -------------------------------------------------------------------------


	public asMunsellNotation(): string {
		if (this.us.has('mun_not')) {
			return this.us.get('mun_not') as string;
		}
		const s = Munsell.toString(this.asMunsell());
		this.us.set('mun_not', s);
		return s;
	}

	public asPCCSNotation(): string {
		if (this.us.has('pccs_not')) {
			return this.us.get('pccs_not') as string;
		}
		const s = PCCS.toString(this.asPCCS());
		this.us.set('pccs_not', s);
		return s;
	}

	public asCategory(): string {
		if (this.us.has('cat')) {
			return this.us.get('cat') as string;
		}
		const s = Evaluation.categoryOfYxy(this.asYxy());
		this.us.set('cat', s);
		return s;
	}


	// -------------------------------------------------------------------------


	public toProtanopia(method: 1|2 = 2, doCorrection: boolean = false): Color {
		if (1 === method) {
			const lms = ColorVisionSimulation.lmsToProtanopia(this.asLMS(), doCorrection);
			return new Color(ColorSpace.LMS, lms);
		} else {
			const lms = ColorVisionSimulation.lrgbToProtanopia(this.asLRGB(), doCorrection);
			return new Color(ColorSpace.LMS, lms);
		}
	}

	public toDeuteranopia(method: 1|2 = 2, doCorrection: boolean = false): Color {
		if (1 === method) {
			const lms = ColorVisionSimulation.lmsToDeuteranopia(this.asLMS(), doCorrection);
			return new Color(ColorSpace.LMS, lms);
		} else {
			const lms = ColorVisionSimulation.lrgbToDeuteranopia(this.asLRGB(), doCorrection);
			return new Color(ColorSpace.LMS, lms);
		}
	}
}
