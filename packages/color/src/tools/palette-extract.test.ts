import { describe, it, expect } from 'vitest';
import { kmeans } from '../lib/kmeans.js';

describe('palette-extract (kmeans integration)', () => {
  it('kmeans clusters RGB points into color groups', () => {
    const pixels = [
      // Red cluster
      { x: 255, y: 0, z: 0 },
      { x: 250, y: 5, z: 5 },
      { x: 245, y: 10, z: 0 },
      // Blue cluster
      { x: 0, y: 0, z: 255 },
      { x: 5, y: 5, z: 250 },
      { x: 0, y: 10, z: 245 },
    ];
    const clusters = kmeans(pixels, 2, 50, 1.0);
    expect(clusters.length).toBe(2);

    const sorted = clusters.sort((a, b) => a.centroid.x - b.centroid.x);
    // Blue cluster has low R, red cluster has high R
    expect(sorted[0]!.centroid.x).toBeLessThan(50);
    expect(sorted[1]!.centroid.x).toBeGreaterThan(200);
  });

  it('pure color pixels converge to that color', () => {
    const pixels = Array.from({ length: 100 }, () => ({ x: 255, y: 0, z: 0 }));
    const clusters = kmeans(pixels, 1, 50, 1.0);
    expect(clusters.length).toBe(1);
    expect(clusters[0]!.centroid.x).toBeCloseTo(255, 0);
    expect(clusters[0]!.centroid.y).toBeCloseTo(0, 0);
  });
});
