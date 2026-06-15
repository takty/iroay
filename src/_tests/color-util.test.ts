import { describe, expect, it } from 'vitest';

import { ColorSpace } from '../color';
import * as ColorUtil from '../color-util';

describe('ColorUtil', () => {
	it('creates Color objects from integers and strings', () => {
		const fromInteger = ColorUtil.fromInteger(0x112233);
		expect(fromInteger.toString()).toBe('Rgb[17, 34, 51]');
		expect(fromInteger.alpha()).toBe(1);

		const fromString = ColorUtil.fromString('rgb(255 0 128 / 0.5)');
		expect(fromString).not.toBeNull();
		expect(fromString?.toString()).toBe('Rgb[255, 0, 128, 0.5]');
		expect(fromString?.alpha()).toBe(0.5);
		expect(fromString?.as(ColorSpace.Rgb)).toEqual([255, 0, 128]);
	});

	it('formats Color objects back to CSS strings', () => {
		const color = ColorUtil.fromString('hsl(0 100% 50%)');
		expect(color).not.toBeNull();
		expect(ColorUtil.toStringRgb(color as NonNullable<typeof color>)).toBe('rgb(255 0 0)');
		expect(ColorUtil.toStringHex(color as NonNullable<typeof color>)).toBe('#ff0000');
		expect(ColorUtil.toStringHsl(color as NonNullable<typeof color>)).toBe('hsl(0 100% 50%)');
	});
});