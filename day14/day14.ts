import { strict as assert } from "assert";
import { readFileSync } from "fs";

const parse = (
  file: string
): { template: string; mapping: Map<string, string> } => {
  const input = readFileSync(file, "utf-8").trim().split("\n\n");
  const template = input[0];
  const pairs = input[1].split("\n");

  const mapping = new Map();
  for (const pair of pairs) {
    const parts = pair.split(" -> ");
    mapping.set(parts[0], parts[1]);
  }

  return { template, mapping };
};

const CACHE: Map<string, Map<string, number>> = new Map();

const step = (
  pair: string,
  mapping: Map<string, string>,
  steps: number,
  depth: number
): Map<string, number> => {
  const key = `${pair}-${depth}`;
  const res = CACHE.get(key);
  if (res) {
    return res;
  }

  const match = mapping.get(pair);
  if (!match) {
    throw `unexpected mapping: ${match}`;
  }

  if (depth < steps) {
    const b1 = step(`${pair[0]}${match}`, mapping, steps, depth + 1);
    const b2 = step(`${match}${pair[1]}`, mapping, steps, depth + 1);

    const r = new Map();
    b1.forEach((v, k) => {
      r.set(k, v);
    });
    b2.forEach((v, k) => {
      r.set(k, (r.get(k) || 0) + v);
    });

    CACHE.set(key, r);

    return r;
  }

  const r = new Map();
  r.set(pair[0], 1);
  r.set(match, (r.get(match) || 0) + 1);

  if (depth === steps - 1) {
    r.set(pair[1], (r.get(pair[1]) || 0) + 1);
  }

  return r;
};

const solve = (file: string, steps: number): number => {
  CACHE.clear();
  const parsed = parse(file);

  const sum = new Map();
  for (let i = 0; i < parsed.template.length - 1; i++) {
    const count = step(
      parsed.template[i] + parsed.template[i + 1],
      parsed.mapping,
      steps,
      1
    );
    count.forEach((value, key) => {
      sum.set(key, (sum.get(key) || 0) + value);
    });
  }

  // count the very last character in the template too
  sum.set(
    parsed.template[parsed.template.length - 1],
    (sum.get(parsed.template[parsed.template.length - 1]) || 0) + 1
  );

  let max = 0;
  let min = Number.MAX_SAFE_INTEGER;
  sum.forEach((value, key) => {
    if (max < value) {
      max = value;
    }
    if (min > value) {
      min = value;
    }
  });

  return max - min;
};

assert(solve("./example.txt", 10) === 1588);
console.log(solve("../input/2021/day14.txt", 10));

assert(solve("./example.txt", 40) === 2188189693529);
console.log(solve("../input/2021/day14.txt", 40));
