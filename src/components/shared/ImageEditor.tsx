import * as stylex from "@stylexjs/stylex";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useCallback, useRef, useState } from "react";

import {
  currentImageAtom,
  originalImageAtom,
  selectionAtom,
} from "../../store/imageAtoms";
import { colors, spacing } from "../../tokens.stylex";

const marchingAnts = stylex.keyframes({
  "0%": { backgroundPosition: "0 0, 0 100%, 0 0, 100% 0" },
  "100%": { backgroundPosition: "20px 0, -20px 100%, 0 -20px, 100% 20px" },
});

const styles = stylex.create({
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.large,
    width: "100%",
    height: "100%",
    overflow: "hidden",
    position: "relative",
    backgroundColor: colors.bgApp,
  },
  editorWrapper: {
    position: "relative",
    display: "inline-block",
    maxWidth: "100%",
    maxHeight: "80vh",
    boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
    overflow: "hidden",
    cursor: "crosshair",
    userSelect: "none",
  },
  image: {
    display: "block",
    maxWidth: "100%",
    maxHeight: "80vh",
    objectFit: "contain",
  },
  selectionOverlay: {
    position: "absolute",
    pointerEvents: "none",
    zIndex: 10,
    backgroundImage: `
      linear-gradient(90deg, #fff 50%, #000 50%),
      linear-gradient(90deg, #fff 50%, #000 50%),
      linear-gradient(0deg, #fff 50%, #000 50%),
      linear-gradient(0deg, #fff 50%, #000 50%)
    `,
    backgroundRepeat: "repeat-x, repeat-x, repeat-y, repeat-y",
    backgroundSize: "10px 1px, 10px 1px, 1px 10px, 1px 10px",
    backgroundPosition: "0 0, 0 100%, 0 0, 100% 0",
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    animationName: marchingAnts,
    animationDuration: "1s",
    animationIterationCount: "infinite",
    animationTimingFunction: "linear",
  },
  placeholder: {
    color: colors.textMain,
    fontSize: 18,
    fontWeight: 500,
  },
});

export default function ImageEditor() {
  const imageUrl = useAtomValue(currentImageAtom);
  const [selection, setSelection] = useAtom(selectionAtom);
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const wrapperRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!wrapperRef.current) return;
    const rect = wrapperRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setStartPos({ x, y });
    setIsDragging(true);
    setSelection({ x, y, width: 0, height: 0 });
  };

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging || !wrapperRef.current) return;
      const rect = wrapperRef.current.getBoundingClientRect();
      const currentX = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
      const currentY = Math.max(0, Math.min(e.clientY - rect.top, rect.height));

      const x = Math.min(startPos.x, currentX);
      const y = Math.min(startPos.y, currentY);
      const width = Math.abs(startPos.x - currentX);
      const height = Math.abs(startPos.y - currentY);

      setSelection({ x, y, width, height });
    },
    [isDragging, startPos, setSelection],
  );

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const setOriginalImage = useSetAtom(originalImageAtom);
  const setCurrentImage = useSetAtom(currentImageAtom);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setCurrentImage(result);
        setOriginalImage(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape" || e.key === "Backspace") {
      setSelection(null);
    }
  };

  if (!imageUrl) {
    return (
      <label
        {...stylex.props(styles.container)}
        style={{ cursor: "pointer" }}
        htmlFor="image-upload"
      >
        <p {...stylex.props(styles.placeholder)}>
          이미지를 업로드하려면 클릭하세요
        </p>
        <input
          ref={inputRef}
          id="image-upload"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          style={{ display: "none" }}
        />
      </label>
    );
  }

  return (
    <div {...stylex.props(styles.container)}>
      <div
        ref={wrapperRef}
        {...stylex.props(styles.editorWrapper)}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onKeyDown={handleKeyDown}
        role="application"
        aria-label="Image selection area"
      >
        <img
          src={imageUrl}
          alt="Original"
          {...stylex.props(styles.image)}
          draggable={false}
        />
        {selection && (
          <div
            {...stylex.props(styles.selectionOverlay)}
            style={{
              left: selection.x,
              top: selection.y,
              width: selection.width,
              height: selection.height,
            }}
          />
        )}
      </div>
    </div>
  );
}
