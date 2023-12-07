import { strict as assert } from "assert";
import { readFileSync } from "fs";

const parse = (file: string): string[] =>
  readFileSync(file, "utf-8").trim().split("\n");

interface Positions {
  slots: Array<Array<string>>;
}

const ROOMS = {
  A: 0,
  B: 1,
  C: 2,
  D: 3,
};

const COST = {
  A: 1,
  B: 10,
  C: 100,
  D: 1000,
};

const done = (positions: Positions): boolean => {
  let r = true;
  for (let i = 1; i < positions.slots.length; i++) {
    r =
      r &&
      positions.slots[i][0] === "A" &&
      positions.slots[i][1] === "B" &&
      positions.slots[i][2] === "C" &&
      positions.slots[i][3] === "D";
  }

  return r;
};

const canMoveUp = (
  positions: Positions,
  hwPos: number,
  roomPos: number,
  rowPos: number
): boolean => {
  // is the room blocked?
  for (let i = 1; i < rowPos; i++) {
    if (positions.slots[i][roomPos] !== ".") {
      return false;
    }
  }

  /*
  0 1 2 3 4 5 6
     0 1 2 3 

  0 + 2 => 1, 2
  1 + 2 => 2, 3
  2 + 2 => 3, 4
  3 + 2 => 4, 5

  */
  let relativeRoomPos = roomPos + 2;
  if (hwPos < relativeRoomPos) {
    relativeRoomPos--;
  }

  // is the hallway blocked?
  while (relativeRoomPos !== hwPos) {
    if (positions.slots[0][relativeRoomPos] !== ".") {
      return false;
    }

    relativeRoomPos += hwPos < relativeRoomPos ? -1 : 1;
  }

  // are we already done from this position?
  let finishedFromHere = true;
  for (let i = rowPos; i < positions.slots.length; i++) {
    if (ROOMS[positions.slots[i][roomPos]] !== roomPos) {
      finishedFromHere = false;
      break;
    }
  }

  return !finishedFromHere && positions.slots[rowPos][roomPos] !== ".";
};

const canMoveDown = (
  positions: Positions,
  hwPos: number,
  roomPos: number,
  rowPos: number
): boolean => {
  // wrong room?
  if (ROOMS[positions.slots[0][hwPos]] !== roomPos) {
    return false;
  }

  // is there another type down there?
  for (let i = rowPos + 1; i < positions.slots.length; i++) {
    if (ROOMS[positions.slots[i][roomPos]] !== roomPos) {
      return false;
    }
  }

  // is the room blocked?
  for (let i = 1; i < rowPos + 1; i++) {
    if (positions.slots[i][roomPos] !== ".") {
      return false;
    }
  }

  /*
  0 1 2 3 4 5 6
     0 1 2 3 

  0 + 2 => 1, 2
  1 + 2 => 2, 3
  2 + 2 => 3, 4
  3 + 2 => 4, 5

  */
  let relativeRoomPos = roomPos + 2;
  if (hwPos < relativeRoomPos) {
    relativeRoomPos--;
  }

  // is the hallways blocked?
  while (relativeRoomPos !== hwPos) {
    if (positions.slots[0][relativeRoomPos] !== ".") {
      return false;
    }

    relativeRoomPos += hwPos < relativeRoomPos ? -1 : 1;
  }

  return true;
};

interface Move {
  fromRow: number;
  fromPos: number;
  toRow: number;
  toPos: number;
}

const cost = (move: Move, type: string): number => {
  /*
  01 2 3 4 56
  0123456789X
    2 4 6 8 
    2 4 6 8
    0 1 2 3 

  4 phantom slots
  0 => 0 = +0
  1 => 1 = +0
  2 => 3 = +1
  3 => 5 = +2
  4 => 7 = +3
  5 => 9 = +4
  6 => 10 = +4

  0 => 2 = +2
  1 => 4 = +3
  2 => 6 = +4
  3 => 8 = +5
  */
  const ROOM_MAPPING = {
    0: 2,
    1: 4,
    2: 6,
    3: 8,
  };

  const HW_MAPPIONG = {
    0: 0,
    1: 1,
    2: 3,
    3: 5,
    4: 7,
    5: 9,
    6: 10,
  };

  const relativeA =
    move.toRow !== 0 ? ROOM_MAPPING[move.toPos] : HW_MAPPIONG[move.toPos];
  const relativeB =
    move.fromRow !== 0 ? ROOM_MAPPING[move.fromPos] : HW_MAPPIONG[move.fromPos];

  return (
    (Math.abs(relativeA - relativeB) + Math.abs(move.fromRow - move.toRow)) *
    COST[type]
  );
};

