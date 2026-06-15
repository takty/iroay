import { describe, expect, it } from 'vitest';

import { D50_XYZ, D50_xyz, D65_XYZ, D65_xyz } from '../const';

describe('Color constants', () => {
	it('defines D50 tristimulus values', () => {
		expect(D50_xyz).toEqual([0.34567, 0.3585, 0.29583]);
		expect(D50_XYZ[0]).toBeCloseTo(0.964, 3);
		expect(D50_XYZ[1]).toBe(1);
		expect(D50_XYZ[2]).toBeCloseTo(0.825, 3);
	});

	it('defines D65 tristimulus values', () => {
		expect(D65_xyz).toEqual([0.31273, 0.32902, 0.35825]);
		expect(D65_XYZ[0]).toBeCloseTo(0.95, 3);
		expect(D65_XYZ[1]).toBe(1);
		expect(D65_XYZ[2]).toBeCloseTo(1.089, 3);
	});
});