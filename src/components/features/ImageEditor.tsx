import * as stylex from "@stylexjs/stylex";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useCallback, useRef, useState } from "react";

import {
  currentImageAtom,
  originalImageAtom,
  selectionAtom,
} from "../../store/imageAtoms";
import { colors } from "../../tokens.stylex";
import ImageToolbar from "./ImageToolbar";

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
    touchAction: "none",
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

  const getCoordinates = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (!wrapperRef.current) return { x: 0, y: 0, width: 0, height: 0 };
      const rect = wrapperRef.current.getBoundingClientRect();
      let clientX: number;
      let clientY: number;

      if ("touches" in e) {
        if (e.touches.length === 0) return { x: 0, y: 0, width: 0, height: 0 };
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else {
        clientX = (e as React.MouseEvent).clientX;
        clientY = (e as React.MouseEvent).clientY;
      }

      return {
        x: clientX - rect.left,
        y: clientY - rect.top,
        width: rect.width,
        height: rect.height,
      };
    },
    [],
  );

  const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
    const { x, y } = getCoordinates(e);
    setStartPos({ x, y });
    setIsDragging(true);
    setSelection({ x, y, width: 0, height: 0 });
  };

  const handleMove = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (!isDragging || !wrapperRef.current) return;
      const {
        x: currentX,
        y: currentY,
        width: rectWidth,
        height: rectHeight,
      } = getCoordinates(e);

      const constrainedX = Math.max(0, Math.min(currentX, rectWidth));
      const constrainedY = Math.max(0, Math.min(currentY, rectHeight));

      const x = Math.min(startPos.x, constrainedX);
      const y = Math.min(startPos.y, constrainedY);
      const width = Math.abs(startPos.x - constrainedX);
      const height = Math.abs(startPos.y - constrainedY);

      setSelection({ x, y, width, height });
    },
    [isDragging, startPos, setSelection, getCoordinates],
  );

  const handleEnd = () => {
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

  const handleUndo = () => {
    console.log("Undo clicked");
  };

  const handleRedo = () => {
    console.log("Redo clicked");
  };

  const handleFilterClick = () => {
    console.log("Filter clicked - Open Modal");
    // TODO: Implement Modal
  };

  const handleEditClick = () => {
    console.log("Edit clicked");
  };

  const handleSaveClick = () => {
    console.log("Save clicked");
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
        onMouseDown={handleStart}
        onMouseMove={handleMove}
        onMouseUp={handleEnd}
        onMouseLeave={handleEnd}
        onTouchStart={handleStart}
        onTouchMove={handleMove}
        onTouchEnd={handleEnd}
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
      <ImageToolbar
        onUndo={handleUndo}
        onRedo={handleRedo}
        onFilterClick={handleFilterClick}
        onEditClick={handleEditClick}
        onSaveClick={handleSaveClick}
      />
    </div>
  );
}
