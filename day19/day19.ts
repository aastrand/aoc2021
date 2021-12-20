import { strict as assert } from "assert";
import { readFileSync } from "fs";

interface Rotation {
  coord: [number, number, number];
  x: number;
  y: number;
  z: number;
}

interface Beacon {
  coord: [number, number, number];
  rots: Array<Rotation>;
}

interface Scanner {
  id: number;
  distance?: [number, number, number];
  beacons: Beacon[];
}

// Used this for early debugging
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const toString = (scanner: Scanner, rot?: number): string => {
  const s = [];

  s.push(`--- scanner ${scanner.id} ---`);

  for (const beacon of scanner.beacons) {
    if (rot === undefined) {
      s.push(beacon.coord.join(","));
    } else {
      s.push(beacon.rots[rot].coord.join(","));
    }
  }

  return s.join("\n");
};

const rotate = (
  v: [number, number, number],
  x: number,
  y: number,
  z: number
): [number, number, number] => {
  const r = [0, 0, 0];

  // around x
  r[0] = Math.round(v[0] * Math.cos(x)) - Math.round(v[1] * Math.sin(x));
  r[1] = Math.round(v[0] * Math.sin(x)) + Math.round(v[1] * Math.cos(x));
  r[2] = v[2];

  // around y
  const r2 = [0, 0, 0];
  r2[0] = Math.round(r[0] * Math.cos(y)) + Math.round(r[2] * Math.sin(y));
  r2[1] = r[1];
  r2[2] = Math.round(-1 * r[0] * Math.sin(y)) + Math.round(r[2] * Math.cos(y));

  // around z
  const r3: [number, number, number] = [0, 0, 0];
  r3[0] = r2[0];
  r3[1] = Math.round(r2[1] * Math.cos(z)) - Math.round(r2[2] * Math.sin(z));
  r3[2] = Math.round(r2[1] * Math.sin(z)) + Math.round(r2[2] * Math.cos(z));

  return r3;
};

const ROTATIONS: Array<[number, number, number]> = [
  // 0.  I
  [0, 0, 0],
  // 1.  X = YXZ
  [Math.PI / 2, 0, 0],
  // 2.  Y = ZYX
  [0, Math.PI / 2, 0],
  // 3.  Z = XZY
  [0, 0, Math.PI / 2],
  // 4.  XX = XYXZ = YXXY = YXYZ = YXZX = YYZZ = YZXZ = ZXXZ = ZZYY
  [Math.PI, 0, 0],
  // 5.  XY = YZ = ZX = XZYX = YXZY = ZYXZ
  [Math.PI / 2, Math.PI / 2, 0],
  // 6.  XZ = XXZY = YXZZ = YYYX = ZYYY
  [Math.PI / 2, 0, Math.PI / 2],
  // 7.  YX = XZZZ* = YYXZ = ZYXX = ZZZY
  [Math.PI / 2, 0, (Math.PI / 2) * 3],
  // 8.  YY = XXZZ = XYYX = YZYX = ZXYX = ZYXY = ZYYZ = ZYZX = ZZXX
  [0, Math.PI, 0],
  // 9. ZY = XXXZ* = XZYY = YXXX = ZZYX
  [(Math.PI / 2) * 3, 0, Math.PI / 2],
  // 10. ZZ = XXYY = XYZY = XZXY = XZYZ = XZZX = YYXX = YZZY = ZXZY
  [0, 0, Math.PI],
  // 11. XXX
  [(Math.PI / 2) * 3, 0, 0],
  // 12. XXY = XYZ = XZX = YZZ = ZXZ
  [Math.PI, Math.PI / 2, 0],
  // 13. XXZ = ZYY
  [Math.PI, 0, Math.PI / 2],
  // 14. XYX = YXY = YYZ* = YZX = ZXX
  [0, Math.PI, Math.PI / 2],
  // 15. XYY = YZY = ZXY = ZYZ = ZZX
  [Math.PI / 2, Math.PI, 0],
  // 16. XZZ = YYX
  [Math.PI / 2, 0, Math.PI],
  // 17. YXX = ZZY = XXYYY*
  [Math.PI, (Math.PI / 2) * 3, 0],
  // 18. YYY
  [0, (Math.PI / 2) * 3, 0],
  // 19. ZZZ
  [0, 0, (Math.PI / 2) * 3],
  // 20. XXXY = XXYZ = XXZX = XYZZ = XZXZ = YZZZ = ZXZZ = ZYYX
  [(Math.PI / 2) * 3, Math.PI / 2, 0],
  // 21. XXYX = XYXY = XYYZ* = XYZX = XZXX = YXYY = YYZY = YZXY = YZYZ = YZZX = ZXXY = ZXYZ = ZXZX = ZYZZ = ZZXZ
  [Math.PI / 2, Math.PI, Math.PI / 2],
  // 22. XYXX = XZZY = YXYX = YYXY = YYYZ* = YYZX = YZXX = ZXXX
  [0, (Math.PI / 2) * 3, Math.PI / 2],
  // 23. XYYY = YXXZ = YZYY = ZXYY = ZYZY = ZZXY = ZZYZ = ZZZX
  [Math.PI / 2, (Math.PI / 2) * 3, 0],
];

