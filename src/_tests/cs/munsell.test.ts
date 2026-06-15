import { describe, expect, it } from 'vitest';

import { fromXyz, hueNameToHueValue, hueValueToHueName, toString, toXyz } from '../../cs/munsell';

describe('cs/munsell', () => {
	it('handles achromatic colors', () => {
		expect(fromXyz([0, 0, 0])).toEqual([0, 0, 0]);
		expect(toXyz([0, 0, 0])).toEqual([0, 0, 0]);
		expect(hueNameToHueValue('N')).toBe(-1);
		expect(hueValueToHueName(0, 0)).toBe('N');
		expect(toString([0, 5, 0])).toBe('N 5');
	});

	it('formats a chromatic hue name', () => {
		expect(hueNameToHueValue('5R')).toBe(5);
	});
});