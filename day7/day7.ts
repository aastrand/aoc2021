import { strict as assert } from "assert";
import { readFileSync } from "fs";

const parse = (file: string): string[] =>
  readFileSync(file, "utf-8").trim().split("\n");

const solve = (file: string, costFn: (n: number) => number): number => {
  const lines = parse(file);
  const crabs = lines[0].split(",").map(Number);
  const min = Math.min(...crabs);
  const max = Math.max(...crabs);

  let minCost = Number.MAX_SAFE_INTEGER;
  for (let diff = min; diff < max + 1; diff++) {
    let cost = 0;
    for (const crab of crabs) {
      cost += costFn(Math.abs(crab - diff));
    }

    if (cost < minCost) {
      minCost = cost;
    }
  }

  return minCost;
};

const solve1 = (file: string): number => {
  return solve(file, (n) => n);
};

const adjustedCost = (pos: number): number => {
  // Gauss
  // https://stackoverflow.com/questions/29549836/how-to-find-the-sum-of-all-numbers-between-1-and-n-using-javascript
  return (pos * (pos + 1)) / 2;
};

const solve2 = (file: string): number => {
  return solve(file, adjustedCost);
};

assert(solve1("./example.txt") === 37);
console.log(solve1("./input.txt"));

assert(adjustedCost(11) === 66);
assert(adjustedCost(4) === 10);
assert(adjustedCost(5) === 15);

assert(solve2("./example.txt") === 168);
console.log(solve2("./input.txt"));
