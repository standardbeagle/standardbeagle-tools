export function linearRgbToXyz(lr: number, lg: number, lb: number): { x: number; y: number; z: number } {
  return {
    x: 0.4124 * lr + 0.3576 * lg + 0.1805 * lb,
    y: 0.2126 * lr + 0.7152 * lg + 0.0722 * lb,
    z: 0.0193 * lr + 0.1192 * lg + 0.9505 * lb,
  };
}

export function xyzToLinearRgb(x: number, y: number, z: number): { r: number; g: number; b: number } {
  return {
    r: 3.2406 * x - 1.5372 * y - 0.4986 * z,
    g: -0.9689 * x + 1.8758 * y + 0.0415 * z,
    b: 0.0557 * x - 0.2040 * y + 1.0570 * z,
  };
}
