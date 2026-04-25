import { mkdtempSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import sharp from 'sharp';

let tempDir: string | undefined;

export function getTempDir(): string {
  if (!tempDir) {
    tempDir = mkdtempSync(join(tmpdir(), 'imgproc-'));
  }
  return tempDir;
}

export async function createTestPng(
  name: string,
  width: number,
  height: number,
  color: { r: number; g: number; b: number } = { r: 255, g: 0, b: 0 },
): Promise<string> {
  const path = join(getTempDir(), name);
  await sharp({
    create: {
      width,
      height,
      channels: 3,
      background: color,
    },
  })
    .png()
    .toFile(path);
  return path;
}

export async function createTestJpeg(
  name: string,
  width: number,
  height: number,
  color: { r: number; g: number; b: number } = { r: 0, g: 255, b: 0 },
): Promise<string> {
  const path = join(getTempDir(), name);
  await sharp({
    create: {
      width,
      height,
      channels: 3,
      background: color,
    },
  })
    .jpeg()
    .toFile(path);
  return path;
}
