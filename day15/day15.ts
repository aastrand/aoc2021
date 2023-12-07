import { strict as assert } from "assert";
import { readFileSync } from "fs";
import { Edge, findShortestPathWeighted } from "../graph";
import { Grid } from "../grid";

const parse = (file: string): string[] =>
  readFileSync(file, "utf-8").trim().split("\n");

const walk = (grid: Grid<number>): number => {
  const graph: Map<string, Array<Edge>> = new Map();

  grid.forEach((x: number, y: number) => {
    const pos = Grid.toPos(x, y);

    let edges = graph.get(pos);
    if (!edges) {
      edges = [];
      graph.set(pos, edges);
    }

    for (const dir of grid.directions) {
      const xd = x + dir[0];
      const yd = y + dir[1];
      const value = grid.get(xd, yd);

      if (value !== undefined) {
        edges.push({ to: Grid.toPos(xd, yd), cost: value });
      }
    }
  });

  const result = findShortestPathWeighted(
    graph,
    "0,0",
    `${grid.maxX},${grid.maxY}`
  );

  return result.distance;
};

const solve1 = (file: string): number => {
  const lines = parse(file);
  const grid: Grid<number> = Grid.parseGrid(lines, Number);

  return walk(grid);
};

const solve2 = (file: string): number => {
  const lines = parse(file);
  const grid: Grid<number> = Grid.parseGrid(lines, Number);

  const scale = 5;
  const larger: Grid<number> = new Grid(
    new Map(),
    0,
    (grid.maxX + 1) * scale - 1,
    0,
    (grid.maxY + 1) * scale - 1
  );
  for (let yd = 0; yd < scale; yd++) {
    for (let xd = 0; xd < scale; xd++) {
      grid.forEach((x, y) => {
        const original = grid.get(x, y) + xd + yd;
        let value = original % 10;
        if (value < original) {
          value++;
        }

        larger.set(x + xd * (grid.maxX + 1), y + yd * (grid.maxY + 1), value);
      });
    }
  }

  return walk(larger);
};

assert(solve1("./example.txt") === 40);
console.log(solve1("../input/2021/day15.txt"));

assert(solve2("./example.txt") === 315);
console.log(solve2("../input/2021/day15.txt"));
