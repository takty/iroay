import { describe, expect, it } from 'vitest';

import {
	ConversionMethod,
	Tone,
	absoluteLightness,
	conversionMethod,
	fromMunsell,
	relativeLightness,
	setConversionMethod,
	tone,
	toMunsell,
	toNormalCoordinate,
	toString,
	toToneCoordinate,
	toToneString,
	toHueString,
} from '../../cs/pccs';

describe('cs/pccs', () => {
	it('converts tone coordinates back and forth', () => {
		const source: [number, number, number] = [12, 5, 4];
		const toneCoordinate = toToneCoordinate(source);
		const back = toNormalCoordinate(toneCoordinate);

		expect(toneCoordinate[0]).toBe(12);
		expect(back[0]).toBe(12);
		expect(back[1]).toBeCloseTo(source[1], 10);
		expect(back[2]).toBe(4);
	});

	it('formats monochrome PCCS values', () => {
		const mono: [number, number, number] = [0, 5, 0];

		expect(tone(mono)).toBe(Tone.none);
		expect(toHueString(mono)).toBe('N');
		expect(toToneString(mono)).toBe('Gy');
		expect(toString(mono)).toBe('Gy-5 N-5');
	});

	it('keeps the conversion method configurable', () => {
		setConversionMethod(ConversionMethod.Concise);
		expect(conversionMethod).toBe(ConversionMethod.Concise);
		setConversionMethod(ConversionMethod.Accurate);
		expect(conversionMethod).toBe(ConversionMethod.Accurate);
	});

	it('inverts relative and absolute lightness', () => {
		const source: [number, number, number] = [12, 5, 4];
		const relative = relativeLightness(source);
		const absolute = absoluteLightness([source[0], relative, source[2]]);

		expect(absolute).toBeCloseTo(source[1], 10);
	});
});