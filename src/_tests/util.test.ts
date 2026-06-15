import { describe, expect, it } from 'vitest';

import {
	fromInteger,
	parseHsl,
	parseHex,
	parseLab,
	parseLch,
	parseRgb,
	stringifyHsl,
	stringifyHex,
	stringifyLab,
	stringifyLch,
	stringifyRgb,
	toInteger,
} from '../util';

describe('Utility helpers', () => {
	it('converts color integers and RGB arrays', () => {
		expect(fromInteger(0x112233)).toEqual([17, 34, 51]);
		expect(toInteger([17, 34, 51]) >>> 0).toBe(0xff112233);
	});

	it('parses CSS color strings', () => {
		expect(parseRgb('rgb(100% 0% 50% / 25%)')).toEqual([255, 0, 127, 0.25]);
		expect(parseHex('#ff0080')).toEqual([255, 0, 128, 1]);
		expect(parseHsl('hsl(120 50% 25% / 0.5)')).toEqual([120, 50, 25, 0.5]);
		expect(parseLab('lab(50% 20 -30 / 0.8)')).toEqual([50, 20, -30, 0.8]);
		expect(parseLch('lch(50% 40 250deg / 0.8)')).toEqual([50, 40, 250, 0.8]);
	});

	it('stringifies CSS color arrays', () => {
		expect(stringifyRgb([255, 0, 128, 0.25])).toBe('rgb(255 0 128 / 0.25)');
		expect(stringifyHex([255, 0, 128, 0.5])).toBe('#ff008080');
		expect(stringifyHsl([120, 50, 25, 0.5])).toBe('hsl(120 50% 25% / 0.5)');
		expect(stringifyLab([50, 20, -30, 0.8])).toBe('lab(50% 20 -30 / 0.8)');
		expect(stringifyLch([50, 40, 250, 0.8])).toBe('lch(50% 40 250 / 0.8)');
	});
});