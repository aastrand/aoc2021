/* eslint-disable no-bitwise */
/* eslint-disable import/prefer-default-export */
/* eslint-disable class-methods-use-this */
class Grid<T> {
  data: Map<string, T>;

  minX: number;

  maxX: number;

  minY: number;

  maxY: number;

  directions = [
    [0, -1], // up
    [0, 1], // down
    [-1, 0], // left
    [1, 0], // right
  ];

  adjecent: Array<[number, number]> = [
    [-1, 0], // left
    [1, 0], // right

    [1, -1], // bottom right
    [0, -1], // bottom middle
    [-1, -1], // bottom left

    [1, 1], // top right
    [0, 1], // top middle
    [-1, 1], // top left
  ];

  constructor(
    data: Map<string, T>,
    minX: number,
    maxX: number,
    minY: number,
    maxY: number
  ) {
    this.data = data;
    this.minX = minX;
    this.maxX = maxX;
    this.minY = minY;
    this.maxY = maxY;
  }

  static parseGrid = (lines: string[]): Grid<string> => {
    const data: Map<string, string> = new Map();
    let maxX = 0;
    let maxY = 0;

    for (let y = 0; y < lines.length; y++) {
      for (let x = 0; x < lines[y].length; x++) {
        data.set(Grid.toPos(x, y), lines[y][x]);

        if (maxX < x) {
          maxX = x;
        }
        if (maxY < y) {
          maxY = y;
        }
      }
    }

    return new Grid(data, 0, maxX, 0, maxY);
  };

  static toPos = (x: number, y: number): string => {
    return `${x},${y}`;
  };

  toPos = (x: number, y: number): string => {
    return Grid.toPos(x, y);
  };

  static fromPos = (pos: string): [number, number] => {
    const parts = pos.split(",");
    return [+parts[0], +parts[1]];
  };

  fromPos = (pos: string): [number, number] => {
    return Grid.fromPos(pos);
  };

  get = (x: number, y: number): T => {
    return this.data.get(this.toPos(x, y));
  };

  print = (defaultalue?: string): string[] => {
    const out = [];
    for (let y = this.minY; y < this.maxY + 1; y++) {
      const line = [];
      for (let x = this.minX; x < this.maxX + 1; x++) {
        const pos = Grid.toPos(x, y);
        const point = this.data.get(pos) || defaultalue;

        if (point) {
          line.push(point);
        }
      }

      out.push(`${line.join("")}`);
    }

    return out;
  };

  getAdjecent = (x: number, y: number): Array<string> => {
    const neighbours = [];

    for (const offset of this.adjecent) {
      const chr = this.data.get(Grid.toPos(x + offset[0], y + offset[1]));
      if (chr) {
        neighbours.push(chr);
      }
    }

    return neighbours;
  };

  forEach = (callback: (x: number, y: number) => void): void => {
    for (let y = 0; y < this.maxY + 1; y++) {
      for (let x = 0; x < this.maxX + 1; x++) {
        callback(x, y);
      }
    }
  };
}

// https://github.com/madbence/node-bresenham
const bresenham = (
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  fn: (x: number, y: number) => void
): void => {
  const dx = x1 - x0;
  const dy = y1 - y0;
  const adx = Math.abs(dx);
  const ady = Math.abs(dy);
  let eps = 0;
  const sx = dx > 0 ? 1 : -1;
  const sy = dy > 0 ? 1 : -1;
  if (adx > ady) {
    for (let x = x0, y = y0; sx < 0 ? x >= x1 : x <= x1; x += sx) {
      fn(x, y);
      eps += ady;
      if (eps << 1 >= adx) {
        y += sy;
        eps -= adx;
      }
    }
  } else {
    for (let x = x0, y = y0; sy < 0 ? y >= y1 : y <= y1; y += sy) {
      fn(x, y);
      eps += adx;
      if (eps << 1 >= ady) {
        x += sx;
        eps -= ady;
      }
    }
  }
};

export { bresenham, Grid };
