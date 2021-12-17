/* eslint-disable no-param-reassign */
import { strict as assert } from "assert";

const shoot = (
  minX: number,
  maxX: number,
  minY: number,
  maxY: number,
  dx: number,
  dy: number
): { record: number; hit: boolean } => {
  let x = 0;
  let y = 0;

  let record = 0;
  let hit = false;
  while (!hit) {
    if (x >= minX && x <= maxX && y >= minY && y <= maxY) {
      hit = true;
      break;
    }

    if (x > maxX || y < minY) {
      break;
    }

    x += dx;
    y += dy;

    if (record < y) {
      record = y;
    }

    dx = Math.max(dx - 1, 0);
    dy -= 1;
  }

  return { record, hit };
};

const solve = (
  minX: number,
  maxX: number,
  minY: number,
  maxY: number,
  minDx: number,
  maxDx: number,
  minDy: number,
  maxDy: number
): { max: number; sum: number } => {
  let max = 0;
  let sum = 0;

  for (let dy = minDx; dy < maxDx; dy++) {
    for (let dx = minDy; dx < maxDy; dx++) {
      const res = shoot(minX, maxX, minY, maxY, dx, dy);

      if (res.hit) {
        sum++;

        if (res.record > max) {
          max = res.record;
        }
      }
    }
  }

  return { max, sum };
};

assert(shoot(20, 30, -10, -5, 7, 2).hit);
assert(shoot(20, 30, -10, -5, 6, 3).hit);
assert(shoot(20, 30, -10, -5, 9, 0).hit);
assert(!shoot(20, 30, -10, -5, 17, -4).hit);

// just guess reasonable bounds for brute ¯\_(ツ)_/¯

// target area: x=20..30, y=-10..-5
assert(solve(20, 30, -10, -5, -100, 100, -100, 100).max === 45);
// target area: x=138..184, y=-125..-71
console.log(solve(138, 184, -125, -71, -200, 200, 0, 200).max);

assert(solve(20, 30, -10, -5, -100, 100, -100, 100).sum === 112);
console.log(solve(138, 184, -125, -71, -200, 200, 0, 200).sum);
