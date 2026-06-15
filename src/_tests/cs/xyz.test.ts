import { describe, expect, it } from 'vitest';

import { fromIlluminantC, toIlluminantC } from '../../cs/xyz';

describe('cs/xyz', () => {
	it('round-trips the illuminant C conversion', () => {
		const source: [number, number, number] = [0.1, 0.2, 0.3];
		const c = fromIlluminantC(source);
		const back = toIlluminantC(c);

		expect(back[0]).toBeCloseTo(source[0], 6);
		expect(back[1]).toBeCloseTo(source[1], 6);
		expect(back[2]).toBeCloseTo(source[2], 6);
	});

	it('keeps zero at zero', () => {
		expect(fromIlluminantC([0, 0, 0])).toEqual([0, 0, 0]);
		expect(toIlluminantC([0, 0, 0])).toEqual([0, 0, 0]);
	});
});