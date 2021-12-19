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
  beacons: Beacon[];
}

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

  /*for (const scanner of scanners) {
    console.log(toString(scanner));
    for (const beacon of scanner.beacons) {
      for (const r of beacon.rots) {
        //console.log(r.x + " " + r.y + " " + r.z);
        console.log(r.coord);
      }
      console.log("###");
    }
    console.log();
  }*/

  return scanners;
};

const solve1 = (file: string): number => {
  const input = readFileSync(file, "utf-8").trim().split("\n\n");
  const scanners = parse(input);

  const overlaps: Map<number, Set<number>> = new Map();
  const translations = new Map();
  for (let i = 0; i < scanners.length; i++) {
    for (let j = 0; j < scanners.length; j++) {
      if (i !== j) {
        const s1 = scanners[i];
        const s2 = scanners[j];
        let found = false;

        for (let rj = 0; rj < ROTATIONS.length && !found; rj++) {
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
                        /*mapping.set(
                          `${b11.coord[0]},${b11.coord[1]},${b11.coord[2]}`,
                          [b21.rots[rj].coord, rj]
                        );
                        mapping.set(
                          `${b12.coord[0]},${b12.coord[1]},${b12.coord[2]}`,
                          [b22.rots[rj].coord, rj]
                        );*/
                        mapping.set(
                          `${b21.rots[rj].coord[0]},${b21.rots[rj].coord[1]},${b21.rots[rj].coord[2]}`,
                          [
                            `${b11.coord[0]},${b11.coord[1]},${b11.coord[2]}`,
                            rj,
                          ]
                        );
                        mapping.set(
                          `${b22.rots[rj].coord[0]},${b22.rots[rj].coord[1]},${b22.rots[rj].coord[2]}`,
                          [
                            `${b12.coord[0]},${b12.coord[1]},${b12.coord[2]}`,
                            rj,
                          ]
                        );
                      }
                    }
                  }
                }
              }
            }
          }

          if (mapping.size >= 12) {
            console.log(`${i},${j}`);
            console.log(mapping);
            mapping.forEach((value, key) => {
              const b1 = value[0].split(",").map(Number);
              const b2 = key.split(",").map(Number);
              console.log([b1[0] - b2[0], b1[1] - b2[1], b1[2] - b2[2]]);

              const r = value[1];
              /*const b3 = rotate(
                b1,
                ROTATIONS[r][0],
                ROTATIONS[r][1],
                ROTATIONS[r][2]
              );*/
              /*console.log(b1);
              console.log(b2);
              console.log(b3);
              console.log(
                b1[0] - b2[0] + " " + (b1[1] - b2[1]) + " " + (b1[2] - b2[2])
              );
              console.log();*/
              translations.set(`${i},${j}`, [
                [b1[0] - b2[0], b1[1] - b2[1], b1[2] - b2[2]],
                mapping,
                r,
              ]);

              let neighbour = overlaps.get(i);
              if (!neighbour) {
                neighbour = new Set();
                overlaps.set(i, neighbour);
              }
              neighbour.add(j);
            });

            found = true;
          }
        }
      }
    }
  }

  console.log(translations);
  console.log(overlaps);

  const q = [];
  q.push(0);
  const visited = new Set();
  visited.add(0);
  const path = [];

  while (q.length !== 0) {
    const cur = q.shift();
    const neighbours = overlaps.get(cur) || [];
    for (const n of neighbours) {
      if (!visited.has(n)) {
        const edge = `${cur},${n}`;
        path.push([edge, translations.get(edge)[2]]);
        q.push(n);
        visited.add(n);
      }
    }
  }

  console.log(path);
  const f1 = translations.get("0,1")[0];
  const f2 = translations.get("1,4")[0];
  for (const b of scanners[0].beacons) {
    console.log(b.coord);
  }
  console.log("0,1");
  console.log(translations.get("0,1"));
  console.log("1,4");
  console.log(translations.get("1,4"));

  // -20, -1133, 1061
  const a: [number, number, number] = [68, -1246, -43];
  const b: [number, number, number] = [88, 113, -1104];
  let rotated = rotate(b, ROTATIONS[8][0], ROTATIONS[8][1], ROTATIONS[8][2]);
  console.log(rotated);
  console.log(b);

  console.log([rotated[0] + a[0], rotated[0] + a[1], rotated[2] + a[2]]);

  // Following this process, scanner 2 must be at 1105,-1205,1229 (relative to scanner 0)

  // 1105,-1205,1229
  const c: [number, number, number] = [168, -1125, 72];
  let rotated2 = rotate(c, ROTATIONS[9][0], ROTATIONS[9][1], ROTATIONS[9][2]);
  /*rotated2 = rotate(
        rotated2,
        ROTATIONS[j][0],
        ROTATIONS[j][1],
        ROTATIONS[j][2]
      );*/
  rotated2 = [rotated2[0] + b[0], rotated2[1] + b[1], rotated2[2] + b[2]];
  rotated2 = rotate(
    rotated2,
    ROTATIONS[8][0],
    ROTATIONS[8][1],
    ROTATIONS[8][2]
  );
  console.log([rotated2[0] + a[0], rotated2[1] + a[1], rotated2[2] + a[2]]);

  //  and scanner 3 must be at -92,-2380,-20 (relative to scanner 0).
  const d: [number, number, number] = [160, -1134, -23];
  for (let i = 0; i < 24; i++) {
    console.log(i);
    rotated = rotate(d, ROTATIONS[i][0], ROTATIONS[i][1], ROTATIONS[i][2]);
    for (let j = 0; j < 24; j++) {
      console.log(j);
      rotated2 = rotate(a, ROTATIONS[j][0], ROTATIONS[j][1], ROTATIONS[j][2]);
      console.log([
        rotated[0] - rotated2[0],
        rotated[0] - rotated2[1],
        rotated[2] - rotated2[2],
      ]);
    }
  }

  /*//  68, -1246, -43
  // 1 relative to 0:  68, -1246, -43
  console.log(translations.get("0,1")[0]);
  // 4 relative to 1:  88, 113, -1104
  console.log(translations.get("1,4")[0]);
  // 0 relative to 1 rotated:'
  // -88 -- 68, 113 -1246, 1104 -43
  // -88, 113, 1104
  let rotated = rotate(
    translations.get("1,4")[0],
    ROTATIONS[8][0],
    ROTATIONS[8][1],
    ROTATIONS[8][2]
  );
  console.log(rotated);
  const transl = [rotated[0] + f1[0], rotated[1] + f1[1], rotated[2] + f1[2]];
  console.log(transl);

  //-447,-329,318
  //  for (let i = 0; i < 24; i++) {
  //  console.log(i);
  rotated = rotate(
    [427, 804, 743],
    ROTATIONS[8][0],
    ROTATIONS[8][1],
    ROTATIONS[8][2]
  );
  console.log(rotated);
  console.log(
    rotated[0] +
      transl[0] +
      "," +
      (rotated[1] + transl[1]) +
      "," +
      (rotated[2] + transl[2])
  );

  console.log("###");

  for (let i = 0; i < 24; i++) {
    console.log(i);
    rotated = rotate(
      translations.get("4,2")[0],
      ROTATIONS[i][0],
      ROTATIONS[i][1],
      ROTATIONS[i][2]
    );
    console.log(rotated);
    let rotated2 = rotate(
      translations.get("1,4")[0],
      ROTATIONS[8][0],
      ROTATIONS[8][1],
      ROTATIONS[8][2]
    );
    console.log(rotated2);
    console.log(f1);
    const transl2 = [
      rotated[0] + rotated2[0] + f1[0],
      rotated[1] + rotated2[1] + f1[1],
      rotated[2] + rotated2[2] + f1[2],
    ];
    console.log(transl2);
  }*/
  /*
  Following this process, scanner 2 must be at 1105,-1205,1229 (relative to scanner 0)

    '4,2' => [ [ 168, -1125, 72 ],
    15 ]
     '1,4' => [ [ 88, 113, -1104 ],
    9 ], 
 '0,1' => [ [ 68, -1246, -43 ],
    8 ],

 '0,1' => [ [ 68, -1246, -43 ],
    8 ],
  '1,0' => [ [ 68, 1246, -43 ],
    8 ],
  '1,3' => [ [ 160, -1134, -23 ],
    0 ],
  '1,4' => [ [ 88, 113, -1104 ],
    9 ],
  '2,4' => [ [ 1125, -168, 72 ],
    15 ],
  '3,1' => [ [ -160, 1134, 23 ],
    0 ],
  '4,1' => [ [ -1104, -88, 113 ],
    23 ],
  '4,2' => [ [ 168, -1125, 72 ],
    15 ] }

  and scanner 3 must be at -92,-2380,-20 (relative to scanner 0).
  */

  // }
  /*for (let i = 0; i < 24; i++) {
    console.log(i);
    let rotated = rotate(
      translations.get("0,1")[0],
      ROTATIONS[i][0],
      ROTATIONS[i][1],
      ROTATIONS[i][2]
    );
    console.log(rotated);
    rotated = rotate(
      translations.get("1,4")[0],
      ROTATIONS[i][0],
      ROTATIONS[i][1],
      ROTATIONS[i][2]
    );
    console.log(rotated);
  }*/

  // 4 relative to 0: -20,-1133,1061
  // 1,4: -479,426,660
  // // -20 --479, 1133 -426, 1061-660

  // hit ska vi i 0: 459,-707,401

  /*const seen = new Set();
  for (const b of scanners[0].beacons) {
    seen.add(`${b.coord[0]},${b.coord[1]},${b.coord[2]}`);
  }
  console.log(seen);

  for (const b of scanners[1].beacons) {
    const coord = rotate(
      b.coord,
      ROTATIONS[8][0],
      ROTATIONS[8][1],
      ROTATIONS[8][2]
    );
    const key = `${coord[0]},${coord[1]},${coord[2]}`;
    //console.log(key);
    const other = translations.get("0,1")[1].get(key);
    if (other) {
      //console.log("translated: " + other[0]);
      seen.add(other[0]);
    }
  }
  console.log("1,4");
  console.log(translations.get("1,4"));
  console.log("0,1");
  console.log(translations.get("0,1"));

  for (const b of scanners[4].beacons) {
    let coord = rotate(
      b.coord,
      ROTATIONS[9][0],
      ROTATIONS[9][1],
      ROTATIONS[9][2]
    );
    //coord = rotate(coord, ROTATIONS[8][0], ROTATIONS[8][1], ROTATIONS[8][2]);
    const key = `${coord[0]},${coord[1]},${coord[2]}`;
    console.log("key : " + key);
    const other = translations.get("1,4")[1].get(key);
    console.log("other: " + other);
    if (other) {
      const other2 = translations.get("0,1")[1].get(other[0]);
      console.log("other2: " + other2);
      if (other2) {
        console.log("translated: " + other2[0]);
        seen.add(other2[0]);
      }
    }
  }

  console.log(seen.size);*/

  return 0;
};

const solve2 = (file: string): number => {
  return 0;
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

// assert(solve2('./example.txt') === 2);
console.log(solve2("./input.txt"));
