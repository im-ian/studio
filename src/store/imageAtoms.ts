import { atom } from "jotai";

export const originalImageAtom = atom<string | null>(null);
export const currentImageAtom = atom<string | null>(null);

export type ToolType = "select" | "draw" | "filter" | "edit" | null;
export type DrawingToolType = "pen" | "brush" | "eraser";
export type SelectionMode = "add" | "subtract";

export interface DrawingSettings {
  selectedSubTool: DrawingToolType | null;
  penSize: number;
  brushSize: number;
  eraserSize: number;
  color: string;
  eraseBackground: boolean;
}

export interface SelectionRect {
  x: number;
  y: number;
  width: number;
  height: number;
  mode: SelectionMode;
}

/**
 * Compound selection state.
 *
 * `rects` is an ordered list of rectangles, each tagged with a mode:
 *   - "add"      → union with the current selection
 *   - "subtract" → difference from the current selection
 *
 * `pendingRect` is the rectangle being drawn right now (not yet committed).
 * `pendingMode` is the mode that will be applied when the drag ends.
 *
 * Rendering helpers (`getSelectionPath`, `hasSelection`) are exported below.
 */
export interface SelectionState {
  rects: SelectionRect[];
  pendingRect: Omit<SelectionRect, "mode"> | null;
  pendingMode: SelectionMode;
}

export const selectionAtom = atom<SelectionState>({
  rects: [],
  pendingRect: null,
  pendingMode: "add",
});

export const activeToolAtom = atom<ToolType>("select");

export const drawingSettingsAtom = atom<DrawingSettings>({
  selectedSubTool: null,
  penSize: 5,
  brushSize: 15,
  eraserSize: 20,
  color: "#000000",
  eraseBackground: false,
});

export interface HistorySnapshot {
  backgroundImage: string | null;
  drawingLayer: string | null;
}

export interface HistoryState {
  snapshots: HistorySnapshot[];
  currentIndex: number;
}

export const historyAtom = atom<HistoryState>({
  snapshots: [],
  currentIndex: -1,
});

export const historyLimitAtom = atom<number>(10);

// ---------------------------------------------------------------------------
// Pure helpers for working with SelectionState
// ---------------------------------------------------------------------------

/**
 * Returns true if the committed rects produce a non-empty visible area.
 * Accounts for subtract rects that may fully cancel out add rects.
 */
export function hasSelection(state: SelectionState): boolean {
  if (!state.rects.some((r) => r.mode === "add" && r.width > 0 && r.height > 0))
    return false;

  const result = computeSelectionGrid(state.rects, { x: 1, y: 1 });
  if (!result) return false;
  return result.grid.some((row) => row.some((cell) => cell));
}

/**
 * Returns a bounding box that encloses all "add" rects.
 * Useful for canvas clipping when exact pixel-perfect union isn't needed.
 */
export function getSelectionBoundingBox(
  rects: SelectionRect[],
): { x: number; y: number; width: number; height: number } | null {
  const addRects = rects.filter(
    (r) => r.mode === "add" && r.width > 0 && r.height > 0,
  );
  if (addRects.length === 0) return null;

  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;

  for (const r of addRects) {
    minX = Math.min(minX, r.x);
    minY = Math.min(minY, r.y);
    maxX = Math.max(maxX, r.x + r.width);
    maxY = Math.max(maxY, r.y + r.height);
  }

  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}

/**
 * Applies the committed selection rects as a canvas clip path.
 * Call this inside a `ctx.save() … ctx.restore()` block before drawing.
 *
 * Uses the sweep-line grid to resolve add/subtract ordering correctly,
 * then clips to only the grid cells that are actually selected.
 */
export function applySelectionClip(
  ctx: CanvasRenderingContext2D,
  rects: SelectionRect[],
): void {
  if (rects.length === 0) return;

  const scale = { x: 1, y: 1 };
  const result = computeSelectionGrid(rects, scale);
  if (!result) return;

  const { grid, sortedX, sortedY } = result;

  const rows = grid.length;
  const cols = grid[0].length;

  let hasCell = false;
  ctx.beginPath();
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c]) {
        hasCell = true;
        ctx.rect(
          sortedX[c],
          sortedY[r],
          sortedX[c + 1] - sortedX[c],
          sortedY[r + 1] - sortedY[r],
        );
      }
    }
  }
  // Don't clip to an empty region — that would block all drawing.
  if (hasCell) {
    ctx.clip("nonzero");
  }
}

/**
 * Returns all rectangles that contribute to the final visible selection,
 * i.e. the list that the SVG overlay should render (add rects as positive
 * regions, subtract rects as holes).
 *
 * When `pendingRect` is present it is merged in using `pendingMode` so the
 * overlay updates live while the user is dragging.
 */
export function getEffectiveRects(state: SelectionState): SelectionRect[] {
  if (!state.pendingRect) return state.rects;

  const pending: SelectionRect = {
    ...state.pendingRect,
    mode: state.pendingMode,
  };
  return [...state.rects, pending];
}

// ---------------------------------------------------------------------------
// Shared grid computation for compound selection
// ---------------------------------------------------------------------------

interface SelectionGrid {
  grid: boolean[][];
  sortedX: number[];
  sortedY: number[];
}

/**
 * Builds a sweep-line grid that resolves the compound selection into a 2D
 * boolean array. Each cell is true if it belongs to the final selected region,
 * respecting the order of add/subtract operations.
 *
 * `scale` maps rect pixel-coordinates to the target coordinate space
 * (e.g. displayScale for SVG, {x:1,y:1} for canvas).
 */
