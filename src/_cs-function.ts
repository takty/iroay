/**
 * Functions for Color Space Conversion
 *
 * @author Takuto Yanagida
 * @version 2024-07-25
 */

import { Triplet } from './_triplet';
import { Lab } from './_cs-lab';
import { LMS } from './_cs-lms';
import { LRGB } from './_cs-lrgb';
import { RGB } from './_cs-rgb';
import { XYZ } from './_cs-xyz';
import { YIQ } from './_cs-yiq';
import { Yxy } from './_cs-yxy';
import { Munsell } from './_cs-munsell';
import { PCCS } from './_cs-pccs';

/**
 * Convert a color from one color space to another.
 * @param {number[]} vs a color of the color space 'from'
 * @param {string} from a color space name
 * @param {string=} [to='rgb'] a color space name
 * @return {number[]} a color of the color space 'to'
 */
export function convert(vs: Triplet, from: string, to: string | undefined = 'rgb'): Triplet {
	const type = from.toLowerCase() + '-' + to.toLowerCase();
	switch (type) {
		case 'yiq-rgb'     : return RGB.fromLRGB(LRGB.fromYIQ(vs));
		case 'lrgb-rgb'    : return RGB.fromLRGB(vs);
		case 'xyz-rgb'     : return RGB.fromLRGB(LRGB.fromXYZ(vs));
		case 'yxy-rgb'     : return RGB.fromLRGB(LRGB.fromXYZ(XYZ.fromYxy(vs)));
		case 'lab-rgb'     : return RGB.fromLRGB(LRGB.fromXYZ(XYZ.fromLab(vs)));
		case 'lms-rgb'     : return RGB.fromLRGB(LRGB.fromXYZ(XYZ.fromLMS(vs)));
		case 'munsell-rgb' : return RGB.fromLRGB(LRGB.fromXYZ(XYZ.fromMunsell(vs)));
		case 'pccs-rgb'    : return RGB.fromLRGB(LRGB.fromXYZ(XYZ.fromMunsell(Munsell.fromPCCS(vs))));

		case 'rgb-lrgb'    : return LRGB.fromRGB(vs);
		case 'yiq-lrgb'    : return LRGB.fromYIQ(vs);
		case 'xyz-lrgb'    : return LRGB.fromXYZ(vs);
		case 'yxy-lrgb'    : return LRGB.fromXYZ(XYZ.fromYxy(vs));
		case 'lab-lrgb'    : return LRGB.fromXYZ(XYZ.fromLab(vs));
		case 'lms-lrgb'    : return LRGB.fromXYZ(XYZ.fromLMS(vs));
		case 'munsell-lrgb': return LRGB.fromXYZ(XYZ.fromMunsell(vs));
		case 'pccs-lrgb'   : return LRGB.fromXYZ(XYZ.fromMunsell(Munsell.fromPCCS(vs)));

		case 'rgb-yiq'     : return YIQ.fromLRGB(LRGB.fromRGB(vs));
		case 'lrgb-yiq'    : return YIQ.fromLRGB(vs);
		case 'xyz-yiq'     : return YIQ.fromLRGB(LRGB.fromXYZ(vs));
		case 'yxy-yiq'     : return YIQ.fromLRGB(LRGB.fromXYZ(XYZ.fromYxy(vs)));
		case 'lab-yiq'     : return YIQ.fromLRGB(LRGB.fromXYZ(XYZ.fromLab(vs)));
		case 'lms-yiq'     : return YIQ.fromLRGB(LRGB.fromXYZ(XYZ.fromLMS(vs)));
		case 'munsell-yiq' : return YIQ.fromLRGB(LRGB.fromXYZ(XYZ.fromMunsell(vs)));
		case 'pccs-yiq'    : return YIQ.fromLRGB(LRGB.fromXYZ(XYZ.fromMunsell(Munsell.fromPCCS(vs))));

		case 'rgb-xyz'     : return XYZ.fromLRGB(LRGB.fromRGB(vs));
		case 'yiq-xyz'     : return XYZ.fromLRGB(LRGB.fromYIQ(vs));
		case 'lrgb-xyz'    : return XYZ.fromLRGB(vs);
		case 'yxy-xyz'     : return XYZ.fromYxy(vs);
		case 'lab-xyz'     : return XYZ.fromLab(vs);
		case 'lms-xyz'     : return XYZ.fromLMS(vs);
		case 'munsell-xyz' : return XYZ.fromMunsell(vs);
		case 'pccs-xyz'    : return XYZ.fromMunsell(Munsell.fromPCCS(vs));

		case 'rgb-yxy'     : return Yxy.fromXYZ(XYZ.fromLRGB(LRGB.fromRGB(vs)));
		case 'yiq-yxy'     : return Yxy.fromXYZ(XYZ.fromLRGB(LRGB.fromYIQ(vs)));
		case 'lrgb-yxy'    : return Yxy.fromXYZ(XYZ.fromLRGB(vs));
		case 'xyz-yxy'     : return Yxy.fromXYZ(vs);
		case 'lab-yxy'     : return Yxy.fromXYZ(XYZ.fromLab(vs));
		case 'lms-yxy'     : return Yxy.fromXYZ(XYZ.fromLMS(vs));
		case 'munsell-yxy' : return Yxy.fromXYZ(XYZ.fromMunsell(vs));
		case 'pccs-yxy'    : return Yxy.fromXYZ(XYZ.fromMunsell(Munsell.fromPCCS(vs)));

		case 'rgb-lab'     : return Lab.fromXYZ(XYZ.fromLRGB(LRGB.fromRGB(vs)));
		case 'yiq-lab'     : return Lab.fromXYZ(XYZ.fromLRGB(LRGB.fromYIQ(vs)));
		case 'lrgb-lab'    : return Lab.fromXYZ(XYZ.fromLRGB(vs));
		case 'xyz-lab'     : return Lab.fromXYZ(vs);
		case 'yxy-lab'     : return Lab.fromXYZ(XYZ.fromYxy(vs));
		case 'lms-lab'     : return Lab.fromXYZ(XYZ.fromLMS(vs));
		case 'munsell-lab' : return Lab.fromXYZ(XYZ.fromMunsell(vs));
		case 'pccs-lab'    : return Lab.fromXYZ(XYZ.fromMunsell(Munsell.fromPCCS(vs)));

		case 'rgb-lms'     : return LMS.fromXYZ(XYZ.fromLRGB(LRGB.fromRGB(vs)));
		case 'yiq-lms'     : return LMS.fromXYZ(XYZ.fromLRGB(LRGB.fromYIQ(vs)));
		case 'lrgb-lms'    : return LMS.fromXYZ(XYZ.fromLRGB(vs));
		case 'xyz-lms'     : return LMS.fromXYZ(vs);
		case 'yxy-lms'     : return LMS.fromXYZ(XYZ.fromYxy(vs));
		case 'lab-lms'     : return LMS.fromXYZ(XYZ.fromLab(vs));
		case 'munsell-lms' : return LMS.fromXYZ(XYZ.fromMunsell(vs));
		case 'pccs-lms'    : return LMS.fromXYZ(XYZ.fromMunsell(Munsell.fromPCCS(vs)));

		case 'rgb-munsell' : return Munsell.fromXYZ(XYZ.fromLRGB(LRGB.fromRGB(vs)));
		case 'yiq-munsell' : return Munsell.fromXYZ(XYZ.fromLRGB(LRGB.fromYIQ(vs)));
		case 'lrgb-munsell': return Munsell.fromXYZ(XYZ.fromLRGB(vs));
		case 'xyz-munsell' : return Munsell.fromXYZ(vs);
		case 'yxy-munsell' : return Munsell.fromXYZ(XYZ.fromYxy(vs));
		case 'lab-munsell' : return Munsell.fromXYZ(XYZ.fromLab(vs));
		case 'lms-munsell' : return Munsell.fromXYZ(XYZ.fromLMS(vs));
		case 'pccs-munsell': return Munsell.fromPCCS(vs);

		case 'rgb-pccs'    : return PCCS.fromMunsell(Munsell.fromXYZ(XYZ.fromLRGB(LRGB.fromRGB(vs))));
		case 'yiq-pccs'    : return PCCS.fromMunsell(Munsell.fromXYZ(XYZ.fromLRGB(LRGB.fromYIQ(vs))));
		case 'lrgb-pccs'   : return PCCS.fromMunsell(Munsell.fromXYZ(XYZ.fromLRGB(vs)));
		case 'xyz-pccs'    : return PCCS.fromMunsell(Munsell.fromXYZ(vs));
		case 'yxy-pccs'    : return PCCS.fromMunsell(Munsell.fromXYZ(XYZ.fromYxy(vs)));
		case 'lab-pccs'    : return PCCS.fromMunsell(Munsell.fromXYZ(XYZ.fromLab(vs)));
		case 'lms-pccs'    : return PCCS.fromMunsell(Munsell.fromXYZ(XYZ.fromLMS(vs)));
		case 'munsell-pccs': return PCCS.fromMunsell(vs);
	}
	return vs;
}

export function isRGBSaturated(): boolean {
	return RGB.isSaturated;
}

export function isYxySaturated(): boolean {
	return Yxy.isSaturated;
}

export function isMunsellSaturated(): boolean {
	return Munsell.isSaturated;
}
