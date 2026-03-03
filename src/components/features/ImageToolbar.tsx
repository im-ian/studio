import * as stylex from "@stylexjs/stylex";
import { Edit3, Layers, RotateCcw, RotateCw, Save } from "react-feather";

import { colors, fontSize, spacing } from "../../tokens.stylex";

const styles = stylex.create({
  toolbar: {
    position: "fixed",
    width: "100%",
    bottom: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.medium,
    padding: `${spacing.small} ${spacing.large}`,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    backdropFilter: "blur(12px)",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
    zIndex: 1000,
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
      transform: "translateY(-2px)",
    },
    ":active": {
      transform: "scale(0.95)",
    },
  },
  label: {
    fontSize: fontSize.xsmall,
    fontWeight: 500,
    opacity: 0.9,
  },
  divider: {
    width: "1px",
    height: "32px",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    margin: `0 ${spacing.small}`,
  },
});

interface ImageToolbarProps {
  onUndo?: () => void;
  onRedo?: () => void;
  onFilterClick?: () => void;
  onEditClick?: () => void;
  onSaveClick?: () => void;
}

const ICON_SIZE = 18;

export default function ImageToolbar({
  onUndo,
  onRedo,
  onFilterClick,
  onEditClick,
  onSaveClick,
}: ImageToolbarProps) {
  return (
    <div {...stylex.props(styles.toolbar)}>
      <button
        type="button"
        {...stylex.props(styles.button)}
        onClick={onUndo}
        aria-label="Undo"
      >
        <RotateCcw size={ICON_SIZE} />
        <span {...stylex.props(styles.label)}>실행 취소</span>
      </button>
      <button
        type="button"
        {...stylex.props(styles.button)}
        onClick={onRedo}
        aria-label="Redo"
      >
        <RotateCw size={ICON_SIZE} />
        <span {...stylex.props(styles.label)}>다시 실행</span>
      </button>

      <div {...stylex.props(styles.divider)} />

      <button
        type="button"
        {...stylex.props(styles.button)}
        onClick={onFilterClick}
        aria-label="Add Filter"
      >
        <Layers size={ICON_SIZE} />
        <span {...stylex.props(styles.label)}>필터 추가</span>
      </button>
      <button
        type="button"
        {...stylex.props(styles.button)}
        onClick={onEditClick}
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
  );
}
