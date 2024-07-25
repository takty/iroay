/**
 * Color
 *
 * @author Takuto Yanagida
 * @version 2024-07-25
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

export class Color {
	private cs = new Map<string, Triplet|string|boolean>();
	private orig: string = '';

	public constructor(name: string, c: Triplet) {
		this.set(name, c);
	}

	public set(name: string, c: Triplet): void {
		this.cs.clear();
		this.cs.set(name, c);
		this.orig = name;
	}

	public asRGB(): Triplet {
		if (this.cs.has('rgb')) {
			return this.cs.get('rgb') as Triplet;
		}
		const c = RGB.fromLRGB(this.asLRGB());
		this.cs.set('rgb', c);
		if (RGB.isSaturated) this.cs.set('rgb_saturated', true);
		return c;
	}

	public asLRGB(): Triplet {
		if (this.cs.has('lrgb')) {
			return this.cs.get('lrgb') as Triplet;
		}
		let c: Triplet = [0, 0, 0];
		switch (this.orig) {
			case 'rgb':
				c = RGB.toLRGB(this.asRGB());
				break;
			default:
				c = LRGB.fromXYZ(this.asXYZ());
				break;
		}
		this.cs.set('lrgb', c);
		return c;
	}

	public asXYZ(): Triplet {
		if (this.cs.has('xyz')) {
			return this.cs.get('xyz') as Triplet;
		}
		let c: Triplet = [0, 0, 0];
		switch (this.orig) {
			case 'rgb':
			case 'lrgb':
				c = LRGB.toXYZ(this.asLRGB());
				break;
			case 'lch':
			case 'lab':
				c = Lab.toXYZ(this.asLab());
				break;
			case 'yxy':
				c = Yxy.toXYZ(this.asYxy());
				if (Yxy.isSaturated) this.cs.set('yxy_saturated', true);
				break;
			case 'lms':
				c = LMS.toXYZ(this.asLMS());
				break;
			case 'munsell':
			case 'pccs':
			case 'tone':
				c = Munsell.toXYZ(this.asMunsell());
				if (Munsell.isSaturated) this.cs.set('munsell_saturated', true);
				break;
		}
		this.cs.set('xyz', c);
		return c;
	}

	public asYxy(): Triplet {
		if (this.cs.has('yxy')) {
			return this.cs.get('yxy') as Triplet;
		}
		const c = Yxy.fromXYZ(this.asXYZ());
		this.cs.set('yxy', c);
		return c;
	}

	public asLab(): Triplet {
		if (this.cs.has('lab')) {
			return this.cs.get('lab') as Triplet;
		}
		let c: Triplet = [0, 0, 0];
		switch (this.orig) {
			case 'lch':
				c = Lab.toOrthogonalCoordinate(this.asLCH());
				break;
			default:
				c = Lab.fromXYZ(this.asXYZ());
				break;
		}
		this.cs.set('lab', c);
		return c;
	}

	public asLCH(): Triplet {
		if (this.cs.has('lch')) {
			return this.cs.get('lch') as Triplet;
		}
		const c = Lab.toPolarCoordinate(this.asLab());
		this.cs.set('lch', c);
		return c;
	}

	public asLMS(): Triplet {
		if (this.cs.has('lms')) {
			return this.cs.get('lms') as Triplet;
		}
		const c = LMS.fromXYZ(this.asXYZ());
		this.cs.set('lms', c);
		return c;
	}

	public asMunsell(): Triplet {
		if (this.cs.has('munsell')) {
			return this.cs.get('munsell') as Triplet;
		}
		let c: Triplet = [0, 0, 0];
		switch (this.orig) {
			case 'pccs':
			case 'tone':
				c = PCCS.toMunsell(this.asPCCS());
				break;
			default:
				c = Munsell.fromXYZ(this.asXYZ());
				break;
		}
		this.cs.set('munsell', c);
		return c;
	}

	public asPCCS(): Triplet {
		if (this.cs.has('pccs')) {
			return this.cs.get('pccs') as Triplet;
		}
		let c: Triplet = [0, 0, 0];
		switch (this.orig) {
			case 'tone':
				c = PCCS.toNormalCoordinate(this.asTone());
				break;
			default:
				c = PCCS.fromMunsell(this.asMunsell());
				break;
		}
		this.cs.set('pccs', c);
		return c;
	}

	public asTone(): Triplet {
		if (this.cs.has('tone')) {
			return this.cs.get('tone') as Triplet;
		}
		const c = PCCS.toToneCoordinate(this.asPCCS());
		this.cs.set('tone', c);
		return c;
	}


	// -------------------------------------------------------------------------


	public isRGBSaturated(): boolean {
		return this.cs.has('rgb_saturated');
	}

	public isYxySaturated(): boolean {
		return this.cs.has('yxy_saturated');
	}

	public isMunsellSaturated(): boolean {
		return this.cs.has('munsell_saturated');
	}


	// -------------------------------------------------------------------------


	public asMunsellNotation(): string {
		if (this.cs.has('munsell_notation')) {
			return this.cs.get('munsell_notation') as string;
		}
		const s = Munsell.toString(this.asMunsell());
		this.cs.set('munsell_notation', s);
		return s;
	}

	public asPCCSNotation(): string {
		if (this.cs.has('pccs_notation')) {
			return this.cs.get('pccs_notation') as string;
		}
		const s = PCCS.toString(this.asPCCS());
		this.cs.set('pccs_notation', s);
		return s;
	}

	public asCategory(): string {
		if (this.cs.has('category')) {
			return this.cs.get('category') as string;
		}
		const s = Evaluation.categoryOfYxy(this.asYxy());
		this.cs.set('category', s);
		return s;
	}
}
