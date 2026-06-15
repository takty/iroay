import { describe, expect, it } from 'vitest';

import { TBL_SRC_MIN, TBL_V } from '../../table/hc2xy-real-min';

describe('table/hc2xy-real-min', () => {
	it('exposes the real table data', () => {
		expect(TBL_V).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
		expect(TBL_SRC_MIN[0][0]).toEqual([0, 363, 271, -334, -300, -6, 4, -2, 0, -5, 4, -1, 1]);
	});
});