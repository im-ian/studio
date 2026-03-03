import { atom } from "jotai";

export const originalImageAtom = atom<string | null>(null);
export const currentImageAtom = atom<string | null>(null);

export const selectionAtom = atom<{
  x: number;
  y: number;
  width: number;
  height: number;
} | null>(null);
