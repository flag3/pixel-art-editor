/** Grid cell as [x, y], matching the pixels[x][y] data layout. */
export type CellPoint = [number, number];

export interface ViewTransform {
  scale: number;
  tx: number;
  ty: number;
}

export interface PinchSample {
  dist: number;
  midX: number;
  midY: number;
}

export interface ViewBox {
  viewW: number;
  viewH: number;
  contentW: number;
  contentH: number;
}

/** Next transform for a two-finger gesture: zoom about the midpoint, pan by its delta. */
export const pinchViewTransform = (
  current: ViewTransform,
  from: PinchSample,
  to: PinchSample,
): ViewTransform => {
  const scale = current.scale * (to.dist / from.dist);
  const ratio = scale / current.scale;
  return {
    scale,
    tx: to.midX - (from.midX - current.tx) * ratio,
    ty: to.midY - (from.midY - current.ty) * ratio,
  };
};

const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);

/** Keep the scale within [1, maxScale] and the content covering the viewport. */
export const clampViewTransform = (
  transform: ViewTransform,
  box: ViewBox,
  maxScale: number,
): ViewTransform => {
  const scale = clamp(transform.scale, 1, Math.max(1, maxScale));
  const minTx = Math.min(0, box.viewW - box.contentW * scale);
  const minTy = Math.min(0, box.viewH - box.contentH * scale);
  return {
    scale,
    tx: clamp(transform.tx, minTx, 0),
    ty: clamp(transform.ty, minTy, 0),
  };
};

/** Bresenham line between two grid cells, inclusive of both endpoints. */
export const getLinePoints = (x0: number, y0: number, x1: number, y1: number): CellPoint[] => {
  const points: CellPoint[] = [];
  const dx = Math.abs(x1 - x0);
  const dy = Math.abs(y1 - y0);
  const stepX = x0 < x1 ? 1 : -1;
  const stepY = y0 < y1 ? 1 : -1;
  let error = dx - dy;
  let x = x0;
  let y = y0;

  for (;;) {
    points.push([x, y]);
    if (x === x1 && y === y1) {
      return points;
    }
    const doubledError = 2 * error;
    if (doubledError > -dy) {
      error -= dy;
      x += stepX;
    }
    if (doubledError < dx) {
      error += dx;
      y += stepY;
    }
  }
};
