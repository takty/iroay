import { describe, expect, it } from 'vitest';

import { labToElderlyAB, labToYoungAB } from '../../sim/age';

describe('sim/age', () => {
	it('keeps neutral Lab values unchanged', () => {
		expect(labToElderlyAB([50, 0, 0])).toEqual([50, 0, 0]);
		expect(labToYoungAB([50, 0, 0])[0]).toBe(50);
		expect(labToYoungAB([50, 0, 0])[1]).toBe(0);
		expect(labToYoungAB([50, 0, 0])[2]).toBeCloseTo(0, 12);
	});
});