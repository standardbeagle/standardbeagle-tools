const XN = 0.95047;
const YN = 1.0;
const ZN = 1.08883;

function f(t: number): number {
  return t > 0.008856 ? Math.pow(t, 1 / 3) : 7.787 * t + 16 / 116;
}

function fInv(t: number): number {
  const t3 = t * t * t;
  return t3 > 0.008856 ? t3 : (t - 16 / 116) / 7.787;
}

export function xyzToLab(x: number, y: number, z: number): { l: number; a: number; b: number } {
  const fx = f(x / XN);
  const fy = f(y / YN);
  const fz = f(z / ZN);
  return {
    l: 116 * fy - 16,
    a: 500 * (fx - fy),
    b: 200 * (fy - fz),
  };
}

export function labToXyz(l: number, a: number, b: number): { x: number; y: number; z: number } {
  const fy = (l + 16) / 116;
  const fx = fy + a / 500;
  const fz = fy - b / 200;
  return {
    x: XN * fInv(fx),
    y: YN * fInv(fy),
    z: ZN * fInv(fz),
  };
}
