import { strict as assert } from "assert";
import { readFileSync } from "fs";
import { bresenham, Grid } from "../grid";

const parse = (file: string): string[] =>
  readFileSync(file, "utf-8").trim().split("\n");

const solve = (file: string, countDiagonals: boolean): number => {
  const lines = parse(file);
  const data: Map<string, number> = new Map();

  for (const line of lines) {
    const parts = line.split(" -> ");
    const fromX = +parts[0].split(",")[0];
    const fromY = +parts[0].split(",")[1];
    const toX = +parts[1].split(",")[0];
    const toY = +parts[1].split(",")[1];

    if (countDiagonals || fromX === toX || fromY === toY) {
      bresenham(fromX, fromY, toX, toY, (x, y) => {
        const pos = Grid.toPos(x, y);
        data.set(pos, (data.get(pos) || 0) + 1);
      });
    }
  }

  let count = 0;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  data.forEach((value, _) => {
    if (value >= 2) {
      count++;
    }
  });

  return count;
};

assert(solve("./example.txt", false) === 5);
console.log(solve("./input.txt", false));

assert(solve("./example.txt", true) === 12);
console.log(solve("./input.txt", true));
