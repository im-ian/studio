import * as stylex from "@stylexjs/stylex";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useCallback, useEffect, useRef, useState } from "react";
import { Crosshair } from "react-feather";

import {
  activeToolAtom,
  currentImageAtom,
  drawingSettingsAtom,
  originalImageAtom,
  selectionAtom,
} from "../../store/imageAtoms";
import { colors, spacing } from "../../tokens.stylex";
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
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: "100%",
    maxWidth: "100%",
    maxHeight: "80vh",
    boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
    overflow: "hidden",
    cursor: "crosshair",
    userSelect: "none",
    touchAction: "none",
  },
  pannableContent: {
    position: "relative",
    display: "inline-block",
    willChange: "transform",
  },
  panningResetButton: {
    position: "absolute",
    bottom: spacing.medium,
    right: spacing.medium,
    zIndex: 1100,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    backdropFilter: "blur(8px)",
    borderRadius: "50%",
    width: "44px",
    height: "44px",
    display: "flex",
    borderWidth: 0,
    borderStyle: "solid",
    alignItems: "center",
    justifyContent: "center",
    border: "1px solid rgba(255, 255, 255, 0.3)",
    color: colors.textMain,
    cursor: "pointer",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
    transition: "all 0.2s ease",
    animationName: stylex.keyframes({
      from: { opacity: 0, transform: "scale(0.8) translateY(10px)" },
      to: { opacity: 1, transform: "scale(1) translateY(0)" },
    }),
    animationDuration: "0.3s",
    ":hover": {
      backgroundColor: "rgba(255, 255, 255, 0.3)",
      transform: "scale(1.1)",
    },
    ":active": {
      transform: "scale(0.95)",
    },
  },
  image: {
    display: "none",
  },
  canvas: {
    display: "block",
    maxWidth: "100%",
    maxHeight: "80vh",
    objectFit: "contain",
  },
  drawingCanvas: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    pointerEvents: "none",
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
  const activeTool = useAtomValue(activeToolAtom);
  const drawingSettings = useAtomValue(drawingSettingsAtom);
  const [selection, setSelection] = useAtom(selectionAtom);
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const wrapperRef = useRef<HTMLDivElement>(null);
  const imageCanvasRef = useRef<HTMLCanvasElement>(null);
  const drawingCanvasRef = useRef<HTMLCanvasElement>(null);
  const [displayScale, setDisplayScale] = useState({ x: 1, y: 1 });
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });

  const getCoordinates = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      let clientX: number;
      let clientY: number;

      if ("touches" in e) {
        if (e.touches.length === 0)
          return { x: 0, y: 0, width: 0, height: 0, clientX: 0, clientY: 0 };
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else {
        clientX = (e as React.MouseEvent).clientX;
        clientY = (e as React.MouseEvent).clientY;
      }

      if (!imageCanvasRef.current)
        return {
          x: 0,
          y: 0,
          width: 0,
          height: 0,
          clientX,
          clientY,
        };

      const rect = imageCanvasRef.current.getBoundingClientRect();
      const scaleX = imageCanvasRef.current.width / rect.width;
      const scaleY = imageCanvasRef.current.height / rect.height;

      return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY,
        width: imageCanvasRef.current.width,
        height: imageCanvasRef.current.height,
        clientX,
        clientY,
      };
    },
    [],
  );

  useEffect(() => {
    if (!imageUrl || !imageCanvasRef.current || !drawingCanvasRef.current)
      return;
    const imageCanvas = imageCanvasRef.current;
    const drawingCanvas = drawingCanvasRef.current;
    const imgCtx = imageCanvas.getContext("2d");
    const drawCtx = drawingCanvas.getContext("2d");
    if (!imgCtx || !drawCtx) return;

    const img = new Image();
    img.src = imageUrl;
    img.onload = () => {
      imageCanvas.width = img.width;
      imageCanvas.height = img.height;
      drawingCanvas.width = img.width;
      drawingCanvas.height = img.height;
      imgCtx.drawImage(img, 0, 0);

      // Update scale after image load and canvas sized
      const rect = imageCanvas.getBoundingClientRect();
      if (rect.width > 0) {
        setDisplayScale({
          x: img.width / rect.width,
          y: img.height / rect.height,
        });
      }
    };
  }, [imageUrl]);

  // Handle window resize to keep scale accurate
  useEffect(() => {
    const handleResize = () => {
      if (imageCanvasRef.current) {
        const rect = imageCanvasRef.current.getBoundingClientRect();
        if (rect.width > 0) {
          setDisplayScale({
            x: imageCanvasRef.current.width / rect.width,
            y: imageCanvasRef.current.height / rect.height,
          });
        }
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Handle keyboard for space-pan
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.code === "Space" &&
        !isSpacePressed &&
        document.activeElement?.tagName !== "INPUT"
      ) {
        setIsSpacePressed(true);
        // Prevent default spacebar scrolling
        if (e.target === document.body || e.target === wrapperRef.current) {
          e.preventDefault();
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        setIsSpacePressed(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [isSpacePressed]);

  const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
    const { x, y, clientX, clientY } = getCoordinates(e);

    if (isSpacePressed) {
      setIsDragging(true);
      setLastMousePos({ x: clientX, y: clientY });
      return;
    }

    if (activeTool !== "select" && activeTool !== "draw") return;

    if (activeTool === "select") {
      setStartPos({ x, y });
      setIsDragging(true);
      setSelection({ x, y, width: 0, height: 0 });
    } else if (activeTool === "draw" && drawingSettings.selectedSubTool) {
      setIsDragging(true);
      const ctx = drawingCanvasRef.current?.getContext("2d");
      if (ctx) {
        ctx.save(); // Save initial state for clipping

        // Setup drawing styles
        ctx.strokeStyle =
          drawingSettings.selectedSubTool === "eraser"
            ? "rgba(0,0,0,1)"
            : drawingSettings.color;
        const currentSize =
          drawingSettings.selectedSubTool === "pen"
            ? drawingSettings.penSize
            : drawingSettings.selectedSubTool === "brush"
              ? drawingSettings.brushSize
              : drawingSettings.eraserSize;

        ctx.lineWidth = currentSize;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        if (drawingSettings.selectedSubTool === "eraser") {
          ctx.globalCompositeOperation = "destination-out";
        } else {
          ctx.globalCompositeOperation = "source-over";
          if (drawingSettings.selectedSubTool === "brush") {
            ctx.shadowBlur = currentSize / 2;
            ctx.shadowColor = drawingSettings.color;
          } else {
            ctx.shadowBlur = 0;
          }
        }

        // Selection masking
        if (selection && selection.width > 0 && selection.height > 0) {
          ctx.beginPath();
          ctx.rect(selection.x, selection.y, selection.width, selection.height);
          ctx.clip();
        }

        // Start drawing path
        ctx.beginPath();
        ctx.moveTo(x, y);
      }
    }
  };

  const handleMove = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (
        !isDragging ||
        !drawingCanvasRef.current ||
        (activeTool !== "select" && activeTool !== "draw")
      )
        return;
      const {
        x: currentX,
        y: currentY,
        width: canvasWidth,
        height: canvasHeight,
        clientX,
        clientY,
      } = getCoordinates(e);

      if (isSpacePressed) {
        const dx = clientX - lastMousePos.x;
        const dy = clientY - lastMousePos.y;
        setPanOffset((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
        setLastMousePos({ x: clientX, y: clientY });
        return;
      }

      if (activeTool === "select") {
        const constrainedX = Math.max(0, Math.min(currentX, canvasWidth));
        const constrainedY = Math.max(0, Math.min(currentY, canvasHeight));

        const x = Math.min(startPos.x, constrainedX);
        const y = Math.min(startPos.y, constrainedY);
        const width = Math.abs(startPos.x - constrainedX);
        const height = Math.abs(startPos.y - constrainedY);

        setSelection({ x, y, width, height });
      } else if (activeTool === "draw") {
        const ctx = drawingCanvasRef.current.getContext("2d");
        if (ctx) {
          ctx.lineTo(currentX, currentY);
          ctx.stroke();
        }
      }
    },
    [
      isDragging,
      startPos,
      setSelection,
      getCoordinates,
      activeTool,
      isSpacePressed,
      lastMousePos,
    ],
  );

  const handleEnd = () => {
    if (activeTool === "select" && selection) {
      if (selection.width < 5 && selection.height < 5) {
        setSelection(null);
      }
    }

    if (activeTool === "draw" && isDragging) {
      const ctx = drawingCanvasRef.current?.getContext("2d");
      if (ctx) {
        ctx.restore(); // Restore context state
      }
    }
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

  const handleSaveClick = () => {
    if (!imageCanvasRef.current || !drawingCanvasRef.current) return;

    const canvas = document.createElement("canvas");
    canvas.width = imageCanvasRef.current.width;
    canvas.height = imageCanvasRef.current.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Draw background image
    ctx.drawImage(imageCanvasRef.current, 0, 0);
    // Draw drawings on top
    ctx.drawImage(drawingCanvasRef.current, 0, 0);

    const dataUrl = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = "studio-edit.png";
    link.href = dataUrl;
    link.click();
  };

  const handleClearAll = () => {
    const canvas = drawingCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
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
        style={{
          cursor: isSpacePressed
            ? isDragging
              ? "grabbing"
              : "grab"
            : "crosshair",
        }}
      >
        <div
          {...stylex.props(styles.pannableContent)}
          style={{ transform: `translate(${panOffset.x}px, ${panOffset.y}px)` }}
        >
          <div style={{ position: "relative" }}>
            <canvas ref={imageCanvasRef} {...stylex.props(styles.canvas)} />
            <canvas
              ref={drawingCanvasRef}
              {...stylex.props(styles.drawingCanvas)}
            />
          </div>
          {selection && (
            <div
              {...stylex.props(styles.selectionOverlay)}
              style={{
                left: selection.x / displayScale.x,
                top: selection.y / displayScale.y,
                width: selection.width / displayScale.x,
                height: selection.height / displayScale.y,
              }}
            />
          )}
        </div>
        {(panOffset.x !== 0 || panOffset.y !== 0) && (
          <button
            type="button"
            {...stylex.props(styles.panningResetButton)}
            onClick={() => setPanOffset({ x: 0, y: 0 })}
            aria-label="Reset position"
          >
            <Crosshair size={20} />
          </button>
        )}
      </div>
      <ImageToolbar
        onUndo={handleUndo}
        onRedo={handleRedo}
        onSaveClick={handleSaveClick}
        onClearAll={handleClearAll}
      />
    </div>
  );
}
