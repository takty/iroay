import { describe, expect, it } from 'vitest';

import {
	brettelD,
	brettelP,
	lmsToDeuteranopia,
	lmsToProtanopia,
	setOkajimaCorrectionOption,
} from '../../sim/color-vision';

describe('sim/color-vision', () => {
	it('simulates protanopia and deuteranopia', () => {
		setOkajimaCorrectionOption(false);

		expect(brettelP([1, 2, 3])[0]).toBeCloseTo(-3.53055, 5);
		expect(brettelP([1, 2, 3])[1]).toBe(2);
		expect(brettelP([1, 2, 3])[2]).toBe(3);

		expect(brettelD([1, 2, 3])[0]).toBe(1);
		expect(brettelD([1, 2, 3])[1]).toBeCloseTo(4.239017, 6);
		expect(brettelD([1, 2, 3])[2]).toBe(3);

		expect(lmsToProtanopia([1, 2, 3])[0]).toBeCloseTo(-3.53055, 5);
		expect(lmsToProtanopia([1, 2, 3])[1]).toBe(2);
		expect(lmsToProtanopia([1, 2, 3])[2]).toBe(3);

		expect(lmsToDeuteranopia([1, 2, 3])[0]).toBe(1);
		expect(lmsToDeuteranopia([1, 2, 3])[1]).toBeCloseTo(4.239017, 6);
		expect(lmsToDeuteranopia([1, 2, 3])[2]).toBe(3);
	});
});