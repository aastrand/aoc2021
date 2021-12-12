import { strict as assert } from "assert";
import { readFileSync } from "fs";

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

const traverse = (
  cur: string,
  end: string,
  graph: Map<string, Array<string>>,
  visited: Map<string, number>,
  shouldAddSmall: boolean,
  path: Array<string>,
  paths: Array<Array<string>>
): Array<Array<string>> => {
  path.push(cur);
  visited.set(cur, (visited.get(cur) || 0) + 1);

  let canAddSmall = true;
  visited.forEach((value, node) => {
    if (!isUpper(node) && value > 1) {
      canAddSmall = false;
    }
  });

  if (cur === end) {
    paths.push([...path]);
  } else {
    for (const n of graph.get(cur) || []) {
      if (isUpper(n)) {
        traverse(n, end, graph, visited, shouldAddSmall, path, paths);
      } else if (n !== "start" && !visited.get(n)) {
        traverse(n, end, graph, visited, shouldAddSmall, path, paths);
      } else if (n !== "start" && shouldAddSmall && canAddSmall) {
        traverse(n, end, graph, visited, shouldAddSmall, path, paths);
      }
    }
  }

  path.pop();
  visited.set(cur, visited.get(cur) - 1);

  return paths;
};

const solve1 = (file: string): number => {
  const graph = getGraph(parse(file));
  const paths = traverse("start", "end", graph, new Map(), false, [], []);

  return paths.length;
};

const solve2 = (file: string): number => {
  const graph = getGraph(parse(file));
  const paths = traverse("start", "end", graph, new Map(), true, [], []);

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
