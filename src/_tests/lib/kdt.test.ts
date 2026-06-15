import { describe, expect, it } from 'vitest';

import { Tree } from '../../lib/kdt';

describe('lib/kdt', () => {
	it('finds neighbors in distance order', () => {
		const tree = new Tree([
			[[0, 0], [1, 1]],
			[[3, 0], [2, 2]],
			[[0, 4], [3, 3]],
		]);

		expect(tree.neighbors([0, 0], 2)).toEqual([
			[[1, 1], 0],
			[[2, 2], 3],
		]);
	});
});