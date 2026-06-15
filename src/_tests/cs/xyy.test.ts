import { describe, expect, it } from 'vitest';

import { fromXyz, isSaturated, toXyz } from '../../cs/xyy';

describe('cs/xyy', () => {
	it('round-trips a representative XYZ color', () => {
		const xyz: [number, number, number] = [0.25, 0.5, 0.75];
		const xyy = fromXyz(xyz);
		const back = toXyz(xyy);

		expect(back[0]).toBeCloseTo(xyz[0], 6);
		expect(back[1]).toBeCloseTo(xyz[1], 6);
		expect(back[2]).toBeCloseTo(xyz[2], 6);
	});

	it('marks impossible zero division inputs as non-saturated', () => {
		toXyz([0, 0, 0]);
		expect(isSaturated).toBe(false);
	});
});