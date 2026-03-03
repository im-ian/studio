import * as stylex from "@stylexjs/stylex";
import { useAtom } from "jotai";
import {
  Crosshair,
  Edit2,
  Edit3,
  Layers,
  RotateCcw,
  RotateCw,
  Save,
} from "react-feather";

import { activeToolAtom, type ToolType } from "../../store/imageAtoms";
import { colors, fontSize, spacing } from "../../tokens.stylex";

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

export default function ImageToolbar({
  onUndo,
  onRedo,
  onSaveClick,
}: ImageToolbarProps) {
  const [activeTool, setActiveTool] = useAtom(activeToolAtom);

  const handleToolClick = (tool: ToolType) => {
    setActiveTool(activeTool === tool ? null : tool);
  };

  const renderSubmenu = () => {
    if (!activeTool) return null;

    switch (activeTool) {
      case "draw":
        return (
          <div {...stylex.props(styles.submenu)}>
            <button type="button" {...stylex.props(styles.button)}>
              펜
            </button>
            <button type="button" {...stylex.props(styles.button)}>
              브러시
            </button>
            <button type="button" {...stylex.props(styles.button)}>
              지우개
            </button>
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