const buildRotations = (v: [number, number, number]): Array<Rotation> => {
  const ret = [];

  for (const r of ROTATIONS) {
    const coord = rotate(v, r[0], r[1], r[2]);
    ret.push({ coord, r });
  }

  return ret;
};

const parse = (input: string[]): Array<Scanner> => {
  const scanners: Array<Scanner> = [];

  for (const scanner of input) {
    const lines = scanner.split("\n");
    const id = +lines[0].split("--- scanner ")[1].split(" ---")[0];

    const beacons: Array<Beacon> = lines
      .slice(1)
      .map((b) => b.split(",").map(Number))
      .map((b) => {
        const coord: [number, number, number] = [b[0], b[1], b[2]];
        const rots = buildRotations(coord);
        return { coord, rots };
      });
    scanners.push({ id, beacons });
  }

  return scanners;
};

const checkOverlap = (
  s1: Scanner,
  s2: Scanner
): [[number, number, number], number] | null => {
  for (let rj = 0; rj < ROTATIONS.length; rj++) {
    const mapping = new Map();
    for (const b11 of s1.beacons) {
      for (const b12 of s1.beacons) {
        if (b11 !== b12) {
          for (const b21 of s2.beacons) {
            for (const b22 of s2.beacons) {
              if (b21 !== b22) {
                const dx1 = b11.coord[0] - b12.coord[0];
                const dy1 = b11.coord[1] - b12.coord[1];
                const dz1 = b11.coord[2] - b12.coord[2];

                const dx2 = b21.rots[rj].coord[0] - b22.rots[rj].coord[0];
                const dy2 = b21.rots[rj].coord[1] - b22.rots[rj].coord[1];
                const dz2 = b21.rots[rj].coord[2] - b22.rots[rj].coord[2];

                if (dx1 === dx2 && dy1 === dy2 && dz1 === dz2) {
                  mapping.set(
                    `${b21.rots[rj].coord[0]},${b21.rots[rj].coord[1]},${b21.rots[rj].coord[2]}`,
                    [`${b11.coord[0]},${b11.coord[1]},${b11.coord[2]}`, rj]
                  );
                  mapping.set(
                    `${b22.rots[rj].coord[0]},${b22.rots[rj].coord[1]},${b22.rots[rj].coord[2]}`,
                    [`${b12.coord[0]},${b12.coord[1]},${b12.coord[2]}`, rj]
                  );
                }
              }
            }
            if (mapping.size >= 12) {
              const key = mapping.keys().next().value;
              const value = mapping.get(key);
              const b1 = value[0].split(",").map(Number);
              const b2 = key.split(",").map(Number);
              const r = value[1];
              return [[b1[0] - b2[0], b1[1] - b2[1], b1[2] - b2[2]], r];
            }
          }
        }
      }
    }
  }

  return null;
};

