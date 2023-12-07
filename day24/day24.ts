import { readFileSync } from "fs";

const parse = (file: string): string[] =>
  readFileSync(file, "utf-8").trim().split("\n");

interface Op {
  sibling: number;
  add: number;
}

// it took me a long-ass time to even understand why this is correct
// logic not discovered by me, at all
// worst day ever I think
const solve = (file: string): void => {
  const lines = parse(file);

  const digits = {};
  const stack: Op[] = [];

  let monad = 0;

  let push = false;
  let offset = 0;

  for (let i = 0; i < lines.length; i++) {
    const parts = lines[i].split(" ");
    const b = parts[2];

    switch (i % 18) {
      case 4: {
        push = b === "1";
        break;
      }
      case 5: {
        offset = +b;
        break;
      }
      case 15: {
        if (push) {
          stack.push({ sibling: monad, add: +b });
          // 0, 10
          // 1, 16
          // 2, 0
          // 3, 13
        } else {
          const op = stack.pop();
          // 13 - 14
          const diff = op.add + offset;

          if (diff < 0) {
            // 3 = -1 => 2, 9
            // 4 = 1, 8
            digits[op.sibling] = [9, -diff + 1];
            digits[monad] = [9 + diff, 1];
          } else {
            digits[op.sibling] = [9 - diff, 1];
            digits[monad] = [9, 1 + diff];
          }
        }

        monad++;
        break;
      }
      default:
        break;
    }
  }

  const p1 = [];
  const p2 = [];
  for (let i = 0; i < 14; i++) {
    p1.push(digits[i][0]);
    p2.push(digits[i][1]);
  }

  console.log(p1.join(""));
  console.log(p2.join(""));
};

solve("../input/2021/day24.txt");
