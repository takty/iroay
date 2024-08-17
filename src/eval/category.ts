/**
 * Evaluation Methods (Category)
 *
 * @author Takuto Yanagida
 * @version 2024-08-17
 */

import { Triplet } from './../type';
import { CC_TABLE } from './../table/cc-min';

export class Category {


	// Determination of the basic categorical color ----------------------------


	/**
	 * Find the basic categorical color of the specified color.
	 * @param {Triplet} yxy Yxy color
	 * @return {string} Basic categorical color
	 */
	static categoryOfYxy([y, sx, sy]: Triplet): string {
		const lum = Math.pow(y * Category._Y_TO_LUM, 0.9);  // magic number

		let diff = Number.MAX_VALUE;
		let clu = 0;
		for (let l of Category._LUM_TABLE) {
			const d = Math.abs(lum - l);
			if (d < diff) {
				diff = d;
				clu = l;
			}
		}
		const t: string = Category._CC_TABLE[clu as 2|5|10|20|30|40] as string;
		sx *= 1000;
		sy *= 1000;
		let dis = Number.MAX_VALUE;
		let cc: number|string = 1;
		for (let i = 0; i < 18 * 21; i += 1) {
			if (t[i] === '.') continue;
			const x = (i % 18) * 25 + 150;
			const y = ((i / 18) | 0) * 25 + 75;
			const d = Math.sqrt((sx - x) * (sx - x) + (sy - y) * (sy - y));
			if (d < dis) {
				dis = d;
				cc = t[i];
			}
		}
		const ci = (cc === 'a') ? 10 : parseInt(cc as string);
		return Category.CATEGORICAL_COLORS[ci];
	}

	/**
	 * Basic Categorical Colors
	 */
	static CATEGORICAL_COLORS = [
		'white', 'black', 'red', 'green',
		'yellow', 'blue', 'brown', 'purple',
		'pink', 'orange', 'gray',
	];
	private static _Y_TO_LUM = 60;
	private static _LUM_TABLE = [2, 5, 10, 20, 30, 40];

	private static _CC_TABLE = CC_TABLE;

}