const moves = (positions: Positions): [Move, number][] => {
  const res = [];

  for (let i = 0; i < positions.slots[0].length; i++) {
    const hw = positions.slots[0][i];
    if (hw !== ".") {
      // can we move someone down?
      for (let j = 1; j < positions.slots.length; j++) {
        if (canMoveDown(positions, i, ROOMS[hw], j)) {
          const m = { fromRow: 0, fromPos: i, toRow: j, toPos: ROOMS[hw] };
          res.push([m, cost(m, positions.slots[m.fromRow][m.fromPos])]);
        }
      }
    }
  }

  // prio moving down
  if (res.length > 0) {
    return res;
  }

  for (let i = 0; i < positions.slots[0].length; i++) {
    const hw = positions.slots[0][i];
    if (hw === ".") {
      // can we move someone up?
      for (let j = 0; j < positions.slots[1].length; j++) {
        for (let k = 1; k < positions.slots.length; k++) {
          if (canMoveUp(positions, i, j, k)) {
            const m = { fromRow: k, fromPos: j, toRow: 0, toPos: i };
            res.push([m, cost(m, positions.slots[m.fromRow][m.fromPos])]);
          }
        }
      }
    }
  }

  return res;
};

const cacheKey = (positions: Positions): string => {
  const s = [];

  for (let i = 0; i < positions.slots.length; i++) {
    s.push(positions.slots[i].join(","));
  }

  return s.join(".");
};

const CACHE = new Map();
const play = (positions: Positions): number => {
  const key = cacheKey(positions);
  // already been here?
  const res = CACHE.get(key);
  if (res !== undefined) {
    return res;
  }

  // are we done?
  if (done(positions)) {
    return 0;
  }

  let min = Number.MAX_SAFE_INTEGER;
  for (const mo of moves(positions)) {
    const m = mo[0];
    const c = mo[1];
    const slots = [];

    for (let i = 0; i < positions.slots.length; i++) {
      slots.push([...positions.slots[i]]);
    }

    // test a move
    const p: Positions = { slots };
    p.slots[m.toRow][m.toPos] = p.slots[m.fromRow][m.fromPos];
    p.slots[m.fromRow][m.fromPos] = ".";

    const played = c + play(p);

    // choose branch with least cost
    if (played < min) {
      min = played;
    }
  }

  CACHE.set(key, min);
  return min;
};

const parsePositions = (lines: string[], extend: boolean): Positions => {
  const top = lines[2]
    .trim()
    .slice(3, lines[2].length - 3)
    .split("#");
  const bottom = lines[3]
    .trim()
    .slice(1, lines[2].length - 2)
    .split("#");

  const slots = [
    [".", ".", ".", ".", ".", ".", "."],
    [top[0], top[1], top[2], top[3]],
    [bottom[0], bottom[1], bottom[2], bottom[3]],
  ];

  if (extend) {
    slots.splice(2, 0, ["D", "C", "B", "A"]);
    slots.splice(3, 0, ["D", "B", "A", "C"]);
  }

  return { slots };
};

const solve = (file: string, extend: boolean): number => {
  CACHE.clear();
  return play(parsePositions(parse(file), extend));
};

const positions: Positions = {
  slots: [
    [".", ".", ".", ".", ".", ".", "."],
    ["A", "B", "C", "D"],
    ["A", "B", "C", "D"],
    ["A", "B", "C", "D"],
    ["A", "B", "C", "D"],
  ],
};
assert(done(positions));
positions.slots[1][0] = ".";
positions.slots[0][0] = "A";
assert(!done(positions));

