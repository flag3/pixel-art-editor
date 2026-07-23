import { clampViewTransform, getLinePoints, pinchViewTransform } from "./gridUtils";
import { describe, expect, test } from "vitest";

describe("getLinePoints", () => {
  test("returns a single point when start and end are the same", () => {
    expect(getLinePoints(3, 4, 3, 4)).toEqual([[3, 4]]);
  });

  test("returns every cell on a horizontal line", () => {
    expect(getLinePoints(1, 2, 4, 2)).toEqual([
      [1, 2],
      [2, 2],
      [3, 2],
      [4, 2],
    ]);
  });

  test("returns every cell on a vertical line", () => {
    expect(getLinePoints(5, 1, 5, 3)).toEqual([
      [5, 1],
      [5, 2],
      [5, 3],
    ]);
  });

  test("returns every cell on a 45-degree diagonal", () => {
    expect(getLinePoints(0, 0, 3, 3)).toEqual([
      [0, 0],
      [1, 1],
      [2, 2],
      [3, 3],
    ]);
  });

  test("walks backwards when the end is before the start", () => {
    expect(getLinePoints(4, 2, 1, 2)).toEqual([
      [4, 2],
      [3, 2],
      [2, 2],
      [1, 2],
    ]);
  });

  test("leaves no gaps on a shallow line", () => {
    const points = getLinePoints(0, 0, 6, 2);
    expect(points[0]).toEqual([0, 0]);
    expect(points[points.length - 1]).toEqual([6, 2]);
    for (let i = 1; i < points.length; i++) {
      const [prevX, prevY] = points[i - 1];
      const [x, y] = points[i];
      expect(Math.abs(x - prevX)).toBeLessThanOrEqual(1);
      expect(Math.abs(y - prevY)).toBeLessThanOrEqual(1);
    }
  });

  test("leaves no gaps on a steep line", () => {
    const points = getLinePoints(0, 0, 2, 7);
    expect(points[0]).toEqual([0, 0]);
    expect(points[points.length - 1]).toEqual([2, 7]);
    for (let i = 1; i < points.length; i++) {
      const [prevX, prevY] = points[i - 1];
      const [x, y] = points[i];
      expect(Math.abs(x - prevX)).toBeLessThanOrEqual(1);
      expect(Math.abs(y - prevY)).toBeLessThanOrEqual(1);
    }
  });
});

describe("pinchViewTransform", () => {
  test("doubles the scale when the finger distance doubles", () => {
    const next = pinchViewTransform(
      { scale: 1, tx: 0, ty: 0 },
      { dist: 100, midX: 50, midY: 50 },
      { dist: 200, midX: 50, midY: 50 },
    );
    expect(next.scale).toBe(2);
  });

  test("keeps the content point under the midpoint fixed while zooming", () => {
    // Content point under midpoint (50, 50) at scale 1 is (50, 50).
    // After zooming x2 about that midpoint it must still map to (50, 50):
    // 50 * 2 + tx === 50  =>  tx === -50
    const next = pinchViewTransform(
      { scale: 1, tx: 0, ty: 0 },
      { dist: 100, midX: 50, midY: 50 },
      { dist: 200, midX: 50, midY: 50 },
    );
    expect(next.tx).toBe(-50);
    expect(next.ty).toBe(-50);
  });

  test("pans by the midpoint delta when the distance is unchanged", () => {
    const next = pinchViewTransform(
      { scale: 2, tx: -10, ty: -20 },
      { dist: 100, midX: 50, midY: 50 },
      { dist: 100, midX: 80, midY: 40 },
    );
    expect(next.scale).toBe(2);
    expect(next.tx).toBe(20);
    expect(next.ty).toBe(-30);
  });
});

describe("clampViewTransform", () => {
  const view = { viewW: 100, viewH: 100, contentW: 100, contentH: 100 };

  test("clamps scale to the minimum of 1", () => {
    const next = clampViewTransform({ scale: 0.5, tx: 0, ty: 0 }, view, 8);
    expect(next.scale).toBe(1);
  });

  test("clamps scale to the given maximum", () => {
    const next = clampViewTransform({ scale: 100, tx: 0, ty: 0 }, view, 8);
    expect(next.scale).toBe(8);
  });

  test("does not allow panning past the top-left edge", () => {
    const next = clampViewTransform({ scale: 2, tx: 10, ty: 5 }, view, 8);
    expect(next.tx).toBe(0);
    expect(next.ty).toBe(0);
  });

  test("does not allow panning past the bottom-right edge", () => {
    // At scale 2 the content is 200px wide in a 100px view: tx range is [-100, 0]
    const next = clampViewTransform({ scale: 2, tx: -150, ty: -999 }, view, 8);
    expect(next.tx).toBe(-100);
    expect(next.ty).toBe(-100);
  });

  test("pins the transform to the origin at scale 1", () => {
    const next = clampViewTransform({ scale: 1, tx: -30, ty: -30 }, view, 8);
    expect(next).toEqual({ scale: 1, tx: 0, ty: 0 });
  });
});
