import { atom } from "jotai";

export const originalImageAtom = atom<string | null>(null);
export const currentImageAtom = atom<string | null>(null);

export type ToolType = "select" | "draw" | "filter" | "edit" | null;
export type DrawingToolType = "pen" | "brush" | "eraser";

export interface DrawingSettings {
  selectedSubTool: DrawingToolType | null;
  penSize: number;
  brushSize: number;
  eraserSize: number;
  color: string;
}

export const selectionAtom = atom<{
  x: number;
  y: number;
  width: number;
  height: number;
} | null>(null);

export const activeToolAtom = atom<ToolType>(null);

export const drawingSettingsAtom = atom<DrawingSettings>({
  selectedSubTool: null,
  penSize: 5,
  brushSize: 15,
  eraserSize: 20,
  color: "#000000",
});
