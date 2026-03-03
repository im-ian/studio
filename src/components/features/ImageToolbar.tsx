import * as stylex from "@stylexjs/stylex";
import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import {
  Crosshair,
  Edit2,
  Edit3,
  Layers,
  RotateCcw,
  RotateCw,
  Save,
} from "react-feather";

import {
  activeToolAtom,
  type DrawingToolType,
  drawingSettingsAtom,
  type ToolType,
} from "../../store/imageAtoms";
import { colors, fontSize, radius, spacing } from "../../tokens.stylex";
import CircleButton from "../shared/CircleButton";
import Range from "../shared/Range";

const bounce = stylex.keyframes({
  "0%, 20%, 50%, 80%, 100%": { transform: "translateY(0)" },
  "40%": { transform: "translateY(-10px)" },
  "60%": { transform: "translateY(-5px)" },
});

const styles = stylex.create({
  container: {
    position: "fixed",
    width: "100%",
    bottom: 0,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    zIndex: 1000,
  },
  submenu: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: spacing.small,
    padding: `${spacing.small} ${spacing.medium}`,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    backdropFilter: "blur(16px)",
    borderRadius: "20px",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    marginBottom: spacing.small,
    boxShadow: "0 4px 16px rgba(0, 0, 0, 0.1)",
    animationName: stylex.keyframes({
      from: { opacity: 0, transform: "translateY(10px)" },
      to: { opacity: 1, transform: "translateY(0)" },
    }),
    animationDuration: "0.2s",
  },
  bounce: {
    animationName: bounce,
    animationDuration: "1s",
    animationIterationCount: 1,
  },
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
  toolbar: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    gap: spacing.small,
    padding: `${spacing.small} ${spacing.medium}`,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    backdropFilter: "blur(12px)",
    borderTop: "1px solid rgba(255, 255, 255, 0.2)",
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
    overflowX: "scroll",
  },
  button: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "4px",
    padding: `${spacing.xsmall} ${spacing.small}`,
    borderRadius: "12px",
    borderStyle: "solid",
    borderWidth: 0,
    backgroundColor: "transparent",
    color: colors.textMain,
    cursor: "pointer",
    transition: "all 0.2s ease",
    ":hover": {
      backgroundColor: "rgba(255, 255, 255, 0.1)",
    },
    ":active": {
      transform: "scale(0.95)",
    },
  },
  activeButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    color: colors.accent,
  },
  label: {
    fontSize: fontSize.xsmall,
    width: 28,
    fontWeight: 500,
    opacity: 0.9,
    textAlign: "center",
  },
  divider: {
    width: "1px",
    height: "32px",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    margin: `0 ${spacing.small}`,
    flexShrink: 0,
  },
});

interface ImageToolbarProps {
  onUndo?: () => void;
  onRedo?: () => void;
  onSaveClick?: () => void;
}

const ICON_SIZE = 18;

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