assert(!canMoveUp(positions, 0, 0, 2));
assert(!canMoveUp(positions, 1, 0, 2));
positions.slots[2][0] = "C";
assert(canMoveUp(positions, 1, 0, 2));
positions.slots[0][3] = "C";
assert(canMoveUp(positions, 1, 0, 2));
positions.slots[2][0] = "A";
positions.slots[0][3] = ".";
positions.slots[0][1] = "C";
assert(!canMoveUp(positions, 1, 0, 2));
positions.slots[0][1] = ".";
assert(!canMoveUp(positions, 6, 3, 2));
positions.slots[2][3] = "A";
assert(canMoveUp(positions, 6, 3, 1));
positions.slots[2][3] = "D";
positions.slots[0][5] = "C";
assert(!canMoveUp(positions, 6, 3, 1));
positions.slots[0][5] = ".";

/*
#############
#...........#
###B#C#B#D###
  #A#D#C#A#
  #########
*/
const regression: Positions = {
  slots: [
    [".", ".", ".", ".", ".", ".", "."],
    ["B", "C", "B", "D"],
    ["D", "C", "B", "A"],
    ["D", "B", "A", "C"],
    ["A", "D", "C", "A"],
  ],
};
assert(canMoveUp(regression, 0, 3, 1));
const rms = moves(regression);
assert(rms.length === 28);

assert(canMoveDown(positions, 0, 0, 1));
assert(!canMoveDown(positions, 0, 0, 2));
positions.slots[1][2] = ".";
positions.slots[0][6] = "C";
positions.slots[1][3] = ".";
positions.slots[0][5] = "D";
assert(canMoveDown(positions, 5, 3, 1));
assert(!canMoveDown(positions, 6, 2, 1));
positions.slots[1][3] = "D";
positions.slots[0][5] = ".";
assert(canMoveDown(positions, 6, 2, 1));

positions.slots[1][0] = "A";
positions.slots[0][0] = ".";
let ms = moves(positions);
assert(ms.length === 1);
assert(ms[0][0].toPos === 2);
assert(ms[0][0].toRow === 1);
assert(ms[0][0].fromPos === 6);
assert(ms[0][0].fromRow === 0);

positions.slots[1][2] = "C";
positions.slots[0][6] = ".";
ms = moves(positions);
assert(ms.length === 0);

positions.slots[1][0] = ".";
positions.slots[0][0] = "A";
ms = moves(positions);
assert(ms.length === 1);
assert(ms[0][0].toPos === 0);
assert(ms[0][0].toRow === 1);
assert(ms[0][0].fromPos === 0);
assert(ms[0][0].fromRow === 0);

positions.slots[0][0] = ".";
positions.slots[2][0] = "C";
positions.slots[0][4] = "D";
ms = moves(positions);
assert(ms.length === 4);
assert(ms[0][0].toPos === 0);
assert(ms[0][0].toRow === 0);
assert(ms[0][0].fromPos === 0);
assert(ms[0][0].fromRow === 2);
assert(ms[1][0].toPos === 1);
assert(ms[1][0].toRow === 0);
assert(ms[1][0].fromPos === 0);
assert(ms[1][0].fromRow === 2);
assert(ms[2][0].toPos === 2);
assert(ms[2][0].toRow === 0);
assert(ms[2][0].fromPos === 0);
assert(ms[2][0].fromRow === 2);
assert(ms[3][0].toPos === 3);
assert(ms[3][0].toRow === 0);
assert(ms[3][0].fromPos === 0);
assert(ms[3][0].fromRow === 2);

/*
01.2.3.4.56
  0 1 2 3 
  0 1 2 3 
*/
const m: Move = { fromRow: 1, fromPos: 2, toPos: 2, toRow: 0 };
assert(cost(m, "A") === 4);
assert(cost(m, "B") === 40);
assert(cost(m, "C") === 400);
assert(cost(m, "D") === 4000);

m.fromRow = 2;
m.fromPos = 3;
m.toRow = 0;
m.toPos = 0;
assert(cost(m, "A") === 10);

m.fromRow = 2;
m.fromPos = 1;
m.toRow = 0;
m.toPos = 3;
assert(cost(m, "D") === 3000);

m.fromRow = 1;
m.fromPos = 0;
m.toRow = 0;
m.toPos = 2;
assert(cost(m, "B") === 20);

m.fromRow = 0;
m.fromPos = 2;
m.toRow = 1;
m.toPos = 1;
assert(cost(m, "B") === 20);

assert(solve("./example.txt", false) === 12521);
console.log(solve("../input/2021/day23.txt", false));
assert(solve("./example.txt", true) === 44169);
console.log(solve("../input/2021/day23.txt", true));
