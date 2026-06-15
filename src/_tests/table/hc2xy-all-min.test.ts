import { describe, expect, it } from 'vitest';

import { TBL_SRC_MIN, TBL_V } from '../../table/hc2xy-all-min';

describe('table/hc2xy-all-min', () => {
	it('exposes the sampled table data', () => {
		expect(TBL_V).toEqual([0.2, 0.4, 0.6, 0.8, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
		expect(TBL_SRC_MIN[0][0]).toEqual([0, 404, 164, -384, -203, -9, 17]);
	});
});