function computeSelectionGrid(
  rects: SelectionRect[],
  scale: { x: number; y: number },
): SelectionGrid | null {
  const valid = rects.filter((r) => r.width > 0 && r.height > 0);
  if (valid.length === 0) return null;
  if (!valid.some((r) => r.mode === "add")) return null;

  const xSet = new Set<number>();
  const ySet = new Set<number>();

  for (const r of valid) {
    const x = r.x / scale.x;
    const y = r.y / scale.y;
    const w = r.width / scale.x;
    const h = r.height / scale.y;
    xSet.add(x);
    xSet.add(x + w);
    ySet.add(y);
    ySet.add(y + h);
  }

  const sortedX = [...xSet].sort((a, b) => a - b);
  const sortedY = [...ySet].sort((a, b) => a - b);

  const cols = sortedX.length - 1;
  const rows = sortedY.length - 1;
  if (cols <= 0 || rows <= 0) return null;

  const grid: boolean[][] = Array.from({ length: rows }, () =>
    Array(cols).fill(false),
  );

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cx = (sortedX[c] + sortedX[c + 1]) / 2;
      const cy = (sortedY[r] + sortedY[r + 1]) / 2;

      let inside = false;
      for (const rect of rects) {
        if (rect.width <= 0 || rect.height <= 0) continue;
        const rx = rect.x / scale.x;
        const ry = rect.y / scale.y;
        const rw = rect.width / scale.x;
        const rh = rect.height / scale.y;
        if (cx >= rx && cx <= rx + rw && cy >= ry && cy <= ry + rh) {
          inside = rect.mode === "add";
        }
      }
      grid[r][c] = inside;
    }
  }

  return { grid, sortedX, sortedY };
}

// ---------------------------------------------------------------------------
// Compute the outline path of the compound selection
// ---------------------------------------------------------------------------

/**
 * Computes an SVG path string representing only the outer boundary of the
 * compound selection (union of add rects minus subtract rects).
 */
export function computeSelectionOutlinePath(
  rects: SelectionRect[],
  displayScale: { x: number; y: number },
): string {
  const result = computeSelectionGrid(rects, displayScale);
  if (!result) return "";

  const { grid, sortedX, sortedY } = result;
  const rows = grid.length;
  const cols = grid[0].length;

  // Extract boundary edges
  //    Each edge is a horizontal or vertical segment between an inside and
  //    outside cell (or at the grid border).
  type Edge = { x1: number; y1: number; x2: number; y2: number };
  const edges: Edge[] = [];

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (!grid[r][c]) continue;

      // Top
      if (r === 0 || !grid[r - 1][c]) {
        edges.push({
          x1: sortedX[c],
          y1: sortedY[r],
          x2: sortedX[c + 1],
          y2: sortedY[r],
        });
      }
      // Bottom
      if (r === rows - 1 || !grid[r + 1][c]) {
        edges.push({
          x1: sortedX[c + 1],
          y1: sortedY[r + 1],
          x2: sortedX[c],
          y2: sortedY[r + 1],
        });
      }
      // Left
      if (c === 0 || !grid[r][c - 1]) {
        edges.push({
          x1: sortedX[c],
          y1: sortedY[r + 1],
          x2: sortedX[c],
          y2: sortedY[r],
        });
      }
      // Right
      if (c === cols - 1 || !grid[r][c + 1]) {
        edges.push({
          x1: sortedX[c + 1],
          y1: sortedY[r],
          x2: sortedX[c + 1],
          y2: sortedY[r + 1],
        });
      }
    }
  }

  if (edges.length === 0) return "";

  // 4. Chain edges into closed loops for continuous marching ants
  const key = (x: number, y: number) => `${x},${y}`;

  // Build adjacency: endpoint → list of edges
  const adj = new Map<string, Edge[]>();
  for (const e of edges) {
    const k1 = key(e.x1, e.y1);
    const k2 = key(e.x2, e.y2);
    if (!adj.has(k1)) adj.set(k1, []);
    if (!adj.has(k2)) adj.set(k2, []);
    adj.get(k1)!.push(e);
    adj.get(k2)!.push(e);
  }

  const used = new Set<Edge>();
  const pathParts: string[] = [];

  for (const startEdge of edges) {
    if (used.has(startEdge)) continue;

    const loop: Array<{ x: number; y: number }> = [];
    let current = startEdge;
    let cx = current.x1;
    let cy = current.y1;

    while (!used.has(current)) {
      used.add(current);
      // Move to the other endpoint of this edge
      if (cx === current.x1 && cy === current.y1) {
        cx = current.x2;
        cy = current.y2;
      } else {
        cx = current.x1;
        cy = current.y1;
      }
      loop.push({ x: cx, y: cy });

      // Find the next unused edge from this endpoint
      const k = key(cx, cy);
      const neighbors = adj.get(k);
      if (!neighbors) break;
      const next = neighbors.find((e) => !used.has(e));
      if (!next) break;
      current = next;
    }

    if (loop.length > 0) {
      const parts = [`M ${loop[0].x} ${loop[0].y}`];
      for (let i = 1; i < loop.length; i++) {
        parts.push(`L ${loop[i].x} ${loop[i].y}`);
      }
      parts.push("Z");
      pathParts.push(parts.join(" "));
    }
  }

  return pathParts.join(" ");
}
