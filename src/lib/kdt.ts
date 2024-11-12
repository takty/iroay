/**
 * KD Tree
 *
 * @author Takuto Yanagida
 * @version 2024-11-12
 */

type Pair = [number, number];

class Node {
	p: Pair;
	q: Pair;
	nl: Node | null;
	nr: Node | null;

	constructor(p: Pair, q: Pair, nl: Node | null, nr: Node | null) {
		this.p = p;
		this.q = q;
		this.nl = nl;
		this.nr = nr;
	}
}

export class Tree {
	root: Node | null = null;
	k: number;

	constructor(ps: [Pair, Pair][], k: number = 2) {
		this.k = k;
		this.root = this.#build(ps, 0);
	}

	#build(ps: [Pair, Pair][], dep: number): Node | null {
		if (ps.length === 0) return null;

		const ax = dep % this.k;
		ps.sort(([p0, ], [p1, ]) => (p0[ax] - p1[ax]));

		const med = Math.floor(ps.length / 2);
		return new Node(
			ps[med][0],
			ps[med][1],
			this.#build(ps.slice(0, med), dep + 1),
			this.#build(ps.slice(med + 1), dep + 1),
		);
	}

	#dist(p0: Pair, p1: Pair): number {
		return Math.sqrt((p0[0] - p1[0]) * (p0[0] - p1[0]) + (p0[1] - p1[1]) * (p0[1] - p1[1]));
	}

	neighbors(tar: Pair, size: number): [Pair, number][] {
		const rs: { n: Node, d: number }[] = [];

		const search = (n: Node | null, dep: number) => {
			if (n === null) return;

			const ax = dep % this.k;
			const d = this.#dist(tar, n.p);

			if (rs.length < size) {
				rs.push({ n, d });
				rs.sort((a, b) => a.d - b.d);
			} else if (d < rs[rs.length - 1].d) {
				rs[rs.length - 1] = { n, d };
				rs.sort((a, b) => a.d - b.d);
			}

			const nb: Node | null = tar[ax] < n.p[ax] ? n.nl : n.nr;
			const ob: Node | null = nb === n.nl ? n.nr : n.nl;

			search(nb, dep + 1);

			if (rs.length < size || Math.abs(tar[ax] - n.p[ax]) < rs[rs.length - 1].d) {
				search(ob, dep + 1);
			}
		};

		search(this.root, 0);
		return rs.map(r => [r.n.q, r.d]);
	}
}
