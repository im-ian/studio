import * as stylex from "@stylexjs/stylex";
import { Edit3, Layers, RotateCcw, RotateCw, Save } from "react-feather";

import { colors, spacing } from "../../tokens.stylex";

const styles = stylex.create({
  toolbar: {
    position: "fixed",
    bottom: spacing.large,
    left: "50%",
    transform: "translateX(-50%)",
    display: "flex",
    alignItems: "center",
    gap: spacing.medium,
    padding: `${spacing.small} ${spacing.large}`,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    backdropFilter: "blur(12px)",
    borderRadius: "100px",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
    zIndex: 1000,
  },
  button: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "44px",
    height: "44px",
    borderRadius: "50%",
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
  divider: {
    width: "1px",
    height: "24px",
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
        <RotateCcw size={20} />
      </button>
      <button
        type="button"
        {...stylex.props(styles.button)}
        onClick={onRedo}
        aria-label="Redo"
      >
        <RotateCw size={20} />
      </button>

      <div {...stylex.props(styles.divider)} />

      <button
        type="button"
        {...stylex.props(styles.button)}
        onClick={onFilterClick}
        aria-label="Add Filter"
      >
        <Layers size={20} />
      </button>
      <button
        type="button"
        {...stylex.props(styles.button)}
        onClick={onEditClick}
        aria-label="Edit"
      >
        <Edit3 size={20} />
      </button>

      <div {...stylex.props(styles.divider)} />

      <button
        type="button"
        {...stylex.props(styles.button)}
        onClick={onSaveClick}
        aria-label="Save"
      >
        <Save size={20} />
      </button>
    </div>
  );
}
