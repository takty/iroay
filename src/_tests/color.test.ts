import { describe, expect, it } from 'vitest';

import { Color, ColorSpace } from '../color';

describe('Color', () => {
	it('represents an empty color by default', () => {
		expect(new Color().toString()).toBe('empty');
	});

	it('stores RGB colors and converts them to integers', () => {
		const color = new Color(ColorSpace.Rgb, [17, 34, 51]);

		expect(color.toString()).toBe('Rgb[17, 34, 51]');
		expect(color.alpha()).toBe(1);
		expect(color.asInteger() >>> 0).toBe(0xff112233);
	});

	it('converts HSL colors to RGB', () => {
		const color = new Color(ColorSpace.Hsl, [0, 100, 50]);

		expect(color.asRgb()).toEqual([255, 0, 0]);
		expect(color.toString()).toBe('Hsl[0, 100, 50]');
	});

	it('updates alpha and color space with set', () => {
		const color = new Color(ColorSpace.Rgb, [1, 2, 3]);

		color.set(ColorSpace.Hsl, [240, 100, 50], 0.5);

		expect(color.alpha()).toBe(0.5);
		expect(color.toString()).toBe('Hsl[240, 100, 50, 0.5]');
	});

	it('reports zero difference to itself', () => {
		const color = new Color(ColorSpace.Rgb, [255, 0, 0]);

		expect(color.differenceFrom(color)).toBe(0);
	});
});