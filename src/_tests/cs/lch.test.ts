import { describe, expect, it } from 'vitest';

import { fromLab, toLab } from '../../cs/lch';

describe('cs/lch', () => {
	it('converts neutral Lab values without changing them', () => {
		expect(fromLab([50, 0, 0])).toEqual([50, 0, 0]);
		expect(toLab([50, 0, 0])).toEqual([50, 0, 0]);
	});

	it('round-trips a chromatic color', () => {
		expect(toLab(fromLab([50, 10, 0]))).toEqual([50, 10, 0]);
	});
});