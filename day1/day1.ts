import { strict as assert } from "assert";
import { readFileSync } from "fs";

const parse = (file: string): string[] =>
  readFileSync(file, "utf-8").trim().split("\n");

const solve1 = (file: string): number => {
  const numbers = parse(file).map((l) => +l);

  let previous = null;
  let increaseCount = 0;
  for (const num of numbers) {
    if (previous && num - previous > 0) {
      increaseCount++;
    }
    previous = num;
  }

  return increaseCount;
};

const solve2 = (file: string): number => {
  const numbers = parse(file).map((l) => +l);

  let increaseCount = 0;
  for (let i = 0; i < numbers.length - 3; i++) {
    const first = numbers[i] + numbers[i + 1] + numbers[i + 2];
    const second = numbers[i + 1] + numbers[i + 2] + numbers[i + 3];
    if (second > first) {
      increaseCount++;
    }
  }

  return increaseCount;
};

assert(solve1("./example.txt") === 7);
console.log(solve1("./input.txt"));

assert(solve2("./example.txt") === 5);
console.log(solve2("./input.txt"));
