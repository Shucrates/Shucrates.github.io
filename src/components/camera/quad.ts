/**
 * CSS `matrix3d` that maps a `width`×`height` box (transform-origin 0 0) onto
 * four screen points: top-left, top-right, bottom-right, bottom-left. Lets the
 * flat LCD overlay follow the 3D screen when the camera turns.
 */
type Point = { x: number; y: number };
type M3 = number[];

const adjugate = (m: M3): M3 => [
  m[4] * m[8] - m[5] * m[7], m[2] * m[7] - m[1] * m[8], m[1] * m[5] - m[2] * m[4],
  m[5] * m[6] - m[3] * m[8], m[0] * m[8] - m[2] * m[6], m[2] * m[3] - m[0] * m[5],
  m[3] * m[7] - m[4] * m[6], m[1] * m[6] - m[0] * m[7], m[0] * m[4] - m[1] * m[3],
];

const multiply = (a: M3, b: M3): M3 =>
  Array.from({ length: 9 }, (_, n) => {
    const i = Math.floor(n / 3);
    const j = n % 3;
    return a[3 * i] * b[j] + a[3 * i + 1] * b[3 + j] + a[3 * i + 2] * b[6 + j];
  });

/** The projective map taking the unit basis to the four points. */
function basis([p1, p2, p3, p4]: Point[]): M3 {
  const m = [p1.x, p2.x, p3.x, p1.y, p2.y, p3.y, 1, 1, 1];
  const a = adjugate(m);
  const v = [0, 1, 2].map((r) => a[3 * r] * p4.x + a[3 * r + 1] * p4.y + a[3 * r + 2]);
  return multiply(m, [v[0], 0, 0, 0, v[1], 0, 0, 0, v[2]]);
}

export function quadTransform(width: number, height: number, [tl, tr, br, bl]: Point[]): string {
  const from = basis([{ x: 0, y: 0 }, { x: width, y: 0 }, { x: 0, y: height }, { x: width, y: height }]);
  const to = basis([tl, tr, bl, br]);
  const t = multiply(to, adjugate(from)).map((v, _, all) => v / all[8]);
  return `matrix3d(${[t[0], t[3], 0, t[6], t[1], t[4], 0, t[7], 0, 0, 1, 0, t[2], t[5], 0, t[8]].join(",")})`;
}
