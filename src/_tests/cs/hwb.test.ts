import { describe, expect, it } from 'vitest';

import { fromRgb, toRgb } from '../../cs/hwb';

describe('cs/hwb', () => {
	it('converts red between RGB and HWB', () => {
		expect(fromRgb([255, 0, 0])).toEqual([0, 0, 0]);
		expect(toRgb([0, 0, 0])).toEqual([255, 0, 0]);
	});
});