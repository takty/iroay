import { describe, expect, it } from 'vitest';

import { fromXyz, toXyz } from '../../cs/lrgb';

describe('cs/lrgb', () => {
	it('round-trips a representative XYZ color', () => {
		const xyz: [number, number, number] = [0.25, 0.5, 0.75];
		const lrgb = fromXyz(xyz);
		const back = toXyz(lrgb);

		expect(back[0]).toBeCloseTo(xyz[0], 6);
		expect(back[1]).toBeCloseTo(xyz[1], 6);
		expect(back[2]).toBeCloseTo(xyz[2], 6);
	});

	it('keeps black at zero', () => {
		expect(fromXyz([0, 0, 0])).toEqual([0, 0, 0]);
		expect(toXyz([0, 0, 0])).toEqual([0, 0, 0]);
	});
});