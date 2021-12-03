import { strict as assert } from "assert";
import { readFileSync } from "fs";

const parse = (file: string): string[] =>
  readFileSync(file, "utf-8").trim().split("\n");

const commonBit = (lines: string[], i: number): string => {
  let count = 0;
  for (const line of lines) {
    if (line[i] === "1") {
      count++;
    }
  }

  return count >= lines.length / 2 ? "1" : "0";
};

const solve1 = (file: string): number => {
  const lines = parse(file);
  const bits = Array(lines[0].length).fill(0);

  for (let i = 0; i < lines[0].length; i++) {
    bits[i] = commonBit(lines, i);
  }

  const gamma = parseInt(bits.join(""), 2);
  const epsilon = parseInt(
    bits.map((n) => (n === "0" ? "1" : "0")).join(""),
    2
  );

  return gamma * epsilon;
};

const reduceSet = (
  lines: string[],
  criteria: (s: string, b: string) => boolean
): string => {
  let workingSet = lines.concat([]);

  for (let i = 0; i < workingSet[0].length; i++) {
    const newLines = [];
    const bit = commonBit(workingSet, i);

    for (const line of workingSet) {
      if (criteria(line[i], bit)) {
        newLines.push(line);
      }
    }

    workingSet = newLines;

    if (workingSet.length === 1) {
      break;
    }
  }

  return workingSet[0];
};

const solve2 = (file: string): number => {
  const lines = parse(file);

  const o2 = parseInt(
    reduceSet(lines, (s, n) => s === n),
    2
  );
  const co2 = parseInt(
    reduceSet(lines, (s, n) => s !== n),
    2
  );

  return o2 * co2;
};

assert(solve1("./example.txt") === 198);
console.log(solve1("./input.txt"));

assert(solve2("./example.txt") === 230);
console.log(solve2("./input.txt"));
