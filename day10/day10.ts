import { strict as assert } from "assert";
import { readFileSync } from "fs";

const parse = (file: string): string[] =>
  readFileSync(file, "utf-8").trim().split("\n");

const openers = ["(", "[", "{", "<"];
const closers = {
  "(": ")",
  "[": "]",
  "{": "}",
  "<": ">",
};
const points = {
  ")": [3, 1],
  "]": [57, 2],
  "}": [1197, 3],
  ">": [25137, 4],
};

interface CheckResult {
  stack: string[];
  invalid?: string;
}

const check = (line: string): CheckResult => {
  const stack = [];

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (openers.includes(char)) {
      stack.push(char);
    } else if (closers[stack.slice(-1)[0]] === char) {
      stack.pop();
    } else {
      return { stack, invalid: char };
    }
  }

  return { stack };
};

const solve1 = (file: string): number => {
  const lines = parse(file);

  let sum = 0;
  for (const line of lines) {
    const out = check(line);
    if (out.invalid) {
      sum += points[out.invalid][0];
    }
  }

  return sum;
};

const solve2 = (file: string): number => {
  const lines = parse(file);
  const incomplete = lines
    .map((l) => check(l))
    .filter((o) => o.invalid === undefined);

  const scores = [];
  for (const out of incomplete) {
    let score = 0;
    for (let i = out.stack.length - 1; i > -1; i--) {
      score *= 5;
      score += points[closers[out.stack[i]]][1];
    }

    scores.push(score);
  }

  scores.sort((a, b) => a - b);

  return scores[Math.floor(scores.length / 2)];
};

let test = "()";
let out = check(test);
assert(out.stack.length === 0);
assert(out.invalid === undefined);
test = "([])";
assert(out.stack.length === 0);
assert(out.invalid === undefined);
test = "{()()()}";
assert(out.stack.length === 0);
assert(out.invalid === undefined);
test = "<([{}])>";
assert(out.stack.length === 0);
assert(out.invalid === undefined);
test = "[<>({}){}[([])<>]]";
assert(out.stack.length === 0);
assert(out.invalid === undefined);
test = "(((((((((())))))))))";
assert(out.stack.length === 0);
assert(out.invalid === undefined);

test = "(]";
out = check(test);
assert(out.stack.length === 1);
assert(out.invalid === "]");
test = "{()()()>";
out = check(test);
assert(out.stack.length === 1);
assert(out.invalid === ">");
test = "(((()))}";
out = check(test);
assert(out.stack.length === 1);
assert(out.invalid === "}");
test = "<([]){()}[{}])";
out = check(test);
assert(out.stack.length === 1);
assert(out.invalid === ")");

assert(solve1("./example.txt") === 26397);
console.log(solve1("./input.txt"));

assert(solve2("./example.txt") === 288957);
console.log(solve2("./input.txt"));
