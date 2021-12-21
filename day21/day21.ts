/* eslint-disable no-param-reassign */
import { strict as assert } from "assert";

class Die {
  last = 0;

  casts = 0;

  cast(): number {
    this.last++;
    this.casts++;

    if (this.last > 100) {
      this.last = 1;
    }

    return this.last;
  }
}

const solve1 = (p1: number, p2: number): number => {
  const die = new Die();
  let p1pos = p1 - 1;
  let p2pos = p2 - 1;
  let p1score = 0;
  let p2score = 0;

  while (true) {
    let value = 0;
    for (let i = 0; i < 3; i++) {
      value += die.cast();
    }

    p1pos += value;
    p1pos %= 10;
    p1score += p1pos + 1;

    if (p1score >= 1000) {
      break;
    }

    value = 0;
    for (let i = 0; i < 3; i++) {
      value += die.cast();
    }

    p2pos += value;
    p2pos %= 10;
    p2score += p2pos + 1;

    if (p2score >= 1000) {
      break;
    }
  }

  return Math.min(p1score, p2score) * die.casts;
};

const CACHE = new Map();

const play = (
  p1pos: number,
  p2pos: number,
  p1score: number,
  p2score: number,
  value: number,
  casts: number
): [number, number] => {
  const key = `${p1pos},${p2pos},${p1score},${p2score},${value},${casts}`;
  let res = CACHE.get(key);
  if (res) {
    return res;
  }

  if (casts < 4) {
    p1pos += value;
    p1pos %= 10;
  }
  if (casts === 3) {
    p1score += p1pos + 1;

    if (p1score >= 21) {
      return [1, 0];
    }
  }

  if (casts > 3) {
    p2pos += value;
    p2pos %= 10;
  }
  if (casts === 6) {
    p2score += p2pos + 1;
    casts = 0;

    if (p2score >= 21) {
      return [0, 1];
    }
  }

  const wins1 = play(p1pos, p2pos, p1score, p2score, 1, casts + 1);
  const wins2 = play(p1pos, p2pos, p1score, p2score, 2, casts + 1);
  const wins3 = play(p1pos, p2pos, p1score, p2score, 3, casts + 1);

  res = [wins1[0] + wins2[0] + wins3[0], wins1[1] + wins2[1] + wins3[1]];
  CACHE.set(key, res);

  return res;
};

const solve2 = (p1: number, p2: number): number => {
  return Math.max(...play(p1 - 1, p2 - 1, 0, 0, 0, 0));
};

assert(solve1(4, 8) === 739785);
console.log(solve1(5, 10));

assert(solve2(4, 8) === 444356092776315);
console.log(solve2(5, 10));
