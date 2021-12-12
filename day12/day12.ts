import { strict as assert } from "assert";
import { readFileSync } from "fs";
import { allPaths } from "../graph";

const parse = (file: string): string[] =>
  readFileSync(file, "utf-8").trim().split("\n");

const isUpper = (char: string): boolean => {
  return char === char.toUpperCase();
};

const getGraph = (lines: string[]): Map<string, Array<string>> => {
  const graph: Map<string, Array<string>> = new Map();

  for (const line of lines) {
    const parts = line.split("-");
    let neighbours = graph.get(parts[0]);
    if (!neighbours) {
      neighbours = [];
      graph.set(parts[0], neighbours);
    }
    neighbours.push(parts[1]);

    neighbours = graph.get(parts[1]);
    if (!neighbours) {
      neighbours = [];
      graph.set(parts[1], neighbours);
    }
    neighbours.push(parts[0]);
  }

  return graph;
};

const solve1 = (file: string): number => {
  const graph = getGraph(parse(file));

  const visited: Map<string, number> = new Map();
  const shouldVisit = (n: string, v: Map<string, number>): boolean => {
    return isUpper(n) || (n !== "start" && !v.get(n));
  };

  const paths = allPaths("start", "end", graph, visited, shouldVisit, [], []);

  return paths.length;
};

const solve2 = (file: string): number => {
  const graph = getGraph(parse(file));

  const visited: Map<string, number> = new Map();
  const shouldVisit = (n: string, v: Map<string, number>): boolean => {
    let canAddSmall = true;
    v.forEach((value, node) => {
      if (!isUpper(node) && value > 1) {
        canAddSmall = false;
      }
    });

    return (
      isUpper(n) ||
      (n !== "start" && !v.get(n)) ||
      (n !== "start" && canAddSmall)
    );
  };

  const paths = allPaths("start", "end", graph, visited, shouldVisit, [], []);

  return paths.length;
};

assert(isUpper("AA"));
assert(solve1("./example.txt") === 10);
assert(solve1("./example2.txt") === 19);
assert(solve1("./example3.txt") === 226);
console.log(solve1("./input.txt"));

assert(solve2("./example.txt") === 36);
assert(solve2("./example2.txt") === 103);
assert(solve2("./example3.txt") === 3509);
console.log(solve2("./input.txt"));
