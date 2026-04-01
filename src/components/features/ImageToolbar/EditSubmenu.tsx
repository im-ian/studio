import * as stylex from "@stylexjs/stylex";
import { useState } from "react";
import { Crop, Maximize2, RotateCcw, RotateCw } from "react-feather";

import { fontSize, radius, spacing } from "../../../tokens.stylex";
import IconButton from "../../ui/IconButton";
import SubmenuContainer from "./SubmenuContainer";

function FlipHIcon({ size = 14 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="12" y1="3" x2="12" y2="21" />
      <polyline points="16 7 20 12 16 17" />
      <polyline points="8 7 4 12 8 17" />
    </svg>
  );
}

function FlipVIcon({ size = 14 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="3" y1="12" x2="21" y2="12" />
      <polyline points="7 8 12 4 17 8" />
      <polyline points="7 16 12 20 17 16" />
    </svg>
  );
}

const styles = stylex.create({
  optionGroup: {
    display: "flex",
    gap: spacing.small,
    alignItems: "center",
    flexWrap: "wrap",
  },
  controlsGroup: {
    display: "flex",
    flexDirection: "column",
    gap: spacing.small,
    width: "100%",
    paddingTop: spacing.small,
    borderTop: "1px solid rgba(255, 255, 255, 0.1)",
  },
  resizeRow: {
    display: "flex",
    alignItems: "center",
    gap: spacing.small,
    width: "100%",
  },
  resizeLabel: {
    fontSize: fontSize.xxsmall,
    color: "white",
    minWidth: "16px",
  },
  resizeInput: {
    width: "64px",
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    color: "white",
    fontSize: fontSize.xsmall,
    padding: "4px 6px",
    borderRadius: radius.sm,
    textAlign: "center",
    outline: "none",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    flexShrink: 0,
    ":focus": {
      borderColor: "rgba(59, 130, 246, 0.5)",
    },
  },
  resizeSeparator: {
    fontSize: fontSize.xxsmall,
    color: "rgba(255, 255, 255, 0.5)",
  },
  lockButton: {
    fontSize: fontSize.xxsmall,
    color: "white",
    padding: "4px 8px",
    borderRadius: radius.sm,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    cursor: "pointer",
    ":hover": {
      backgroundColor: "rgba(255, 255, 255, 0.25)",
    },
  },
  lockButtonActive: {
    backgroundColor: "rgba(59, 130, 246, 0.3)",
    color: "#93bbfd",
  },
  applyButton: {
    width: "100%",
    padding: `${spacing.small} ${spacing.small}`,
    backgroundColor: "rgba(59, 130, 246, 0.3)",
    color: "#93bbfd",
    borderRadius: radius.sm,
    fontSize: fontSize.small,
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.2s ease",
    ":hover": {
      backgroundColor: "rgba(59, 130, 246, 0.45)",
    },
  },
});

const ICON_SIZE = 14;

interface EditSubmenuProps {
  isExiting?: boolean;
  canvasWidth?: number;
  canvasHeight?: number;
  hasSelection?: boolean;
  onRotateLeft?: () => void;
  onRotateRight?: () => void;
  onFlipHorizontal?: () => void;
  onFlipVertical?: () => void;
  onCrop?: () => void;
  onResize?: (width: number, height: number) => void;
}

export default function EditSubmenu({
  isExiting,
  canvasWidth = 0,
  canvasHeight = 0,
  hasSelection = false,
  onRotateLeft,
  onRotateRight,
  onFlipHorizontal,
  onFlipVertical,
  onCrop,
  onResize,
}: EditSubmenuProps) {
  const [showResize, setShowResize] = useState(false);
  const [resizeWidth, setResizeWidth] = useState(canvasWidth);
  const [resizeHeight, setResizeHeight] = useState(canvasHeight);
  const [lockAspect, setLockAspect] = useState(true);
  const aspectRatio = canvasWidth > 0 ? canvasWidth / canvasHeight : 1;

  const handleWidthChange = (val: string) => {
    const w = Number.parseInt(val, 10);
    if (Number.isNaN(w) || w <= 0) return;
    setResizeWidth(w);
    if (lockAspect) {
      setResizeHeight(Math.round(w / aspectRatio));
    }
  };

  const handleHeightChange = (val: string) => {
    const h = Number.parseInt(val, 10);
    if (Number.isNaN(h) || h <= 0) return;
    setResizeHeight(h);
    if (lockAspect) {
      setResizeWidth(Math.round(h * aspectRatio));
    }
  };

  const handleResizeClick = () => {
    if (showResize) {
      setShowResize(false);
    } else {
      setResizeWidth(canvasWidth);
      setResizeHeight(canvasHeight);
      setShowResize(true);
    }
  };

  const handleApplyResize = () => {
    if (resizeWidth > 0 && resizeHeight > 0) {
      onResize?.(resizeWidth, resizeHeight);
      setShowResize(false);
    }
  };

  return (
    <SubmenuContainer isExiting={isExiting}>
      <div {...stylex.props(styles.optionGroup)}>
        <IconButton onClick={onRotateLeft}>
          <RotateCcw size={ICON_SIZE} />
          왼쪽 회전
        </IconButton>
        <IconButton onClick={onRotateRight}>
          <RotateCw size={ICON_SIZE} />
          오른쪽 회전
        </IconButton>
        <IconButton onClick={onFlipHorizontal}>
          <FlipHIcon size={ICON_SIZE} />
          좌우 반전
        </IconButton>
        <IconButton onClick={onFlipVertical}>
          <FlipVIcon size={ICON_SIZE} />
          상하 반전
        </IconButton>
        <IconButton onClick={onCrop} disabled={!hasSelection}>
          <Crop size={ICON_SIZE} />
          자르기
        </IconButton>
        <IconButton isActive={showResize} onClick={handleResizeClick}>
          <Maximize2 size={ICON_SIZE} />
          크기 조절
        </IconButton>
      </div>

      {showResize && (
        <div {...stylex.props(styles.controlsGroup)}>
          <div {...stylex.props(styles.resizeRow)}>
            <span {...stylex.props(styles.resizeLabel)}>W</span>
            <input
              type="number"
              {...stylex.props(styles.resizeInput)}
              value={resizeWidth}
              onChange={(e) => handleWidthChange(e.target.value)}
            />
            <span {...stylex.props(styles.resizeSeparator)}>×</span>
            <span {...stylex.props(styles.resizeLabel)}>H</span>
            <input
              type="number"
              {...stylex.props(styles.resizeInput)}
              value={resizeHeight}
              onChange={(e) => handleHeightChange(e.target.value)}
            />
            <button
              type="button"
              {...stylex.props(
                styles.lockButton,
                lockAspect && styles.lockButtonActive,
              )}
              onClick={() => setLockAspect(!lockAspect)}
            >
              {lockAspect ? "잠금" : "해제"}
            </button>
          </div>
          <button
            type="button"
            {...stylex.props(styles.applyButton)}
            onClick={handleApplyResize}
          >
            적용
          </button>
        </div>
      )}
    </SubmenuContainer>
  );
}
