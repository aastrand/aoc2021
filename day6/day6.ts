import { strict as assert } from "assert";
import { readFileSync } from "fs";

const parse = (file: string): string[] =>
  readFileSync(file, "utf-8").trim().split("\n");

const solve = (file: string, days: number): number => {
  const lines = parse(file);
  const fishes = lines[0]
    .trim()
    .split(",")
    .map((s) => +s);

  const ages: Array<number> = new Array(9).fill(0);
  for (const fish of fishes) {
    ages[fish]++;
  }

  for (let day = 1; day < days + 1; day++) {
    const zero = ages.shift();
    ages[6] += zero;
    ages.push(zero);
  }

  return ages.reduce((sum, f) => sum + f, 0);
};

assert(solve("./example.txt", 18) === 26);
assert(solve("./example.txt", 80) === 5934);
assert(solve("./example.txt", 256) === 26984457539);
console.log(solve("./input.txt", 80));
console.log(solve("./input.txt", 256));
