import { strict as assert } from "assert";
import { readFileSync } from "fs";
import { Grid } from "../grid";

const parse = (file: string): string[] =>
  readFileSync(file, "utf-8").trim().split("\n");

const step = (grid: Grid<number>): number => {
  const hasFlashed = new Set<string>();
  const queue = [];

  // bump all by 1
  grid.forEach((x, y) => {
    const value = grid.get(x, y) + 1;
    grid.set(x, y, value);

    if (value > 9) {
      queue.push([x, y]);
    }
  });

  // handle flashes
  while (queue.length > 0) {
    const pos = queue.shift();
    const key = Grid.toPos(pos[0], pos[1]);

    if (!hasFlashed.has(key)) {
      hasFlashed.add(key);

      for (const neighbour of grid.getAdjecentPositions(pos[0], pos[1])) {
        const value = grid.get(neighbour[0], neighbour[1]);

        if (value !== undefined) {
          grid.set(neighbour[0], neighbour[1], value + 1);

          if (value > 8) {
            queue.push(neighbour);
          }
        }
      }
    }
  }

  // reset flashes
  for (const key of hasFlashed.values()) {
    const pos = Grid.fromPos(key);
    grid.set(pos[0], pos[1], 0);
  }

  return hasFlashed.size;
};

const solve1 = (file: string, steps: number): number => {
  const lines = parse(file);
  const grid: Grid<number> = Grid.parseGrid(lines, Number);

  let sum = 0;
  for (let i = 0; i < steps; i++) {
    sum += step(grid);
  }

  return sum;
};

const solve2 = (file: string): number => {
  const lines = parse(file);
  const grid: Grid<number> = Grid.parseGrid(lines, Number);

  let steps = 0;
  do {
    steps++;
  } while (step(grid) !== 100);

  return steps;
};

assert(solve1("./example_small.txt", 1) === 9);
assert(solve1("./example.txt", 100) === 1656);
console.log(solve1("./input.txt", 100));

assert(solve2("./example.txt") === 195);
console.log(solve2("./input.txt"));
