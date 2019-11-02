/**
 *
 * Basic Categorical Colors
 *
 * @author Takuto Yanagida
 * @version 2019-10-14
 */


class BasicCategoricalColor {

	/**
	 * Find the Basic categorical color of the specified color.
	 * @param sy Y of Yxy color
	 * @param sx Small x of Yxy color
	 * @param sy Small y of Yxy color
	 * @return Basic categorical color
	 */
	static categoryOfYxy(y, sx, sy) {
		const lum = Math.pow(y * this._Y_TO_LUM, 0.9);  // magic number

		let diff = Number.MAX_VALUE;
		let clum = 0;
		for (let l of this._LUM_TABLE) {
			const d = Math.abs(lum - l);
			if (d < diff) {
				diff = d;
				clum = l;
			}
		}
		let dis = Number.MAX_VALUE;
		let cc = 1;
		for (let ent of this._CC_TABLE) {
			if (ent[0] != clum) continue;
			const d = Math.sqrt((sx - ent[1]) * (sx - ent[1]) + (sy - ent[2]) * (sy - ent[2]));
			if (d < dis) {
				dis = d;
				cc = ent[3];
			}
		}
		return this.COLORS[cc];
	}

}

BasicCategoricalColor.COLORS = [
	'white', 'black', 'red', 'green',
	'yellow', 'blue', 'brown', 'purple',
	'pink', 'orange', 'gray',
];

BasicCategoricalColor._Y_TO_LUM = 60.0;

BasicCategoricalColor._LUM_TABLE = [2, 5, 10, 20, 30, 40];

//=
//=include table/_cc.js
