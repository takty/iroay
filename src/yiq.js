/**
 *
 * This class converts the YIQ color system.
 * Reference: http://en.wikipedia.org/wiki/YIQ
 *
 * @author Takuto Yanagida
 * @version 2019-09-29
 *
 */


class YIQ extends ColorSpace {

	/**
	 * Convert Linear RGB to YIQ.
	 * @param src Linear RGB color
	 * @return YIQ color
	 */
	static fromLRGB(src) {
		return [
			0.2990   * src[0] +  0.5870   * src[1] +  0.1140   * src[2],  // Y[0, 1]
			0.595716 * src[0] + -0.274453 * src[1] + -0.321263 * src[2],  // I[-0.5957, 0.5957]
			0.211456 * src[0] + -0.522591 * src[1] +  0.311135 * src[2],  // Q[-0.5226, 0.5226]
		];
	}

	/**
	 * Convert YIQ to Linear RGB.
	 * @param src YIQ color
	 * @return Linear RGB color
	 */
	static toLRGB(src) {
		return [
			src[0] +  0.9563 * src[1] +  0.6210 * src[2],  // R[0, 1]
			src[0] + -0.2721 * src[1] + -0.6474 * src[2],  // G[0, 1]
			src[0] + -1.1070 * src[1] +  1.7046 * src[2],  // B[0, 1]
		];
	}

}
