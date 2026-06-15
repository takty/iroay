import { describe, expect, it } from 'vitest';

import { fromHsl, fromLrgb, toHsl, toLrgb, MAX, MIN } from '../../cs/rgb';

describe('cs/rgb', () => {
	it('defines the RGB range', () => {
		expect(MIN).toBe(0);
		expect(MAX).toBe(255);
	});

	it('round-trips the primary red channel', () => {
		expect(fromLrgb([1, 0, 0])).toEqual([254, 0, 0]);
		expect(toLrgb([255, 0, 0])).toEqual([1, 0, 0]);
		expect(fromHsl([0, 100, 50])).toEqual([255, 0, 0]);
		expect(toHsl([255, 0, 0])).toEqual([0, 100, 50]);
	});
});