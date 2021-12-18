/* eslint-disable no-param-reassign */
import { strict as assert } from "assert";
import { readFileSync } from "fs";

const parse = (file: string): string[] =>
  readFileSync(file, "utf-8").trim().split("\n");

interface Pair {
  l?: Pair;
  r?: Pair;
  v?: number;
}

const parseLine = (line: string): Pair => {
  const pair: Pair = {};
  const stack = [];
  stack.push(pair);

  for (const char of line.slice(1).split("")) {
    const cur = stack[stack.length - 1];
    if (char === "[") {
      const child = {};

      if (!cur.l) {
        cur.l = child;
      } else {
        cur.r = child;
      }

      stack.push(child);
    } else if (char === "]") {
      stack.pop();
    } else if (char !== ",") {
      if (!cur.l) {
        cur.l = { v: +char };
      } else {
        cur.r = { v: +char };
      }
    }
  }

  return pair;
};

const buildString = (pair: Pair, s: string[]): void => {
  if (pair.v != null) {
    s.push(`${pair.v}`);
  } else {
    s.push("[");

    buildString(pair.l, s);
    s.push(",");
    buildString(pair.r, s);

    s.push("]");
  }
};

const toString = (pair: Pair): string => {
  const s = [];
  buildString(pair, s);
  return s.join("");
};

const explode = (cur: Pair, stack: Pair[]): boolean => {
  if (cur.l) {
    stack.push(cur);
    if (explode(cur.l, stack)) {
      return true;
    }
    stack.pop();
  }

  if (cur.r) {
    stack.push(cur);
    if (explode(cur.r, stack)) {
      return true;
    }
    stack.pop();
  }

  if (cur.v) {
    if (stack.length === 5) {
      if (stack[stack.length - 2].l === stack[stack.length - 1]) {
        if (stack[stack.length - 2].r.v != null) {
          stack[stack.length - 2].r.v += stack[stack.length - 1].r.v;
        } else {
          let find = stack[stack.length - 2];
          while (find) {
            if (find.r && find.r.v != null) {
              find.l.v += stack[stack.length - 1].r.v;
              break;
            }
            find = find.r;
          }
        }

        let find = null;
        for (let i = 3; i < stack.length + 1; i++) {
          if (
            stack[stack.length - i].l !== stack[stack.length - i + 1] &&
            stack[stack.length - i].l != null
          ) {
            find = stack[stack.length - i].l;
            break;
          }
        }

        if (!find && stack[0].l !== stack[1]) {
          find = stack[0].l;
        }

        while (find) {
          if (find.v != null) {
            find.v += stack[stack.length - 1].l.v;
            break;
          }
          find = find.r;
        }

        stack[stack.length - 1].v = 0;
        stack[stack.length - 1].l = null;
        stack[stack.length - 1].r = null;
      } else {
        if (stack[stack.length - 2].l.v != null) {
          stack[stack.length - 2].l.v += stack[stack.length - 1].l.v;
        } else {
          let find = stack[stack.length - 2];
          while (find) {
            if (find.l && find.l.v != null) {
              find.r.v += stack[stack.length - 1].l.v;
              break;
            }
            find = find.l;
          }
        }

        let find = null;
        for (let i = 3; i < stack.length + 1; i++) {
          if (
            stack[stack.length - i].r !== stack[stack.length - i + 1] &&
            stack[stack.length - i].r != null
          ) {
            find = stack[stack.length - i].r;
            break;
          }
        }

        if (!find && stack[0].r !== stack[1]) {
          find = stack[0].r;
        }

        while (find) {
          if (find.v != null) {
            find.v += stack[stack.length - 1].r.v;
            break;
          }
          find = find.l;
        }

        stack[stack.length - 1].v = 0;
        stack[stack.length - 1].l = null;
        stack[stack.length - 1].r = null;
      }

      return true;
    }
  }

  return false;
};

const split = (cur: Pair): boolean => {
  if (cur.v > 9) {
    cur.l = { v: Math.floor(cur.v / 2) };
    cur.r = { v: Math.ceil(cur.v / 2) };
    cur.v = null;

    return true;
  }

  if (cur.l) {
    if (split(cur.l)) {
      return true;
    }
  }

  if (cur.r) {
    if (split(cur.r)) {
      return true;
    }
  }

  return false;
};

const reduce = (pair: Pair): boolean => {
  let mutaded = false;
  while (true) {
    if (explode(pair, [])) {
      // console.log("exploded: " + toString(pair));
      mutaded = true;
    } else if (!split(pair)) {
      break;
    } else {
      // console.log("split: " + toString(pair));
      mutaded = true;
    }
  }

  return mutaded;
};

const add = (p1: Pair, p2: Pair): Pair => {
  const res: Pair = {};

  res.l = p1;
  res.r = p2;

  reduce(res);

  return res;
};

const addLines = (lines: string[]): Pair => {
  let pair = parseLine(lines[0]);

  for (const line of lines.slice(1)) {
    pair = add(pair, parseLine(line));
  }

  return pair;
};