const convert = (scanners: Scanner[]): void => {
  const converted: Map<number, Scanner> = new Map();
  converted.set(scanners[0].id, scanners[0]);
  // eslint-disable-next-line no-param-reassign
  scanners[0].distance = [0, 0, 0];
  const checked = new Set();

  let found = false;
  while (converted.size !== scanners.length) {
    // resorted to this algo of keeping a set bases, a nice tip from u/Multipl
    found = false;
    for (let i = 0; i < scanners.length && !found; i++) {
      if (!converted.get(i)) {
        const candidate = scanners[i];

        for (const j of converted.keys()) {
          const base = scanners[j];
          const keys = [`${i},${j}`, `${j},${i}`];
          if (!checked.has(keys[0]) && !checked.has(keys[1])) {
            checked.add(keys[0]);
            checked.add(keys[1]);
            const res = checkOverlap(base, candidate);

            if (res !== null) {
              const diff = res[0];
              const rotation = res[1];

              for (const beacon of candidate.beacons) {
                beacon.coord[0] = beacon.rots[rotation].coord[0] + diff[0];
                beacon.coord[1] = beacon.rots[rotation].coord[1] + diff[1];
                beacon.coord[2] = beacon.rots[rotation].coord[2] + diff[2];
              }

              converted.set(i, candidate);
              candidate.distance = diff;
              found = true;
              break;
            }
          }
        }
      }
    }
  }
};

const solve1 = (file: string): number => {
  const input = readFileSync(file, "utf-8").trim().split("\n\n");
  const scanners = parse(input);

  convert(scanners);

  const seen = new Set();
  for (const scanner of scanners) {
    for (const beacon of scanner.beacons) {
      seen.add(`${beacon.coord[0]},${beacon.coord[1]},${beacon.coord[2]}`);
    }
  }

  return seen.size;
};

const solve2 = (file: string): number => {
  const input = readFileSync(file, "utf-8").trim().split("\n\n");
  const scanners = parse(input);

  convert(scanners);

  let max = 0;
  for (const s1 of scanners) {
    for (const s2 of scanners) {
      const distance =
        Math.abs(s1.distance[0] - s2.distance[0]) +
        Math.abs(s1.distance[1] - s2.distance[1]) +
        Math.abs(s1.distance[2] - s2.distance[2]);
      if (distance > max) {
        max = distance;
      }
    }
  }

  return max;
};

const rots = buildRotations([1, 2, 3]);
const seen = new Set();
const valid = new Set([1, 2, 3, -1, -2, -3]);
for (const rot of rots) {
  assert(valid.has(rot.coord[0]));
  assert(valid.has(rot.coord[1]));
  assert(valid.has(rot.coord[2]));
  const key = `${rot.coord[0]},${rot.coord[1]},${rot.coord[2]}`;
  assert(!seen.has(key));
  seen.add(key);
}

const input = [
  `--- scanner 0 ---
-1,-1,1
-2,-2,2
-3,-3,3
-2,-3,1
5,6,-4
8,0,7`,
];
const scanner = parse(input)[0];
assert(scanner.beacons.length === 6);
assert(scanner.beacons[5].coord[0] === 8);
assert(scanner.beacons[5].coord[1] === 0);
assert(scanner.beacons[5].coord[2] === 7);

assert(scanner.beacons[5].rots[0].coord[0] === 8);
assert(scanner.beacons[5].rots[0].coord[1] === 0);
assert(scanner.beacons[5].rots[0].coord[2] === 7);

assert(scanner.beacons[1].rots[13].coord[0] === 2);
assert(scanner.beacons[1].rots[13].coord[1] === -2);
assert(scanner.beacons[1].rots[13].coord[2] === 2);
assert(scanner.beacons[5].rots[13].coord[0] === -8);
assert(scanner.beacons[5].rots[13].coord[1] === -7);
assert(scanner.beacons[5].rots[13].coord[2] === 0);

assert(scanner.beacons[5].rots[18].coord[0] === -7);
assert(scanner.beacons[5].rots[18].coord[1] === 0);
assert(scanner.beacons[5].rots[18].coord[2] === 8);

assert(scanner.beacons[3].rots[12].coord[0] === 1);
assert(scanner.beacons[3].rots[12].coord[1] === 3);
assert(scanner.beacons[3].rots[12].coord[2] === -2);
assert(scanner.beacons[5].rots[12].coord[0] === 7);
assert(scanner.beacons[5].rots[12].coord[1] === 0);
assert(scanner.beacons[5].rots[12].coord[2] === 8);

assert(scanner.beacons[5].rots[7].coord[0] === 0);
assert(scanner.beacons[5].rots[7].coord[1] === 7);
assert(scanner.beacons[5].rots[7].coord[2] === -8);

assert(solve1("./example.txt") === 79);
console.log(solve1("./input.txt"));

assert(solve2("./example.txt") === 3621);
console.log(solve2("./input.txt"));
