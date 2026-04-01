import * as stylex from "@stylexjs/stylex";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useCallback, useEffect, useRef, useState } from "react";
import { Crosshair } from "react-feather";

import {
  type AdjustmentValues,
  activeToolAtom,
  applySelectionClip,
  cacheTTLAtom,
  computeSelectionOutlinePath,
  currentImageAtom,
  DEFAULT_ADJUSTMENTS,
  drawingSettingsAtom,
  type FilterType,
  getEffectiveRects,
  getSelectionBoundingBox,
  type HistorySnapshot,
  type HistoryState,
  hasSelection,
  historyAtom,
  historyLimitAtom,
  originalImageAtom,
  type SelectionMode,
  type SelectionRect,
  type SelectionState,
  selectionAtom,
} from "../../store/imageAtoms";
import { colors, spacing } from "../../tokens.stylex";
import Confirm from "../ui/Confirm";
import ImageToolbar from "./ImageToolbar";

// ---------------------------------------------------------------------------
// Marching-ants keyframe (unchanged)
// ---------------------------------------------------------------------------
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
  canvasContainer: {
    position: "relative",
    backgroundImage: `
      linear-gradient(45deg, #ccc 25%, transparent 25%), 
      linear-gradient(-45deg, #ccc 25%, transparent 25%),
      linear-gradient(45deg, transparent 75%, #ccc 75%),
      linear-gradient(-45deg, transparent 75%, #ccc 75%)
    `,
    backgroundSize: "20px 20px",
    backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0px",
    backgroundColor: "white",
  },
  placeholder: {
    color: colors.textMain,
    fontSize: 18,
    fontWeight: 500,
  },
  // SVG overlay that sits on top of the canvas container
  selectionSvg: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    pointerEvents: "none",
    zIndex: 10,
    overflow: "visible",
  },
});

// ---------------------------------------------------------------------------
// SelectionOverlay — SVG that renders compound selection with marching ants
// ---------------------------------------------------------------------------
interface SelectionOverlayProps {
  rects: SelectionRect[];
  displayScale: { x: number; y: number };
  canvasWidth: number;
  canvasHeight: number;
}

