import { strict as assert } from "assert";
import { readFileSync } from "fs";
import { Grid } from "../grid";

const DOT = "\u2593";
const EMPTY = "\u2591";

const getGrid = (lines: string[]): Grid<string> => {
  const data: Map<string, string> = new Map();

  let maxX = 0;
  let maxY = 0;
  for (const dot of lines) {
    const parts = dot.split(",");
    data.set(dot, DOT);

    if (maxX < +parts[0]) {
      maxX = +parts[0];
    }
    if (maxY < +parts[1]) {
      maxY = +parts[1];
    }
  }

  return new Grid(data, 0, maxX, 0, maxY);
};

const fold = (
  grid: Grid<string>,
  side: string,
  value: number
): Grid<string> => {
  let newGrid = null;

  switch (side) {
    case "y": {
      newGrid = new Grid(new Map(), 0, grid.maxX, 0, grid.maxY - value - 1);
      for (let y = 0; y < value; y++) {
        for (let x = 0; x < grid.maxX + 1; x++) {
          if (grid.get(x, y)) {
            newGrid.set(x, y, DOT);
          }
        }
      }

      for (let y = value; y < grid.maxY + 1; y++) {
        for (let x = 0; x < grid.maxX + 1; x++) {
          if (grid.get(x, y)) {
            newGrid.set(x, grid.maxY - y, DOT);
          }
        }
      }
      break;
    }

    case "x": {
      newGrid = new Grid(new Map(), 0, grid.maxX - value - 1, 0, grid.maxY);
      for (let y = 0; y < grid.maxY + 1; y++) {
        for (let x = 0; x < value; x++) {
          if (grid.get(x, y)) {
            newGrid.set(x, y, DOT);
          }
        }
      }

      for (let y = 0; y < grid.maxY + 1; y++) {
        for (let x = value; x < grid.maxX + 1; x++) {
          if (grid.get(x, y)) {
            newGrid.set(grid.maxX - x, y, DOT);
          }
        }
      }
      break;
    }

    default:
      throw `unsupported axis: ${side}`;
  }

  return newGrid;
};

const solve1 = (file: string): number => {
  const input = readFileSync(file, "utf-8").trim().split("\n\n");
  const dots = input[0].split("\n");
  const grid = getGrid(dots);

  const fold1 = input[1].split("\n")[0].split("=");
  const side = fold1[0][fold1[0].length - 1];
  const value = +fold1[1];

  const newGrid = fold(grid, side, value);

  let sum = 0;
  newGrid.forEach((x, y) => {
    if (newGrid.get(x, y) === DOT) {
      sum++;
    }
  });

  return sum;
};

const solve2 = (file: string): number => {
  const input = readFileSync(file, "utf-8").trim().split("\n\n");
  const dots = input[0].split("\n");
  let grid = getGrid(dots);

  for (const instr of input[1].split("\n")) {
    const parts = instr.split("=");
    const side = parts[0][parts[0].length - 1];
    const value = +parts[1];

    grid = fold(grid, side, value);
  }

  for (const line of grid.print(EMPTY)) {
    console.log(line);
  }

  return 0;
};

assert(solve1("./example.txt") === 17);
console.log(solve1("./input.txt"));

console.log(solve2("./input.txt"));
