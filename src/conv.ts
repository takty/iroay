/**
 * Functions for Color Space Conversion
 *
 * @author Takuto Yanagida
 * @version 2024-11-10
 */

import { Triplet } from './type';

import * as Rgb from './cs/rgb';
import * as Yiq from './cs/yiq';
import * as Lrgb from './cs/lrgb';
import * as Xyz from './cs/xyz';
import * as Xyy from './cs/xyy';
import * as Lab from './cs/lab';
import * as Lch from './cs/lch';
import * as Lms from './cs/lms';
import * as Munsell from './cs/munsell';
import * as Pccs from './cs/pccs';

/**
 * Convert a color from one color space to another.
 * @param {Triplet} vs a color of the color space 'from'
 * @param {string} from a color space name
 * @param {string=} [to='rgb'] a color space name
 * @return {Triplet} a color of the color space 'to'
 */
export function convert(vs: Triplet, from: string, to: string | undefined = 'rgb'): Triplet {
	const type: string = from.toLowerCase() + '-' + to.toLowerCase();
	switch (type) {
		case 'hsl-rgb'     : return Rgb.fromHsl(vs);
		case 'yiq-rgb'     : return Rgb.fromLrgb(Lrgb.fromYiq(vs));
		case 'lrgb-rgb'    : return Rgb.fromLrgb(vs);
		case 'xyz-rgb'     : return Rgb.fromLrgb(Lrgb.fromXyz(vs));
		case 'xyy-rgb'     : return Rgb.fromLrgb(Lrgb.fromXyz(Xyz.fromXyy(vs)));
		case 'lab-rgb'     : return Rgb.fromLrgb(Lrgb.fromXyz(Xyz.fromLab(vs)));
		case 'lch-rgb'     : return Rgb.fromLrgb(Lrgb.fromXyz(Xyz.fromLab(Lab.fromLch(vs))));
		case 'lms-rgb'     : return Rgb.fromLrgb(Lrgb.fromXyz(Xyz.fromLms(vs)));
		case 'munsell-rgb' : return Rgb.fromLrgb(Lrgb.fromXyz(Xyz.fromMunsell(vs)));
		case 'pccs-rgb'    : return Rgb.fromLrgb(Lrgb.fromXyz(Xyz.fromMunsell(Munsell.fromPccs(vs))));

		case 'hsl-lrgb'    : return Lrgb.fromRgb(Rgb.fromHsl(vs));
		case 'rgb-lrgb'    : return Lrgb.fromRgb(vs);
		case 'yiq-lrgb'    : return Lrgb.fromYiq(vs);
		case 'xyz-lrgb'    : return Lrgb.fromXyz(vs);
		case 'xyy-lrgb'    : return Lrgb.fromXyz(Xyz.fromXyy(vs));
		case 'lab-lrgb'    : return Lrgb.fromXyz(Xyz.fromLab(vs));
		case 'lch-lrgb'    : return Lrgb.fromXyz(Xyz.fromLab(Lab.fromLch(vs)));
		case 'lms-lrgb'    : return Lrgb.fromXyz(Xyz.fromLms(vs));
		case 'munsell-lrgb': return Lrgb.fromXyz(Xyz.fromMunsell(vs));
		case 'pccs-lrgb'   : return Lrgb.fromXyz(Xyz.fromMunsell(Munsell.fromPccs(vs)));

		case 'hsl-yiq'     : return Yiq.fromLrgb(Lrgb.fromRgb(Rgb.fromHsl(vs)));
		case 'rgb-yiq'     : return Yiq.fromLrgb(Lrgb.fromRgb(vs));
		case 'lrgb-yiq'    : return Yiq.fromLrgb(vs);
		case 'xyz-yiq'     : return Yiq.fromLrgb(Lrgb.fromXyz(vs));
		case 'xyy-yiq'     : return Yiq.fromLrgb(Lrgb.fromXyz(Xyz.fromXyy(vs)));
		case 'lab-yiq'     : return Yiq.fromLrgb(Lrgb.fromXyz(Xyz.fromLab(vs)));
		case 'lch-yiq'     : return Yiq.fromLrgb(Lrgb.fromXyz(Xyz.fromLab(Lab.fromLch(vs))));
		case 'lms-yiq'     : return Yiq.fromLrgb(Lrgb.fromXyz(Xyz.fromLms(vs)));
		case 'munsell-yiq' : return Yiq.fromLrgb(Lrgb.fromXyz(Xyz.fromMunsell(vs)));
		case 'pccs-yiq'    : return Yiq.fromLrgb(Lrgb.fromXyz(Xyz.fromMunsell(Munsell.fromPccs(vs))));

		case 'hsl-xyz'     : return Xyz.fromLrgb(Lrgb.fromRgb(Rgb.fromHsl(vs)));
		case 'rgb-xyz'     : return Xyz.fromLrgb(Lrgb.fromRgb(vs));
		case 'yiq-xyz'     : return Xyz.fromLrgb(Lrgb.fromYiq(vs));
		case 'lrgb-xyz'    : return Xyz.fromLrgb(vs);
		case 'xyy-xyz'     : return Xyz.fromXyy(vs);
		case 'lab-xyz'     : return Xyz.fromLab(vs);
		case 'lch-xyz'     : return Xyz.fromLab(Lab.fromLch(vs));
		case 'lms-xyz'     : return Xyz.fromLms(vs);
		case 'munsell-xyz' : return Xyz.fromMunsell(vs);
		case 'pccs-xyz'    : return Xyz.fromMunsell(Munsell.fromPccs(vs));

		case 'hsl-xyy'     : return Xyy.fromXyz(Xyz.fromLrgb(Lrgb.fromRgb(Rgb.fromHsl(vs))));
		case 'rgb-xyy'     : return Xyy.fromXyz(Xyz.fromLrgb(Lrgb.fromRgb(vs)));
		case 'yiq-xyy'     : return Xyy.fromXyz(Xyz.fromLrgb(Lrgb.fromYiq(vs)));
		case 'lrgb-xyy'    : return Xyy.fromXyz(Xyz.fromLrgb(vs));
		case 'xyz-xyy'     : return Xyy.fromXyz(vs);
		case 'lab-xyy'     : return Xyy.fromXyz(Xyz.fromLab(vs));
		case 'lch-xyy'     : return Xyy.fromXyz(Xyz.fromLab(Lab.fromLch(vs)));
		case 'lms-xyy'     : return Xyy.fromXyz(Xyz.fromLms(vs));
		case 'munsell-xyy' : return Xyy.fromXyz(Xyz.fromMunsell(vs));
		case 'pccs-xyy'    : return Xyy.fromXyz(Xyz.fromMunsell(Munsell.fromPccs(vs)));

		case 'hsl-lab'     : return Lab.fromXyz(Xyz.fromLrgb(Lrgb.fromRgb(Rgb.fromHsl(vs))));
		case 'rgb-lab'     : return Lab.fromXyz(Xyz.fromLrgb(Lrgb.fromRgb(vs)));
		case 'yiq-lab'     : return Lab.fromXyz(Xyz.fromLrgb(Lrgb.fromYiq(vs)));
		case 'lrgb-lab'    : return Lab.fromXyz(Xyz.fromLrgb(vs));
		case 'xyz-lab'     : return Lab.fromXyz(vs);
		case 'lch-lab'     : return Lab.fromLch(vs);
		case 'xyy-lab'     : return Lab.fromXyz(Xyz.fromXyy(vs));
		case 'lms-lab'     : return Lab.fromXyz(Xyz.fromLms(vs));
		case 'munsell-lab' : return Lab.fromXyz(Xyz.fromMunsell(vs));
		case 'pccs-lab'    : return Lab.fromXyz(Xyz.fromMunsell(Munsell.fromPccs(vs)));

		case 'hsl-lch'     : return Lch.fromLab(Lab.fromXyz(Xyz.fromLrgb(Lrgb.fromRgb(Rgb.fromHsl(vs)))));
		case 'rgb-lch'     : return Lch.fromLab(Lab.fromXyz(Xyz.fromLrgb(Lrgb.fromRgb(vs))));
		case 'yiq-lch'     : return Lch.fromLab(Lab.fromXyz(Xyz.fromLrgb(Lrgb.fromYiq(vs))));
		case 'lrgb-lch'    : return Lch.fromLab(Lab.fromXyz(Xyz.fromLrgb(vs)));
		case 'xyz-lch'     : return Lch.fromLab(Lab.fromXyz(vs));
		case 'lab-lch'     : return Lch.fromLab(vs);
		case 'xyy-lch'     : return Lch.fromLab(Lab.fromXyz(Xyz.fromXyy(vs)));
		case 'lms-lch'     : return Lch.fromLab(Lab.fromXyz(Xyz.fromLms(vs)));
		case 'munsell-lch' : return Lch.fromLab(Lab.fromXyz(Xyz.fromMunsell(vs)));
		case 'pccs-lch'    : return Lch.fromLab(Lab.fromXyz(Xyz.fromMunsell(Munsell.fromPccs(vs))));

		case 'hsl-lms'     : return Lms.fromXyz(Xyz.fromLrgb(Lrgb.fromRgb(Rgb.fromHsl(vs))));
		case 'rgb-lms'     : return Lms.fromXyz(Xyz.fromLrgb(Lrgb.fromRgb(vs)));
		case 'yiq-lms'     : return Lms.fromXyz(Xyz.fromLrgb(Lrgb.fromYiq(vs)));
		case 'lrgb-lms'    : return Lms.fromXyz(Xyz.fromLrgb(vs));
		case 'xyz-lms'     : return Lms.fromXyz(vs);
		case 'xyy-lms'     : return Lms.fromXyz(Xyz.fromXyy(vs));
		case 'lab-lms'     : return Lms.fromXyz(Xyz.fromLab(vs));
		case 'lch-lms'     : return Lms.fromXyz(Xyz.fromLab(Lab.fromLch(vs)));
		case 'munsell-lms' : return Lms.fromXyz(Xyz.fromMunsell(vs));
		case 'pccs-lms'    : return Lms.fromXyz(Xyz.fromMunsell(Munsell.fromPccs(vs)));

		case 'hsl-munsell' : return Munsell.fromXyz(Xyz.fromLrgb(Lrgb.fromRgb(Rgb.fromHsl(vs))));
		case 'rgb-munsell' : return Munsell.fromXyz(Xyz.fromLrgb(Lrgb.fromRgb(vs)));
		case 'yiq-munsell' : return Munsell.fromXyz(Xyz.fromLrgb(Lrgb.fromYiq(vs)));
		case 'lrgb-munsell': return Munsell.fromXyz(Xyz.fromLrgb(vs));
		case 'xyz-munsell' : return Munsell.fromXyz(vs);
		case 'xyy-munsell' : return Munsell.fromXyz(Xyz.fromXyy(vs));
		case 'lab-munsell' : return Munsell.fromXyz(Xyz.fromLab(vs));
		case 'lch-munsell' : return Munsell.fromXyz(Xyz.fromLab(Lab.fromLch(vs)));
		case 'lms-munsell' : return Munsell.fromXyz(Xyz.fromLms(vs));
		case 'pccs-munsell': return Munsell.fromPccs(vs);

		case 'hsl-pccs'    : return Pccs.fromMunsell(Munsell.fromXyz(Xyz.fromLrgb(Lrgb.fromRgb(Rgb.fromHsl(vs)))));
		case 'rgb-pccs'    : return Pccs.fromMunsell(Munsell.fromXyz(Xyz.fromLrgb(Lrgb.fromRgb(vs))));
		case 'yiq-pccs'    : return Pccs.fromMunsell(Munsell.fromXyz(Xyz.fromLrgb(Lrgb.fromYiq(vs))));
		case 'lrgb-pccs'   : return Pccs.fromMunsell(Munsell.fromXyz(Xyz.fromLrgb(vs)));
		case 'xyz-pccs'    : return Pccs.fromMunsell(Munsell.fromXyz(vs));
		case 'xyy-pccs'    : return Pccs.fromMunsell(Munsell.fromXyz(Xyz.fromXyy(vs)));
		case 'lab-pccs'    : return Pccs.fromMunsell(Munsell.fromXyz(Xyz.fromLab(vs)));
		case 'lch-pccs'    : return Pccs.fromMunsell(Munsell.fromXyz(Xyz.fromLab(Lab.fromLch(vs))));
		case 'lms-pccs'    : return Pccs.fromMunsell(Munsell.fromXyz(Xyz.fromLms(vs)));
		case 'munsell-pccs': return Pccs.fromMunsell(vs);
	}
	return vs;
}
export function getConverter(from: string, to: string = 'rgb') {
	const type: string = from.toLowerCase() + '-' + to.toLowerCase();
	switch (type) {
		case 'hsl-rgb'     : return (vs: Triplet) => Rgb.fromHsl(vs);
		case 'yiq-rgb'     : return (vs: Triplet) => Rgb.fromLrgb(Lrgb.fromYiq(vs));
		case 'lrgb-rgb'    : return (vs: Triplet) => Rgb.fromLrgb(vs);
		case 'xyz-rgb'     : return (vs: Triplet) => Rgb.fromLrgb(Lrgb.fromXyz(vs));
		case 'xyy-rgb'     : return (vs: Triplet) => Rgb.fromLrgb(Lrgb.fromXyz(Xyz.fromXyy(vs)));
		case 'lab-rgb'     : return (vs: Triplet) => Rgb.fromLrgb(Lrgb.fromXyz(Xyz.fromLab(vs)));
		case 'lch-rgb'     : return (vs: Triplet) => Rgb.fromLrgb(Lrgb.fromXyz(Xyz.fromLab(Lab.fromLch(vs))));
		case 'lms-rgb'     : return (vs: Triplet) => Rgb.fromLrgb(Lrgb.fromXyz(Xyz.fromLms(vs)));
		case 'munsell-rgb' : return (vs: Triplet) => Rgb.fromLrgb(Lrgb.fromXyz(Xyz.fromMunsell(vs)));
		case 'pccs-rgb'    : return (vs: Triplet) => Rgb.fromLrgb(Lrgb.fromXyz(Xyz.fromMunsell(Munsell.fromPccs(vs))));

		case 'hsl-lrgb'    : return (vs: Triplet) => Lrgb.fromRgb(Rgb.fromHsl(vs));
		case 'rgb-lrgb'    : return (vs: Triplet) => Lrgb.fromRgb(vs);
		case 'yiq-lrgb'    : return (vs: Triplet) => Lrgb.fromYiq(vs);
		case 'xyz-lrgb'    : return (vs: Triplet) => Lrgb.fromXyz(vs);
		case 'xyy-lrgb'    : return (vs: Triplet) => Lrgb.fromXyz(Xyz.fromXyy(vs));
		case 'lab-lrgb'    : return (vs: Triplet) => Lrgb.fromXyz(Xyz.fromLab(vs));
		case 'lch-lrgb'    : return (vs: Triplet) => Lrgb.fromXyz(Xyz.fromLab(Lab.fromLch(vs)));
		case 'lms-lrgb'    : return (vs: Triplet) => Lrgb.fromXyz(Xyz.fromLms(vs));
		case 'munsell-lrgb': return (vs: Triplet) => Lrgb.fromXyz(Xyz.fromMunsell(vs));
		case 'pccs-lrgb'   : return (vs: Triplet) => Lrgb.fromXyz(Xyz.fromMunsell(Munsell.fromPccs(vs)));

		case 'hsl-yiq'     : return (vs: Triplet) => Yiq.fromLrgb(Lrgb.fromRgb(Rgb.fromHsl(vs)));
		case 'rgb-yiq'     : return (vs: Triplet) => Yiq.fromLrgb(Lrgb.fromRgb(vs));
		case 'lrgb-yiq'    : return (vs: Triplet) => Yiq.fromLrgb(vs);
		case 'xyz-yiq'     : return (vs: Triplet) => Yiq.fromLrgb(Lrgb.fromXyz(vs));
		case 'xyy-yiq'     : return (vs: Triplet) => Yiq.fromLrgb(Lrgb.fromXyz(Xyz.fromXyy(vs)));
		case 'lab-yiq'     : return (vs: Triplet) => Yiq.fromLrgb(Lrgb.fromXyz(Xyz.fromLab(vs)));
		case 'lch-yiq'     : return (vs: Triplet) => Yiq.fromLrgb(Lrgb.fromXyz(Xyz.fromLab(Lab.fromLch(vs))));
		case 'lms-yiq'     : return (vs: Triplet) => Yiq.fromLrgb(Lrgb.fromXyz(Xyz.fromLms(vs)));
		case 'munsell-yiq' : return (vs: Triplet) => Yiq.fromLrgb(Lrgb.fromXyz(Xyz.fromMunsell(vs)));
		case 'pccs-yiq'    : return (vs: Triplet) => Yiq.fromLrgb(Lrgb.fromXyz(Xyz.fromMunsell(Munsell.fromPccs(vs))));

		case 'hsl-xyz'     : return (vs: Triplet) => Xyz.fromLrgb(Lrgb.fromRgb(Rgb.fromHsl(vs)));
		case 'rgb-xyz'     : return (vs: Triplet) => Xyz.fromLrgb(Lrgb.fromRgb(vs));
		case 'yiq-xyz'     : return (vs: Triplet) => Xyz.fromLrgb(Lrgb.fromYiq(vs));
		case 'lrgb-xyz'    : return (vs: Triplet) => Xyz.fromLrgb(vs);
		case 'xyy-xyz'     : return (vs: Triplet) => Xyz.fromXyy(vs);
		case 'lab-xyz'     : return (vs: Triplet) => Xyz.fromLab(vs);
		case 'lch-xyz'     : return (vs: Triplet) => Xyz.fromLab(Lab.fromLch(vs));
		case 'lms-xyz'     : return (vs: Triplet) => Xyz.fromLms(vs);
		case 'munsell-xyz' : return (vs: Triplet) => Xyz.fromMunsell(vs);
		case 'pccs-xyz'    : return (vs: Triplet) => Xyz.fromMunsell(Munsell.fromPccs(vs));

		case 'hsl-xyy'     : return (vs: Triplet) => Xyy.fromXyz(Xyz.fromLrgb(Lrgb.fromRgb(Rgb.fromHsl(vs))));
		case 'rgb-xyy'     : return (vs: Triplet) => Xyy.fromXyz(Xyz.fromLrgb(Lrgb.fromRgb(vs)));
		case 'yiq-xyy'     : return (vs: Triplet) => Xyy.fromXyz(Xyz.fromLrgb(Lrgb.fromYiq(vs)));
		case 'lrgb-xyy'    : return (vs: Triplet) => Xyy.fromXyz(Xyz.fromLrgb(vs));
		case 'xyz-xyy'     : return (vs: Triplet) => Xyy.fromXyz(vs);
		case 'lab-xyy'     : return (vs: Triplet) => Xyy.fromXyz(Xyz.fromLab(vs));
		case 'lch-xyy'     : return (vs: Triplet) => Xyy.fromXyz(Xyz.fromLab(Lab.fromLch(vs)));
		case 'lms-xyy'     : return (vs: Triplet) => Xyy.fromXyz(Xyz.fromLms(vs));
		case 'munsell-xyy' : return (vs: Triplet) => Xyy.fromXyz(Xyz.fromMunsell(vs));
		case 'pccs-xyy'    : return (vs: Triplet) => Xyy.fromXyz(Xyz.fromMunsell(Munsell.fromPccs(vs)));

		case 'hsl-lab'     : return (vs: Triplet) => Lab.fromXyz(Xyz.fromLrgb(Lrgb.fromRgb(Rgb.fromHsl(vs))));
		case 'rgb-lab'     : return (vs: Triplet) => Lab.fromXyz(Xyz.fromLrgb(Lrgb.fromRgb(vs)));
		case 'yiq-lab'     : return (vs: Triplet) => Lab.fromXyz(Xyz.fromLrgb(Lrgb.fromYiq(vs)));
		case 'lrgb-lab'    : return (vs: Triplet) => Lab.fromXyz(Xyz.fromLrgb(vs));
		case 'xyz-lab'     : return (vs: Triplet) => Lab.fromXyz(vs);
		case 'lch-lab'     : return (vs: Triplet) => Lab.fromLch(vs);
		case 'xyy-lab'     : return (vs: Triplet) => Lab.fromXyz(Xyz.fromXyy(vs));
		case 'lms-lab'     : return (vs: Triplet) => Lab.fromXyz(Xyz.fromLms(vs));
		case 'munsell-lab' : return (vs: Triplet) => Lab.fromXyz(Xyz.fromMunsell(vs));
		case 'pccs-lab'    : return (vs: Triplet) => Lab.fromXyz(Xyz.fromMunsell(Munsell.fromPccs(vs)));

		case 'hsl-lch'     : return (vs: Triplet) => Lch.fromLab(Lab.fromXyz(Xyz.fromLrgb(Lrgb.fromRgb(Rgb.fromHsl(vs)))));
		case 'rgb-lch'     : return (vs: Triplet) => Lch.fromLab(Lab.fromXyz(Xyz.fromLrgb(Lrgb.fromRgb(vs))));
		case 'yiq-lch'     : return (vs: Triplet) => Lch.fromLab(Lab.fromXyz(Xyz.fromLrgb(Lrgb.fromYiq(vs))));
		case 'lrgb-lch'    : return (vs: Triplet) => Lch.fromLab(Lab.fromXyz(Xyz.fromLrgb(vs)));
		case 'xyz-lch'     : return (vs: Triplet) => Lch.fromLab(Lab.fromXyz(vs));
		case 'lab-lch'     : return (vs: Triplet) => Lch.fromLab(vs);
		case 'xyy-lch'     : return (vs: Triplet) => Lch.fromLab(Lab.fromXyz(Xyz.fromXyy(vs)));
		case 'lms-lch'     : return (vs: Triplet) => Lch.fromLab(Lab.fromXyz(Xyz.fromLms(vs)));
		case 'munsell-lch' : return (vs: Triplet) => Lch.fromLab(Lab.fromXyz(Xyz.fromMunsell(vs)));
		case 'pccs-lch'    : return (vs: Triplet) => Lch.fromLab(Lab.fromXyz(Xyz.fromMunsell(Munsell.fromPccs(vs))));

		case 'hsl-lms'     : return (vs: Triplet) => Lms.fromXyz(Xyz.fromLrgb(Lrgb.fromRgb(Rgb.fromHsl(vs))));
		case 'rgb-lms'     : return (vs: Triplet) => Lms.fromXyz(Xyz.fromLrgb(Lrgb.fromRgb(vs)));
		case 'yiq-lms'     : return (vs: Triplet) => Lms.fromXyz(Xyz.fromLrgb(Lrgb.fromYiq(vs)));
		case 'lrgb-lms'    : return (vs: Triplet) => Lms.fromXyz(Xyz.fromLrgb(vs));
		case 'xyz-lms'     : return (vs: Triplet) => Lms.fromXyz(vs);
		case 'xyy-lms'     : return (vs: Triplet) => Lms.fromXyz(Xyz.fromXyy(vs));
		case 'lab-lms'     : return (vs: Triplet) => Lms.fromXyz(Xyz.fromLab(vs));
		case 'lch-lms'     : return (vs: Triplet) => Lms.fromXyz(Xyz.fromLab(Lab.fromLch(vs)));
		case 'munsell-lms' : return (vs: Triplet) => Lms.fromXyz(Xyz.fromMunsell(vs));
		case 'pccs-lms'    : return (vs: Triplet) => Lms.fromXyz(Xyz.fromMunsell(Munsell.fromPccs(vs)));

		case 'hsl-munsell' : return (vs: Triplet) => Munsell.fromXyz(Xyz.fromLrgb(Lrgb.fromRgb(Rgb.fromHsl(vs))));
		case 'rgb-munsell' : return (vs: Triplet) => Munsell.fromXyz(Xyz.fromLrgb(Lrgb.fromRgb(vs)));
		case 'yiq-munsell' : return (vs: Triplet) => Munsell.fromXyz(Xyz.fromLrgb(Lrgb.fromYiq(vs)));
		case 'lrgb-munsell': return (vs: Triplet) => Munsell.fromXyz(Xyz.fromLrgb(vs));
		case 'xyz-munsell' : return (vs: Triplet) => Munsell.fromXyz(vs);
		case 'xyy-munsell' : return (vs: Triplet) => Munsell.fromXyz(Xyz.fromXyy(vs));
		case 'lab-munsell' : return (vs: Triplet) => Munsell.fromXyz(Xyz.fromLab(vs));
		case 'lch-munsell' : return (vs: Triplet) => Munsell.fromXyz(Xyz.fromLab(Lab.fromLch(vs)));
		case 'lms-munsell' : return (vs: Triplet) => Munsell.fromXyz(Xyz.fromLms(vs));
		case 'pccs-munsell': return (vs: Triplet) => Munsell.fromPccs(vs);

		case 'hsl-pccs'    : return (vs: Triplet) => Pccs.fromMunsell(Munsell.fromXyz(Xyz.fromLrgb(Lrgb.fromRgb(Rgb.fromHsl(vs)))));
		case 'rgb-pccs'    : return (vs: Triplet) => Pccs.fromMunsell(Munsell.fromXyz(Xyz.fromLrgb(Lrgb.fromRgb(vs))));
		case 'yiq-pccs'    : return (vs: Triplet) => Pccs.fromMunsell(Munsell.fromXyz(Xyz.fromLrgb(Lrgb.fromYiq(vs))));
		case 'lrgb-pccs'   : return (vs: Triplet) => Pccs.fromMunsell(Munsell.fromXyz(Xyz.fromLrgb(vs)));
		case 'xyz-pccs'    : return (vs: Triplet) => Pccs.fromMunsell(Munsell.fromXyz(vs));
		case 'xyy-pccs'    : return (vs: Triplet) => Pccs.fromMunsell(Munsell.fromXyz(Xyz.fromXyy(vs)));
		case 'lab-pccs'    : return (vs: Triplet) => Pccs.fromMunsell(Munsell.fromXyz(Xyz.fromLab(vs)));
		case 'lch-pccs'    : return (vs: Triplet) => Pccs.fromMunsell(Munsell.fromXyz(Xyz.fromLab(Lab.fromLch(vs))));
		case 'lms-pccs'    : return (vs: Triplet) => Pccs.fromMunsell(Munsell.fromXyz(Xyz.fromLms(vs)));
		case 'munsell-pccs': return (vs: Triplet) => Pccs.fromMunsell(vs);
	}
	return (vs: Triplet) => vs;
}
