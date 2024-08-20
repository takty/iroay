/**
 * Determination of the basic categorical color.
 *
 * @author Takuto Yanagida
 * @version 2024-08-19
 */

import { Triplet } from './../type';
import { CC_TABLE } from './../table/cc-min';
import { mag } from '../math';

/**
 * Basic Categorical Colors
 */
export const CATEGORICAL_COLORS = [
	'white', 'black', 'red', 'green',
	'yellow', 'blue', 'brown', 'purple',
	'pink', 'orange', 'gray',
];

const Y_TO_LUM = 60;

const LUM_TABLE = [2, 5, 10, 20, 30, 40];

/**
 * Find the basic categorical color of the specified color.
 * @param {Triplet} yxy Yxy color
 * @return {string} Basic categorical color
 */
export function categoryOfYxy([y, sx, sy]: Triplet): string {
	const lum = Math.pow(y * Y_TO_LUM, 0.9);  // magic number

	let diff = Number.MAX_VALUE;
	let clu = 0;
	for (let l of LUM_TABLE) {
		const d = Math.abs(lum - l);
		if (d < diff) {
			diff = d;
			clu = l;
		}
	}
	const t: string = CC_TABLE[clu as 2|5|10|20|30|40] as string;
	sx *= 1000;
	sy *= 1000;
	let dis = Number.MAX_VALUE;
	let cc: number|string = 1;
	for (let i = 0; i < 18 * 21; i += 1) {
		if (t[i] === '.') continue;
		const x = (i % 18) * 25 + 150;
		const y = ((i / 18) | 0) * 25 + 75;
		const d = mag(sx - x, sy - y);
		if (d < dis) {
			dis = d;
			cc = t[i];
		}
	}
	const ci = (cc === 'a') ? 10 : parseInt(cc as string);
	return CATEGORICAL_COLORS[ci];
}
