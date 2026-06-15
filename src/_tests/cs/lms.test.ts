import { describe, expect, it } from 'vitest';

import { ConversionMethod, SMITH_POKORNY, fromXyz, setConversionMethod, toXyz } from '../../cs/lms';

describe('cs/lms', () => {
	it('round-trips zero through XYZ', () => {
		expect(fromXyz([0, 0, 0])).toEqual([0, 0, 0]);
		expect(toXyz([0, 0, 0])).toEqual([0, 0, 0]);
	});

	it('switches conversion methods', () => {
		const source: [number, number, number] = [0.25, 0.5, 0.75];
		const previous = ConversionMethod.SMITH_POKORNY;

		setConversionMethod(ConversionMethod.VON_KRIES);
		const roundTrip = toXyz(fromXyz(source));
		setConversionMethod(previous);

		expect(ConversionMethod.SMITH_POKORNY.direct).toBe(SMITH_POKORNY);
		expect(ConversionMethod.SMITH_POKORNY.inverse).toBeDefined();
		expect(roundTrip[0]).toBeCloseTo(source[0], 6);
		expect(roundTrip[1]).toBeCloseTo(source[1], 6);
		expect(roundTrip[2]).toBeCloseTo(source[2], 6);
	});
});