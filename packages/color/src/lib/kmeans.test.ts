import { describe, it, expect } from 'vitest';
import { kmeans } from './kmeans.js';

describe('kmeans', () => {
  it('converges on two distinct clusters', () => {
    const points = [
      { x: 0, y: 0, z: 0 },
      { x: 1, y: 0, z: 0 },
      { x: 0, y: 1, z: 0 },
      { x: 100, y: 100, z: 100 },
      { x: 101, y: 100, z: 100 },
      { x: 100, y: 101, z: 100 },
    ];
    const result = kmeans(points, 2, 50, 1.0);
    expect(result.length).toBe(2);
    // Centroids should be near (0.33, 0.33, 0) and (100.33, 100.33, 100)
    const sorted = result.sort((a, b) => a.centroid.x - b.centroid.x);
    expect(sorted[0]!.centroid.x).toBeLessThan(10);
    expect(sorted[1]!.centroid.x).toBeGreaterThan(90);
  });

  it('handles k > points by reducing k', () => {
    const points = [{ x: 1, y: 2, z: 3 }];
    const result = kmeans(points, 5, 50, 1.0);
    expect(result.length).toBe(1);
  });

  it('handles empty input', () => {
    const result = kmeans([], 3, 50, 1.0);
    expect(result.length).toBe(0);
  });
});
