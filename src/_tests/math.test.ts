import { describe, it, expect } from 'vitest';
import { atan2rad, mag, DEG_RAD, RAD_DEG, PI2 } from '../math';

describe('Math utilities', () => {
	describe('atan2rad', () => {
		it('returns 0 for positive x-axis', () => {
			const result = atan2rad(0, 1);
			expect(result).toBe(0);
		});

		it('returns π/2 for positive y-axis', () => {
			const result = atan2rad(1, 0);
			expect(result).toBeCloseTo(Math.PI / 2, 5);
		});

		it('returns π for negative x-axis', () => {
			const result = atan2rad(0, -1);
			expect(result).toBeCloseTo(Math.PI, 5);
		});

		it('returns 2π for negative y-axis', () => {
			const result = atan2rad(-1, 0);
			expect(result).toBeCloseTo(Math.PI * 3 / 2, 5);
		});
	});

	describe('mag', () => {
		it('calculates magnitude of 3-4-5 triangle', () => {
			const result = mag(3, 4);
			expect(result).toBe(5);
		});

		it('calculates magnitude of unit vector', () => {
			const result = mag(1, 0);
			expect(result).toBe(1);
		});

		it('handles zero vector', () => {
			const result = mag(0, 0);
			expect(result).toBe(0);
		});

		it('handles negative coordinates', () => {
			const result = mag(-3, -4);
			expect(result).toBe(5);
		});
	});

	describe('Constants', () => {
		it('DEG_RAD is correct', () => {
			expect(DEG_RAD).toBe(Math.PI / 180);
		});

		it('RAD_DEG is correct', () => {
			expect(RAD_DEG).toBe(180 / Math.PI);
		});

		it('PI2 is correct', () => {
			expect(PI2).toBe(Math.PI * 2);
		});
	});
});
