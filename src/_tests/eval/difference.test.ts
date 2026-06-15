import { describe, expect, it } from 'vitest';

import { DE_TO_NBS, NBS, CIE76, CIEDE2000, distance } from '../../eval/difference';

describe('eval/difference', () => {
	it('computes vector distances', () => {
		expect(distance([1, 2, 3], [4, 6, 3])).toBe(5);
		expect(CIE76([1, 2, 3], [4, 6, 3])).toBe(5);
	});

	it('computes perceptual color difference', () => {
		expect(CIEDE2000([50, 0, 0], [50, 0, 0])).toBe(0);
		expect(DE_TO_NBS).toBeCloseTo(0.92, 2);
		expect(NBS.Trace).toBe(0);
	});
});