export default function ImageToolbar({
  onUndo,
  onRedo,
  onSaveClick,
}: ImageToolbarProps) {
  const [activeTool, setActiveTool] = useAtom(activeToolAtom);
  const [drawingSettings, setDrawingSettings] = useAtom(drawingSettingsAtom);
  const [shouldBounce, setShouldBounce] = useState(false);

  useEffect(() => {
    if (activeTool === "draw" && !drawingSettings.selectedSubTool) {
      setShouldBounce(true);
      const timer = setTimeout(() => setShouldBounce(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [activeTool, drawingSettings.selectedSubTool]);

  const handleToolClick = (tool: ToolType) => {
    setActiveTool(activeTool === tool ? null : tool);
  };

  const handleSubToolClick = (subTool: DrawingToolType) => {
    setDrawingSettings((prev) => ({
      ...prev,
      selectedSubTool: prev.selectedSubTool === subTool ? null : subTool,
    }));
  };

  const updateDrawingSettings = (updates: Partial<typeof drawingSettings>) => {
    setDrawingSettings((prev) => ({ ...prev, ...updates }));
  };

  const renderSubmenu = () => {
    if (!activeTool) return null;

    switch (activeTool) {
      case "draw":
        return (
          <div {...stylex.props(styles.submenu, shouldBounce && styles.bounce)}>
            <div {...stylex.props(styles.subToolGroup)}>
              <button
                type="button"
                {...stylex.props(
                  styles.button,
                  drawingSettings.selectedSubTool === "pen" &&
                    styles.activeButton,
                )}
                onClick={() => handleSubToolClick("pen")}
              >
                펜
              </button>
              <button
                type="button"
                {...stylex.props(
                  styles.button,
                  drawingSettings.selectedSubTool === "brush" &&
                    styles.activeButton,
                )}
                onClick={() => handleSubToolClick("brush")}
              >
                브러시
              </button>
              <button
                type="button"
                {...stylex.props(
                  styles.button,
                  drawingSettings.selectedSubTool === "eraser" &&
                    styles.activeButton,
                )}
                onClick={() => handleSubToolClick("eraser")}
              >
                지우개
              </button>
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
              </div>
            )}
          </div>
        );
      case "filter":
        return (
          <div {...stylex.props(styles.submenu)}>
            <button type="button" {...stylex.props(styles.button)}>
              선명하게
            </button>
            <button type="button" {...stylex.props(styles.button)}>
              흑백
            </button>
            <button type="button" {...stylex.props(styles.button)}>
              세피아
            </button>
          </div>
        );
      case "edit":
        return (
          <div {...stylex.props(styles.submenu)}>
            <button type="button" {...stylex.props(styles.button)}>
              자르기
            </button>
            <button type="button" {...stylex.props(styles.button)}>
              회전
            </button>
            <button type="button" {...stylex.props(styles.button)}>
              크기 조절
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div {...stylex.props(styles.container)}>
      {renderSubmenu()}
      <div {...stylex.props(styles.toolbar)}>
        <button
          type="button"
          {...stylex.props(styles.button)}
          onClick={onUndo}
          aria-label="Undo"
        >
          <RotateCcw size={ICON_SIZE} />
          <span {...stylex.props(styles.label)}>뒤로</span>
        </button>
        <button
          type="button"
          {...stylex.props(styles.button)}
          onClick={onRedo}
          aria-label="Redo"
        >
          <RotateCw size={ICON_SIZE} />
          <span {...stylex.props(styles.label)}>앞으로</span>
        </button>

        <div {...stylex.props(styles.divider)} />

        <button
          type="button"
          {...stylex.props(
            styles.button,
            activeTool === "select" && styles.activeButton,
          )}
          onClick={() => handleToolClick("select")}
          aria-label="Select"
        >
          <Crosshair size={ICON_SIZE} />
          <span {...stylex.props(styles.label)}>선택</span>
        </button>

        <div {...stylex.props(styles.divider)} />

        <button
          type="button"
          {...stylex.props(
            styles.button,
            activeTool === "draw" && styles.activeButton,
          )}
          onClick={() => handleToolClick("draw")}
          aria-label="Draw"
        >
          <Edit2 size={ICON_SIZE} />
          <span {...stylex.props(styles.label)}>그리기</span>
        </button>
        <button
          type="button"
          {...stylex.props(
            styles.button,
            activeTool === "filter" && styles.activeButton,
          )}
          onClick={() => handleToolClick("filter")}
          aria-label="Add Filter"
        >
          <Layers size={ICON_SIZE} />
          <span {...stylex.props(styles.label)}>필터</span>
        </button>
        <button
          type="button"
          {...stylex.props(
            styles.button,
            activeTool === "edit" && styles.activeButton,
          )}
          onClick={() => handleToolClick("edit")}
          aria-label="Edit"
        >
          <Edit3 size={ICON_SIZE} />
          <span {...stylex.props(styles.label)}>편집</span>
        </button>

        <div {...stylex.props(styles.divider)} />

        <button
          type="button"
          {...stylex.props(styles.button)}
          onClick={onSaveClick}
          aria-label="Save"
        >
          <Save size={ICON_SIZE} />
          <span {...stylex.props(styles.label)}>저장</span>
        </button>
      </div>
    </div>
  );
}
