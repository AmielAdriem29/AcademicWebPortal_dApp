const CHARSET = 'qpzry9x8gf2tvdw0s3jn54khce6mua7l';

function polymod(values: number[]): number {
  const GEN = [0x3b6a57b2, 0x26508e6d, 0x1ea119fa, 0x3d4233dd, 0x2a1462b3];
  let chk = 1;
  for (const v of values) {
    const b = chk >> 25;
    chk = ((chk & 0x1ffffff) << 5) ^ v;
    for (let i = 0; i < 5; i++) chk ^= (b >> i) & 1 ? GEN[i] : 0;
  }
  return chk;
}

function hrpExpand(hrp: string): number[] {
  return [...hrp].map(c => c.charCodeAt(0) >> 5)
    .concat([0])
    .concat([...hrp].map(c => c.charCodeAt(0) & 31));
}

function convertbits(data: number[], from: number, to: number): number[] {
  let acc = 0, bits = 0;
  const ret: number[] = [];
  const maxv = (1 << to) - 1;
  for (const v of data) {
    acc = ((acc << from) | v);
    bits += from;
    while (bits >= to) { bits -= to; ret.push((acc >> bits) & maxv); }
  }
  if (bits) ret.push((acc << (to - bits)) & maxv);
  return ret;
}

export function hexToBech32(hex: string): string {
  const hrp = 'addr_test';
  const raw = Array.from(Buffer.from(hex, 'hex'));
  const data = convertbits(raw, 8, 5);
  const combined = [...data, 0, 0, 0, 0, 0, 0];
  const mod = polymod([...hrpExpand(hrp), ...combined]) ^ 1;
  for (let i = 0; i < 6; i++) combined[combined.length - 6 + i] = (mod >> (5 * (5 - i))) & 31;
  return hrp + '1' + combined.map(d => CHARSET[d]).join('');
}

export function resolveAddress(raw: string): string {
  return raw.startsWith('addr') ? raw : hexToBech32(raw);
}