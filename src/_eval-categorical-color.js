/**
 *
 * Basic Categorical Colors
 *
 * @author Takuto Yanagida
 * @version 2020-11-27
 */


class CategoricalColor {

	/**
	 * Find the Basic categorical color of the specified color.
	 * @param sy Y of Yxy color
	 * @param sx Small x of Yxy color
	 * @param sy Small y of Yxy color
	 * @return Basic categorical color
	 */
	static categoryOfYxy(y, sx, sy) {
		const lum = Math.pow(y * CategoricalColor._Y_TO_LUM, 0.9);  // magic number

		let diff = Number.MAX_VALUE;
		let clum = 0;
		for (let l of CategoricalColor._LUM_TABLE) {
			const d = Math.abs(lum - l);
			if (d < diff) {
				diff = d;
				clum = l;
			}
		}
		const t = CategoricalColor._CC_TABLE[clum];
		sx *= 1000;
		sy *= 1000;
		let dis = Number.MAX_VALUE;
		let cc = 1;
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
		const ci = (cc === 'a') ? 10 : parseInt(cc);
		return CategoricalColor.COLORS[ci];
	}

}

CategoricalColor.COLORS = [
	'white', 'black', 'red', 'green',
	'yellow', 'blue', 'brown', 'purple',
	'pink', 'orange', 'gray',
];
CategoricalColor._Y_TO_LUM = 60;
CategoricalColor._LUM_TABLE = [2, 5, 10, 20, 30, 40];

//=
//=include table/_cc-min.js