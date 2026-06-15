import { describe, expect, it } from 'vitest';

import { CATEGORICAL_COLORS, categoryOfXyy } from '../../eval/category';

describe('eval/category', () => {
	it('returns one of the categorical colors', () => {
		for (const sample of [
			[0.30, 0.30, 0.10],
			[0.30, 0.30, 0.50],
			[0.20, 0.25, 0.30],
		]) {
			expect(CATEGORICAL_COLORS).toContain(categoryOfXyy(sample as [number, number, number]));
		}
	});
});