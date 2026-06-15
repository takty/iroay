import { describe, expect, it } from 'vitest';

import { fromRgb, toRgb } from '../../cs/hsl';

describe('cs/hsl', () => {
	it('converts red between RGB and HSL', () => {
		expect(fromRgb([255, 0, 0])).toEqual([0, 100, 50]);
		expect(toRgb([0, 100, 50])).toEqual([255, 0, 0]);
	});

	it('round-trips a representative color', () => {
		const rgb: [number, number, number] = [32, 128, 224];
		const hsl = fromRgb(rgb);
		const back = toRgb(hsl);

		expect(back[0]).toBeCloseTo(rgb[0], 0);
		expect(back[1]).toBeCloseTo(rgb[1], 0);
		expect(back[2]).toBeCloseTo(rgb[2], 0);
	});
});