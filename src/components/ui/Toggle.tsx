import * as stylex from "@stylexjs/stylex";
import type { ReactNode } from "react";

import { colors, timing } from "../../tokens.stylex";

const styles = stylex.create({
  container: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    cursor: "pointer",
    userSelect: "none",
  },
  label: {
    color: colors.textMain,
    fontSize: "12px",
    fontWeight: 500,
  },
  track: {
    width: "36px",
    height: "20px",
    borderRadius: "10px",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    position: "relative",
    transition: `background-color ${timing.normal} ease`,
    outline: {
      default: "none",
      ":focus-visible": `2px solid ${colors.accent}`,
    },
    outlineOffset: "2px",
  },
  trackActive: {
    backgroundColor: colors.accent,
  },
  thumb: {
    position: "absolute",
    top: "2px",
    left: "2px",
    width: "16px",
    height: "16px",
    borderRadius: "50%",
    backgroundColor: "white",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
    transition: `transform ${timing.normal} cubic-bezier(0.4, 0, 0.2, 1)`,
  },
  thumbActive: {
    transform: "translateX(16px)",
  },
});

interface ToggleProps {
  isActive: boolean;
  onToggle: (value: boolean) => void;
  label?: ReactNode;
  "aria-label"?: string;
}

export default function Toggle({
  isActive,
  onToggle,
  label,
  "aria-label": ariaLabel,
}: ToggleProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onToggle(!isActive);
    }
  };

  return (
    <div
      {...stylex.props(styles.container)}
      onClick={() => onToggle(!isActive)}
      onKeyDown={handleKeyDown}
      role="switch"
      aria-checked={isActive}
      aria-label={ariaLabel}
      tabIndex={0}
    >
      {label && <span {...stylex.props(styles.label)}>{label}</span>}
      <div {...stylex.props(styles.track, isActive && styles.trackActive)}>
        <div {...stylex.props(styles.thumb, isActive && styles.thumbActive)} />
      </div>
    </div>
  );
}
