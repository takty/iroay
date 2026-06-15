import { expectTypeOf, describe, it } from 'vitest';

import type { Pair, Quartet, Triplet } from '../type';

describe('Type aliases', () => {
	it('define tuple shapes', () => {
		expectTypeOf<Pair>().toEqualTypeOf<[number, number]>();
		expectTypeOf<Triplet>().toEqualTypeOf<[number, number, number]>();
		expectTypeOf<Quartet>().toEqualTypeOf<[number, number, number, number]>();
	});
});