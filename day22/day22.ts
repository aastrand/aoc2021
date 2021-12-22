import { strict as assert } from "assert";
import { readFileSync } from "fs";

const parse = (file: string): string[] =>
  readFileSync(file, "utf-8").trim().split("\n");

const sizeOf = (
  dims: [number, number, number, number, number, number]
): number => {
  return (
    (dims[1] + 1 - dims[0]) * (dims[3] + 1 - dims[2]) * (dims[5] + 1 - dims[4])
  );
};

const split = (
  instr: [number, number, number, number, number, number],
  handled: Set<[number, number, number, number, number, number]>
): void => {
  const add = [];
  const del = [];

  for (const h of handled) {
    let hMinX = h[0];
    let hMaxX = h[1];
    let hMinY = h[2];
    let hMaxY = h[3];
    let hMinZ = h[4];
    let hMaxZ = h[5];

    const minX = Math.max(instr[0], hMinX);
    const maxX = Math.min(instr[1], hMaxX);
    const minY = Math.max(instr[2], hMinY);
    const maxY = Math.min(instr[3], hMaxY);
    const minZ = Math.max(instr[4], hMinZ);
    const maxZ = Math.min(instr[5], hMaxZ);

    // plane split logic from u/Diderikdm because cba really
    if (minX <= maxX && minY <= maxY && minZ <= maxZ) {
      del.push(h);
      if (hMinX <= minX && minX <= hMaxX) {
        add.push([hMinX, minX - 1, hMinY, hMaxY, hMinZ, hMaxZ]);
        hMinX = minX;
      }
      if (hMinX <= maxX && maxX <= hMaxX) {
        add.push([maxX + 1, hMaxX, hMinY, hMaxY, hMinZ, hMaxZ]);
        hMaxX = maxX;
      }
      if (hMinY <= minY && minY <= hMaxY) {
        add.push([hMinX, hMaxX, hMinY, minY - 1, hMinZ, hMaxZ]);
        hMinY = minY;
      }
      if (hMinY <= maxY && maxY <= hMaxY) {
        add.push([hMinX, hMaxX, maxY + 1, hMaxY, hMinZ, hMaxZ]);
        hMaxY = maxY;
      }
      if (hMinZ <= minZ && minZ <= hMaxZ) {
        add.push([hMinX, hMaxX, hMinY, hMaxY, hMinZ, minZ - 1]);
        hMinZ = minZ;
      }
      if (hMinZ <= maxZ && maxZ <= hMaxZ) {
        add.push([hMinX, hMaxX, hMinY, hMaxY, maxZ + 1, hMaxZ]);
        hMaxZ = maxZ;
      }
    }
  }

  for (const d of del) {
    handled.delete(d);
  }
  for (const a of add) {
    handled.add(a);
  }
};

const solve = (file: string, max?: number): number => {
  const lines = parse(file);

  const instructions = [];
  for (const line of lines) {
    const parts = line.split(" ");
    const op = parts[0];
    const dims = parts[1].split(",");

    const minX = +dims[0].split("=")[1].split("..")[0];
    const maxX = +dims[0].split("=")[1].split("..")[1];
    const minY = +dims[1].split("=")[1].split("..")[0];
    const maxY = +dims[1].split("=")[1].split("..")[1];
    const minZ = +dims[2].split("=")[1].split("..")[0];
    const maxZ = +dims[2].split("=")[1].split("..")[1];

    if (max) {
      if (
        minX < -1 * max ||
        maxX > max ||
        minY < -1 * max ||
        maxY > max ||
        minZ < -1 * max ||
        maxZ > max
      ) {
        // eslint-disable-next-line no-continue
        continue;
      }
    }

    instructions.push({
      op,
      dim: [minX, maxX, minY, maxY, minZ, maxZ],
    });
  }

  const handled: Set<[number, number, number, number, number, number]> =
    new Set();
  for (const instr of instructions) {
    split(instr.dim, handled);
    if (instr.op === "on") {
      handled.add(instr.dim);
    }
  }

  let sum = 0;
  for (const h of handled) {
    sum += sizeOf(h);
  }

  return sum;
};

assert(solve("./example.txt", 50) === 39);
assert(solve("./example2.txt", 50) === 590784);
console.log(solve("./input.txt", 50));

assert(sizeOf([10, 12, 10, 12, 10, 12]) === 27);
assert(sizeOf([10, 10, 10, 10, 10, 10]) === 1);

assert(solve("./example.txt") === 39);
assert(solve("./example2.txt") === 39769202357779);
assert(solve("./example3.txt") === 2758514936282235);
console.log(solve("./input.txt"));
