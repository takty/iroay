import { describe, expect, it } from 'vitest';

import { conspicuityOfLab } from '../../eval/conspicuity';

describe('eval/conspicuity', () => {
	it('computes a neutral and a vertical hue case', () => {
		expect(conspicuityOfLab([50, 0, 0])).toBe(145);
		expect(conspicuityOfLab([50, 0, 10])).toBe(125);
	});
});