function SelectionOverlay({
  rects,
  displayScale,
  canvasWidth,
  canvasHeight,
}: SelectionOverlayProps) {
  if (rects.length === 0) return null;

  const hasAddRect = rects.some(
    (r) => r.mode === "add" && r.width > 0 && r.height > 0,
  );

  if (!hasAddRect) return null;

  const svgW = canvasWidth / displayScale.x;
  const svgH = canvasHeight / displayScale.y;

  // Compute the outline path of the compound selection (outer boundary only)
  const outlinePath = computeSelectionOutlinePath(rects, displayScale);

  return (
    <svg
      {...stylex.props(styles.selectionSvg)}
      viewBox={`0 0 ${svgW} ${svgH}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Marching-ants border on the outer boundary only */}
      {outlinePath && (
        <>
          <path
            d={outlinePath}
            fill="none"
            stroke="white"
            strokeWidth={1}
            style={{
              strokeDasharray: "6 4",
              animation: "march 0.6s linear infinite",
            }}
          />
          <path
            d={outlinePath}
            fill="none"
            stroke="black"
            strokeWidth={1}
            style={{
              strokeDasharray: "6 4",
              strokeDashoffset: 10,
              animation: "march 0.6s linear infinite",
            }}
          />
        </>
      )}

      <style>{`
        @keyframes march {
          to { stroke-dashoffset: -20; }
        }
      `}</style>
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
export default function ImageEditor() {
  const imageUrl = useAtomValue(currentImageAtom);
  const originalImage = useAtomValue(originalImageAtom);
  const activeTool = useAtomValue(activeToolAtom);
  const drawingSettings = useAtomValue(drawingSettingsAtom);
  const [selection, setSelection] = useAtom(selectionAtom);
  const setCurrentImage = useSetAtom(currentImageAtom);
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const wrapperRef = useRef<HTMLDivElement>(null);
  const imageCanvasRef = useRef<HTMLCanvasElement>(null);
  const drawingCanvasRef = useRef<HTMLCanvasElement>(null);
  const tempCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawSnapshotRef = useRef<ImageData | null>(null);
  const [displayScale, setDisplayScale] = useState({ x: 1, y: 1 });
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
  const [mouseCanvasPos, setMouseCanvasPos] = useState({ x: 0, y: 0 });
  const [showBrushPreview, setShowBrushPreview] = useState(false);
  // Track which modifier was held when drag started
  const pendingModeRef = useRef<SelectionMode>("add");

  const [history, setHistory] = useAtom(historyAtom);
  const historyLimit = useAtomValue(historyLimitAtom);
  const cacheTTL = useAtomValue(cacheTTLAtom);
  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);
  const [pendingSession, setPendingSession] = useState<{
    original: string;
    current: string;
    history: HistoryState;
  } | null>(null);

  const historyRef = useRef(history);
  useEffect(() => {
    historyRef.current = history;
  }, [history]);

  const pushHistory = useCallback(() => {
    const imgCanvas = imageCanvasRef.current;
    const drawCanvas = drawingCanvasRef.current;
    if (!imgCanvas || !drawCanvas) return;

    const snapshot: HistorySnapshot = {
      backgroundImage: imgCanvas.toDataURL(),
      drawingLayer: drawCanvas.toDataURL(),
    };

    setHistory((prev) => {
      const newSnapshots = [
        ...prev.snapshots.slice(0, prev.currentIndex + 1),
        snapshot,
      ];
      if (newSnapshots.length > historyLimit) newSnapshots.shift();
      return { snapshots: newSnapshots, currentIndex: newSnapshots.length - 1 };
    });
  }, [historyLimit, setHistory]);

  // Trim history when limit is reduced below current snapshot count
  useEffect(() => {
    setHistory((prev) => {
      if (prev.snapshots.length <= historyLimit) return prev;
      const excess = prev.snapshots.length - historyLimit;
      const newSnapshots = prev.snapshots.slice(excess);
      const newIndex = Math.max(0, prev.currentIndex - excess);
      return { snapshots: newSnapshots, currentIndex: newIndex };
    });
  }, [historyLimit, setHistory]);

  const loadSnapshot = useCallback(
    (snapshot: HistorySnapshot) => {
      if (!imageCanvasRef.current || !drawingCanvasRef.current) return;
      const imgCanvas = imageCanvasRef.current;
      const drawCanvas = drawingCanvasRef.current;
      const imgCtx = imgCanvas.getContext("2d");
      const drawCtx = drawCanvas.getContext("2d");

      if (snapshot.backgroundImage) {
        const img = new Image();
        img.src = snapshot.backgroundImage;
        img.onload = () => {
          imgCtx?.clearRect(0, 0, imgCanvas.width, imgCanvas.height);
          imgCtx?.drawImage(img, 0, 0);
          if (snapshot.backgroundImage)
            setCurrentImage(snapshot.backgroundImage);
        };
      }

      if (snapshot.drawingLayer) {
        const drawImg = new Image();
        drawImg.src = snapshot.drawingLayer;
        drawImg.onload = () => {
          drawCtx?.clearRect(0, 0, drawCanvas.width, drawCanvas.height);
          drawCtx?.drawImage(drawImg, 0, 0);
        };
      } else {
        drawCtx?.clearRect(0, 0, drawCanvas.width, drawCanvas.height);
      }
    },
    [setCurrentImage],
  );

  const currentBrushSize =
    drawingSettings.selectedSubTool === "pen"
      ? drawingSettings.penSize
      : drawingSettings.selectedSubTool === "brush"
        ? drawingSettings.brushSize
        : drawingSettings.eraserSize;

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
        return { x: 0, y: 0, width: 0, height: 0, clientX, clientY };

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

  // ---------------------------------------------------------------------------
  // Image load / resize
  // ---------------------------------------------------------------------------
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
      if (
        imageCanvas.width !== img.width ||
        imageCanvas.height !== img.height
      ) {
        imageCanvas.width = img.width;
        imageCanvas.height = img.height;
        drawingCanvas.width = img.width;
        drawingCanvas.height = img.height;
      }

      imgCtx.clearRect(0, 0, imageCanvas.width, imageCanvas.height);
      imgCtx.drawImage(img, 0, 0);

      const rect = imageCanvas.getBoundingClientRect();
      if (rect.width > 0) {
        setDisplayScale({
          x: img.width / rect.width,
          y: img.height / rect.height,
        });
      }

      const currentHistory = historyRef.current;
      if (
        currentHistory.snapshots.length > 0 &&
        currentHistory.currentIndex >= 0
      ) {
        const snapshot = currentHistory.snapshots[currentHistory.currentIndex];
        if (snapshot.drawingLayer) {
          const drawImg = new Image();
          drawImg.src = snapshot.drawingLayer;
          drawImg.onload = () => {
            const dCtx = drawingCanvas.getContext("2d");
            if (dCtx) {
              dCtx.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);
              dCtx.drawImage(drawImg, 0, 0);
            }
          };
        } else {
          drawCtx.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);
        }
      } else {
        setHistory((prev) => {
          if (prev.snapshots.length === 0) {
            const snapshot: HistorySnapshot = {
              backgroundImage: img.src,
              drawingLayer: null,
            };
            return { snapshots: [snapshot], currentIndex: 0 };
          }
          return prev;
        });
      }
    };
  }, [imageUrl, setHistory]);

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

  // ---------------------------------------------------------------------------
  // Session persistence
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (imageUrl && history.snapshots.length > 0) {
      const session = {
        original: originalImage,
        current: imageUrl,
        history,
        lastModified: Date.now(),
      };
      localStorage.setItem("studio_session", JSON.stringify(session));
    }
  }, [imageUrl, originalImage, history]);

  useEffect(() => {
    const saved = localStorage.getItem("studio_session");
    if (saved) {
      try {
        const session = JSON.parse(saved);
        // Auto-delete expired cache
        if (cacheTTL > 0 && session.lastModified) {
          const elapsed = Date.now() - session.lastModified;
          const ttlMs = cacheTTL * 24 * 60 * 60 * 1000;
          if (elapsed > ttlMs) {
            localStorage.removeItem("studio_session");
            return;
          }
        }
        if (session.original && session.current) {
          setPendingSession(session);
          setIsRestoreModalOpen(true);
        }
      } catch (e) {
        console.error("Failed to parse saved session", e);
      }
    }
  }, [cacheTTL]);

  const restoreSession = () => {
    if (pendingSession) {
      setOriginalImage(pendingSession.original);
      setCurrentImage(pendingSession.current);
      setHistory(pendingSession.history);
      setIsRestoreModalOpen(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Space-bar panning keyboard handling
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.code === "Space" &&
        !isSpacePressed &&
        document.activeElement?.tagName !== "INPUT"
      ) {
        setIsSpacePressed(true);
        if (e.target === document.body || e.target === wrapperRef.current)
          e.preventDefault();
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space") setIsSpacePressed(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [isSpacePressed]);

  // ---------------------------------------------------------------------------
  // Pointer handlers
  // ---------------------------------------------------------------------------
  const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
    const { x, y, clientX, clientY } = getCoordinates(e);

    if (isSpacePressed) {
      setIsDragging(true);
      setLastMousePos({ x: clientX, y: clientY });
      return;
    }

    if (activeTool !== "select" && activeTool !== "draw") return;

    if (activeTool === "select") {
      // Determine mode from modifier keys
      const mouseEvent = e as React.MouseEvent;
      let mode: SelectionMode = "add";
      if (mouseEvent.shiftKey) {
        mode = "add";
      } else if (mouseEvent.altKey) {
        mode = "subtract";
      } else {
        // Plain click without modifier: replace existing selection
        // We do this by resetting rects and starting fresh in "add" mode
        setSelection((prev: SelectionState) => ({
          ...prev,
          rects: [],
          pendingRect: null,
          pendingMode: "add",
        }));
      }

      pendingModeRef.current = mode;
      setStartPos({ x, y });
      setIsDragging(true);

      setSelection((prev: SelectionState) => ({
        ...prev,
        pendingRect: { x, y, width: 0, height: 0 },
        pendingMode: mode,
      }));
    } else if (activeTool === "draw" && drawingSettings.selectedSubTool) {
      setIsDragging(true);
      const ctx = drawingCanvasRef.current?.getContext("2d");
      if (ctx) {
        ctx.save();
        ctx.strokeStyle =
          drawingSettings.selectedSubTool === "eraser"
            ? "rgba(0,0,0,1)"
            : drawingSettings.color;
        const currentSize = currentBrushSize;
        ctx.lineWidth = currentSize;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        if (drawingSettings.selectedSubTool === "eraser") {
          ctx.globalCompositeOperation = "destination-out";
          if (drawingSettings.eraseBackground) {
            const imgCtx = imageCanvasRef.current?.getContext("2d");
            if (imgCtx) {
              imgCtx.save();
              imgCtx.globalCompositeOperation = "destination-out";
              imgCtx.lineWidth = currentSize;
              imgCtx.lineCap = "round";
              imgCtx.lineJoin = "round";
              if (hasSelection(selection)) {
                applySelectionClip(imgCtx, selection.rects);
              }
              imgCtx.beginPath();
              imgCtx.moveTo(x, y);
            }
          }
        } else {
          ctx.globalCompositeOperation = "source-over";
          if (drawingSettings.selectedSubTool === "brush") {
            // When a selection is active, draw to a temp canvas to prevent
            // shadowBlur from bleeding outside the clipped region.
            if (hasSelection(selection)) {
              const drawCanvas = drawingCanvasRef.current!;
              // Save current drawing canvas state for live preview
              drawSnapshotRef.current = ctx.getImageData(
                0,
                0,
                drawCanvas.width,
                drawCanvas.height,
              );
              const tempCanvas = document.createElement("canvas");
              tempCanvas.width = drawCanvas.width;
              tempCanvas.height = drawCanvas.height;
              tempCanvasRef.current = tempCanvas;
              const tCtx = tempCanvas.getContext("2d")!;
              tCtx.strokeStyle = drawingSettings.color;
              tCtx.lineWidth = currentSize;
              tCtx.lineCap = "round";
              tCtx.lineJoin = "round";
              tCtx.globalCompositeOperation = "source-over";
              tCtx.shadowBlur = currentSize / 2;
              tCtx.shadowColor = drawingSettings.color;
              tCtx.beginPath();
              tCtx.moveTo(x, y);
              // No clip on temp canvas; clip will be applied when compositing
              ctx.restore();
              return;
            }
            ctx.shadowBlur = currentSize / 2;
            ctx.shadowColor = drawingSettings.color;
          } else {
            ctx.shadowBlur = 0;
          }
        }

        if (hasSelection(selection)) {
          applySelectionClip(ctx, selection.rects);
        }

        ctx.beginPath();
        ctx.moveTo(x, y);
      }
    }
  };

  const handleMouseEnter = () => setShowBrushPreview(true);
  const handleMouseLeave = () => {
    setShowBrushPreview(false);
    setIsDragging(false);
  };

  const handleMove = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      const {
        x: currentX,
        y: currentY,
        width: canvasWidth,
        height: canvasHeight,
        clientX,
        clientY,
      } = getCoordinates(e);

      setMouseCanvasPos({ x: currentX, y: currentY });

      if (isSpacePressed && isDragging) {
        const dx = clientX - lastMousePos.x;
        const dy = clientY - lastMousePos.y;
        setPanOffset((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
        setLastMousePos({ x: clientX, y: clientY });
        return;
      }

      if (!isDragging) return;

      if (activeTool === "select") {
        const constrainedX = Math.max(0, Math.min(currentX, canvasWidth));
        const constrainedY = Math.max(0, Math.min(currentY, canvasHeight));

        const rx = Math.min(startPos.x, constrainedX);
        const ry = Math.min(startPos.y, constrainedY);
        const rw = Math.abs(startPos.x - constrainedX);
        const rh = Math.abs(startPos.y - constrainedY);

        setSelection((prev: SelectionState) => ({
          ...prev,
          pendingRect: { x: rx, y: ry, width: rw, height: rh },
        }));
      } else if (activeTool === "draw") {
        // If brush + selection, draw to temp canvas and show live preview
        const tCanvas = tempCanvasRef.current;
        if (tCanvas) {
          const tCtx = tCanvas.getContext("2d");
          if (tCtx) {
            tCtx.lineTo(currentX, currentY);
            tCtx.stroke();
          }
          // Live preview: restore snapshot, then composite with clip
          const dCtx = drawingCanvasRef.current?.getContext("2d");
          if (dCtx && drawSnapshotRef.current) {
            dCtx.putImageData(drawSnapshotRef.current, 0, 0);
            dCtx.save();
            applySelectionClip(dCtx, selection.rects);
            dCtx.drawImage(tCanvas, 0, 0);
            dCtx.restore();
          }
        }
        const ctx = !tCanvas
          ? drawingCanvasRef.current?.getContext("2d")
          : null;
        if (ctx) {
          ctx.lineTo(currentX, currentY);
          ctx.stroke();

          if (
            drawingSettings.selectedSubTool === "eraser" &&
            drawingSettings.eraseBackground
          ) {
            const imgCtx = imageCanvasRef.current?.getContext("2d");
            if (imgCtx) {
              imgCtx.lineTo(currentX, currentY);
              imgCtx.stroke();
            }
          }
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
      drawingSettings,
      selection,
    ],
  );

  const handleEnd = () => {
    if (activeTool === "select") {
      setSelection((prev: SelectionState) => {
        if (!prev.pendingRect) return { ...prev, pendingRect: null };

        const { pendingRect, pendingMode } = prev;

        // Discard tiny drags (treat as click = clear selection)
        if (pendingRect.width < 5 && pendingRect.height < 5) {
          return { rects: [], pendingRect: null, pendingMode: "add" };
        }

        const committed: SelectionRect = { ...pendingRect, mode: pendingMode };
        return {
          rects: [...prev.rects, committed],
          pendingRect: null,
          pendingMode: "add",
        };
      });
    }

    if (activeTool === "draw" && isDragging) {
      // Composite temp canvas (brush + selection) onto drawing canvas with clip
      const tCanvas = tempCanvasRef.current;
      if (tCanvas) {
        const ctx = drawingCanvasRef.current?.getContext("2d");
        if (ctx && drawSnapshotRef.current) {
          ctx.putImageData(drawSnapshotRef.current, 0, 0);
          ctx.save();
          applySelectionClip(ctx, selection.rects);
          ctx.drawImage(tCanvas, 0, 0);
          ctx.restore();
        }
        tempCanvasRef.current = null;
        drawSnapshotRef.current = null;
      } else {
        const ctx = drawingCanvasRef.current?.getContext("2d");
        if (ctx) ctx.restore();
      }

      if (
        drawingSettings.selectedSubTool === "eraser" &&
        drawingSettings.eraseBackground
      ) {
        const imgCtx = imageCanvasRef.current?.getContext("2d");
        if (imgCtx) imgCtx.restore();
      }
      pushHistory();
    }

    setIsDragging(false);
  };

  const setOriginalImage = useSetAtom(originalImageAtom);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setCurrentImage(result);
        setOriginalImage(result);
        setHistory({ snapshots: [], currentIndex: -1 });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape" || e.key === "Backspace") {
      setSelection({ rects: [], pendingRect: null, pendingMode: "add" });
    }
  };

  const handleUndo = () => {
    if (history.currentIndex > 0) {
      const prevIndex = history.currentIndex - 1;
      loadSnapshot(history.snapshots[prevIndex]);
      setHistory((prev) => ({ ...prev, currentIndex: prevIndex }));
    }
  };

  const handleRedo = () => {
    if (history.currentIndex < history.snapshots.length - 1) {
      const nextIndex = history.currentIndex + 1;
      loadSnapshot(history.snapshots[nextIndex]);
      setHistory((prev) => ({ ...prev, currentIndex: nextIndex }));
    }
  };

  const handleSaveClick = () => {
    if (!imageCanvasRef.current || !drawingCanvasRef.current) return;
    const canvas = document.createElement("canvas");
    canvas.width = imageCanvasRef.current.width;
    canvas.height = imageCanvasRef.current.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(imageCanvasRef.current, 0, 0);
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
    pushHistory();
  };

  const handleReset = () => {
    if (!originalImage) return;
    const canvas = drawingCanvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
    }
    setSelection({ rects: [], pendingRect: null, pendingMode: "add" });
    setCurrentImage(originalImage);
    if (imageUrl === originalImage && imageCanvasRef.current) {
      const img = new Image();
      img.src = originalImage;
      img.onload = () => {
        const ctx = imageCanvasRef.current?.getContext("2d");
        if (ctx) ctx.drawImage(img, 0, 0);
        pushHistory();
      };
    }
  };

  const filterSnapshotRef = useRef<ImageData | null>(null);

  const applyFilterToCanvas = useCallback(
    (source: ImageData, filter: FilterType, intensity: number) => {
      const canvas = imageCanvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const t = intensity / 100;
      const w = source.width;
      const h = source.height;
      const src = source.data;

      // --- Kernel-based filters ---
      const KERNEL_FILTERS = [
        "sharpen",
        "blur",
        "motionBlur",
        "grain",
        "denoise",
      ] as const;

      if ((KERNEL_FILTERS as readonly string[]).includes(filter)) {
        const out = new ImageData(new Uint8ClampedArray(src), w, h);
        const od = out.data;

        switch (filter) {
          case "sharpen": {
            // 3x3 unsharp-mask kernel
            const amount = t * 2;
            for (let y = 1; y < h - 1; y++) {
              for (let x = 1; x < w - 1; x++) {
                const i = (y * w + x) * 4;
                for (let ch = 0; ch < 3; ch++) {
                  const center = src[i + ch];
                  const neighbors =
                    src[((y - 1) * w + x) * 4 + ch] +
                    src[((y + 1) * w + x) * 4 + ch] +
                    src[(y * w + x - 1) * 4 + ch] +
                    src[(y * w + x + 1) * 4 + ch];
                  const sharpened = center + (center * 4 - neighbors) * amount;
                  od[i + ch] = Math.max(
                    0,
                    Math.min(255, Math.round(sharpened)),
                  );
                }
              }
            }
            break;
          }
          case "blur": {
            // Separable box blur (3-pass ≈ Gaussian)
            const radius = Math.max(1, Math.round(t * 15));
            const temp = new Uint8ClampedArray(src);
            for (let pass = 0; pass < 3; pass++) {
              const input = pass === 0 ? src : od;
              // Horizontal pass → temp
              for (let y = 0; y < h; y++) {
                for (let x = 0; x < w; x++) {
                  let rr = 0,
                    gg = 0,
                    bb = 0,
                    count = 0;
                  for (let dx = -radius; dx <= radius; dx++) {
                    const nx = Math.min(w - 1, Math.max(0, x + dx));
                    const idx = (y * w + nx) * 4;
                    rr += input[idx];
                    gg += input[idx + 1];
                    bb += input[idx + 2];
                    count++;
                  }
                  const idx = (y * w + x) * 4;
                  temp[idx] = rr / count;
                  temp[idx + 1] = gg / count;
                  temp[idx + 2] = bb / count;
                  temp[idx + 3] = input[idx + 3];
                }
              }
              // Vertical pass → od
              for (let y = 0; y < h; y++) {
                for (let x = 0; x < w; x++) {
                  let rr = 0,
                    gg = 0,
                    bb = 0,
                    count = 0;
                  for (let dy = -radius; dy <= radius; dy++) {
                    const ny = Math.min(h - 1, Math.max(0, y + dy));
                    const idx = (ny * w + x) * 4;
                    rr += temp[idx];
                    gg += temp[idx + 1];
                    bb += temp[idx + 2];
                    count++;
                  }
                  const idx = (y * w + x) * 4;
                  od[idx] = rr / count;
                  od[idx + 1] = gg / count;
                  od[idx + 2] = bb / count;
                  od[idx + 3] = temp[idx + 3];
                }
              }
            }
            // Blend with original
            for (let i = 0; i < od.length; i += 4) {
              od[i] = Math.round(src[i] + (od[i] - src[i]) * t);
              od[i + 1] = Math.round(src[i + 1] + (od[i + 1] - src[i + 1]) * t);
              od[i + 2] = Math.round(src[i + 2] + (od[i + 2] - src[i + 2]) * t);
            }
            break;
          }
          case "motionBlur": {
            const length = Math.max(1, Math.round(t * 25));
            for (let y = 0; y < h; y++) {
              for (let x = 0; x < w; x++) {
                let rr = 0,
                  gg = 0,
                  bb = 0,
                  count = 0;
                for (let dx = -length; dx <= length; dx++) {
                  const nx = Math.min(w - 1, Math.max(0, x + dx));
                  const idx = (y * w + nx) * 4;
                  rr += src[idx];
                  gg += src[idx + 1];
                  bb += src[idx + 2];
                  count++;
                }
                const idx = (y * w + x) * 4;
                od[idx] = Math.round(src[idx] + (rr / count - src[idx]) * t);
                od[idx + 1] = Math.round(
                  src[idx + 1] + (gg / count - src[idx + 1]) * t,
                );
                od[idx + 2] = Math.round(
                  src[idx + 2] + (bb / count - src[idx + 2]) * t,
                );
              }
            }
            break;
          }
          case "grain": {
            const amount = t * 60;
            for (let i = 0; i < od.length; i += 4) {
              const noise = (Math.random() - 0.5) * amount;
              od[i] = Math.max(0, Math.min(255, src[i] + noise));
              od[i + 1] = Math.max(0, Math.min(255, src[i + 1] + noise));
              od[i + 2] = Math.max(0, Math.min(255, src[i + 2] + noise));
            }
            break;
          }
          case "denoise": {
            // Mean filter with radius based on intensity
            const r = Math.max(1, Math.round(t * 3));
            for (let y = 0; y < h; y++) {
              for (let x = 0; x < w; x++) {
                let rr = 0,
                  gg = 0,
                  bb = 0,
                  count = 0;
                for (let dy = -r; dy <= r; dy++) {
                  for (let dx = -r; dx <= r; dx++) {
                    const ny = Math.min(h - 1, Math.max(0, y + dy));
                    const nx = Math.min(w - 1, Math.max(0, x + dx));
                    const idx = (ny * w + nx) * 4;
                    rr += src[idx];
                    gg += src[idx + 1];
                    bb += src[idx + 2];
                    count++;
                  }
                }
                const idx = (y * w + x) * 4;
                od[idx] = Math.round(src[idx] + (rr / count - src[idx]) * t);
                od[idx + 1] = Math.round(
                  src[idx + 1] + (gg / count - src[idx + 1]) * t,
                );
                od[idx + 2] = Math.round(
                  src[idx + 2] + (bb / count - src[idx + 2]) * t,
                );
              }
            }
            break;
          }
        }

        ctx.putImageData(out, 0, 0);
        return;
      }

      // --- Per-pixel filters ---
      const imageData = new ImageData(new Uint8ClampedArray(src), w, h);
      const { data } = imageData;

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        let nr = r;
        let ng = g;
        let nb = b;

        switch (filter) {
          case "grayscale": {
            const gray = r * 0.299 + g * 0.587 + b * 0.114;
            nr = gray;
            ng = gray;
            nb = gray;
            break;
          }
          case "sepia": {
            nr = Math.min(255, r * 0.393 + g * 0.769 + b * 0.189);
            ng = Math.min(255, r * 0.349 + g * 0.686 + b * 0.168);
            nb = Math.min(255, r * 0.272 + g * 0.534 + b * 0.131);
            break;
          }
          case "vintage": {
            nr = Math.min(255, r * 0.62 + g * 0.32 + b * 0.16 + 20);
            ng = Math.min(255, r * 0.22 + g * 0.7 + b * 0.08 + 10);
            nb = Math.min(255, r * 0.16 + g * 0.24 + b * 0.44 + 10);
            break;
          }
          case "film": {
            const gray = r * 0.299 + g * 0.587 + b * 0.114;
            nr = Math.min(255, r * 0.75 + gray * 0.25 + 10);
            ng = Math.min(255, g * 0.75 + gray * 0.25 + 15);
            nb = Math.min(255, b * 0.7 + gray * 0.3 + 10);
            nr = nr * 0.85 + 20;
            ng = ng * 0.85 + 20;
            nb = nb * 0.85 + 20;
            break;
          }
          case "cool": {
            nr = r * 0.9;
            ng = g;
            nb = Math.min(255, b * 1.15 + 10);
            break;
          }
          case "warm": {
            nr = Math.min(255, r * 1.12 + 8);
            ng = Math.min(255, g * 1.02 + 4);
            nb = b * 0.9;
            break;
          }
          case "fade": {
            nr = r * 0.8 + 50;
            ng = g * 0.8 + 50;
            nb = b * 0.8 + 50;
            break;
          }
          case "highlight": {
            const lum = (r + g + b) / 3;
            const boost = lum > 100 ? (lum - 100) / 155 : 0;
            nr = Math.min(255, r + boost * 60);
            ng = Math.min(255, g + boost * 60);
            nb = Math.min(255, b + boost * 60);
            break;
          }
          case "shadow": {
            const luminance = (r + g + b) / 3;
            const darken = luminance < 160 ? (160 - luminance) / 160 : 0;
            nr = Math.max(0, r - darken * 50);
            ng = Math.max(0, g - darken * 50);
            nb = Math.max(0, b - darken * 50);
            break;
          }
        }

        data[i] = Math.round(r + (nr - r) * t);
        data[i + 1] = Math.round(g + (ng - g) * t);
        data[i + 2] = Math.round(b + (nb - b) * t);
      }

      ctx.putImageData(imageData, 0, 0);
    },
    [],
  );

  const handlePreviewFilter = useCallback(
    (filter: FilterType, intensity: number) => {
      const canvas = imageCanvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Save original pixels on first preview call
      if (!filterSnapshotRef.current) {
        filterSnapshotRef.current = ctx.getImageData(
          0,
          0,
          canvas.width,
          canvas.height,
        );
      }

      applyFilterToCanvas(filterSnapshotRef.current, filter, intensity);
    },
    [applyFilterToCanvas],
  );

  const handleCancelPreview = useCallback(() => {
    const canvas = imageCanvasRef.current;
    if (!canvas || !filterSnapshotRef.current) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.putImageData(filterSnapshotRef.current, 0, 0);
    filterSnapshotRef.current = null;
  }, []);

  const handleApplyFilter = useCallback(
    (filter: FilterType, intensity: number) => {
      const canvas = imageCanvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // If we have a snapshot, apply from original; otherwise apply from current
      const source =
        filterSnapshotRef.current ??
        ctx.getImageData(0, 0, canvas.width, canvas.height);
      applyFilterToCanvas(source, filter, intensity);
      filterSnapshotRef.current = null;
      pushHistory();
    },
    [applyFilterToCanvas, pushHistory],
  );

  // ---------------------------------------------------------------------------
  // Adjustment handlers (보정)
  // ---------------------------------------------------------------------------
  const adjustmentSnapshotRef = useRef<ImageData | null>(null);

  const applyAdjustmentsToImageData = useCallback(
    (source: ImageData, v: AdjustmentValues): ImageData => {
      const result = new ImageData(
        new Uint8ClampedArray(source.data),
        source.width,
        source.height,
      );
      const d = result.data;

      // Pre-compute contrast factor
      const contrastVal = v.contrast * 2.55;
      const cf = (259 * (contrastVal + 255)) / (255 * (259 - contrastVal));

      // Pre-compute gamma exponent
      const gammaExp = 1 / 2 ** (v.gamma / 100);

      for (let i = 0; i < d.length; i += 4) {
        let r = d[i];
        let g = d[i + 1];
        let b = d[i + 2];

        // 1. Brightness
        r += v.brightness * 2.55;
        g += v.brightness * 2.55;
        b += v.brightness * 2.55;

        // 2. Contrast
        if (v.contrast !== 0) {
          r = cf * (r - 128) + 128;
          g = cf * (g - 128) + 128;
          b = cf * (b - 128) + 128;
        }

        // 3. Saturation
        if (v.saturation !== 0) {
          const gray = 0.299 * r + 0.587 * g + 0.114 * b;
          const sf = 1 + v.saturation / 100;
          r = gray + (r - gray) * sf;
          g = gray + (g - gray) * sf;
          b = gray + (b - gray) * sf;
        }

        // 4. Warmth (red-blue shift)
        if (v.warmth !== 0) {
          r += v.warmth * 0.7;
          b -= v.warmth * 0.7;
        }

        // 5. Tint (green-magenta shift)
        if (v.tint !== 0) {
          g += v.tint * 0.7;
        }

        // 6. Gamma
        if (v.gamma !== 0) {
          r = 255 * (Math.max(0, r) / 255) ** gammaExp;
          g = 255 * (Math.max(0, g) / 255) ** gammaExp;
          b = 255 * (Math.max(0, b) / 255) ** gammaExp;
        }

        d[i] = Math.max(0, Math.min(255, Math.round(r)));
        d[i + 1] = Math.max(0, Math.min(255, Math.round(g)));
        d[i + 2] = Math.max(0, Math.min(255, Math.round(b)));
      }

      return result;
    },
    [],
  );

  const handlePreviewAdjustment = useCallback(
    (values: AdjustmentValues) => {
      const canvas = imageCanvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      if (!adjustmentSnapshotRef.current) {
        adjustmentSnapshotRef.current = ctx.getImageData(
          0,
          0,
          canvas.width,
          canvas.height,
        );
      }

      const adjusted = applyAdjustmentsToImageData(
        adjustmentSnapshotRef.current,
        values,
      );
      ctx.putImageData(adjusted, 0, 0);
    },
    [applyAdjustmentsToImageData],
  );

  const handleApplyAdjustment = useCallback(
    (values: AdjustmentValues) => {
      const canvas = imageCanvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const source =
        adjustmentSnapshotRef.current ??
        ctx.getImageData(0, 0, canvas.width, canvas.height);
      const adjusted = applyAdjustmentsToImageData(source, values);
      ctx.putImageData(adjusted, 0, 0);
      adjustmentSnapshotRef.current = null;
      pushHistory();
    },
    [applyAdjustmentsToImageData, pushHistory],
  );

  const handleResetAdjustment = useCallback(() => {
    const canvas = imageCanvasRef.current;
    if (!canvas || !adjustmentSnapshotRef.current) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.putImageData(adjustmentSnapshotRef.current, 0, 0);
    adjustmentSnapshotRef.current = null;
  }, []);

  // ---------------------------------------------------------------------------
  // Edit handlers (편집)
  // ---------------------------------------------------------------------------
  const transformBothCanvases = useCallback(
    (
      transform: (
        srcCanvas: HTMLCanvasElement,
        destCtx: CanvasRenderingContext2D,
        destCanvas: HTMLCanvasElement,
      ) => void,
      newWidth?: number,
      newHeight?: number,
    ) => {
      const imgCanvas = imageCanvasRef.current;
      const drawCanvas = drawingCanvasRef.current;
      if (!imgCanvas || !drawCanvas) return;

      const w = newWidth ?? imgCanvas.width;
      const h = newHeight ?? imgCanvas.height;

      // Transform image canvas
      const imgTemp = document.createElement("canvas");
      imgTemp.width = imgCanvas.width;
      imgTemp.height = imgCanvas.height;
      imgTemp.getContext("2d")!.drawImage(imgCanvas, 0, 0);

      imgCanvas.width = w;
      imgCanvas.height = h;
      const imgCtx = imgCanvas.getContext("2d")!;
      imgCtx.clearRect(0, 0, w, h);
      transform(imgTemp, imgCtx, imgCanvas);

      // Transform drawing canvas
      const drawTemp = document.createElement("canvas");
      drawTemp.width = drawCanvas.width;
      drawTemp.height = drawCanvas.height;
      drawTemp.getContext("2d")!.drawImage(drawCanvas, 0, 0);

      drawCanvas.width = w;
      drawCanvas.height = h;
      const drawCtx = drawCanvas.getContext("2d")!;
      drawCtx.clearRect(0, 0, w, h);
      transform(drawTemp, drawCtx, drawCanvas);

      // Update display scale
      const rect = imgCanvas.getBoundingClientRect();
      if (rect.width > 0) {
        setDisplayScale({ x: w / rect.width, y: h / rect.height });
      }

      setCurrentImage(imgCanvas.toDataURL());
      pushHistory();
    },
    [pushHistory, setCurrentImage],
  );

  const handleRotateLeft = useCallback(() => {
    const imgCanvas = imageCanvasRef.current;
    if (!imgCanvas) return;
    const oldW = imgCanvas.width;
    const oldH = imgCanvas.height;
    transformBothCanvases(
      (src, ctx) => {
        ctx.translate(0, oldW);
        ctx.rotate(-Math.PI / 2);
        ctx.drawImage(src, 0, 0);
      },
      oldH,
      oldW,
    );
  }, [transformBothCanvases]);

  const handleRotateRight = useCallback(() => {
    const imgCanvas = imageCanvasRef.current;
    if (!imgCanvas) return;
    const oldW = imgCanvas.width;
    const oldH = imgCanvas.height;
    transformBothCanvases(
      (src, ctx) => {
        ctx.translate(oldH, 0);
        ctx.rotate(Math.PI / 2);
        ctx.drawImage(src, 0, 0);
      },
      oldH,
      oldW,
    );
  }, [transformBothCanvases]);

  const handleFlipHorizontal = useCallback(() => {
    const imgCanvas = imageCanvasRef.current;
    if (!imgCanvas) return;
    transformBothCanvases((src, ctx, dest) => {
      ctx.translate(dest.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(src, 0, 0);
    });
  }, [transformBothCanvases]);

  const handleFlipVertical = useCallback(() => {
    const imgCanvas = imageCanvasRef.current;
    if (!imgCanvas) return;
    transformBothCanvases((src, ctx, dest) => {
      ctx.translate(0, dest.height);
      ctx.scale(1, -1);
      ctx.drawImage(src, 0, 0);
    });
  }, [transformBothCanvases]);

  const handleCrop = useCallback(() => {
    if (!hasSelection(selection)) return;
    const bbox = getSelectionBoundingBox(selection.rects);
    if (!bbox) return;

    const imgCanvas = imageCanvasRef.current;
    const drawCanvas = drawingCanvasRef.current;
    if (!imgCanvas || !drawCanvas) return;

    const { x, y, width: cw, height: ch } = bbox;

    // Crop image canvas
    const imgData = imgCanvas.getContext("2d")!.getImageData(x, y, cw, ch);
    imgCanvas.width = cw;
    imgCanvas.height = ch;
    imgCanvas.getContext("2d")!.putImageData(imgData, 0, 0);

    // Crop drawing canvas
    const drawData = drawCanvas.getContext("2d")!.getImageData(x, y, cw, ch);
    drawCanvas.width = cw;
    drawCanvas.height = ch;
    drawCanvas.getContext("2d")!.putImageData(drawData, 0, 0);

    // Clear selection and update
    setSelection({ rects: [], pendingRect: null, pendingMode: "add" });
    const rect = imgCanvas.getBoundingClientRect();
    if (rect.width > 0) {
      setDisplayScale({ x: cw / rect.width, y: ch / rect.height });
    }
    setCurrentImage(imgCanvas.toDataURL());
    pushHistory();
  }, [selection, setSelection, setCurrentImage, pushHistory]);

  const handleResize = useCallback(
    (newWidth: number, newHeight: number) => {
      transformBothCanvases(
        (src, ctx) => {
          ctx.drawImage(src, 0, 0, newWidth, newHeight);
        },
        newWidth,
        newHeight,
      );
    },
    [transformBothCanvases],
  );

  // Derive effective rects for the SVG overlay (committed + pending)
  const effectiveRects = getEffectiveRects(selection);
  const canvasWidth = imageCanvasRef.current?.width ?? 0;
  const canvasHeight = imageCanvasRef.current?.height ?? 0;
  const selectionActive = hasSelection(selection);

  return (
    <div {...stylex.props(styles.container)}>
      {!imageUrl ? (
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
      ) : (
        <>
          <div
            ref={wrapperRef}
            {...stylex.props(styles.editorWrapper)}
            onMouseDown={handleStart}
            onMouseMove={handleMove}
            onMouseUp={handleEnd}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
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
              style={{
                transform: `translate(${panOffset.x}px, ${panOffset.y}px)`,
              }}
            >
              <div {...stylex.props(styles.canvasContainer)}>
                <canvas ref={imageCanvasRef} {...stylex.props(styles.canvas)} />
                <canvas
                  ref={drawingCanvasRef}
                  {...stylex.props(styles.drawingCanvas)}
                />

                {/* Compound selection overlay */}
                <SelectionOverlay
                  rects={effectiveRects}
                  displayScale={displayScale}
                  canvasWidth={canvasWidth}
                  canvasHeight={canvasHeight}
                />
              </div>

              {/* Brush preview circle */}
              {showBrushPreview &&
                activeTool === "draw" &&
                drawingSettings.selectedSubTool && (
                  <div
                    style={{
                      position: "absolute",
                      pointerEvents: "none",
                      left: mouseCanvasPos.x / displayScale.x,
                      top: mouseCanvasPos.y / displayScale.y,
                      width: currentBrushSize / displayScale.x,
                      height: currentBrushSize / displayScale.y,
                      border: "1px solid rgba(255, 255, 255, 0.8)",
                      borderRadius: "50%",
                      transform: "translate(-50%, -50%)",
                      boxShadow: "0 0 2px rgba(0,0,0,0.5)",
                      mixBlendMode: "difference",
                      zIndex: 100,
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
            onReset={handleReset}
            onApplyFilter={handleApplyFilter}
            onPreviewFilter={handlePreviewFilter}
            onCancelPreview={handleCancelPreview}
            onPreviewAdjustment={handlePreviewAdjustment}
            onApplyAdjustment={handleApplyAdjustment}
            onResetAdjustment={handleResetAdjustment}
            onRotateLeft={handleRotateLeft}
            onRotateRight={handleRotateRight}
            onFlipHorizontal={handleFlipHorizontal}
            onFlipVertical={handleFlipVertical}
            onCrop={handleCrop}
            onResize={handleResize}
            canvasWidth={canvasWidth}
            canvasHeight={canvasHeight}
            hasSelection={selectionActive}
            canUndo={history.currentIndex > 0}
            canRedo={history.currentIndex < history.snapshots.length - 1}
          />
        </>
      )}

      <Confirm
        isOpen={isRestoreModalOpen}
        onClose={() => {
          setIsRestoreModalOpen(false);
          localStorage.removeItem("studio_session");
        }}
        onConfirm={restoreSession}
        title="작업 복구"
        message="이전에 편집하던 내용이 있습니다. 복구하시겠습니까?"
        confirmText="복구하기"
        cancelText="새로시작"
      />
    </div>
  );
}
