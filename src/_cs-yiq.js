/**
 *
 * This class converts the YIQ color system.
 * Reference: http://en.wikipedia.org/wiki/YIQ
 *
 * @author Takuto Yanagida
 * @version 2020-12-07
 *
 */


class YIQ {

	/**
	 * Convert Linear RGB to YIQ.
	 * @param {number[]} lrgb Linear RGB color
	 * @return {number[]} YIQ color
	 */
	static fromLRGB([lr, lg, lb]) {
		return [
			0.2990   * lr +  0.5870   * lg +  0.1140   * lb,  // Y[0, 1]
			0.595716 * lr + -0.274453 * lg + -0.321263 * lb,  // I[-0.5957, 0.5957]
			0.211456 * lr + -0.522591 * lg +  0.311135 * lb,  // Q[-0.5226, 0.5226]
		];
	}

	/**
	 * Convert YIQ to Linear RGB.
	 * @param {number[]} yiq YIQ color
	 * @return {number[]} Linear RGB color
	 */
	static toLRGB([y, i, q]) {
		return [
			y +  0.9563 * i +  0.6210 * q,  // R[0, 1]
			y + -0.2721 * i + -0.6474 * q,  // G[0, 1]
			y + -1.1070 * i +  1.7046 * q,  // B[0, 1]
		];
	}

}