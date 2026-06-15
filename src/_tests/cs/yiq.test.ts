import { describe, expect, it } from 'vitest';

import { fromLrgb, toLrgb } from '../../cs/yiq';

describe('cs/yiq', () => {
	it('round-trips a representative linear RGB color', () => {
		const source: [number, number, number] = [0.2, 0.4, 0.6];
		const yiq = fromLrgb(source);
		const back = toLrgb(yiq);

		expect(back[0]).toBeCloseTo(source[0], 5);
		expect(back[1]).toBeCloseTo(source[1], 5);
		expect(back[2]).toBeCloseTo(source[2], 5);
	});

	it('keeps black at zero', () => {
		expect(fromLrgb([0, 0, 0])).toEqual([0, 0, 0]);
		expect(toLrgb([0, 0, 0])).toEqual([0, 0, 0]);
	});
});