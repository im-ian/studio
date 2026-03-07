import * as stylex from "@stylexjs/stylex";
import { Trash2 } from "react-feather";

import type {
  DrawingSettings,
  DrawingToolType,
} from "../../../store/imageAtoms";
import { colors, fontSize, radius, spacing } from "../../../tokens.stylex";
import CircleButton from "../../shared/CircleButton";
import IconButton from "../../shared/IconButton";
import Range from "../../shared/Range";
import SubmenuContainer from "./SubmenuContainer";

const styles = stylex.create({
  subToolGroup: {
    display: "flex",
    gap: spacing.small,
    alignItems: "center",
  },
  controlsGroup: {
    display: "flex",
    flexDirection: "column",
    gap: spacing.small,
    width: "100%",
    paddingTop: spacing.small,
    borderTop: "1px solid rgba(255, 255, 255, 0.1)",
  },
  colorPalette: {
    display: "flex",
    gap: "6px",
    width: "100%",
    justifyContent: "space-between",
    alignItems: "center",
  },
  hexRow: {
    display: "flex",
    alignItems: "center",
    gap: spacing.small,
    width: "100%",
    marginTop: spacing.xsmall,
  },
  hexInput: {
    backgroundColor: "rgba(0,0,0,0.2)",
    borderStyle: "solid",
    borderWidth: 0,
    color: "white",
    fontSize: fontSize.xxsmall,
    padding: `${spacing.small} ${spacing.small}`,
    borderRadius: radius.sm,
    flex: 1,
    outline: "none",
    ":focus": {
      borderColor: colors.accent,
    },
  },
  colorPreview: {
    width: "24px",
    height: "24px",
    borderRadius: "4px",
    border: "1px solid rgba(255,255,255,0.3)",
    flexShrink: 0,
  },
  sliderContainer: {
    display: "flex",
    alignItems: "center",
    gap: spacing.small,
    width: "100%",
  },
  sliderLabel: {
    fontSize: fontSize.xxsmall,
    color: "white",
    minWidth: "20px",
  },
  clearButton: {
    width: "100%",
    marginTop: spacing.small,
    padding: `${spacing.small} ${spacing.small}`,
    backgroundColor: "rgba(255, 59, 48, 0.2)",
    color: "#ff3b30",
    borderWidth: 0,
    borderStyle: "solid",
    borderRadius: radius.sm,
    fontSize: fontSize.small,
    fontWeight: 600,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
    transition: "all 0.2s ease",
    ":hover": {
      backgroundColor: "rgba(255, 59, 48, 0.3)",
      transform: "translateY(-1px)",
    },
    ":active": {
      transform: "translateY(0)",
    },
  },
  activeButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    color: colors.accent,
  },
});

const RAINBOW_COLORS = [
  "#FF0000",
  "#FF7F00",
  "#FFFF00",
  "#00FF00",
  "#0000FF",
  "#4B0082",
  "#9400D3",
  "#000000",
  "#FFFFFF",
];

interface DrawSubmenuProps {
  drawingSettings: DrawingSettings;
  updateDrawingSettings: (updates: Partial<DrawingSettings>) => void;
  onClearAll?: () => void;
  shouldBounce?: boolean;
}

export default function DrawSubmenu({
  drawingSettings,
  updateDrawingSettings,
  onClearAll,
  shouldBounce,
}: DrawSubmenuProps) {
  const handleSubToolClick = (subTool: DrawingToolType) => {
    updateDrawingSettings({
      selectedSubTool:
        drawingSettings.selectedSubTool === subTool ? null : subTool,
    });
  };

  return (
    <SubmenuContainer shouldBounce={shouldBounce}>
      <div {...stylex.props(styles.subToolGroup)}>
        <IconButton
          isActive={drawingSettings.selectedSubTool === "pen"}
          onClick={() => handleSubToolClick("pen")}
        >
          펜
        </IconButton>
        <IconButton
          isActive={drawingSettings.selectedSubTool === "brush"}
          onClick={() => handleSubToolClick("brush")}
        >
          브러시
        </IconButton>
        <IconButton
          isActive={drawingSettings.selectedSubTool === "eraser"}
          onClick={() => handleSubToolClick("eraser")}
        >
          지우개
        </IconButton>
      </div>

      {drawingSettings.selectedSubTool && (
        <div {...stylex.props(styles.controlsGroup)}>
          <div {...stylex.props(styles.sliderContainer)}>
            <span {...stylex.props(styles.sliderLabel)}>크기</span>
            <Range
              min={1}
              max={50}
              value={
                drawingSettings.selectedSubTool === "pen"
                  ? drawingSettings.penSize
                  : drawingSettings.selectedSubTool === "brush"
                    ? drawingSettings.brushSize
                    : drawingSettings.eraserSize
              }
              onChange={(size: number) => {
                if (drawingSettings.selectedSubTool === "pen")
                  updateDrawingSettings({ penSize: size });
                else if (drawingSettings.selectedSubTool === "brush")
                  updateDrawingSettings({ brushSize: size });
                else if (drawingSettings.selectedSubTool === "eraser")
                  updateDrawingSettings({ eraserSize: size });
              }}
              aria-label="Brush size"
            />
            <span {...stylex.props(styles.sliderLabel)}>
              {drawingSettings.selectedSubTool === "pen"
                ? drawingSettings.penSize
                : drawingSettings.selectedSubTool === "brush"
                  ? drawingSettings.brushSize
                  : drawingSettings.eraserSize}
            </span>
          </div>

          {drawingSettings.selectedSubTool !== "eraser" && (
            <>
              <div {...stylex.props(styles.colorPalette)}>
                {RAINBOW_COLORS.map((color) => (
                  <CircleButton
                    key={color}
                    backgroundColor={color}
                    isActive={drawingSettings.color === color}
                    onClick={() => updateDrawingSettings({ color })}
                    aria-label={`Select color ${color}`}
                  />
                ))}
              </div>
              <div {...stylex.props(styles.hexRow)}>
                <div
                  {...stylex.props(styles.colorPreview)}
                  style={{ backgroundColor: drawingSettings.color }}
                />
                <input
                  type="text"
                  value={drawingSettings.color}
                  onChange={(e) =>
                    updateDrawingSettings({ color: e.target.value })
                  }
                  {...stylex.props(styles.hexInput)}
                  placeholder="#HEX"
                />
              </div>
            </>
          )}

          {drawingSettings.selectedSubTool === "eraser" && (
            <button
              type="button"
              {...stylex.props(styles.clearButton)}
              onClick={onClearAll}
            >
              <Trash2 size={14} />
              모두 지우기
            </button>
          )}
        </div>
      )}
    </SubmenuContainer>
  );
}
