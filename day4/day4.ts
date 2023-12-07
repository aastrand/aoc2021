import { strict as assert } from "assert";
import { readFileSync } from "fs";

class Board {
  numbers: number[];

  marked: Set<number>;

  SIZE = 5;

  constructor(numbers: number[], marked: Set<number>) {
    this.numbers = numbers;
    this.marked = marked;
  }

  hasBingo(): boolean {
    // rows
    for (let y = 0; y < this.SIZE; y++) {
      let found = true;
      for (let x = 0; x < this.SIZE; x++) {
        found = found && this.marked.has(y * this.SIZE + x);
      }

      if (found) {
        return true;
      }
    }

    // columns
    for (let x = 0; x < this.SIZE; x++) {
      let found = true;
      for (let y = 0; y < this.SIZE; y++) {
        found = found && this.marked.has(y * this.SIZE + x);
      }

      if (found) {
        return true;
      }
    }

    return false;
  }

  mark(value: number): void {
    for (let i = 0; i < this.numbers.length; i++) {
      if (this.numbers[i] === value) {
        this.marked.add(i);
      }
    }
  }

  isMarked(value: number): boolean {
    let ret = false;

    this.marked.forEach((idx) => {
      if (value === this.numbers[idx]) {
        ret = true;
      }
    });

    return ret;
  }

  score(winner: number): number {
    let score = 0;

    for (let i = 0; i < this.numbers.length; i++) {
      if (!this.marked.has(i)) {
        score += this.numbers[i];
      }
    }

    return score * winner;
  }
}

const getBoards = (parts: string[]): Array<Board> => {
  const boards: Array<Board> = [];

  for (let i = 1; i < parts.length; i++) {
    boards.push(
      new Board(
        parts[i]
          .split("\n")
          .flatMap((s) => s.split(" "))
          .filter((s) => s !== "")
          .map((s) => +s),
        new Set()
      )
    );
  }

  return boards;
};

const solve1 = (file: string): number => {
  const parts = readFileSync(file, "utf-8").trim().split("\n\n");
  const draws = parts[0].split(",").map((s) => +s);
  const boards = getBoards(parts);

  for (const draw of draws) {
    for (const board of boards) {
      board.mark(draw);

      if (board.hasBingo()) {
        return board.score(draw);
      }
    }
  }

  return 0;
};

const solve2 = (file: string): number => {
  const parts = readFileSync(file, "utf-8").trim().split("\n\n");
  const draws = parts[0].split(",").map((s) => +s);
  const boards = getBoards(parts);

  const won: Set<number> = new Set();
  for (const draw of draws) {
    for (let i = 0; i < boards.length; i++) {
      if (!won.has(i)) {
        const board = boards[i];
        board.mark(draw);

        if (board.hasBingo()) {
          if (won.size === boards.length - 1) {
            return board.score(draw);
          }

          won.add(i);
        }
      }
    }
  }

  return 0;
};

const nums = [];
for (let i = 0; i < 25; i++) {
  nums.push(i);
}
const board: Board = new Board(nums, new Set());

board.mark(0);
board.mark(1);
board.mark(2);
board.mark(3);
assert(board.hasBingo() === false);

board.mark(4);
assert(board.hasBingo() === true);

board.marked.clear();
board.mark(2);
board.mark(7);
board.mark(12);
board.mark(17);
assert(board.hasBingo() === false);

assert(board.isMarked(22) === false);
board.mark(22);
assert(board.isMarked(22) === true);
assert(board.hasBingo() === true);

assert(solve1("./example.txt") === 4512);
console.log(solve1("../input/2021/day4.txt"));

assert(solve2("./example.txt") === 1924);
console.log(solve2("../input/2021/day4.txt"));
