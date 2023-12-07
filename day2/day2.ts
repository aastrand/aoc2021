import { strict as assert } from "assert";
import { readFileSync } from "fs";

const parse = (file: string): string[] =>
  readFileSync(file, "utf-8").trim().split("\n");

const solve1 = (file: string): number => {
  const lines = parse(file);

  let depth = 0;
  let forward = 0;
  for (const line of lines) {
    const parts = line.split(" ");
    switch (parts[0]) {
      case "forward":
        forward += +parts[1];
        break;
      case "down":
        depth += +parts[1];
        break;
      case "up":
        depth -= +parts[1];
        break;
      default:
        throw `unexpected split: ${parts[0]}`;
    }
  }

  return depth * forward;
};

const solve2 = (file: string): number => {
  const lines = parse(file);

  let depth = 0;
  let forward = 0;
  let aim = 0;
  for (const line of lines) {
    const parts = line.split(" ");
    switch (parts[0]) {
      case "forward":
        forward += +parts[1];
        depth += aim * +parts[1];
        break;
      case "down":
        aim += +parts[1];
        break;
      case "up":
        aim -= +parts[1];
        break;
      default:
        throw `unexpected split: ${parts[0]}`;
    }
  }

  return depth * forward;
};

assert(solve1("./example.txt") === 150);
console.log(solve1("../input/2021/day2.txt"));

assert(solve2("./example.txt") === 900);
console.log(solve2("../input/2021/day2.txt"));
