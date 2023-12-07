import { strict as assert } from "assert";
import { readFileSync } from "fs";
import { Grid } from "../grid";
import { bfs, parseGraph } from "../graph";

const parse = (file: string): string[] =>
  readFileSync(file, "utf-8").trim().split("\n");

const findLowest = (grid: Grid<string>): Array<[number, number]> => {
  const ret = [];
  grid.forEach((x, y) => {
    const value = +grid.get(x, y);
    let isLowest = true;
    for (const neighbour of grid.getAdjecent(x, y)) {
      if (+neighbour <= value) {
        isLowest = false;
        break;
      }
    }

    if (isLowest) {
      ret.push([x, y]);
    }
  });

  return ret;
};

const solve1 = (file: string): number => {
  const lines = parse(file);
  const grid = Grid.parseGrid(lines);

  let risk = 0;
  for (const pos of findLowest(grid)) {
    risk += +grid.get(pos[0], pos[1]) + 1;
  }

  return risk;
};

const solve2 = (file: string): number => {
  const lines = parse(file);
  const grid = Grid.parseGrid(lines);
  const graph = parseGraph(
    grid,
    new Set(["0", "1", "2", "3", "4", "5", "6", "7", "8"])
  );

  const sizes: number[] = [];
  for (const pos of findLowest(grid)) {
    sizes.push(bfs(Grid.toPos(pos[0], pos[1]), graph).size);
  }

  sizes.sort((n1, n2) => n2 - n1);

  return sizes[0] * sizes[1] * sizes[2];
};

assert(solve1("./example.txt") === 15);
console.log(solve1("../input/2021/day9.txt"));

assert(solve2("./example.txt") === 1134);
console.log(solve2("../input/2021/day9.txt"));
