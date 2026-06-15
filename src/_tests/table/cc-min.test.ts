import { describe, expect, it } from 'vitest';

import { CC_TABLE } from '../../table/cc-min';

describe('table/cc-min', () => {
	it('exposes the categorical color lookup tables', () => {
		expect(Object.keys(CC_TABLE).sort()).toEqual(['10', '2', '20', '30', '40', '5']);
		expect(CC_TABLE[2].length).toBeGreaterThan(200);
		expect(CC_TABLE[10]).toContain('a');
	});
});