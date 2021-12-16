import { strict as assert } from "assert";
import { readFileSync } from "fs";

const parse = (file: string): string => readFileSync(file, "utf-8").trim();

const hexCharToBinString = (hex: string): string => {
  let v = parseInt(hex, 16).toString(2);
  const prefix = Array(4 - v.length).fill(0);
  v = `${prefix.join("")}${v}`;

  return v;
};

const hexToBinString = (hex: string): string => {
  const s = [];

  for (const char of hex) {
    s.push(hexCharToBinString(char));
  }

  return s.join("");
};

const binStringToDecimal = (bin: string): number => {
  return +parseInt(bin, 2).toString();
};

const parseLiteral = (
  binary: string,
  cursor: number
): { length: number; value: number } => {
  let cur = cursor;
  const s = [];
  let done = false;

  while (!done) {
    if (binary[cur] === "0") {
      done = true;
    }

    s.push(binary.slice(cur + 1, cur + 5));
    cur += 5;
  }

  return {
    length: s.length * 5,
    value: binStringToDecimal(s.join("")),
  };
};

interface Packet {
  version: number;
  type: number;
  length: number;
  literal?: number;
  children: Array<Packet>;
}

const parsePackets = (binary: string, cursor: number): Packet => {
  let cur = cursor;

  const version = binStringToDecimal(binary.slice(cur, cur + 3));
  const type = binStringToDecimal(binary.slice(cur + 3, cur + 6));
  cur += 6;

  const packet: Packet = { version, type, length: 6, children: [] };

  // literal
  if (type === 4) {
    const literal = parseLiteral(binary, cur);
    packet.literal = literal.value;
    packet.length += literal.length;
  } else {
    // operator
    /*
    If the length type ID is 0, then the next 15 bits are a number that 
    represents the total length in bits of the sub-packets contained by this packet.
    
    If the length type ID is 1, then the next 11 bits are a number that 
    represents the number of sub-packets immediately contained by this packet.
    */
    const ltid = +binary[cur];
    packet.length++;
    cur++;

    const offset = ltid === 1 ? 11 : 15;
    const length = binStringToDecimal(binary.slice(cur, cur + offset));
    packet.length += offset;
    cur += offset;

    let done = false;
    let packets = 0;
    let bits = 0;
    while (!done) {
      const child: Packet = parsePackets(binary, cur);

      packets++;
      bits += child.length;
      packet.children.push(child);

      packet.length += child.length;
      cur += child.length;

      if (ltid === 1) {
        // length = number of packets
        if (packets === length) {
          done = true;
        }
      } else if (bits === length) {
        // length = number of bits
        done = true;
      }
    }
  }

  return packet;
};

const sumVersions = (packet: Packet): number => {
  let sum = 0;

  sum += packet.version;
  for (const child of packet.children) {
    sum += sumVersions(child);
  }

  return sum;
};

const solve1 = (input: string): number => {
  return sumVersions(parsePackets(hexToBinString(input), 0));
};

const evalExpr = (packets: Packet): number => {
  switch (packets.type) {
    case 0: {
      // sum
      let sum = 0;
      for (const child of packets.children) {
        sum += evalExpr(child);
      }
      return sum;
    }
    case 1: {
      // product
      let prod = 1;
      for (const child of packets.children) {
        prod *= evalExpr(child);
      }
      return prod;
    }
    case 2: {
      // min
      let min = Number.MAX_SAFE_INTEGER;
      for (const child of packets.children) {
        const value = evalExpr(child);
        if (value < min) {
          min = value;
        }
      }
      return min;
    }
    case 3: {
      // max
      let max = 0;
      for (const child of packets.children) {
        const value = evalExpr(child);
        if (value > max) {
          max = value;
        }
      }
      return max;
    }
    case 4:
      return packets.literal;
    case 5: {
      // >
      return evalExpr(packets.children[0]) > evalExpr(packets.children[1])
        ? 1
        : 0;
    }
    case 6: {
      // <
      return evalExpr(packets.children[0]) < evalExpr(packets.children[1])
        ? 1
        : 0;
    }
    case 7: {
      // ===
      return evalExpr(packets.children[0]) === evalExpr(packets.children[1])
        ? 1
        : 0;
    }
    default:
      throw `unknown type: ${packets.type}`;
  }
};

const solve2 = (input: string): number => {
  return evalExpr(parsePackets(hexToBinString(input), 0));
};

assert(hexCharToBinString("6") === "0110");
assert(hexCharToBinString("A") === "1010");

assert(hexToBinString("D2FE28") === "110100101111111000101000");

assert(solve1("D2FE28") === 6);
assert(solve1("38006F45291200") === 9);
assert(solve1("EE00D40C823060") === 14);
assert(solve1("8A004A801A8002F478") === 16);
assert(solve1("620080001611562C8802118E34") === 12);
assert(solve1("C0015000016115A2E0802F182340") === 23);
assert(solve1("A0016C880162017C3686B18A3D4780") === 31);

console.log(solve1(parse("input.txt")));

assert(solve2("C200B40A82") === 3);
assert(solve2("04005AC33890") === 54);
assert(solve2("880086C3E88112") === 7);
assert(solve2("CE00C43D881120") === 9);
assert(solve2("D8005AC2A8F0") === 1);
assert(solve2("F600BC2D8F") === 0);
assert(solve2("9C005AC2F8F0") === 0);
assert(solve2("9C0141080250320F1802104A08") === 1);

console.log(solve2(parse("input.txt")));
