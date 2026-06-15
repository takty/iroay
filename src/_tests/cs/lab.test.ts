import { describe, expect, it } from 'vitest';

import { D65_XYZ } from '../../const';
import { fromXyz, lightnessFromXyz, toXyz } from '../../cs/lab';

describe('cs/lab', () => {
	it('maps the D65 white point to L*=100', () => {
		expect(lightnessFromXyz(D65_XYZ)).toBe(100);
		expect(fromXyz(D65_XYZ)).toEqual([100, 0, 0]);
	});

	it('round-trips neutral Lab values', () => {
		expect(toXyz([100, 0, 0])[0]).toBeCloseTo(D65_XYZ[0], 6);
		expect(toXyz([100, 0, 0])[1]).toBeCloseTo(D65_XYZ[1], 6);
		expect(toXyz([100, 0, 0])[2]).toBeCloseTo(D65_XYZ[2], 6);
	});
});