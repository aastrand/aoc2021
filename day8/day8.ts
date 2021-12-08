import { strict as assert } from "assert";
import { readFileSync } from "fs";

const parse = (file: string): string[] =>
  readFileSync(file, "utf-8").trim().split("\n");

const solve1 = (file: string): number => {
  const lines = parse(file);
  const counts = Array(10).fill(0);

  for (const line of lines) {
    const output = line.split(" | ")[1].split(" ");
    for (const digit of output) {
      counts[digit.length]++;
    }
  }

  // 1 + 7 + 4 + 8
  return counts[2] + counts[3] + counts[4] + counts[7];
};

const setDiff = (setA: Set<string>, setB: Set<string>): Set<string> => {
  const difference = new Set(setA);
  for (const elem of setB) {
    difference.delete(elem);
  }
  return difference;
};

const setContains = (setA: Set<string>, setB: Set<string>): boolean => {
  for (const elem of setB) {
    if (!setA.has(elem)) {
      return false;
    }
  }
  return true;
};

const solve2 = (file: string): number => {
  const lines = parse(file);

  let sum = 0;
  for (const line of lines) {
    const parts = line.split(" | ");
    const patterns = parts[0].split(" ");

    const mapping = Array(10);
    for (let i = 0; i < 10; i++) {
      mapping[i] = new Set();
    }

    for (const digit of patterns) {
      switch (digit.length) {
        case 2: // 1
          for (const char of digit.split("")) {
            mapping[1].add(char);
          }
          break;
        case 3: // 7
          for (const char of digit.split("")) {
            mapping[7].add(char);
          }
          break;
        case 4: // 4
          for (const char of digit.split("")) {
            mapping[4].add(char);
          }
          break;
        case 7: // 8
          for (const char of digit.split("")) {
            mapping[8].add(char);
          }
          break;
        default:
          break;
      }
    }

    // ^ create sets for the known digits

    // second create a heuristic:

    // for len 6:
    // 9 contains 4 && 7
    // 6 contains 4 && !7
    // else 0

    // third, use the above:
    // for len 5:
    // 3 contains 7
    // 5 contains 9 - 7
    // else 2

    for (const digit of patterns) {
      if (digit.length === 6) {
        // 9 contains 4 && 7
        // 6 contains 4 && !7
        // else 0
        const chars = new Set(digit.split(""));

        if (setContains(chars, mapping[4]) && setContains(chars, mapping[7])) {
          mapping[9] = chars;
        } else if (
          setContains(chars, mapping[7]) &&
          !setContains(chars, mapping[4])
        ) {
          mapping[0] = chars;
        } else {
          mapping[6] = chars;
        }
      }
    }

    for (const digit of patterns) {
      if (digit.length === 5) {
        // 3 contains 7
        // 5 contains 9 - 7
        // else 2
        const chars = new Set(digit.split(""));

        if (setContains(chars, mapping[7])) {
          mapping[3] = chars;
        } else if (setContains(chars, setDiff(mapping[9], mapping[7]))) {
          mapping[5] = chars;
        } else {
          mapping[2] = chars;
        }
      }
    }

    const output = parts[1].split(" ");
    let out = "";
    for (const digit of output) {
      const chars = new Set(digit.split(""));

      for (let i = 0; i < mapping.length; i++) {
        if (chars.size === mapping[i].size && setContains(mapping[i], chars)) {
          out += i;
        }
      }
    }
    sum += +out;
  }

  return sum;
};

assert(solve1("./example.txt") === 26);

console.log(solve1("./input.txt"));

assert(solve2("./example.txt") === 61229);
console.log(solve2("./input.txt"));
