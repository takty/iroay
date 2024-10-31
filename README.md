# iroay

[Japanese Ver.](https://github.com/takty/iroay/blob/main/README.ja.md)

[Demo](https://takty.github.io/iroay/)

**Pronunciation**: i-ro-a-i

**Overview**
iroay is a JavaScript library designed for color space conversion. The name "iroay" is derived from the Japanese word "いろあい" (iroai), meaning "color harmony." This library makes it easy to perform various color-related operations.

## Features

- Supports multiple color spaces, including RGB, LRGB, YIQ, XYZ, Yxy, LMS, Lab, LCh, Munsell, and PCCS
- Simulation of color vision characteristics for Protanopia (P-type) and Deuteranopia (D-type)
- Simulation of age-related changes in color vision
- Detection of categorical colors and calculation of conspicuity
- Supports multiple color difference calculation algorithms, including Euclidean distance and the CIEDE2000 algorithm
- Lightweight with no dependencies
- High-precision color conversion algorithms

## Installation

iroay is lightweight and has no dependencies, making it easy to integrate into your project.

```javascript
import { * } as iroay from 'path/to/iroay.min.js';
```

## Usage

The iroay library provides a `Color` class that simplifies color conversions and manipulations.

### Initializing a Color

To initialize a color, use the `Color` class. For example, to initialize a color in the RGB color space:

```javascript
const color = new iroay.Color('rgb', [255, 0, 0]);
```

### Converting Colors

To convert the initialized color to another color space, use the `as()` method. For example, to convert RGB to Lab:

```javascript
const labColor = color.as('lab');
console.log(labColor); // [53.23288, 80.10933, 67.22006]
```

The `as()` method converts the color to the specified color space and returns the result as an array.

### Calculating Color Differences

To calculate the difference between two colors, use the `differenceFrom()` method. For example, to calculate the difference using the CIEDE2000 algorithm:

```javascript
const color1 = new iroay.Color('lab', [50, 2.6772, -79.7751]);
const color2 = new iroay.Color('lab', [50, 0, -82.7485]);
const diff = color1.differenceFrom(color2, 'ciede2000');
console.log(diff);  // 2.0425
```

This shows how the iroay library provides powerful and easy-to-use tools for color manipulation.

## License

iroay is provided under the MIT License. See the LICENSE file for details.
