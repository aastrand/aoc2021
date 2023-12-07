import { strict as assert } from "assert";
import { readFileSync } from "fs";
import { Grid } from "../grid";

const POSITIONS: Array<[number, number]> = [
  [-1, -1],
  [0, -1],
  [1, -1],

  [-1, 0],
  [0, 0],
  [1, 0],

  [-1, 1],
  [0, 1],
  [1, 1],
];

const indexOf = (
  grid: Grid<string>,
  x: number,
  y: number,
  iteration: number,
  def: string
): number => {
  const num = [];
  for (const offset of POSITIONS) {
    let char = grid.get(x + offset[0], y + offset[1]);
    if (!char && iteration % 2 === 1) {
      char = def;
    }

    num.push(char === "#" ? "1" : "0");
  }
  return parseInt(num.join(""), 2);
};

const solve = (file: string, iterations: number, def: string): number => {
  const input = readFileSync(file, "utf-8").trim().split("\n\n");
  const lookup = input[0];

  let grid: Grid<string> = Grid.parseGrid(input[1].split("\n"));

  for (let i = 0; i < iterations; i++) {
    const newGrid = new Grid(new Map(), 0, 0, 0, 0);
    for (let y = grid.minY - 1; y < grid.maxY + 2; y++) {
      for (let x = grid.minX - 1; x < grid.maxX + 2; x++) {
        newGrid.set(x, y, lookup[indexOf(grid, x, y, i, def)]);
      }
    }

    grid = newGrid;
  }

  let sum = 0;
  grid.forEach((x, y) => {
    if (grid.get(x, y) === "#") {
      sum++;
    }
  });

  return sum;
};

assert(solve("./example.txt", 2, ".") === 35);
console.log(solve("../input/2021/day20.txt", 2, "#"));

assert(solve("./example.txt", 50, ".") === 3351);
console.log(solve("../input/2021/day20.txt", 50, "#"));
