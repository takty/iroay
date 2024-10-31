# iroay

[English Ver.](https://github.com/takty/iroay/blob/main/README.md)

[Demo](https://takty.github.io/iroay/)

**発音**: いろあい

**概要**
iroayは、表色系を変換するためのJavaScriptライブラリです。日本語の「いろあい」をもじった名前であり、色に関連するさまざまな操作を簡単に行うことができます。

## 特徴

- RGB, LRGB, YIQ, XYZ, Yxy, LMS, Lab, LCh, Munsell, and PCCSといった複数の表色系に対応
- P型（1型2色覚）およびD型（2型2色覚）の色覚特性のシミュレーション機能
- 年齢による色覚の変化のシミュレーション機能
- カテゴリカルカラーの検出と誘目度の計算
- 色差計算において、通常のユークリッド距離とCIEDE2000アルゴリズムに対応
- 軽量で依存関係がない
- 高精度な色変換アルゴリズムを使用

## インストール

iroayは軽量で依存関係がなく、プロジェクトに簡単に組み込むことができます。

```javascript
import { * } as iroay from 'path/to/iroay.min.js';
```

## 使用方法

iroayライブラリは、色の変換や操作を簡単に行うための `Color` クラスを提供します。

### 色の初期化

色を初期化するには、 `Color` クラスを使用します。例えば、RGB表色系の色を初期化する場合は次のようにします:

```javascript
const color = new iroay.Color('rgb', [255, 0, 0]);
```

### 色の変換

初期化した色を他の表色系に変換するには、 `as()` メソッドを使用します。例えば、RGBからLabに変換するには次のようにします:

```javascript
const labColor = color.as('lab');
console.log(labColor); // [53.23288, 80.10933, 67.22006]
```

`as()` メソッドは、指定した表色系に色を変換し、その結果を配列として返します。

### 色差の計算

2つの色の色差を計算するには、 `differenceFrom()` メソッドを使用します。例えば、CIEDE2000での色差を計算するには次のようにします:

```javascript
const color1 = new iroay.Color('lab', [50, 2.6772, -79.7751]);
const color2 = new iroay.Color('lab', [50, 0, -82.7485]);
const diff = color1.differenceFrom(color2, 'ciede2000');
console.log(diff);  // 2.0425
```

このように、iroayライブラリは色の操作を強力かつ簡単に行うためのツールを提供します。

## ライセンス

iroayはMITライセンスの下で提供されています。詳細はLICENSEファイルを参照してください。