const magnitude = (pair: Pair): number => {
  if (pair.v != null) {
    return pair.v;
  }

  return magnitude(pair.l) * 3 + magnitude(pair.r) * 2;
};

const solve1 = (file: string): number => {
  const pair = addLines(parse(file));

  return magnitude(pair);
};

const solve2 = (file: string): number => {
  const lines = parse(file);

  let max = 0;
  for (let i = 0; i < lines.length; i++) {
    for (let j = 0; j < lines.length; j++) {
      if (i !== j) {
        const p1 = add(parseLine(lines[i]), parseLine(lines[j]));
        let m = magnitude(p1);
        if (m > max) {
          max = m;
        }

        const p2 = add(parseLine(lines[j]), parseLine(lines[i]));
        m = magnitude(p2);
        if (m > max) {
          max = m;
        }
      }
    }
  }

  return max;
};

let pair = parseLine("[1,2]");
assert(pair.l.v === 1);
assert(pair.r.v === 2);

pair = parseLine("[[1,2],3]");
assert(pair.l.l.v === 1);
assert(pair.l.r.v === 2);
assert(pair.r.v === 3);

pair = parseLine("[9,[8,7]]");
assert(pair.l.v === 9);
assert(pair.r.l.v === 8);
assert(pair.r.r.v === 7);

pair = parseLine("[[1,9],[8,5]]");
assert(pair.l.l.v === 1);
assert(pair.l.r.v === 9);
assert(pair.r.l.v === 8);
assert(pair.r.r.v === 5);

pair = parseLine("[[[[1,2],[3,4]],[[5,6],[7,8]]],9]");
assert(pair.l.l.l.l.v === 1);
assert(pair.l.r.r.r.v === 8);
assert(pair.r.v === 9);

pair = parseLine("[[[9,[3,8]],[[0,9],6]],[[[3,7],[4,9]],3]]");
assert(pair.l.l.l.v === 9);
assert(pair.r.r.v === 3);

pair = parseLine(
  "[[[[1,3],[5,3]],[[1,3],[8,7]]],[[[4,9],[6,9]],[[8,2],[7,3]]]]"
);
assert(pair.l.l.l.l.v === 1);
assert(pair.r.l.l.l.v === 4);
assert(pair.r.r.r.r.v === 3);

pair = parseLine("[[[[[9,8],1],2],3],4]");
assert(explode(pair, []));
assert(toString(pair) === "[[[[0,9],2],3],4]");

pair = parseLine("[7,[6,[5,[4,[3,2]]]]]");
assert(explode(pair, []));
assert(toString(pair) === "[7,[6,[5,[7,0]]]]");

pair = parseLine("[[6,[5,[4,[3,2]]]],1]");
assert(explode(pair, []));
assert(toString(pair) === "[[6,[5,[7,0]]],3]");

pair = parseLine("[[3,[2,[1,[7,3]]]],[6,[5,[4,[3,2]]]]]");
assert(explode(pair, []));
assert(toString(pair) === "[[3,[2,[8,0]]],[9,[5,[4,[3,2]]]]]");

pair = parseLine("[[3,[2,[8,0]]],[9,[5,[4,[3,2]]]]]");
assert(explode(pair, []));
assert(toString(pair) === "[[3,[2,[8,0]]],[9,[5,[7,0]]]]");

pair = parseLine("[1,2]");
pair.l.v = 11;
assert(split(pair));
assert(toString(pair) === "[[5,6],2]");

pair = parseLine("[[[[4,3],4],4],[7,[[8,4],9]]]");
pair = add(pair, parseLine("[1,1]"));
assert(toString(pair) === "[[[[0,7],4],[[7,8],[6,0]]],[8,1]]");

pair = parseLine("[1,1]");
for (let i = 2; i < 5; i++) {
  pair = add(pair, parseLine(`[${i},${i}]`));
}
assert(toString(pair) === "[[[[1,1],[2,2]],[3,3]],[4,4]]");

pair = parseLine("[1,1]");
for (let i = 2; i < 6; i++) {
  pair = add(pair, parseLine(`[${i},${i}]`));
}
assert(toString(pair) === "[[[[3,0],[5,3]],[4,4]],[5,5]]");

pair = parseLine("[1,1]");
for (let i = 2; i < 7; i++) {
  pair = add(pair, parseLine(`[${i},${i}]`));
}
assert(toString(pair) === "[[[[5,0],[7,4]],[5,5]],[6,6]]");

pair = addLines(parse("example1.txt"));
assert(
  toString(pair) === "[[[[8,7],[7,7]],[[8,6],[7,7]]],[[[0,7],[6,6]],[8,7]]]"
);

assert(magnitude(parseLine("[9,1]")) === 29);
assert(magnitude(parseLine("[[9,1],[1,9]]")) === 129);

assert(solve1("./example5.txt") === 4140);
console.log(solve1("./input.txt"));

assert(solve2("./example5.txt") === 3993);
console.log(solve2("./input.txt"));
