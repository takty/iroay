/**
 * Functions for Color Object
 *
 * @author Takuto Yanagida
 * @version 2025-02-25
 */

import { Color, ColorSpace } from './color';
import * as Util from './util';

/**
 * Creates a Color object based on the integer.
 * @param i Integer.
 * @returns A Color object.
 */
export function fromInteger(i: number): Color {
	return new Color(ColorSpace.Rgb, Util.fromInteger(i | 0xff000000));
}

/**
 * Parses a color string in various formats and returns a corresponding Color object.
 *
 * @param {string} str - The color string to parse.
 * @returns {Color | null} A Color object if parsing is successful; otherwise, null.
 */
export function fromString(str: string): Color | null {
	let cs: any = null;
	if (cs = Util.parseRgb(str)) return new Color(ColorSpace.Rgb, [cs[0], cs[1], cs[2]], cs[3]);
	if (cs = Util.parseHex(str)) return new Color(ColorSpace.Rgb, [cs[0], cs[1], cs[2]], cs[3]);
	if (cs = Util.parseHsl(str)) return new Color(ColorSpace.Hsl, [cs[0], cs[1], cs[2]], cs[3]);
	if (cs = Util.parseLab(str)) return new Color(ColorSpace.Lab, [cs[0], cs[1], cs[2]], cs[3]);
	if (cs = Util.parseLch(str)) return new Color(ColorSpace.Lch, [cs[0], cs[1], cs[2]], cs[3]);
	return null;
}


// -----------------------------------------------------------------------------


/**
 * Returns a CSS color string of RGB format.
 * @returns A string representation.
 */
export function toStringRgb(c: Color): string {
	return Util.stringifyRgb([...c.asRgb(), c.alpha() as number]);
}

/**
 * Returns a CSS color string of HEX format.
 * @returns A string representation.
 */
export function toStringHex(c: Color): string {
	return Util.stringifyHex([...c.asRgb(), c.alpha() as number]);
}

/**
 * Returns a CSS color string of HSL format.
 * @returns A string representation.
 */
export function toStringHsl(c: Color): string {
	return Util.stringifyHsl([...c.asHsl(), c.alpha() as number]);
}

/**
 * Returns a CSS color string of Lab format.
 * @returns A string representation.
 */
export function toStringLab(c: Color): string {
	return Util.stringifyLab([...c.asLab(), c.alpha() as number]);
}

/**
 * Returns a CSS color string of LCH format.
 * @returns A string representation.
 */
export function toStringLch(c: Color): string {
	return Util.stringifyLch([...c.asLch(), c.alpha() as number]);
}
