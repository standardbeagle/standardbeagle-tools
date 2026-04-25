/**
 * 3-D point used as input to {@link kmeans}.
 *
 * Channel meaning is caller-defined — for color quantization, x/y/z are
 * typically RGB or LAB axes.
 */
export interface Point {
  /** First axis (e.g. R or L*). */
  x: number;
  /** Second axis (e.g. G or a*). */
  y: number;
  /** Third axis (e.g. B or b*). */
  z: number;
}

/**
 * One k-means cluster: its centroid and the {@link Point | points} assigned to it.
 *
 * Note: {@link kmeans}'s current return value populates `centroid` but leaves
 * `points` empty — callers wanting cluster membership must re-bucket against
 * the returned centroids.
 */
export interface Cluster {
  /** Cluster center after convergence. */
  centroid: Point;
  /** Points assigned to this cluster. May be empty in returned values. */
  points: Point[];
}

function distance(a: Point, b: Point): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2 + (a.z - b.z) ** 2);
}

/**
 * k-means clustering with k-means++ initialization and Lloyd iteration.
 *
 * Runs at most `maxIterations` Lloyd passes and stops early once no centroid
 * shifts by more than `tolerance` Euclidean distance. Empty input or `k <= 0`
 * returns `[]`. If `k` exceeds `points.length`, it is clamped down.
 *
 * @param points Input {@link Point | points} to cluster.
 * @param k Target number of clusters.
 * @param maxIterations Hard cap on Lloyd passes (default `50`).
 * @param tolerance Centroid-shift threshold for early termination (default `1.0`).
 * @returns Array of {@link Cluster}s with populated `centroid` and empty `points`.
 */
export function kmeans(points: Point[], k: number, maxIterations = 50, tolerance = 1.0): Cluster[] {
  if (points.length === 0 || k <= 0) return [];
  if (k > points.length) k = points.length;

  // k-means++ initialization
  const centroids: Point[] = [points[Math.floor(Math.random() * points.length)]!];

  while (centroids.length < k) {
    const distances = points.map((p) => {
      const minDist = Math.min(...centroids.map((c) => distance(p, c)));
      return minDist ** 2;
    });
    const totalDist = distances.reduce((a, b) => a + b, 0);
    let target = Math.random() * totalDist;
    let i = 0;
    while (target > 0 && i < distances.length) {
      target -= distances[i]!;
      i++;
    }
    centroids.push(points[Math.min(i, points.length - 1)]!);
  }

  // Lloyd iteration
  for (let iter = 0; iter < maxIterations; iter++) {
    const clusters: Cluster[] = centroids.map((c) => ({ centroid: c, points: [] }));

    for (const point of points) {
      let minDist = Infinity;
      let closest = 0;
      for (let i = 0; i < centroids.length; i++) {
        const d = distance(point, centroids[i]!);
        if (d < minDist) {
          minDist = d;
          closest = i;
        }
      }
      clusters[closest]!.points.push(point);
    }

    let shifted = false;
    for (let i = 0; i < centroids.length; i++) {
      const cluster = clusters[i]!;
      if (cluster.points.length === 0) continue;

      const newCentroid = {
        x: cluster.points.reduce((s, p) => s + p.x, 0) / cluster.points.length,
        y: cluster.points.reduce((s, p) => s + p.y, 0) / cluster.points.length,
        z: cluster.points.reduce((s, p) => s + p.z, 0) / cluster.points.length,
      };

      if (distance(centroids[i]!, newCentroid) > tolerance) {
        shifted = true;
      }
      centroids[i] = newCentroid;
    }

    if (!shifted) break;
  }

  return centroids.map((c) => ({ centroid: c, points: [] }));
}
