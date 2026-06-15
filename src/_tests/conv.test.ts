import { describe, expect, it } from 'vitest';

import { convert, getConverter } from '../conv';

describe('Conversion helpers', () => {
	it('converts HSL to RGB', () => {
		expect(convert([0, 100, 50], 'hsl')).toEqual([255, 0, 0]);
		expect(getConverter('hsl')([0, 100, 50])).toEqual([255, 0, 0]);
	});

	it('falls back to identity for unsupported conversions', () => {
		const input: [number, number, number] = [1, 2, 3];
		const converter = getConverter('unknown', 'also-unknown');

		expect(convert(input, 'unknown', 'also-unknown')).toBe(input);
		expect(converter(input)).toBe(input);
	});
});