/* eslint-disable no-continue */
import { strict as assert } from "assert";
import { readFileSync } from "fs";
import { Grid } from "../grid";

const parse = (file: string): string[] =>
  readFileSync(file, "utf-8").trim().split("\n");

const step = (grid: Grid<string>): [Grid<string>, boolean] => {
  let moved = false;

  const newGrid = new Grid(new Map(), 0, 0, 0, 0);
  const visited = new Set();
  for (let y = 0; y < grid.maxY + 1; y++) {
    for (let x = 0; x < grid.maxX + 1; x++) {
      const key = `${x},${y}`;
      if (visited.has(key)) {
        continue;
      }

      const char = grid.get(x, y);
      const formerX = x === 0 ? grid.maxX : x - 1;

      if (char === ".") {
        if (grid.get(formerX, y) === ">") {
          newGrid.set(x, y, ">");
          newGrid.set(formerX, y, ".");
          visited.add(`${formerX},${y}`);

          moved = true;
        } else {
          newGrid.set(x, y, ".");
        }
      } else {
        newGrid.set(x, y, char);
      }

      visited.add(`${x},${y}`);
    }
  }

  const second = new Grid(new Map(), 0, 0, 0, 0);
  visited.clear();
  for (let y = 0; y < newGrid.maxY + 1; y++) {
    for (let x = 0; x < newGrid.maxX + 1; x++) {
      const key = `${x},${y}`;
      if (visited.has(key)) {
        continue;
      }

      const char = newGrid.get(x, y);
      const formerY = y === 0 ? grid.maxY : y - 1;

      if (char === ".") {
        if (newGrid.get(x, formerY) === "v") {
          second.set(x, y, "v");
          second.set(x, formerY, ".");
          visited.add(`${x},${formerY}`);

          moved = true;
        } else {
          second.set(x, y, ".");
        }
      } else {
        second.set(x, y, char);
      }

      visited.add(`${x},${y}`);
    }
  }

  return [second, moved];
};

const getGrid = (lines: string[]): Grid<string> => {
  return Grid.parseGrid(lines);
};

const solve1 = (file: string): number => {
  let grid = getGrid(parse(file));
  let steps = 0;
  let moved = true;

  while (moved) {
    const parts = step(grid);
    grid = parts[0];
    moved = parts[1];

    steps++;
  }

  return steps;
};

let grid = getGrid(parse("examplesmall.txt"));
for (const line of grid.print("")) {
  console.log(line);
}
console.log();
grid = step(grid)[0];
for (const line of grid.print("")) {
  console.log(line);
}
console.log();
grid = step(grid)[0];
for (const line of grid.print("")) {
  console.log(line);
}
console.log();
grid = step(grid)[0];
for (const line of grid.print("")) {
  console.log(line);
}
console.log();
grid = step(grid)[0];
for (const line of grid.print("")) {
  console.log(line);
}
console.log();

assert(solve1("./example.txt") === 58);
console.log(solve1("./input.txt"));
